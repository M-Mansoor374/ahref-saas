// User limit checking middleware (used/remaining)
const Subscription = require('../models/Subscription');

/**
 * Middleware to check keyword usage limits before allowing access
 * Blocks access if limit is exceeded
 * 
 * @param {number} keywordCount - Number of keywords to check/use (default: 1)
 * @returns {Function} Express middleware function
 */
const checkUsageLimit = (keywordCount = 1) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please login first.',
        });
      }

      // Get subscription from request (should be set by subscriptionCheck middleware)
      // Or fetch it if not available
      let subscription = req.subscription;

      if (!subscription) {
        subscription = await Subscription.findOne({ userId: req.userId });

        if (!subscription) {
          return res.status(403).json({
            success: false,
            message: 'No subscription found. Please contact administrator.',
          });
        }

        // Attach to request for future use
        req.subscription = subscription;
      }

      // Check if subscription is expired
      if (subscription.isExpired) {
        return res.status(403).json({
          success: false,
          message: 'Subscription has expired. Please renew your subscription.',
        });
      }

      // Check if subscription has started
      const now = new Date();
      if (now < subscription.startDate) {
        return res.status(403).json({
          success: false,
          message: 'Subscription has not started yet.',
        });
      }

      // Check if limit is unlimited (-1)
      if (subscription.keywordLimit === -1) {
        // Unlimited access, allow and increment
        subscription.usedKeywords += keywordCount;
        await subscription.save();
        
        // Update request with new values
        req.usedKeywords = subscription.usedKeywords;
        req.remainingKeywords = -1; // Unlimited
        
        return next();
      }

      // Calculate remaining keywords
      const remainingKeywords = subscription.keywordLimit - subscription.usedKeywords;

      // Check if request would exceed limit
      if (keywordCount > remainingKeywords) {
        return res.status(403).json({
          success: false,
          message: 'Keyword usage limit exceeded.',
          limit: subscription.keywordLimit,
          used: subscription.usedKeywords,
          remaining: remainingKeywords,
          requested: keywordCount,
        });
      }

      // Safely increment usage using the model's method
      const canIncrement = subscription.incrementUsedKeywords(keywordCount);

      if (!canIncrement) {
        return res.status(403).json({
          success: false,
          message: 'Cannot increment keyword usage. Limit would be exceeded.',
          limit: subscription.keywordLimit,
          used: subscription.usedKeywords,
          remaining: remainingKeywords,
        });
      }

      // Save updated subscription
      await subscription.save();

      // Update request with new values
      req.usedKeywords = subscription.usedKeywords;
      req.remainingKeywords = subscription.remainingKeywords;
      req.keywordLimit = subscription.keywordLimit;

      // Continue to next middleware
      next();
    } catch (error) {
      console.error('Usage limit check middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check usage limits. Internal server error.',
      });
    }
  };
};

/**
 * Middleware to check usage limits without incrementing
 * Useful for read-only operations or checking before action
 */
const checkUsageLimitOnly = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.',
      });
    }

    // Get subscription from request or fetch it
    let subscription = req.subscription;

    if (!subscription) {
      subscription = await Subscription.findOne({ userId: req.userId });

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'No subscription found. Please contact administrator.',
        });
      }

      req.subscription = subscription;
    }

    // Check if subscription is expired
    if (subscription.isExpired) {
      return res.status(403).json({
        success: false,
        message: 'Subscription has expired. Please renew your subscription.',
      });
    }

    // Calculate remaining keywords
    const remainingKeywords = subscription.keywordLimit === -1 
      ? -1 
      : subscription.keywordLimit - subscription.usedKeywords;

    // Attach usage info to request (without incrementing)
    req.usedKeywords = subscription.usedKeywords;
    req.remainingKeywords = remainingKeywords;
    req.keywordLimit = subscription.keywordLimit;

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Usage limit check (read-only) middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check usage limits. Internal server error.',
    });
  }
};

/**
 * Helper function to log usage (if UsageLog model exists)
 * This can be called after successful operations
 */
const logUsage = async (userId, keywordCount, action = 'keyword_usage', metadata = {}) => {
  try {
    // Try to import UsageLog if it exists
    // If UsageLog model doesn't exist yet, this will fail gracefully
    const UsageLog = require('../models/UsageLog');
    
    await UsageLog.create({
      userId,
      keywordCount,
      action,
      metadata,
    });
  } catch (error) {
    // If UsageLog model doesn't exist, just log to console
    // This allows the middleware to work without UsageLog model
    if (error.code !== 'MODULE_NOT_FOUND') {
      console.error('Failed to log usage:', error);
    }
  }
};

module.exports = {
  checkUsageLimit,
  checkUsageLimitOnly,
  logUsage,
};
