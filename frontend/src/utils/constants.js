export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  RESELLER: 'reseller',
  USER: 'user',
};

export const USER_STATUS = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  SUSPENDED: 'Suspended',
  INACTIVE: 'Inactive',
};

export const RESTRICTED_PAGES = {
  settings: {
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.RESELLER],
    restrictedRoles: [USER_ROLES.USER],
  },
  profile: {
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.RESELLER],
    restrictedRoles: [USER_ROLES.USER],
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    RESELLERS: '/admin/resellers',
    SETTINGS: '/admin/settings',
    IP_MANAGEMENT: '/admin/ips',
  },
  RESELLER: {
    DASHBOARD: '/reseller/dashboard',
    USERS: '/reseller/users',
    BRANDING: '/reseller/branding',
    SETTINGS: '/reseller/settings',
  },
  USER: {
    DASHBOARD: '/user/dashboard',
    TOOL_ACCESS: '/user/tool/access',
    USAGE_STATS: '/user/usage-stats',
  },
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};

export const DEFAULT_LIMITS = {
  KEYWORD_LIMIT_USER: 1000,
  KEYWORD_LIMIT_RESELLER: 10000,
  KEYWORD_LIMIT_UNLIMITED: -1,
};

export const NOTIFICATION_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
};

export const DATE_FORMATS = {
  SHORT: { year: 'numeric', month: 'short', day: 'numeric' },
  LONG: { year: 'numeric', month: 'long', day: 'numeric' },
  TIME: { hour: '2-digit', minute: '2-digit' },
  DATETIME: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  USER_ROLE: 'userRole',
  USER_DATA: 'userData',
  BRANDING_TEXT: 'brandingText',
  BRANDING_LINK: 'brandingLink',
};

export default {
  USER_ROLES,
  USER_STATUS,
  RESTRICTED_PAGES,
  API_ENDPOINTS,
  PAGINATION,
  DEFAULT_LIMITS,
  NOTIFICATION_DURATION,
  DATE_FORMATS,
  STORAGE_KEYS,
};
