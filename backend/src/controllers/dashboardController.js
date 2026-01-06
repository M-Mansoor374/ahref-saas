const subscriptionService = require('../services/subscriptionService');
const usageTrackingService = require('../services/usageTrackingService');
const brandingService = require('../services/brandingService');
const userService = require('../services/userService');
const User = require('../models/User');
const { HTTP_STATUS, USER_ROLES } = require('../types');

const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    let dashboardData = {};

    if (user.role === USER_ROLES.SUPER_ADMIN) {
      dashboardData = await getSuperAdminDashboard(user);
    } else if (user.role === USER_ROLES.RESELLER || user.role === USER_ROLES.RESELLER_ADMIN) {
      dashboardData = await getResellerDashboard(user);
    } else if (user.role === USER_ROLES.USER) {
      dashboardData = await getUserDashboard(user);
    } else {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Invalid user role',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
    });
  }
};

const getSuperAdminDashboard = async (user) => {
  const totalUsers = await userService.getUserCount({ role: USER_ROLES.USER });
  const activeUsers = await userService.getUserCount({ role: USER_ROLES.USER, isActive: true });
  const totalResellers = await userService.getUserCount({ role: USER_ROLES.RESELLER });
  const activeResellers = await userService.getUserCount({
    role: USER_ROLES.RESELLER,
    isActive: true,
  });

  let branding = null;
  try {
    branding = await brandingService.getBrandingByUser(user._id.toString());
  } catch (error) {
    console.warn('Error fetching branding:', error);
  }

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    statistics: {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      resellers: {
        total: totalResellers,
        active: activeResellers,
        inactive: totalResellers - activeResellers,
      },
    },
    branding: branding ? branding.brandingText : null,
  };
};

const getResellerDashboard = async (user) => {
  const userLimit = await userService.getResellerUserLimit(user._id.toString());
  const usersData = await userService.getUsersByReseller(user._id.toString(), {
    page: 1,
    limit: 10,
  });

  let branding = null;
  try {
    branding = await brandingService.getBrandingByUser(user._id.toString());
  } catch (error) {
    console.warn('Error fetching branding:', error);
  }

  const activeUsersCount = usersData.users.filter((u) => u.isActive).length;
  const expiredSubscriptionsCount = usersData.users.filter((u) => {
    if (!u.subscription) return false;
    return u.subscription.isExpired;
  }).length;

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    statistics: {
      users: {
        total: userLimit.currentCount,
        active: activeUsersCount,
        maxUsers: userLimit.maxUsers === -1 ? 'Unlimited' : userLimit.maxUsers,
        remaining: userLimit.remaining === -1 ? 'Unlimited' : userLimit.remaining,
        isUnlimited: userLimit.isUnlimited,
      },
      subscriptions: {
        total: usersData.users.length,
        expired: expiredSubscriptionsCount,
        active: usersData.users.length - expiredSubscriptionsCount,
      },
    },
    recentUsers: usersData.users.slice(0, 5).map((u) => ({
      id: u._id,
      email: u.email,
      isActive: u.isActive,
      subscription: u.subscription
        ? {
            isExpired: u.subscription.isExpired,
            expiryDate: u.subscription.expiryDate,
          }
        : null,
    })),
    branding: branding ? branding.brandingText : null,
  };
};

const getUserDashboard = async (user) => {
  const subscription = await subscriptionService.getSubscription(user._id.toString());
  const usageStats = await usageTrackingService.getRemainingLimit(user._id.toString());

  let branding = null;
  try {
    branding = await brandingService.getBrandingByUser(user._id.toString());
  } catch (error) {
    console.warn('Error fetching branding:', error);
  }

  return {
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
};

module.exports = {
  getDashboard,
};
