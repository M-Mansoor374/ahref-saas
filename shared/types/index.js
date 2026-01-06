/**
 * Shared Type Definitions
 * JSDoc type definitions shared between frontend and backend
 */

/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} name - User full name
 * @property {string} email - User email address
 * @property {string} role - User role (super_admin, reseller, reseller_admin, user)
 * @property {string} status - User status (active, inactive, suspended, deleted)
 * @property {string} [passwordHash] - Hashed password (backend only)
 * @property {number} keywordLimit - Maximum keywords allowed
 * @property {number} usedKeywords - Number of keywords used
 * @property {string} [assignedIP] - Assigned static IP address
 * @property {string} [resellerId] - Parent reseller ID (for users)
 * @property {Date} [startDate] - Subscription start date
 * @property {Date} [expiryDate] - Subscription expiry date
 * @property {Date} createdAt - Account creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} Reseller
 * @property {string} _id - Reseller ID
 * @property {string} name - Reseller name
 * @property {string} email - Reseller email address
 * @property {string} status - Reseller status (active, inactive, suspended)
 * @property {number} userLimit - Maximum users allowed
 * @property {number} currentUsers - Current number of users
 * @property {Date} [startDate] - Reseller start date
 * @property {Date} [expiryDate] - Reseller expiry date
 * @property {Date} createdAt - Account creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} Subscription
 * @property {string} _id - Subscription ID
 * @property {string} userId - User ID
 * @property {string} status - Subscription status (active, expired, pending, suspended, cancelled)
 * @property {number} keywordLimit - Maximum keywords allowed
 * @property {number} usedKeywords - Number of keywords used
 * @property {Date} startDate - Subscription start date
 * @property {Date} expiryDate - Subscription expiry date
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} IPWhitelist
 * @property {string} _id - IP whitelist entry ID
 * @property {string} ipAddress - IP address
 * @property {string} [assignedUserId] - Assigned user ID
 * @property {string} status - IP status (active, inactive, expired, pending)
 * @property {Date} [expiryDate] - IP expiry date
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} Branding
 * @property {string} _id - Branding ID
 * @property {string} userId - User/Reseller ID
 * @property {string} [logoUrl] - Logo URL
 * @property {string} [primaryColor] - Primary brand color
 * @property {string} [secondaryColor] - Secondary brand color
 * @property {string} [companyName] - Company name
 * @property {string} [footerText] - Footer text
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} ActivityLog
 * @property {string} _id - Activity log ID
 * @property {string} userId - User ID who performed the action
 * @property {string} action - Action type (e.g., 'user.create', 'auth.login')
 * @property {string} [targetUserId] - Target user ID (if applicable)
 * @property {string} [targetType] - Target type (user, reseller, subscription, etc.)
 * @property {string} [targetId] - Target ID
 * @property {string} status - Activity status (success, failed, pending, cancelled)
 * @property {Object} [metadata] - Additional metadata
 * @property {string} [ipAddress] - IP address of the action
 * @property {string} [userAgent] - User agent of the action
 * @property {Date} timestamp - Action timestamp
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} [message] - Response message
 * @property {*} [data] - Response data
 * @property {Object} [errors] - Error details (if any)
 * @property {number} [statusCode] - HTTP status code
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page - Page number (default: 1)
 * @property {number} limit - Items per page (default: 10)
 * @property {string} [sortBy] - Field to sort by
 * @property {string} [sortOrder] - Sort order (asc, desc)
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data - Array of items
 * @property {Object} pagination - Pagination metadata
 * @property {number} pagination.page - Current page
 * @property {number} pagination.limit - Items per page
 * @property {number} pagination.total - Total items
 * @property {number} pagination.pages - Total pages
 * @property {boolean} pagination.hasNext - Whether there is a next page
 * @property {boolean} pagination.hasPrev - Whether there is a previous page
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether authentication was successful
 * @property {User} user - Authenticated user object
 * @property {string} token - Authentication token
 * @property {string} [refreshToken] - Refresh token (if applicable)
 */

/**
 * @typedef {Object} CreateUserRequest
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} role - User role
 * @property {number} [keywordLimit] - Keyword limit
 * @property {string} [assignedIP] - Assigned IP address
 * @property {Date} [startDate] - Start date
 * @property {Date} [expiryDate] - Expiry date
 */

/**
 * @typedef {Object} UpdateUserRequest
 * @property {string} [name] - User name
 * @property {string} [email] - User email
 * @property {string} [password] - User password
 * @property {string} [status] - User status
 * @property {number} [keywordLimit] - Keyword limit
 * @property {string} [assignedIP] - Assigned IP address
 * @property {Date} [startDate] - Start date
 * @property {Date} [expiryDate] - Expiry date
 */

/**
 * @typedef {Object} CreateResellerRequest
 * @property {string} name - Reseller name
 * @property {string} email - Reseller email
 * @property {string} password - Reseller password
 * @property {number} [userLimit] - User limit
 * @property {Date} [startDate] - Start date
 * @property {Date} [expiryDate] - Expiry date
 */

/**
 * @typedef {Object} CreateIPRequest
 * @property {string} ipAddress - IP address
 * @property {string} [assignedUserId] - Assigned user ID
 * @property {Date} [expiryDate] - Expiry date
 */

/**
 * @typedef {Object} DashboardStats
 * @property {Object} statistics - Statistics data
 * @property {Object} statistics.users - User statistics
 * @property {number} statistics.users.total - Total users
 * @property {number} statistics.users.active - Active users
 * @property {Object} statistics.resellers - Reseller statistics
 * @property {number} statistics.resellers.total - Total resellers
 * @property {Object} statistics.keywords - Keyword statistics
 * @property {number} statistics.keywords.remaining - Remaining keywords
 * @property {Array<ActivityLog>} [recentActivity] - Recent activity logs
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - Field name with error
 * @property {string} message - Error message
 * @property {*} [value] - Invalid value
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false
 * @property {string} message - Error message
 * @property {string} [code] - Error code
 * @property {Array<ValidationError>} [errors] - Validation errors (if any)
 * @property {number} [statusCode] - HTTP status code
 */

module.exports = {};
