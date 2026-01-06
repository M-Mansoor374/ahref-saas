// User controller
const subscriptionService = require('../services/subscriptionService');
const usageTrackingService = require('../services/usageTrackingService');
const brandingService = require('../services/brandingService');
const User = require('../models/User');

/**
 * Get dashboard data for the user
 * GET /api/user/dashboard
 * 
 * Returns comprehensive dashboard information including:
 * - User profile
 * - Subscription status
 * - Usage statistics
 * - Branding information
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboardData = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get user information
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get subscription information
    const subscription = await subscriptionService.getSubscription(userId);

    // Get usage statistics
    const usageStats = await usageTrackingService.getRemainingLimit(userId);

    // Get branding information
    let branding = null;
    try {
      branding = await brandingService.getBrandingByUser(userId);
    } catch (error) {
      // Branding is optional, don't fail if it errors
      console.warn('Error fetching branding:', error);
    }

    // Calculate dashboard metrics
    const dashboardData = {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      subscription: subscription
        ? {
            keywordLimit: subscription.keywordLimit,
            usedKeywords: subscription.usedKeywords,
            remainingKeywords: subscription.remainingKeywords,
            isExpired: subscription.isExpired,
            isActive: subscription.isActive,
            startDate: subscription.startDate,
            expiryDate: subscription.expiryDate,
            daysRemaining: subscriptionService.calculateDaysRemaining(subscription.expiryDate),
          }
        : null,
      usage: {
        keywordLimit: usageStats.keywordLimit,
        usedKeywords: usageStats.usedKeywords,
        remainingKeywords: usageStats.remainingKeywords,
        isUnlimited: usageStats.isUnlimited,
        percentageUsed: usageStats.percentageUsed,
      },
      branding: branding ? branding.brandingText : null,
    };

    return res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
    });
  }
};

/**
 * Get usage statistics for the user
 * GET /api/user/usage-stats
 * 
 * Returns detailed usage statistics including:
 * - Current usage
 * - Remaining limits
 * - Usage history (if available)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUsageStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get current usage limit information
    const limitInfo = await usageTrackingService.getRemainingLimit(userId);

    // Get detailed usage statistics with date range if provided
    const detailedStats = await usageTrackingService.getUsageStats(
      userId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    // Get subscription for additional info
    const subscription = await subscriptionService.getSubscription(userId);

    const usageStats = {
      current: {
        keywordLimit: limitInfo.keywordLimit,
        usedKeywords: limitInfo.usedKeywords,
        remainingKeywords: limitInfo.remainingKeywords,
        isUnlimited: limitInfo.isUnlimited,
        percentageUsed: limitInfo.percentageUsed,
        isExpired: limitInfo.isExpired,
        isActive: limitInfo.isActive,
      },
      subscription: subscription
        ? {
            startDate: subscription.startDate,
            expiryDate: subscription.expiryDate,
            daysRemaining: subscriptionService.calculateDaysRemaining(subscription.expiryDate),
          }
        : null,
      history: {
        totalLogs: detailedStats.totalLogs,
        totalKeywordsFromLogs: detailedStats.totalKeywordsFromLogs,
        recentLogs: detailedStats.recentLogs || [],
      },
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    };

    return res.status(200).json({
      success: true,
      message: 'Usage statistics retrieved successfully',
      data: usageStats,
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve usage statistics',
    });
  }
};

/**
 * Access tool endpoint
 * POST /api/user/tool/access
 * 
 * Prepares and validates access to the Ahrefs-like tool
 * Checks subscription, usage limits, and returns access token/info
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const accessTool = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get user information
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact your administrator.',
      });
    }

    // Get subscription and check if active
    const subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No active subscription found. Please contact your administrator.',
      });
    }

    // Check subscription expiry
    subscription.checkExpiration();
    if (subscription.isExpired) {
      return res.status(403).json({
        success: false,
        message: 'Subscription has expired. Please renew your subscription.',
        expiryDate: subscription.expiryDate,
      });
    }

    // Check if subscription has started
    const now = new Date();
    if (now < subscription.startDate) {
      return res.status(403).json({
        success: false,
        message: 'Subscription has not started yet.',
        startDate: subscription.startDate,
      });
    }

    // Get usage limits
    const usageInfo = await usageTrackingService.getRemainingLimit(userId);

    // Check if user has remaining keywords (unless unlimited)
    if (!usageInfo.isUnlimited && usageInfo.remainingKeywords <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Keyword usage limit reached. Please upgrade your subscription.',
        limit: usageInfo.keywordLimit,
        used: usageInfo.usedKeywords,
        remaining: usageInfo.remainingKeywords,
      });
    }

    // Get branding information
    let branding = null;
    try {
      branding = await brandingService.getBrandingByUser(userId);
    } catch (error) {
      console.warn('Error fetching branding:', error);
    }

    // Return access information
    const accessInfo = {
      accessGranted: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      subscription: {
        keywordLimit: subscription.keywordLimit,
        usedKeywords: subscription.usedKeywords,
        remainingKeywords: subscription.remainingKeywords,
        isUnlimited: subscription.keywordLimit === -1,
        expiryDate: subscription.expiryDate,
        daysRemaining: subscriptionService.calculateDaysRemaining(subscription.expiryDate),
      },
      branding: branding ? branding.brandingText : null,
      timestamp: new Date(),
    };

    return res.status(200).json({
      success: true,
      message: 'Tool access granted',
      data: accessInfo,
    });
  } catch (error) {
    console.error('Access tool error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process tool access request',
    });
  }
};

module.exports = {
  getDashboardData,
  getUsageStats,
  accessTool,
};
