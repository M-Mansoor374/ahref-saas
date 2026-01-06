/**
 * User Roles
 * Defines all available user roles in the system
 */
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  RESELLER: 'reseller',
  RESELLER_ADMIN: 'reseller_admin',
  USER: 'user',
};

/**
 * Permission Levels
 * Defines permission hierarchy for access control
 */
const PERMISSION_LEVELS = {
  SUPER_ADMIN: 4,
  RESELLER: 3,
  RESELLER_ADMIN: 3,
  USER: 1,
};

/**
 * Subscription Statuses
 * Defines all possible subscription states
 */
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
};

/**
 * User Account Statuses
 * Defines user account states
 */
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
};

/**
 * Activity Log Action Types
 * Defines all trackable actions in the system
 */
const ACTIVITY_LOG_TYPES = {
  AUTH: {
    LOGIN: 'auth.login',
    LOGOUT: 'auth.logout',
    REGISTER: 'auth.register',
    PASSWORD_RESET: 'auth.password_reset',
    PASSWORD_CHANGE: 'auth.password_change',
    TOKEN_REFRESH: 'auth.token_refresh',
  },
  USER: {
    CREATE: 'user.create',
    UPDATE: 'user.update',
    DELETE: 'user.delete',
    ACTIVATE: 'user.activate',
    DEACTIVATE: 'user.deactivate',
    VIEW: 'user.view',
  },
  RESELLER: {
    CREATE: 'reseller.create',
    UPDATE: 'reseller.update',
    DELETE: 'reseller.delete',
    VIEW: 'reseller.view',
  },
  SUBSCRIPTION: {
    CREATE: 'subscription.create',
    UPDATE: 'subscription.update',
    EXTEND: 'subscription.extend',
    EXPIRE: 'subscription.expire',
    CANCEL: 'subscription.cancel',
  },
  BRANDING: {
    CREATE: 'branding.create',
    UPDATE: 'branding.update',
    DELETE: 'branding.delete',
  },
  IP: {
    ADD: 'ip.add',
    REMOVE: 'ip.remove',
    UPDATE: 'ip.update',
    WHITELIST: 'ip.whitelist',
  },
  SETTINGS: {
    UPDATE: 'settings.update',
    VIEW: 'settings.view',
  },
  USAGE: {
    TRACK: 'usage.track',
    RESET: 'usage.reset',
    LIMIT_REACHED: 'usage.limit_reached',
  },
};

/**
 * API Response Status Codes
 * Standard HTTP status codes used in API responses
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Default Keyword Limits
 * Default keyword usage limits per role
 */
const DEFAULT_KEYWORD_LIMITS = {
  [USER_ROLES.SUPER_ADMIN]: -1,
  [USER_ROLES.RESELLER]: 10000,
  [USER_ROLES.RESELLER_ADMIN]: 10000,
  [USER_ROLES.USER]: 1000,
};

/**
 * Default User Limits
 * Maximum number of users a reseller can create
 */
const DEFAULT_USER_LIMITS = {
  [USER_ROLES.SUPER_ADMIN]: -1,
  [USER_ROLES.RESELLER]: 50,
  [USER_ROLES.RESELLER_ADMIN]: 50,
  [USER_ROLES.USER]: 0,
};

/**
 * Cookie Names
 * Standard cookie identifiers used in the application
 */
const COOKIE_NAMES = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  SESSION_ID: 'sessionId',
  BRANDING: 'branding',
};

/**
 * Local Storage Keys
 * Frontend local storage key identifiers
 */
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  USER_ROLE: 'userRole',
  BRANDING: 'branding',
  THEME: 'theme',
};

/**
 * Branding Constants
 * Default branding labels and text
 */
const BRANDING = {
  DEFAULT_TEXT: 'Service by SaaS Platform',
  DEFAULT_LABEL: 'Powered by',
  PLACEHOLDER: 'Your Company Name',
};

/**
 * Pagination Defaults
 * Default pagination values for list endpoints
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

/**
 * Date Formats
 * Standard date format strings
 */
const DATE_FORMATS = {
  ISO: 'ISO',
  DATE_ONLY: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIMESTAMP: 'timestamp',
};

/**
 * Validation Rules
 * Standard validation constraints
 */
const VALIDATION = {
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  STRING_MAX_LENGTH: 500,
  TEXT_MAX_LENGTH: 5000,
};

/**
 * JWT Token Configuration
 * JWT token expiration times
 */
const JWT_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  RESET_TOKEN: '1h',
};

/**
 * API Response Structure Types
 * Standard response format definitions
 */
const API_RESPONSE = {
  SUCCESS: {
    success: true,
    message: '',
    data: null,
  },
  ERROR: {
    success: false,
    message: '',
    errors: null,
  },
};

/**
 * Error Types
 * Standard error categories
 */
const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
  EXTERNAL: 'EXTERNAL_ERROR',
};

/**
 * All Roles Array
 * Array of all available user roles
 */
const ROLES_ARRAY = Object.values(USER_ROLES);

/**
 * All Subscription Statuses Array
 * Array of all available subscription statuses
 */
const SUBSCRIPTION_STATUS_ARRAY = Object.values(SUBSCRIPTION_STATUS);

/**
 * All User Statuses Array
 * Array of all available user statuses
 */
const USER_STATUS_ARRAY = Object.values(USER_STATUS);

/**
 * All Activity Log Types Array
 * Flattened array of all activity log action types
 */
const ACTIVITY_LOG_TYPES_ARRAY = Object.values(ACTIVITY_LOG_TYPES)
  .reduce((acc, category) => {
    return acc.concat(Object.values(category));
  }, []);

/**
 * Role Hierarchy
 * Defines which roles can manage which other roles
 */
const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: [USER_ROLES.RESELLER, USER_ROLES.USER],
  [USER_ROLES.RESELLER]: [USER_ROLES.USER],
  [USER_ROLES.RESELLER_ADMIN]: [USER_ROLES.USER],
  [USER_ROLES.USER]: [],
};

/**
 * Permission Matrix
 * Defines what each role can do
 */
const PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'resellers.create',
    'resellers.read',
    'resellers.update',
    'resellers.delete',
    'settings.read',
    'settings.update',
    'ip.manage',
    'branding.manage',
    'subscriptions.manage',
  ],
  [USER_ROLES.RESELLER]: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'branding.manage',
    'settings.read',
    'subscriptions.view',
  ],
  [USER_ROLES.RESELLER_ADMIN]: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'branding.manage',
    'settings.read',
    'subscriptions.view',
  ],
  [USER_ROLES.USER]: [
    'dashboard.view',
    'tool.access',
    'profile.view',
  ],
};

module.exports = {
  USER_ROLES,
  PERMISSION_LEVELS,
  SUBSCRIPTION_STATUS,
  USER_STATUS,
  ACTIVITY_LOG_TYPES,
  HTTP_STATUS,
  DEFAULT_KEYWORD_LIMITS,
  DEFAULT_USER_LIMITS,
  COOKIE_NAMES,
  STORAGE_KEYS,
  BRANDING,
  PAGINATION,
  DATE_FORMATS,
  VALIDATION,
  JWT_EXPIRY,
  API_RESPONSE,
  ERROR_TYPES,
  ROLES_ARRAY,
  SUBSCRIPTION_STATUS_ARRAY,
  USER_STATUS_ARRAY,
  ACTIVITY_LOG_TYPES_ARRAY,
  ROLE_HIERARCHY,
  PERMISSIONS,
};
