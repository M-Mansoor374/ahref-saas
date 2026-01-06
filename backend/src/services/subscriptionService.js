// Subscription service
const Subscription = require('../models/Subscription');
const { DEFAULT_KEYWORD_LIMITS, USER_ROLES } = require('../config/constants');

/**
 * Create a new subscription for a user
 * 
 * @param {Object} subscriptionData - Subscription data
 * @param {string} subscriptionData.userId - User ID
 * @param {Date} subscriptionData.startDate - Subscription start date (optional, defaults to now)
 * @param {Date} subscriptionData.expiryDate - Subscription expiry date
 * @param {number} subscriptionData.keywordLimit - Keyword limit (optional, uses default based on role)
 * @param {string} subscriptionData.userRole - User role (optional, for determining default limit)
 * @returns {Promise<Object>} Created subscription object
 */
const createSubscription = async (subscriptionData) => {
  try {
    const {
      userId,
      startDate = new Date(),
      expiryDate,
      keywordLimit,
      userRole = USER_ROLES.USER,
    } = subscriptionData;

    // Validate required fields
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!expiryDate) {
      throw new Error('Expiry date is required');
    }

    // Validate dates
    if (new Date(expiryDate) <= new Date(startDate)) {
      throw new Error('Expiry date must be after start date');
    }

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({ userId });
    if (existingSubscription) {
      throw new Error('Subscription already exists for this user');
    }

    // Determine keyword limit
    let finalKeywordLimit = keywordLimit;
    if (finalKeywordLimit === undefined || finalKeywordLimit === null) {
      // Use default based on role
      finalKeywordLimit = DEFAULT_KEYWORD_LIMITS[userRole] || DEFAULT_KEYWORD_LIMITS[USER_ROLES.USER];
    }

    // Create subscription
    const subscription = await Subscription.create({
      userId,
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
      keywordLimit: finalKeywordLimit,
      usedKeywords: 0,
      isExpired: false,
    });

    return subscription;
  } catch (error) {
    // Handle duplicate subscription error
    if (error.code === 11000) {
      throw new Error('Subscription already exists for this user');
    }
    throw error;
  }
};

/**
 * Check if subscription is expired and update status
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription object with updated expiration status
 */
const checkExpiry = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Find subscription
    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check and update expiration status using model method
    const wasExpired = subscription.isExpired;
    subscription.checkExpiration();

    // Save if status changed
    if (subscription.isExpired !== wasExpired) {
      await subscription.save();
    }

    // Return subscription with expiration status
    return {
      subscription,
      isExpired: subscription.isExpired,
      isActive: subscription.isActive,
      daysRemaining: calculateDaysRemaining(subscription.expiryDate),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update keyword usage for a subscription
 * 
 * @param {string} userId - User ID
 * @param {number} keywordCount - Number of keywords to add (default: 1)
 * @param {boolean} force - Force update even if limit would be exceeded (default: false)
 * @returns {Promise<Object>} Updated subscription object
 */
const updateUsage = async (userId, keywordCount = 1, force = false) => {
  try {
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
      throw new Error('Cannot update usage for expired subscription');
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
      return subscription;
    }

    // Check if update would exceed limit
    const newUsedCount = subscription.usedKeywords + keywordCount;
    if (newUsedCount > subscription.keywordLimit && !force) {
      throw new Error(
        `Usage limit would be exceeded. Current: ${subscription.usedKeywords}/${subscription.keywordLimit}, Requested: +${keywordCount}`
      );
    }

    // Update usage using model method
    if (force) {
      // Force update (bypass limit check)
      subscription.usedKeywords = Math.min(newUsedCount, subscription.keywordLimit);
    } else {
      // Safe update with limit check
      const canIncrement = subscription.incrementUsedKeywords(keywordCount);
      if (!canIncrement) {
        throw new Error('Cannot increment usage. Limit would be exceeded.');
      }
    }

    // Save updated subscription
    await subscription.save();

    return subscription;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset keyword usage for a subscription
 * 
 * @param {string} userId - User ID
 * @param {number} resetTo - Value to reset to (default: 0)
 * @returns {Promise<Object>} Updated subscription object
 */
const resetUsage = async (userId, resetTo = 0) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (resetTo < 0) {
      throw new Error('Reset value cannot be negative');
    }

    // Find subscription
    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check if reset value exceeds limit
    if (subscription.keywordLimit !== -1 && resetTo > subscription.keywordLimit) {
      throw new Error(`Reset value (${resetTo}) cannot exceed keyword limit (${subscription.keywordLimit})`);
    }

    // Reset usage
    subscription.usedKeywords = resetTo;
    await subscription.save();

    return subscription;
  } catch (error) {
    throw error;
  }
};

/**
 * Get subscription details for a user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription object with calculated fields
 */
const getSubscription = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return null;
    }

    // Check and update expiration status
    subscription.checkExpiration();
    if (subscription.isExpired !== subscription.isExpired) {
      await subscription.save();
    }

    return subscription;
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate days remaining until expiry
 * 
 * @param {Date} expiryDate - Expiry date
 * @returns {number} Days remaining (negative if expired)
 */
const calculateDaysRemaining = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Extend subscription expiry date
 * 
 * @param {string} userId - User ID
 * @param {Date} newExpiryDate - New expiry date
 * @returns {Promise<Object>} Updated subscription object
 */
const extendSubscription = async (userId, newExpiryDate) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!newExpiryDate) {
      throw new Error('New expiry date is required');
    }

    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Validate new expiry date
    if (new Date(newExpiryDate) <= subscription.startDate) {
      throw new Error('New expiry date must be after start date');
    }

    // Update expiry date
    subscription.expiryDate = new Date(newExpiryDate);

    // Recheck expiration status
    subscription.checkExpiration();

    await subscription.save();

    return subscription;
  } catch (error) {
    throw error;
  }
};

/**
 * Update keyword limit for a subscription
 * 
 * @param {string} userId - User ID
 * @param {number} newLimit - New keyword limit
 * @returns {Promise<Object>} Updated subscription object
 */
const updateKeywordLimit = async (userId, newLimit) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (newLimit < -1) {
      throw new Error('Keyword limit cannot be less than -1 (unlimited)');
    }

    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // If new limit is less than current usage (and not unlimited), adjust usage
    if (newLimit !== -1 && subscription.usedKeywords > newLimit) {
      subscription.usedKeywords = newLimit;
    }

    subscription.keywordLimit = newLimit;
    await subscription.save();

    return subscription;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createSubscription,
  checkExpiry,
  updateUsage,
  resetUsage,
  getSubscription,
  extendSubscription,
  updateKeywordLimit,
  calculateDaysRemaining,
};
