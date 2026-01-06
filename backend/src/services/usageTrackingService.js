// Track used/remaining limits service
const Subscription = require('../models/Subscription');
const ActivityLog = require('../models/ActivityLog');

/**
 * UsageLog model reference (optional - if model exists)
 */
let UsageLog = null;
try {
  UsageLog = require('../models/UsageLog');
} catch (error) {
  // UsageLog model doesn't exist yet, will log to ActivityLog as fallback
  console.warn('UsageLog model not found. Using ActivityLog as fallback.');
}

/**
 * Log usage activity for tracking
 * 
 * @param {Object} usageData - Usage data to log
 * @param {string} usageData.userId - User ID
 * @param {number} usageData.keywordCount - Number of keywords used
 * @param {string} usageData.action - Action type (e.g., 'keyword_search', 'api_call')
 * @param {string} usageData.ipAddress - IP address of the request
 * @param {Object} usageData.metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Created usage log entry
 */
const logUsage = async (usageData) => {
  try {
    const {
      userId,
      keywordCount = 0,
      action = 'keyword_usage',
      ipAddress,
      metadata = {},
    } = usageData;

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Try to log to UsageLog model if it exists
    if (UsageLog) {
      try {
        const usageLog = await UsageLog.create({
          userId,
          keywordCount,
          action,
          metadata,
          timestamp: new Date(),
        });
        return usageLog;
      } catch (error) {
        console.error('Error logging to UsageLog:', error);
        // Fall through to ActivityLog
      }
    }

    // Fallback to ActivityLog if UsageLog doesn't exist or fails
    if (ipAddress) {
      const activityLog = await ActivityLog.create({
        userId,
        action: `${action} (${keywordCount} keywords)`,
        ipAddress,
      });

      return {
        ...activityLog.toObject(),
        keywordCount,
        metadata,
      };
    }

    // If no IP address, just return a simple log object
    return {
      userId,
      keywordCount,
      action,
      metadata,
      timestamp: new Date(),
      logged: true,
    };
  } catch (error) {
    console.error('Error in logUsage:', error);
    throw error;
  }
};

/**
 * Increment keyword count for a user's subscription
 * 
 * @param {string} userId - User ID
 * @param {number} keywordCount - Number of keywords to increment (default: 1)
 * @param {Object} options - Additional options
 * @param {boolean} options.force - Force increment even if limit exceeded (default: false)
 * @param {boolean} options.logUsage - Whether to log this usage (default: true)
 * @param {string} options.action - Action type for logging (default: 'keyword_usage')
 * @param {string} options.ipAddress - IP address for logging (optional)
 * @param {Object} options.metadata - Additional metadata for logging (optional)
 * @returns {Promise<Object>} Updated subscription and usage info
 */
const incrementKeywordCount = async (userId, keywordCount = 1, options = {}) => {
  try {
    const {
      force = false,
      logUsage: shouldLog = true,
      action = 'keyword_usage',
      ipAddress = null,
      metadata = {},
    } = options;

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (keywordCount < 0) {
      throw new Error('Keyword count cannot be negative');
    }

    // Find subscription
    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check if subscription is expired
    subscription.checkExpiration();
    if (subscription.isExpired) {
      throw new Error('Cannot increment usage for expired subscription');
    }

    // Check if subscription has started
    const now = new Date();
    if (now < subscription.startDate) {
      throw new Error('Subscription has not started yet');
    }

    // Check if limit is unlimited
    if (subscription.keywordLimit === -1) {
      // Unlimited, just increment
      subscription.usedKeywords += keywordCount;
      await subscription.save();

      // Log usage if requested
      if (shouldLog) {
        await logUsage({
          userId,
          keywordCount,
          action,
          ipAddress,
          metadata: {
            ...metadata,
            unlimited: true,
          },
        });
      }

      return {
        subscription,
        usedKeywords: subscription.usedKeywords,
        remainingKeywords: -1, // Unlimited
        keywordLimit: -1,
        success: true,
      };
    }

    // Check if increment would exceed limit
    const newUsedCount = subscription.usedKeywords + keywordCount;
    if (newUsedCount > subscription.keywordLimit && !force) {
      throw new Error(
        `Usage limit would be exceeded. Current: ${subscription.usedKeywords}/${subscription.keywordLimit}, Requested: +${keywordCount}`
      );
    }

    // Increment usage using model method
    if (force) {
      // Force increment (cap at limit)
      subscription.usedKeywords = Math.min(newUsedCount, subscription.keywordLimit);
    } else {
      // Safe increment with limit check
      const canIncrement = subscription.incrementUsedKeywords(keywordCount);
      if (!canIncrement) {
        throw new Error('Cannot increment usage. Limit would be exceeded.');
      }
    }

    // Save updated subscription
    await subscription.save();

    // Log usage if requested
    if (shouldLog) {
      await logUsage({
        userId,
        keywordCount,
        action,
        ipAddress,
        metadata: {
          ...metadata,
          usedBefore: subscription.usedKeywords - keywordCount,
          usedAfter: subscription.usedKeywords,
          limit: subscription.keywordLimit,
        },
      });
    }

    return {
      subscription,
      usedKeywords: subscription.usedKeywords,
      remainingKeywords: subscription.remainingKeywords,
      keywordLimit: subscription.keywordLimit,
      success: true,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get remaining keyword limit for a user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Usage information including remaining limit
 */
const getRemainingLimit = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Find subscription
    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return {
        hasSubscription: false,
        keywordLimit: 0,
        usedKeywords: 0,
        remainingKeywords: 0,
        isUnlimited: false,
        isExpired: true,
        isActive: false,
      };
    }

    // Check and update expiration status
    subscription.checkExpiration();
    if (subscription.isExpired !== subscription.isExpired) {
      await subscription.save();
    }

    // Calculate remaining keywords
    const isUnlimited = subscription.keywordLimit === -1;
    const remainingKeywords = isUnlimited
      ? -1
      : Math.max(0, subscription.keywordLimit - subscription.usedKeywords);

    return {
      hasSubscription: true,
      keywordLimit: subscription.keywordLimit,
      usedKeywords: subscription.usedKeywords,
      remainingKeywords,
      isUnlimited,
      isExpired: subscription.isExpired,
      isActive: subscription.isActive,
      startDate: subscription.startDate,
      expiryDate: subscription.expiryDate,
      percentageUsed: isUnlimited
        ? 0
        : subscription.keywordLimit > 0
        ? Math.round((subscription.usedKeywords / subscription.keywordLimit) * 100)
        : 0,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get usage statistics for a user
 * 
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date for statistics (optional)
 * @param {Date} endDate - End date for statistics (optional)
 * @returns {Promise<Object>} Usage statistics
 */
const getUsageStats = async (userId, startDate = null, endDate = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get current subscription info
    const limitInfo = await getRemainingLimit(userId);

    // Try to get usage logs if UsageLog model exists
    let usageLogs = [];
    if (UsageLog) {
      try {
        const query = { userId };
        if (startDate || endDate) {
          query.timestamp = {};
          if (startDate) query.timestamp.$gte = new Date(startDate);
          if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        usageLogs = await UsageLog.find(query).sort({ timestamp: -1 });
      } catch (error) {
        console.error('Error fetching usage logs:', error);
      }
    }

    // Get activity logs as fallback
    const activityLogs = await ActivityLog.find({
      userId,
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { $gte: new Date(startDate) } : {}),
              ...(endDate ? { $lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    })
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate total keywords used from logs
    let totalKeywordsFromLogs = 0;
    if (usageLogs.length > 0) {
      totalKeywordsFromLogs = usageLogs.reduce(
        (sum, log) => sum + (log.keywordCount || 0),
        0
      );
    }

    return {
      ...limitInfo,
      totalLogs: usageLogs.length || activityLogs.length,
      totalKeywordsFromLogs,
      recentLogs: usageLogs.slice(0, 10) || activityLogs.slice(0, 10),
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  logUsage,
  incrementKeywordCount,
  getRemainingLimit,
  getUsageStats,
};
