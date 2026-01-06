const { USER_ROLES } = require('./roles');

/**
 * Permission Actions
 * Defines all possible actions in the system
 * 
 * @constant {Object} PERMISSION_ACTIONS
 */
const PERMISSION_ACTIONS = {
  // User Management
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ACTIVATE: 'user.activate',
  USER_DEACTIVATE: 'user.deactivate',
  USER_VIEW_ALL: 'user.view_all',
  
  // Reseller Management
  RESELLER_CREATE: 'reseller.create',
  RESELLER_READ: 'reseller.read',
  RESELLER_UPDATE: 'reseller.update',
  RESELLER_DELETE: 'reseller.delete',
  RESELLER_VIEW_ALL: 'reseller.view_all',
  
  // IP Management
  IP_CREATE: 'ip.create',
  IP_READ: 'ip.read',
  IP_UPDATE: 'ip.update',
  IP_DELETE: 'ip.delete',
  IP_WHITELIST: 'ip.whitelist',
  
  // Settings Management
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',
  SETTINGS_VIEW_ALL: 'settings.view_all',
  
  // Branding Management
  BRANDING_CREATE: 'branding.create',
  BRANDING_READ: 'branding.read',
  BRANDING_UPDATE: 'branding.update',
  BRANDING_DELETE: 'branding.delete',
  
  // Subscription Management
  SUBSCRIPTION_CREATE: 'subscription.create',
  SUBSCRIPTION_READ: 'subscription.read',
  SUBSCRIPTION_UPDATE: 'subscription.update',
  SUBSCRIPTION_DELETE: 'subscription.delete',
  SUBSCRIPTION_EXTEND: 'subscription.extend',
  
  // Dashboard Access
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_VIEW_ALL: 'dashboard.view_all',
  
  // Activity Logs
  ACTIVITY_VIEW: 'activity.view',
  ACTIVITY_VIEW_ALL: 'activity.view_all',
  
  // Usage Tracking
  USAGE_VIEW: 'usage.view',
  USAGE_VIEW_ALL: 'usage.view_all',
  USAGE_RESET: 'usage.reset',
};

/**
 * Permission Matrix
 * Defines what each role can do
 * 
 * @constant {Object} PERMISSIONS
 */
const PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    // User Management
    PERMISSION_ACTIONS.USER_CREATE,
    PERMISSION_ACTIONS.USER_READ,
    PERMISSION_ACTIONS.USER_UPDATE,
    PERMISSION_ACTIONS.USER_DELETE,
    PERMISSION_ACTIONS.USER_ACTIVATE,
    PERMISSION_ACTIONS.USER_DEACTIVATE,
    PERMISSION_ACTIONS.USER_VIEW_ALL,
    
    // Reseller Management
    PERMISSION_ACTIONS.RESELLER_CREATE,
    PERMISSION_ACTIONS.RESELLER_READ,
    PERMISSION_ACTIONS.RESELLER_UPDATE,
    PERMISSION_ACTIONS.RESELLER_DELETE,
    PERMISSION_ACTIONS.RESELLER_VIEW_ALL,
    
    // IP Management
    PERMISSION_ACTIONS.IP_CREATE,
    PERMISSION_ACTIONS.IP_READ,
    PERMISSION_ACTIONS.IP_UPDATE,
    PERMISSION_ACTIONS.IP_DELETE,
    PERMISSION_ACTIONS.IP_WHITELIST,
    
    // Settings Management
    PERMISSION_ACTIONS.SETTINGS_READ,
    PERMISSION_ACTIONS.SETTINGS_UPDATE,
    PERMISSION_ACTIONS.SETTINGS_VIEW_ALL,
    
    // Branding Management
    PERMISSION_ACTIONS.BRANDING_CREATE,
    PERMISSION_ACTIONS.BRANDING_READ,
    PERMISSION_ACTIONS.BRANDING_UPDATE,
    PERMISSION_ACTIONS.BRANDING_DELETE,
    
    // Subscription Management
    PERMISSION_ACTIONS.SUBSCRIPTION_CREATE,
    PERMISSION_ACTIONS.SUBSCRIPTION_READ,
    PERMISSION_ACTIONS.SUBSCRIPTION_UPDATE,
    PERMISSION_ACTIONS.SUBSCRIPTION_DELETE,
    PERMISSION_ACTIONS.SUBSCRIPTION_EXTEND,
    
    // Dashboard Access
    PERMISSION_ACTIONS.DASHBOARD_VIEW,
    PERMISSION_ACTIONS.DASHBOARD_VIEW_ALL,
    
    // Activity Logs
    PERMISSION_ACTIONS.ACTIVITY_VIEW,
    PERMISSION_ACTIONS.ACTIVITY_VIEW_ALL,
    
    // Usage Tracking
    PERMISSION_ACTIONS.USAGE_VIEW,
    PERMISSION_ACTIONS.USAGE_VIEW_ALL,
    PERMISSION_ACTIONS.USAGE_RESET,
  ],
  
  [USER_ROLES.RESELLER]: [
    // User Management (own users only)
    PERMISSION_ACTIONS.USER_CREATE,
    PERMISSION_ACTIONS.USER_READ,
    PERMISSION_ACTIONS.USER_UPDATE,
    PERMISSION_ACTIONS.USER_DELETE,
    PERMISSION_ACTIONS.USER_ACTIVATE,
    PERMISSION_ACTIONS.USER_DEACTIVATE,
    
    // Branding Management
    PERMISSION_ACTIONS.BRANDING_CREATE,
    PERMISSION_ACTIONS.BRANDING_READ,
    PERMISSION_ACTIONS.BRANDING_UPDATE,
    PERMISSION_ACTIONS.BRANDING_DELETE,
    
    // Subscription Management (own subscriptions)
    PERMISSION_ACTIONS.SUBSCRIPTION_READ,
    PERMISSION_ACTIONS.SUBSCRIPTION_UPDATE,
    
    // Dashboard Access
    PERMISSION_ACTIONS.DASHBOARD_VIEW,
    
    // Activity Logs (own activities)
    PERMISSION_ACTIONS.ACTIVITY_VIEW,
    
    // Usage Tracking (own usage)
    PERMISSION_ACTIONS.USAGE_VIEW,
  ],
  
  [USER_ROLES.RESELLER_ADMIN]: [
    // User Management (own users only)
    PERMISSION_ACTIONS.USER_CREATE,
    PERMISSION_ACTIONS.USER_READ,
    PERMISSION_ACTIONS.USER_UPDATE,
    PERMISSION_ACTIONS.USER_DELETE,
    PERMISSION_ACTIONS.USER_ACTIVATE,
    PERMISSION_ACTIONS.USER_DEACTIVATE,
    
    // Branding Management
    PERMISSION_ACTIONS.BRANDING_CREATE,
    PERMISSION_ACTIONS.BRANDING_READ,
    PERMISSION_ACTIONS.BRANDING_UPDATE,
    PERMISSION_ACTIONS.BRANDING_DELETE,
    
    // Subscription Management (own subscriptions)
    PERMISSION_ACTIONS.SUBSCRIPTION_READ,
    PERMISSION_ACTIONS.SUBSCRIPTION_UPDATE,
    
    // Dashboard Access
    PERMISSION_ACTIONS.DASHBOARD_VIEW,
    
    // Activity Logs (own activities)
    PERMISSION_ACTIONS.ACTIVITY_VIEW,
    
    // Usage Tracking (own usage)
    PERMISSION_ACTIONS.USAGE_VIEW,
  ],
  
  [USER_ROLES.USER]: [
    // Dashboard Access
    PERMISSION_ACTIONS.DASHBOARD_VIEW,
    
    // Activity Logs (own activities)
    PERMISSION_ACTIONS.ACTIVITY_VIEW,
    
    // Usage Tracking (own usage)
    PERMISSION_ACTIONS.USAGE_VIEW,
  ],
};

/**
 * Check if a role has a specific permission
 * 
 * @param {string} role - User role
 * @param {string} permission - Permission action
 * @returns {boolean} True if role has permission
 */
const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  const rolePermissions = PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if a role has any of the specified permissions
 * 
 * @param {string} role - User role
 * @param {Array<string>} permissions - Array of permission actions
 * @returns {boolean} True if role has at least one permission
 */
const hasAnyPermission = (role, permissions) => {
  if (!role || !permissions || !Array.isArray(permissions)) return false;
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if a role has all of the specified permissions
 * 
 * @param {string} role - User role
 * @param {Array<string>} permissions - Array of permission actions
 * @returns {boolean} True if role has all permissions
 */
const hasAllPermissions = (role, permissions) => {
  if (!role || !permissions || !Array.isArray(permissions)) return false;
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 * 
 * @param {string} role - User role
 * @returns {Array<string>} Array of permission actions
 */
const getRolePermissions = (role) => {
  if (!role) return [];
  return PERMISSIONS[role] || [];
};

module.exports = {
  PERMISSION_ACTIONS,
  PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
};
