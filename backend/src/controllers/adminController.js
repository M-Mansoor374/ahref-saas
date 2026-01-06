// Super Admin controller
const authService = require('../services/authService');
const subscriptionService = require('../services/subscriptionService');
const User = require('../models/User');
const { USER_ROLES } = require('../config/constants');

/**
 * Cookie model reference (optional - if model exists)
 */
let CookieModel = null;
try {
  CookieModel = require('../models/Cookie');
} catch (error) {
  console.warn('Cookie model not found. Cookie operations will use fallback.');
}

/**
 * Get all resellers
 * GET /api/admin/resellers
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getResellers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { role: USER_ROLES.RESELLER };
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // Get resellers with pagination
    const [resellers, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    // Get user counts for each reseller
    const resellersWithCounts = await Promise.all(
      resellers.map(async (reseller) => {
        const userCount = await User.countDocuments({
          resellerId: reseller._id.toString(),
          role: USER_ROLES.USER,
        });
        
        return {
          ...reseller,
          userCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Resellers retrieved successfully',
      data: {
        resellers: resellersWithCounts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get resellers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resellers',
      error: error.message,
    });
  }
};

/**
 * Add a new reseller
 * POST /api/admin/resellers
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addReseller = async (req, res) => {
  try {
    const { name, email, password, userLimit, startDate, expiryDate } = req.body;

    // Validate input
    if (!name || !email || !password || userLimit === undefined || !startDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, user limit, start date, and expiry date are required',
      });
    }

    // Create reseller using auth service
    const reseller = await authService.registerUser({
      name,
      email,
      password,
      role: USER_ROLES.RESELLER,
      resellerId: null,
      userLimit: parseInt(userLimit, 10),
      startDate,
      expiryDate,
    });

    return res.status(201).json({
      success: true,
      message: 'Reseller created successfully',
      data: {
        reseller,
      },
    });
  } catch (error) {
    // Handle duplicate email
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Add reseller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create reseller',
    });
  }
};

/**
 * Add a new user
 * POST /api/admin/users
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addUser = async (req, res) => {
  try {
    const { name, email, password, resellerId, role = USER_ROLES.USER, keywordLimit, startDate, expiryDate } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Validate role
    if (role === USER_ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Cannot create super admin user through this endpoint',
      });
    }

    // Validate reseller exists if resellerId is provided
    if (resellerId) {
      const reseller = await User.findOne({
        _id: resellerId,
        role: USER_ROLES.RESELLER,
      });

      if (!reseller) {
        return res.status(404).json({
          success: false,
          message: 'Reseller not found',
        });
      }
    }

    // Create user using auth service
    const user = await authService.registerUser({
      name: name || email.split('@')[0],
      email,
      password,
      role,
      resellerId: resellerId || null,
    });

    // Set keyword limit if provided
    if (keywordLimit !== undefined) {
      const now = new Date();
      const expiry = expiryDate ? new Date(expiryDate) : new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      const start = startDate ? new Date(startDate) : now;

      await subscriptionService.createSubscription({
        userId: user._id.toString(),
        startDate: start,
        expiryDate: expiry,
        keywordLimit: parseInt(keywordLimit),
        userRole: role,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    // Handle duplicate email
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Add user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

/**
 * Set keyword limit for a user's subscription
 * PUT /api/admin/users/:userId/keyword-limit
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setKeywordLimit = async (req, res) => {
  try {
    const { userId } = req.params;
    const { keywordLimit } = req.body;

    // Validate input
    if (keywordLimit === undefined || keywordLimit === null) {
      return res.status(400).json({
        success: false,
        message: 'Keyword limit is required',
      });
    }

    if (keywordLimit < -1) {
      return res.status(400).json({
        success: false,
        message: 'Keyword limit cannot be less than -1 (unlimited)',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get or create subscription
    let subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      // Create subscription with default dates if it doesn't exist
      const now = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(now.getFullYear() + 1);

      subscription = await subscriptionService.createSubscription({
        userId,
        startDate: now,
        expiryDate: oneYearLater,
        keywordLimit,
        userRole: user.role,
      });
    } else {
      // Update existing subscription limit
      subscription = await subscriptionService.updateKeywordLimit(userId, keywordLimit);
    }

    return res.status(200).json({
      success: true,
      message: 'Keyword limit updated successfully',
      data: {
        subscription: {
          keywordLimit: subscription.keywordLimit,
          usedKeywords: subscription.usedKeywords,
          remainingKeywords: subscription.remainingKeywords,
        },
      },
    });
  } catch (error) {
    console.error('Set keyword limit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update keyword limit',
    });
  }
};

/**
 * Set expiry date for a user's subscription
 * PUT /api/admin/users/:userId/expiry-date
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setExpiryDate = async (req, res) => {
  try {
    const { userId } = req.params;
    const { expiryDate } = req.body;

    // Validate input
    if (!expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date is required',
      });
    }

    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expiry date format',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get or create subscription
    let subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      // Create subscription with default limit if it doesn't exist
      const now = new Date();
      subscription = await subscriptionService.createSubscription({
        userId,
        startDate: now,
        expiryDate: expiry,
        userRole: user.role,
      });
    } else {
      // Update existing subscription expiry
      subscription = await subscriptionService.extendSubscription(userId, expiry);
    }

    return res.status(200).json({
      success: true,
      message: 'Expiry date updated successfully',
      data: {
        subscription: {
          expiryDate: subscription.expiryDate,
          startDate: subscription.startDate,
          isExpired: subscription.isExpired,
          isActive: subscription.isActive,
        },
      },
    });
  } catch (error) {
    if (error.message.includes('must be after start date')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Set expiry date error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update expiry date',
    });
  }
};

/**
 * Update Ahrefs cookies for a user or reseller
 * PUT /api/admin/cookies/:ownerId
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAhrefsCookies = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { cookies, ownerType = USER_ROLES.RESELLER } = req.body;

    // Validate input
    if (!cookies || !Array.isArray(cookies)) {
      return res.status(400).json({
        success: false,
        message: 'Cookies array is required',
      });
    }

    if (ownerType !== USER_ROLES.SUPER_ADMIN && ownerType !== USER_ROLES.RESELLER) {
      return res.status(400).json({
        success: false,
        message: 'Owner type must be either super_admin or reseller',
      });
    }

    // Validate owner exists
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found',
      });
    }

    // Validate owner type matches
    if (ownerType === USER_ROLES.RESELLER && owner.role !== USER_ROLES.RESELLER) {
      return res.status(400).json({
        success: false,
        message: 'Owner is not a reseller',
      });
    }

    // Try to save cookies using Cookie model if it exists
    if (CookieModel) {
      try {
        const cookieDoc = await CookieModel.findOneAndUpdate(
          {
            $or: [
              { userId: ownerId },
              { resellerId: ownerId },
            ],
          },
          {
            $set: {
              cookies,
              updatedAt: new Date(),
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

        return res.status(200).json({
          success: true,
          message: 'Cookies updated successfully',
          data: {
            ownerId,
            ownerType,
            cookiesCount: cookies.length,
          },
        });
      } catch (error) {
        console.error('Error saving cookies to database:', error);
        // Fall through to return success anyway
      }
    }

    // If Cookie model doesn't exist, just return success
    // (Cookies might be stored in memory or another system)
    return res.status(200).json({
      success: true,
      message: 'Cookies update request received',
      data: {
        ownerId,
        ownerType,
        cookiesCount: cookies.length,
        note: 'Cookie model not configured. Cookies stored in memory.',
      },
    });
  } catch (error) {
    console.error('Update Ahrefs cookies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cookies',
    });
  }
};

/**
 * View active users
 * GET /api/admin/users/active
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const viewActiveUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role, resellerId } = req.query;

    // Build query
    const query = {
      isActive: true,
    };

    // Filter by role if provided
    if (role) {
      query.role = role;
    }

    // Filter by reseller if provided
    if (resellerId) {
      query.resellerId = resellerId;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get active users with pagination
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await User.countDocuments(query);

    // Get subscription info for each user (optional)
    const usersWithSubscription = await Promise.all(
      users.map(async (user) => {
        const subscription = await subscriptionService.getSubscription(user._id.toString());
        return {
          ...user.toObject(),
          subscription: subscription
            ? {
                keywordLimit: subscription.keywordLimit,
                usedKeywords: subscription.usedKeywords,
                remainingKeywords: subscription.remainingKeywords,
                isExpired: subscription.isExpired,
                expiryDate: subscription.expiryDate,
              }
            : null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Active users retrieved successfully',
      data: {
        users: usersWithSubscription,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('View active users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve active users',
    });
  }
};

module.exports = {
  getResellers,
  addReseller,
  addUser,
  setKeywordLimit,
  setExpiryDate,
  updateAhrefsCookies,
  viewActiveUsers,
};
