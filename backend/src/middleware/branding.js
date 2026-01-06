// Branding middleware (inject "Service by XYZ")
const Branding = require('../models/Branding');
const { USER_ROLES } = require('../config/constants');

/**
 * Middleware to inject branding text into API responses
 * Fetches branding based on user role or reseller and adds it to response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const injectBranding = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.userRole) {
      // No user, continue without branding
      return next();
    }

    let branding = null;
    let ownerType = null;
    let ownerId = null;

    // Determine branding source based on user role
    if (req.userRole === USER_ROLES.SUPER_ADMIN) {
      // Super admin: use super_admin branding
      ownerType = USER_ROLES.SUPER_ADMIN;
      ownerId = req.userId;
    } else if (req.userRole === USER_ROLES.RESELLER) {
      // Reseller: use their own reseller branding
      ownerType = USER_ROLES.RESELLER;
      ownerId = req.userId;
    } else if (req.userRole === USER_ROLES.USER && req.user.resellerId) {
      // User: use their reseller's branding
      ownerType = USER_ROLES.RESELLER;
      ownerId = req.user.resellerId;
    }

    // Fetch branding if owner type and ID are determined
    if (ownerType && ownerId) {
      branding = await Branding.findOne({
        ownerType,
        ownerId,
      });
    }

    // Attach branding to request for use in controllers
    req.branding = branding;
    req.brandingText = branding ? branding.brandingText : null;

    // Override res.json to inject branding into all JSON responses
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // If response already has a structure, inject branding
      if (data && typeof data === 'object') {
        // Add branding to response
        const responseData = {
          ...data,
          branding: req.brandingText || null,
        };

        return originalJson(responseData);
      }

      // If response is not an object, wrap it
      return originalJson({
        data,
        branding: req.brandingText || null,
      });
    };

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Branding middleware error:', error);
    // Don't block request if branding fails, just continue without branding
    next();
  }
};

/**
 * Middleware to inject branding only if explicitly requested
 * Doesn't automatically inject, but makes branding available in req
 */
const loadBranding = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.userRole) {
      req.branding = null;
      req.brandingText = null;
      return next();
    }

    let branding = null;
    let ownerType = null;
    let ownerId = null;

    // Determine branding source based on user role
    if (req.userRole === USER_ROLES.SUPER_ADMIN) {
      ownerType = USER_ROLES.SUPER_ADMIN;
      ownerId = req.userId;
    } else if (req.userRole === USER_ROLES.RESELLER) {
      ownerType = USER_ROLES.RESELLER;
      ownerId = req.userId;
    } else if (req.userRole === USER_ROLES.USER && req.user.resellerId) {
      ownerType = USER_ROLES.RESELLER;
      ownerId = req.user.resellerId;
    }

    // Fetch branding if owner type and ID are determined
    if (ownerType && ownerId) {
      branding = await Branding.findOne({
        ownerType,
        ownerId,
      });
    }

    // Attach branding to request (without auto-injecting into response)
    req.branding = branding;
    req.brandingText = branding ? branding.brandingText : null;

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Load branding middleware error:', error);
    req.branding = null;
    req.brandingText = null;
    next();
  }
};

/**
 * Helper function to manually add branding to response data
 * Use this in controllers when you want to control where branding appears
 * 
 * @param {Object} data - Response data object
 * @param {string} brandingText - Branding text to inject
 * @returns {Object} Response data with branding
 */
const addBrandingToResponse = (data, brandingText) => {
  if (!data || typeof data !== 'object') {
    return {
      data,
      branding: brandingText || null,
    };
  }

  return {
    ...data,
    branding: brandingText || null,
  };
};

module.exports = {
  injectBranding,
  loadBranding,
  addBrandingToResponse,
};
