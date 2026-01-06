// Application constants

/**
 * User Roles
 */
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  RESELLER: 'reseller',
  USER: 'user',
};

/**
 * Subscription Statuses
 */
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
};

/**
 * Default Keyword Limits
 */
const DEFAULT_KEYWORD_LIMITS = {
  SUPER_ADMIN: -1, // -1 means unlimited
  RESELLER: 10000,
  USER: 1000,
};

/**
 * All available roles as array
 */
const ROLES_ARRAY = Object.values(USER_ROLES);

/**
 * All available subscription statuses as array
 */
const SUBSCRIPTION_STATUS_ARRAY = Object.values(SUBSCRIPTION_STATUS);

module.exports = {
  USER_ROLES,
  SUBSCRIPTION_STATUS,
  DEFAULT_KEYWORD_LIMITS,
  ROLES_ARRAY,
  SUBSCRIPTION_STATUS_ARRAY,
};
