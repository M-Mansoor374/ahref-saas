// Role-based access control middleware
const { USER_ROLES } = require('../config/constants');

/**
 * Role-based authorization middleware factory
 * Creates a middleware function that checks if user's role matches allowed roles
 * 
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Single role
 * router.get('/admin', auth, authorize(USER_ROLES.SUPER_ADMIN), controller);
 * 
 * @example
 * // Multiple roles
 * router.get('/dashboard', auth, authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.RESELLER]), controller);
 */
const authorize = (allowedRoles) => {
  // Normalize to array if single role is provided
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.',
      });
    }

    // Check if user's role is in the allowed roles list
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this resource.',
        requiredRoles: roles,
        yourRole: req.userRole,
      });
    }

    // User has required role, continue to next middleware
    next();
  };
};

/**
 * Middleware to check if user is Super Admin
 * Convenience wrapper for authorize(USER_ROLES.SUPER_ADMIN)
 */
const requireSuperAdmin = authorize(USER_ROLES.SUPER_ADMIN);

/**
 * Middleware to check if user is Reseller Admin
 * Convenience wrapper for authorize(USER_ROLES.RESELLER)
 */
const requireReseller = authorize(USER_ROLES.RESELLER);

/**
 * Middleware to check if user is regular User
 * Convenience wrapper for authorize(USER_ROLES.USER)
 */
const requireUser = authorize(USER_ROLES.USER);

/**
 * Middleware to check if user is Admin (Super Admin or Reseller)
 * Convenience wrapper for authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.RESELLER])
 */
const requireAdmin = authorize([USER_ROLES.SUPER_ADMIN, USER_ROLES.RESELLER]);

module.exports = {
  authorize,
  requireSuperAdmin,
  requireReseller,
  requireUser,
  requireAdmin,
};
