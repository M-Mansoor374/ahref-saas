// Reseller Admin controller
const authService = require('../services/authService');
const subscriptionService = require('../services/subscriptionService');
const User = require('../models/User');
const { USER_ROLES } = require('../config/constants');

/**
 * Reseller model reference (optional - if model exists)
 */
let ResellerModel = null;
try {
  ResellerModel = require('../models/Reseller');
} catch (error) {
  console.warn('Reseller model not found. Using User model for reseller info.');
}

/**
 * Get reseller's current user count
 * 
 * @param {string} resellerId - Reseller ID
 * @returns {Promise<number>} Number of users under this reseller
 */
const getResellerUserCount = async (resellerId) => {
  try {
    const userCount = await User.countDocuments({
      resellerId,
      role: USER_ROLES.USER,
      isActive: true,
    });
    return userCount;
  } catch (error) {
    console.error('Error getting reseller user count:', error);
    return 0;
  }
};

/**
 * Get reseller's max user limit
 * 
 * @param {string} resellerId - Reseller ID
 * @returns {Promise<number>} Maximum number of users allowed (-1 for unlimited)
 */
const getResellerMaxUsers = async (resellerId) => {
  try {
    // Try to get from Reseller model if it exists
    if (ResellerModel) {
      const reseller = await ResellerModel.findById(resellerId);
      if (reseller && reseller.maxUsers !== undefined) {
        return reseller.maxUsers || -1; // -1 means unlimited
      }
    }

    // Default limit if not specified in Reseller model
    // You can set a default limit here or make it configurable
    return -1; // Unlimited by default
  } catch (error) {
    console.error('Error getting reseller max users:', error);
    return -1; // Return unlimited on error
  }
};

/**
 * Add a new user under the reseller
 * POST /api/reseller/users
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const resellerId = req.userId; // Reseller ID from authenticated user

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check reseller's user limit
    const currentUserCount = await getResellerUserCount(resellerId);
    const maxUsers = await getResellerMaxUsers(resellerId);

    if (maxUsers !== -1 && currentUserCount >= maxUsers) {
      return res.status(403).json({
        success: false,
        message: `User limit reached. Maximum ${maxUsers} users allowed.`,
        currentCount: currentUserCount,
        maxUsers,
      });
    }

    // Create user under this reseller
    const user = await authService.registerUser({
      email,
      password,
      role: USER_ROLES.USER,
      resellerId, // Link user to this reseller
    });

    // Create default subscription for the new user
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 1);

    try {
      await subscriptionService.createSubscription({
        userId: user._id.toString(),
        startDate: now,
        expiryDate: oneYearLater,
        userRole: USER_ROLES.USER,
      });
    } catch (subscriptionError) {
      // Log error but don't fail user creation
      console.error('Error creating subscription for new user:', subscriptionError);
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user,
        userCount: currentUserCount + 1,
        maxUsers: maxUsers === -1 ? 'Unlimited' : maxUsers,
      },
    });
  } catch (error) {
    // Handle duplicate email
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Add user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

/**
 * Set expiry date for a user's subscription
 * PUT /api/reseller/users/:userId/expiry-date
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setUserExpiry = async (req, res) => {
  try {
    const { userId } = req.params;
    const { expiryDate } = req.body;
    const resellerId = req.userId; // Reseller ID from authenticated user

    // Validate input
    if (!expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date is required',
      });
    }

    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expiry date format',
      });
    }

    // Check if user exists and belongs to this reseller
    const user = await User.findOne({
      _id: userId,
      resellerId,
      role: USER_ROLES.USER,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or does not belong to this reseller',
      });
    }

    // Get or create subscription
    let subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      // Create subscription with default limit if it doesn't exist
      const now = new Date();
      subscription = await subscriptionService.createSubscription({
        userId,
        startDate: now,
        expiryDate: expiry,
        userRole: USER_ROLES.USER,
      });
    } else {
      // Update existing subscription expiry
      subscription = await subscriptionService.extendSubscription(userId, expiry);
    }

    return res.status(200).json({
      success: true,
      message: 'User expiry date updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
        },
        subscription: {
          expiryDate: subscription.expiryDate,
          startDate: subscription.startDate,
          isExpired: subscription.isExpired,
          isActive: subscription.isActive,
        },
      },
    });
  } catch (error) {
    if (error.message.includes('must be after start date')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Set user expiry error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user expiry date',
    });
  }
};

/**
 * Enforce max user limit check
 * GET /api/reseller/users/limit
 * 
 * Returns current user count and limit information
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const enforceMaxUserLimit = async (req, res) => {
  try {
    const resellerId = req.userId; // Reseller ID from authenticated user

    // Get current user count
    const currentUserCount = await getResellerUserCount(resellerId);
    const maxUsers = await getResellerMaxUsers(resellerId);

    // Check if limit is reached
    const isLimitReached = maxUsers !== -1 && currentUserCount >= maxUsers;
    const remainingSlots = maxUsers === -1 ? -1 : Math.max(0, maxUsers - currentUserCount);

    return res.status(200).json({
      success: true,
      data: {
        currentUserCount,
        maxUsers: maxUsers === -1 ? 'Unlimited' : maxUsers,
        remainingSlots: remainingSlots === -1 ? 'Unlimited' : remainingSlots,
        isLimitReached,
        canAddMore: !isLimitReached,
      },
    });
  } catch (error) {
    console.error('Enforce max user limit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user limit information',
    });
  }
};

/**
 * Get all users under this reseller
 * GET /api/reseller/users
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getResellerUsers = async (req, res) => {
  try {
    const resellerId = req.userId; // Reseller ID from authenticated user
    const { page = 1, limit = 50, isActive = true } = req.query;

    // Build query
    const query = {
      resellerId,
      role: USER_ROLES.USER,
    };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get users with pagination
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await User.countDocuments(query);

    // Get subscription info for each user
    const usersWithSubscription = await Promise.all(
      users.map(async (user) => {
        const subscription = await subscriptionService.getSubscription(user._id.toString());
        return {
          ...user.toObject(),
          subscription: subscription
            ? {
                keywordLimit: subscription.keywordLimit,
                usedKeywords: subscription.usedKeywords,
                remainingKeywords: subscription.remainingKeywords,
                isExpired: subscription.isExpired,
                expiryDate: subscription.expiryDate,
                startDate: subscription.startDate,
              }
            : null,
        };
      })
    );

    // Get limit info
    const maxUsers = await getResellerMaxUsers(resellerId);
    const remainingSlots = maxUsers === -1 ? -1 : Math.max(0, maxUsers - total);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: usersWithSubscription,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        limits: {
          currentCount: total,
          maxUsers: maxUsers === -1 ? 'Unlimited' : maxUsers,
          remainingSlots: remainingSlots === -1 ? 'Unlimited' : remainingSlots,
        },
      },
    });
  } catch (error) {
    console.error('Get reseller users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
    });
  }
};

module.exports = {
  addUser,
  setUserExpiry,
  enforceMaxUserLimit,
  getResellerUsers,
};
