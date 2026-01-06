const subscriptionService = require('../services/subscriptionService');
const usageTrackingService = require('../services/usageTrackingService');
const User = require('../models/User');
const { HTTP_STATUS } = require('../types');

const getSubscription = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    const daysRemaining = subscriptionService.calculateDaysRemaining(subscription.expiryDate);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Subscription retrieved successfully',
      data: {
        subscription: {
          id: subscription._id,
          userId: subscription.userId,
          keywordLimit: subscription.keywordLimit,
          usedKeywords: subscription.usedKeywords,
          remainingKeywords: subscription.remainingKeywords,
          startDate: subscription.startDate,
          expiryDate: subscription.expiryDate,
          isExpired: subscription.isExpired,
          isActive: subscription.isActive,
          daysRemaining,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve subscription',
    });
  }
};

const createSubscription = async (req, res) => {
  try {
    const { userId, startDate, expiryDate, keywordLimit, userRole } = req.body;

    if (!userId || !expiryDate) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'User ID and expiry date are required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      });
    }

    const subscription = await subscriptionService.createSubscription({
      userId,
      startDate,
      expiryDate,
      keywordLimit,
      userRole: userRole || user.role,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription: {
          id: subscription._id,
          userId: subscription.userId,
          keywordLimit: subscription.keywordLimit,
          usedKeywords: subscription.usedKeywords,
          startDate: subscription.startDate,
          expiryDate: subscription.expiryDate,
          isExpired: subscription.isExpired,
          isActive: subscription.isActive,
        },
      },
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('must be after start date')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Create subscription error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create subscription',
    });
  }
};

const extendSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { expiryDate } = req.body;

    if (!userId || !expiryDate) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'User ID and expiry date are required',
      });
    }

    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid expiry date format',
      });
    }

    const subscription = await subscriptionService.extendSubscription(userId, expiry);

    const daysRemaining = subscriptionService.calculateDaysRemaining(subscription.expiryDate);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Subscription extended successfully',
      data: {
        subscription: {
          id: subscription._id,
          userId: subscription.userId,
          expiryDate: subscription.expiryDate,
          startDate: subscription.startDate,
          isExpired: subscription.isExpired,
          isActive: subscription.isActive,
          daysRemaining,
        },
      },
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('must be after start date')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Extend subscription error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to extend subscription',
    });
  }
};

const updateKeywordLimit = async (req, res) => {
  try {
    const { userId } = req.params;
    const { keywordLimit } = req.body;

    if (keywordLimit === undefined || keywordLimit === null) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Keyword limit is required',
      });
    }

    if (keywordLimit < -1) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Keyword limit cannot be less than -1 (unlimited)',
      });
    }

    const subscription = await subscriptionService.updateKeywordLimit(userId, keywordLimit);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Keyword limit updated successfully',
      data: {
        subscription: {
          id: subscription._id,
          userId: subscription.userId,
          keywordLimit: subscription.keywordLimit,
          usedKeywords: subscription.usedKeywords,
          remainingKeywords: subscription.remainingKeywords,
        },
      },
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Update keyword limit error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update keyword limit',
    });
  }
};

const checkExpiry = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const result = await subscriptionService.checkExpiry(userId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Subscription expiry checked successfully',
      data: {
        subscription: {
          id: result.subscription._id,
          userId: result.subscription.userId,
          isExpired: result.isExpired,
          isActive: result.isActive,
          expiryDate: result.subscription.expiryDate,
          daysRemaining: result.daysRemaining,
        },
      },
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Check expiry error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to check subscription expiry',
    });
  }
};

const getUsageStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    const usageInfo = await usageTrackingService.getRemainingLimit(userId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Usage statistics retrieved successfully',
      data: {
        subscription: {
          keywordLimit: subscription.keywordLimit,
          usedKeywords: subscription.usedKeywords,
          remainingKeywords: subscription.remainingKeywords,
          isExpired: subscription.isExpired,
          isActive: subscription.isActive,
        },
        usage: {
          keywordLimit: usageInfo.keywordLimit,
          usedKeywords: usageInfo.usedKeywords,
          remainingKeywords: usageInfo.remainingKeywords,
          isUnlimited: usageInfo.isUnlimited,
          percentageUsed: usageInfo.percentageUsed,
        },
      },
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve usage statistics',
    });
  }
};

const resetUsage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { resetTo = 0 } = req.body;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (resetTo < 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Reset value cannot be negative',
      });
    }

    const subscription = await subscriptionService.resetUsage(userId, resetTo);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Usage reset successfully',
      data: {
        subscription: {
          id: subscription._id,
          userId: subscription.userId,
          usedKeywords: subscription.usedKeywords,
          keywordLimit: subscription.keywordLimit,
          remainingKeywords: subscription.remainingKeywords,
        },
      },
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('cannot exceed')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Reset usage error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to reset usage',
    });
  }
};

module.exports = {
  getSubscription,
  createSubscription,
  extendSubscription,
  updateKeywordLimit,
  checkExpiry,
  getUsageStats,
  resetUsage,
};
