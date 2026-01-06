// Page access restrictions middleware (settings/profile)
const { USER_ROLES } = require('../config/constants');

/**
 * Middleware to block access to restricted routes for normal users
 * Blocks 'user' role from accessing settings and profile pages
 * Allows access for 'super_admin' and 'reseller' roles
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const restrictSettingsAndProfile = (req, res, next) => {
  // Check if user is authenticated (should be set by auth middleware)
  if (!req.user || !req.userRole) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login first.',
    });
  }

  // Block access for normal users
  if (req.userRole === USER_ROLES.USER) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You do not have permission to access this resource.',
      restrictedFor: 'normal users',
      allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.RESELLER],
    });
  }

  // Allow access for super_admin and reseller
  next();
};

/**
 * Middleware factory to restrict routes based on specific roles
 * 
 * @param {string[]} restrictedRoles - Array of roles that should be blocked
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Block only normal users
 * router.get('/settings', auth, restrictRoles([USER_ROLES.USER]), controller);
 * 
 * @example
 * // Block multiple roles
 * router.get('/admin', auth, restrictRoles([USER_ROLES.USER, USER_ROLES.RESELLER]), controller);
 */
const restrictRoles = (restrictedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.',
      });
    }

    // Normalize to array if single role is provided
    const roles = Array.isArray(restrictedRoles) ? restrictedRoles : [restrictedRoles];

    // Check if user's role is in the restricted list
    if (roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this resource.',
        restrictedRoles: roles,
        yourRole: req.userRole,
      });
    }

    // User's role is not restricted, allow access
    next();
  };
};

/**
 * Middleware to restrict access to settings page
 * Blocks normal users, allows super_admin and reseller
 */
const restrictSettings = restrictSettingsAndProfile;

/**
 * Middleware to restrict access to profile page
 * Blocks normal users, allows super_admin and reseller
 */
const restrictProfile = restrictSettingsAndProfile;

module.exports = {
  restrictSettingsAndProfile,
  restrictRoles,
  restrictSettings,
  restrictProfile,
};
