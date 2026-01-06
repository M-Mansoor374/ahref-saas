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

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} role - User role (super_admin | reseller | user)
 * @property {string|null} resellerId - Reseller ID (if applicable)
 * @property {boolean} isActive - Active status
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Subscription
 * @property {string} id - Subscription ID
 * @property {string} userId - User ID
 * @property {number} keywordLimit - Keyword limit (-1 for unlimited)
 * @property {number} usedKeywords - Used keywords count
 * @property {number} remainingKeywords - Remaining keywords count
 * @property {boolean} isUnlimited - Whether subscription is unlimited
 * @property {string} startDate - Subscription start date
 * @property {string} expiryDate - Subscription expiry date
 * @property {boolean} isExpired - Whether subscription is expired
 * @property {number} daysRemaining - Days until expiry
 */

/**
 * @typedef {Object} UsageStats
 * @property {number} keywordLimit - Total keyword limit
 * @property {number} usedKeywords - Used keywords
 * @property {number} remainingKeywords - Remaining keywords
 * @property {boolean} isUnlimited - Whether usage is unlimited
 * @property {number} usagePercentage - Usage percentage (0-100)
 */

/**
 * @typedef {Object} DashboardData
 * @property {User} user - User information
 * @property {Subscription} subscription - Subscription information
 * @property {UsageStats} usage - Usage statistics
 * @property {Object|null} branding - Branding information
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Request success status
 * @property {string} message - Response message
 * @property {*} data - Response data
 * @property {Object} [pagination] - Pagination information (if applicable)
 */

/**
 * @typedef {Object} Pagination
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} total - Total items
 * @property {number} totalPages - Total pages
 */

/**
 * @typedef {Object} Reseller
 * @property {string} id - Reseller ID
 * @property {string} name - Reseller name
 * @property {string} email - Reseller email
 * @property {number} userLimit - Maximum user limit
 * @property {number} activeUsers - Current active users count
 * @property {number} remainingSlots - Remaining user slots
 * @property {string} startDate - Subscription start date
 * @property {string} expiryDate - Subscription expiry date
 * @property {string} status - Account status
 */

/**
 * @typedef {Object} Branding
 * @property {string} text - Branding text
 * @property {string|null} link - Branding link URL
 * @property {string|null} logoUrl - Logo URL
 * @property {string} primaryColor - Primary color hex
 * @property {string} secondaryColor - Secondary color hex
 */

/**
 * @typedef {Object} IPAddress
 * @property {string} id - IP address ID
 * @property {string} ipAddress - IP address
 * @property {string|null} description - IP description
 * @property {string|null} ownerId - Owner ID (user or reseller)
 * @property {string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} ToolAccess
 * @property {boolean} accessGranted - Whether access is granted
 * @property {User} user - User information
 * @property {Subscription} subscription - Subscription information
 * @property {string|null} branding - Branding text
 * @property {string} timestamp - Access timestamp
 */

/**
 * @typedef {Object} KeywordMetrics
 * @property {string} keyword - Keyword
 * @property {number} searchVolume - Search volume
 * @property {number} difficulty - Keyword difficulty
 * @property {number} cpc - Cost per click
 * @property {number} competition - Competition level
 */

/**
 * @typedef {Object} Backlink
 * @property {string} id - Backlink ID
 * @property {string} domain - Domain URL
 * @property {string} anchorText - Anchor text
 * @property {number} domainRating - Domain rating
 * @property {string} dateFound - Date found
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User|null} user - Current user
 * @property {boolean} isAuthenticated - Authentication status
 * @property {boolean} isLoading - Loading state
 * @property {string|null} token - Authentication token
 * @property {string|null} role - User role
 * @property {Function} login - Login function
 * @property {Function} logout - Logout function
 * @property {Function} getCurrentUser - Get current user function
 * @property {Function} updateToken - Update token function
 * @property {Function} clearAuth - Clear auth function
 */

/**
 * @typedef {Object} UserContextValue
 * @property {User} userData - User data
 * @property {boolean} isLoading - Loading state
 * @property {Function} setUserData - Set user data function
 * @property {Function} updateUsage - Update usage function
 * @property {Function} resetUsage - Reset usage function
 */

/**
 * @typedef {Object} BrandingContextValue
 * @property {string|null} brandingText - Branding text
 * @property {string|null} brandingLink - Branding link
 * @property {boolean} isLoading - Loading state
 * @property {Function} setBrandingText - Set branding text function
 * @property {Function} setBrandingLink - Set branding link function
 * @property {Function} setBranding - Set branding function
 * @property {Function} clearBranding - Clear branding function
 * @property {Function} fetchBranding - Fetch branding function
 */

export default {
  USER_ROLES,
  USER_STATUS,
};
