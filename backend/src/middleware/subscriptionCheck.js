// Subscription expiry/start date validation middleware
const Subscription = require('../models/Subscription');

/**
 * Middleware to check user's subscription status
 * Validates start and expiry dates and blocks access if expired
 * Attaches subscription info to request object
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const subscriptionCheck = async (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user || !req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.',
      });
    }

    // Find user's subscription
    const subscription = await Subscription.findOne({ userId: req.userId });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No subscription found. Please contact administrator.',
      });
    }

    // Check and update expiration status
    subscription.checkExpiration();

    // Validate start date
    const now = new Date();
    if (now < subscription.startDate) {
      return res.status(403).json({
        success: false,
        message: 'Subscription has not started yet.',
        subscriptionStartDate: subscription.startDate,
      });
    }

    // Validate expiry date
    if (now > subscription.expiryDate) {
      // Update subscription as expired if not already updated
      if (!subscription.isExpired) {
        subscription.isExpired = true;
        await subscription.save();
      }

      return res.status(403).json({
        success: false,
        message: 'Subscription has expired. Please renew your subscription.',
        expiryDate: subscription.expiryDate,
      });
    }

    // Check if subscription is marked as expired (even if dates are valid)
    if (subscription.isExpired) {
      return res.status(403).json({
        success: false,
        message: 'Subscription is expired. Please renew your subscription.',
        expiryDate: subscription.expiryDate,
      });
    }

    // Attach subscription info to request object
    req.subscription = subscription;
    req.subscriptionId = subscription._id;
    req.keywordLimit = subscription.keywordLimit;
    req.usedKeywords = subscription.usedKeywords;
    req.remainingKeywords = subscription.remainingKeywords;
    req.isSubscriptionActive = subscription.isActive;

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Subscription check middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify subscription. Internal server error.',
    });
  }
};

/**
 * Optional middleware to check subscription but allow access even if expired
 * Useful for read-only operations or showing subscription status
 * Still attaches subscription info to request
 */
const subscriptionInfo = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.',
      });
    }

    // Find user's subscription
    const subscription = await Subscription.findOne({ userId: req.userId });

    if (!subscription) {
      // Attach null subscription info but allow access
      req.subscription = null;
      req.subscriptionId = null;
      req.keywordLimit = 0;
      req.usedKeywords = 0;
      req.remainingKeywords = 0;
      req.isSubscriptionActive = false;
      return next();
    }

    // Check and update expiration status
    subscription.checkExpiration();

    // Attach subscription info to request object (even if expired)
    req.subscription = subscription;
    req.subscriptionId = subscription._id;
    req.keywordLimit = subscription.keywordLimit;
    req.usedKeywords = subscription.usedKeywords;
    req.remainingKeywords = subscription.remainingKeywords;
    req.isSubscriptionActive = subscription.isActive;

    // Continue to next middleware (allows access even if expired)
    next();
  } catch (error) {
    console.error('Subscription info middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription info. Internal server error.',
    });
  }
};

module.exports = {
  subscriptionCheck,
  subscriptionInfo,
};
