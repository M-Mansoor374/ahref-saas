// Branding service
const Branding = require('../models/Branding');
const User = require('../models/User');
const { USER_ROLES } = require('../config/constants');

/**
 * Get branding text for a user based on their role and reseller
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Branding object or null if not found
 */
const getBrandingByUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Find user to determine their role and reseller
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    let ownerType = null;
    let ownerId = null;

    // Determine branding source based on user role
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      // Super admin: use super_admin branding
      ownerType = USER_ROLES.SUPER_ADMIN;
      ownerId = user._id;
    } else if (user.role === USER_ROLES.RESELLER) {
      // Reseller: use their own reseller branding
      ownerType = USER_ROLES.RESELLER;
      ownerId = user._id;
    } else if (user.role === USER_ROLES.USER && user.resellerId) {
      // User: use their reseller's branding
      ownerType = USER_ROLES.RESELLER;
      ownerId = user.resellerId;
    } else {
      // User without reseller: no branding
      return null;
    }

    // Find branding
    const branding = await Branding.findOne({
      ownerType,
      ownerId,
    });

    return branding;
  } catch (error) {
    throw error;
  }
};

/**
 * Update branding (super admin only)
 * Can update branding for super admin or any reseller
 * 
 * @param {Object} brandingData - Branding data
 * @param {string} brandingData.ownerType - 'super_admin' or 'reseller'
 * @param {string} brandingData.ownerId - Owner ID (user ID for super_admin, reseller ID for reseller)
 * @param {string} brandingData.brandingText - Branding text to set
 * @param {string} brandingData.updatedBy - User ID of the person updating (must be super admin)
 * @returns {Promise<Object>} Updated or created branding object
 */
const updateBranding = async (brandingData) => {
  try {
    const { ownerType, ownerId, brandingText, updatedBy } = brandingData;

    // Validate required fields
    if (!ownerType || !ownerId || !brandingText) {
      throw new Error('Owner type, owner ID, and branding text are required');
    }

    if (!updatedBy) {
      throw new Error('Updated by user ID is required');
    }

    // Validate owner type
    if (ownerType !== USER_ROLES.SUPER_ADMIN && ownerType !== USER_ROLES.RESELLER) {
      throw new Error('Owner type must be either super_admin or reseller');
    }

    // Verify that the person updating is a super admin
    const updater = await User.findById(updatedBy);
    if (!updater) {
      throw new Error('User not found');
    }

    if (updater.role !== USER_ROLES.SUPER_ADMIN) {
      throw new Error('Only super admin can update branding');
    }

    // Validate branding text length
    if (brandingText.length > 500) {
      throw new Error('Branding text cannot exceed 500 characters');
    }

    // Find or create branding
    const branding = await Branding.findOneAndUpdate(
      {
        ownerType,
        ownerId,
      },
      {
        ownerType,
        ownerId,
        brandingText: brandingText.trim(),
        updatedAt: new Date(),
      },
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    return branding;
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      throw new Error('Branding already exists for this owner');
    }
    throw error;
  }
};

/**
 * Get branding by owner type and ID
 * 
 * @param {string} ownerType - 'super_admin' or 'reseller'
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Object|null>} Branding object or null if not found
 */
const getBrandingByOwner = async (ownerType, ownerId) => {
  try {
    if (!ownerType || !ownerId) {
      throw new Error('Owner type and owner ID are required');
    }

    if (ownerType !== USER_ROLES.SUPER_ADMIN && ownerType !== USER_ROLES.RESELLER) {
      throw new Error('Owner type must be either super_admin or reseller');
    }

    const branding = await Branding.findOne({
      ownerType,
      ownerId,
    });

    return branding;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete branding (super admin only)
 * 
 * @param {string} ownerType - 'super_admin' or 'reseller'
 * @param {string} ownerId - Owner ID
 * @param {string} deletedBy - User ID of the person deleting (must be super admin)
 * @returns {Promise<Object>} Deleted branding object
 */
const deleteBranding = async (ownerType, ownerId, deletedBy) => {
  try {
    if (!ownerType || !ownerId || !deletedBy) {
      throw new Error('Owner type, owner ID, and deleted by user ID are required');
    }

    // Verify that the person deleting is a super admin
    const deleter = await User.findById(deletedBy);
    if (!deleter) {
      throw new Error('User not found');
    }

    if (deleter.role !== USER_ROLES.SUPER_ADMIN) {
      throw new Error('Only super admin can delete branding');
    }

    const branding = await Branding.findOneAndDelete({
      ownerType,
      ownerId,
    });

    if (!branding) {
      throw new Error('Branding not found');
    }

    return branding;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all brandings (super admin only)
 * 
 * @param {string} requestedBy - User ID of the person requesting (must be super admin)
 * @param {Object} filters - Optional filters
 * @param {string} filters.ownerType - Filter by owner type
 * @returns {Promise<Array>} Array of branding objects
 */
const getAllBrandings = async (requestedBy, filters = {}) => {
  try {
    if (!requestedBy) {
      throw new Error('Requested by user ID is required');
    }

    // Verify that the person requesting is a super admin
    const requester = await User.findById(requestedBy);
    if (!requester) {
      throw new Error('User not found');
    }

    if (requester.role !== USER_ROLES.SUPER_ADMIN) {
      throw new Error('Only super admin can view all brandings');
    }

    // Build query
    const query = {};
    if (filters.ownerType) {
      query.ownerType = filters.ownerType;
    }

    const brandings = await Branding.find(query).sort({ updatedAt: -1 });

    return brandings;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getBrandingByUser,
  updateBranding,
  getBrandingByOwner,
  deleteBranding,
  getAllBrandings,
};
