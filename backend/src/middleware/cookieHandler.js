// Server-side cookie management middleware
const { USER_ROLES } = require('../config/constants');

/**
 * Cookie storage model reference
 * Note: You may need to create a Cookie model to store Ahrefs cookies
 * This middleware assumes a Cookie model exists with:
 * - userId or resellerId (ObjectId)
 * - cookies (Array of cookie objects with name, value, domain, path, etc.)
 * - expiresAt (Date)
 */
let CookieModel = null;
try {
  CookieModel = require('../models/Cookie');
} catch (error) {
  // Cookie model doesn't exist yet, will use in-memory storage as fallback
  console.warn('Cookie model not found. Using in-memory storage as fallback.');
}

/**
 * In-memory cookie storage (fallback if Cookie model doesn't exist)
 */
const inMemoryCookieStore = new Map();

/**
 * Middleware to read Ahrefs cookies from database and attach to request
 * Cookies are stored server-side and never exposed to client
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const loadCookies = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.userId) {
      req.ahrefsCookies = [];
      return next();
    }

    let cookieOwnerId = null;
    let cookieOwnerType = null;

    // Determine cookie owner based on user role
    if (req.userRole === USER_ROLES.SUPER_ADMIN) {
      cookieOwnerId = req.userId;
      cookieOwnerType = USER_ROLES.SUPER_ADMIN;
    } else if (req.userRole === USER_ROLES.RESELLER) {
      cookieOwnerId = req.userId;
      cookieOwnerType = USER_ROLES.RESELLER;
    } else if (req.userRole === USER_ROLES.USER && req.user.resellerId) {
      cookieOwnerId = req.user.resellerId;
      cookieOwnerType = USER_ROLES.RESELLER;
    }

    let cookies = [];

    // Try to load cookies from database
    if (CookieModel && cookieOwnerId) {
      try {
        const cookieDoc = await CookieModel.findOne({
          $or: [
            { userId: cookieOwnerId },
            { resellerId: cookieOwnerId },
          ],
        });

        if (cookieDoc && cookieDoc.cookies) {
          // Filter out expired cookies
          const now = new Date();
          cookies = cookieDoc.cookies.filter(cookie => {
            if (cookie.expiresAt) {
              return new Date(cookie.expiresAt) > now;
            }
            return true; // Session cookies (no expiry)
          });

          // Update document if cookies were filtered
          if (cookies.length !== cookieDoc.cookies.length) {
            cookieDoc.cookies = cookies;
            await cookieDoc.save();
          }
        }
      } catch (error) {
        console.error('Error loading cookies from database:', error);
      }
    }

    // Fallback to in-memory storage if database model doesn't exist
    if (cookies.length === 0 && cookieOwnerId) {
      const memoryKey = `${cookieOwnerType}_${cookieOwnerId}`;
      const storedCookies = inMemoryCookieStore.get(memoryKey);
      if (storedCookies) {
        cookies = storedCookies.filter(cookie => {
          if (cookie.expiresAt) {
            return new Date(cookie.expiresAt) > new Date();
          }
          return true;
        });
      }
    }

    // Attach cookies to request (server-side only, never sent to client)
    req.ahrefsCookies = cookies;
    req.cookieString = formatCookiesForRequest(cookies);

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Cookie handler middleware error:', error);
    req.ahrefsCookies = [];
    req.cookieString = '';
    next();
  }
};

/**
 * Format cookies array into cookie string for HTTP requests
 * 
 * @param {Array} cookies - Array of cookie objects
 * @returns {string} Formatted cookie string
 */
const formatCookiesForRequest = (cookies) => {
  if (!cookies || cookies.length === 0) {
    return '';
  }

  return cookies
    .map(cookie => {
      // Format: name=value
      return `${cookie.name}=${cookie.value}`;
    })
    .join('; ');
};

/**
 * Middleware to inject cookies into outgoing proxy requests
 * Adds cookies to request headers before forwarding to Ahrefs API
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const injectCookiesIntoRequest = (req, res, next) => {
  // Ensure cookies are loaded
  if (!req.ahrefsCookies) {
    req.ahrefsCookies = [];
    req.cookieString = '';
  }

  // Inject cookies into request headers for proxy requests
  if (req.cookieString) {
    // Set Cookie header for outgoing requests
    req.headers['Cookie'] = req.cookieString;
    
    // Also attach to a custom property for manual use
    req.proxyCookies = req.cookieString;
  }

  next();
};

/**
 * Helper function to save cookies to database after receiving from Ahrefs
 * 
 * @param {string} userId - User ID or Reseller ID
 * @param {string} ownerType - 'super_admin' or 'reseller'
 * @param {Array} cookies - Array of cookie objects from Ahrefs response
 */
const saveCookies = async (userId, ownerType, cookies) => {
  try {
    if (!CookieModel) {
      // Fallback to in-memory storage
      const memoryKey = `${ownerType}_${userId}`;
      inMemoryCookieStore.set(memoryKey, cookies);
      return;
    }

    // Parse cookies if they're in Set-Cookie header format
    const parsedCookies = cookies.map(cookie => {
      if (typeof cookie === 'string') {
        return parseCookieString(cookie);
      }
      return cookie;
    });

    // Find or create cookie document
    const cookieDoc = await CookieModel.findOneAndUpdate(
      {
        $or: [
          { userId: userId },
          { resellerId: userId },
        ],
      },
      {
        $set: {
          cookies: parsedCookies,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    return cookieDoc;
  } catch (error) {
    console.error('Error saving cookies:', error);
    throw error;
  }
};

/**
 * Parse Set-Cookie header string into cookie object
 * 
 * @param {string} cookieString - Cookie string from Set-Cookie header
 * @returns {Object} Parsed cookie object
 */
const parseCookieString = (cookieString) => {
  const parts = cookieString.split(';').map(part => part.trim());
  const [nameValue] = parts;
  const [name, value] = nameValue.split('=');

  const cookie = {
    name: name.trim(),
    value: value ? value.trim() : '',
  };

  // Parse additional attributes
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const [key, val] = part.split('=');

    switch (key.toLowerCase()) {
      case 'domain':
        cookie.domain = val;
        break;
      case 'path':
        cookie.path = val || '/';
        break;
      case 'expires':
        cookie.expiresAt = new Date(val);
        break;
      case 'max-age':
        cookie.maxAge = parseInt(val, 10);
        if (cookie.maxAge) {
          cookie.expiresAt = new Date(Date.now() + cookie.maxAge * 1000);
        }
        break;
      case 'secure':
        cookie.secure = true;
        break;
      case 'httponly':
        cookie.httpOnly = true;
        break;
      case 'samesite':
        cookie.sameSite = val;
        break;
    }
  }

  return cookie;
};

/**
 * Middleware to prevent client-side cookie access
 * Removes any cookie-related headers from response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const preventClientCookieAccess = (req, res, next) => {
  // Override res.setHeader to filter out Set-Cookie headers
  const originalSetHeader = res.setHeader.bind(res);

  res.setHeader = function (name, value) {
    // Block Set-Cookie headers from being sent to client
    if (name.toLowerCase() === 'set-cookie') {
      console.log('Blocked Set-Cookie header from being sent to client');
      return; // Don't set the header
    }
    return originalSetHeader(name, value);
  };

  // Also override res.set to catch Set-Cookie
  const originalSet = res.set.bind(res);

  res.set = function (name, value) {
    if (name.toLowerCase() === 'set-cookie') {
      console.log('Blocked Set-Cookie header from being sent to client');
      return res;
    }
    return originalSet(name, value);
  };

  next();
};

module.exports = {
  loadCookies,
  injectCookiesIntoRequest,
  saveCookies,
  parseCookieString,
  formatCookiesForRequest,
  preventClientCookieAccess,
};
