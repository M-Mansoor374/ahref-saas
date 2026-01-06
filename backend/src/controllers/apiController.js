const subscriptionService = require('../services/subscriptionService');
const usageTrackingService = require('../services/usageTrackingService');
const ipService = require('../services/ipService');
const User = require('../models/User');
const { HTTP_STATUS } = require('../types');

const keywordSearch = async (req, res) => {
  try {
    const userId = req.userId;
    const { keyword, country = 'us', language = 'en' } = req.body;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Keyword is required',
      });
    }

    const user = await User.findById(userId).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    const subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    subscription.checkExpiration();
    if (subscription.isExpired) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Subscription has expired',
      });
    }

    const usageInfo = await usageTrackingService.getRemainingLimit(userId);

    if (!usageInfo.isUnlimited && usageInfo.remainingKeywords <= 0) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Keyword usage limit reached',
        limit: usageInfo.keywordLimit,
        used: usageInfo.usedKeywords,
      });
    }

    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const isIPWhitelisted = await ipService.isIPWhitelisted(clientIP, user.resellerId || null);

    await usageTrackingService.incrementKeywordCount(userId, 1, {
      logUsage: true,
      action: 'keyword_search',
      ipAddress: clientIP,
      metadata: {
        keyword,
        country,
        language,
        ipWhitelisted: isIPWhitelisted,
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Keyword search completed',
      data: {
        keyword,
        country,
        language,
        metrics: {
          searchVolume: Math.floor(Math.random() * 100000),
          competition: Math.random().toFixed(2),
          cpc: (Math.random() * 5).toFixed(2),
        },
        usage: {
          used: usageInfo.usedKeywords + 1,
          remaining: usageInfo.isUnlimited ? -1 : usageInfo.remainingKeywords - 1,
          limit: usageInfo.keywordLimit,
        },
      },
    });
  } catch (error) {
    console.error('Keyword search error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to process keyword search',
    });
  }
};

const getDomainMetrics = async (req, res) => {
  try {
    const userId = req.userId;
    const { domain } = req.query;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Domain is required',
      });
    }

    const user = await User.findById(userId).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    const subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    subscription.checkExpiration();
    if (subscription.isExpired) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Subscription has expired',
      });
    }

    const usageInfo = await usageTrackingService.getRemainingLimit(userId);

    if (!usageInfo.isUnlimited && usageInfo.remainingKeywords <= 0) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Keyword usage limit reached',
      });
    }

    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await usageTrackingService.incrementKeywordCount(userId, 1, {
      logUsage: true,
      action: 'domain_metrics',
      ipAddress: clientIP,
      metadata: {
        domain,
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Domain metrics retrieved successfully',
      data: {
        domain,
        metrics: {
          domainRating: Math.floor(Math.random() * 100),
          backlinks: Math.floor(Math.random() * 1000000),
          referringDomains: Math.floor(Math.random() * 100000),
          organicKeywords: Math.floor(Math.random() * 100000),
          organicTraffic: Math.floor(Math.random() * 1000000),
        },
        usage: {
          used: usageInfo.usedKeywords + 1,
          remaining: usageInfo.isUnlimited ? -1 : usageInfo.remainingKeywords - 1,
          limit: usageInfo.keywordLimit,
        },
      },
    });
  } catch (error) {
    console.error('Get domain metrics error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve domain metrics',
    });
  }
};

const getBacklinks = async (req, res) => {
  try {
    const userId = req.userId;
    const { domain, page = 1, limit = 50 } = req.query;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Domain is required',
      });
    }

    const user = await User.findById(userId).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    const subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    subscription.checkExpiration();
    if (subscription.isExpired) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Subscription has expired',
      });
    }

    const usageInfo = await usageTrackingService.getRemainingLimit(userId);

    if (!usageInfo.isUnlimited && usageInfo.remainingKeywords <= 0) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Keyword usage limit reached',
      });
    }

    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await usageTrackingService.incrementKeywordCount(userId, 1, {
      logUsage: true,
      action: 'backlinks',
      ipAddress: clientIP,
      metadata: {
        domain,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });

    const mockBacklinks = Array.from({ length: parseInt(limit) }, (_, i) => ({
      id: i + 1,
      sourceUrl: `https://example${i + 1}.com/page`,
      targetUrl: `https://${domain}/page`,
      anchorText: `Anchor text ${i + 1}`,
      domainRating: Math.floor(Math.random() * 100),
      ahrefsRank: Math.floor(Math.random() * 1000000),
      firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    }));

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Backlinks retrieved successfully',
      data: {
        domain,
        backlinks: mockBacklinks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: Math.floor(Math.random() * 10000),
        },
        usage: {
          used: usageInfo.usedKeywords + 1,
          remaining: usageInfo.isUnlimited ? -1 : usageInfo.remainingKeywords - 1,
          limit: usageInfo.keywordLimit,
        },
      },
    });
  } catch (error) {
    console.error('Get backlinks error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve backlinks',
    });
  }
};

const getDomainRank = async (req, res) => {
  try {
    const userId = req.userId;
    const { domain } = req.query;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Domain is required',
      });
    }

    const user = await User.findById(userId).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    const subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    subscription.checkExpiration();
    if (subscription.isExpired) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Subscription has expired',
      });
    }

    const usageInfo = await usageTrackingService.getRemainingLimit(userId);

    if (!usageInfo.isUnlimited && usageInfo.remainingKeywords <= 0) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Keyword usage limit reached',
      });
    }

    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await usageTrackingService.incrementKeywordCount(userId, 1, {
      logUsage: true,
      action: 'domain_rank',
      ipAddress: clientIP,
      metadata: {
        domain,
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Domain rank retrieved successfully',
      data: {
        domain,
        rank: {
          domainRating: Math.floor(Math.random() * 100),
          ahrefsRank: Math.floor(Math.random() * 1000000),
          urlRating: Math.floor(Math.random() * 100),
          globalRank: Math.floor(Math.random() * 1000000),
        },
        usage: {
          used: usageInfo.usedKeywords + 1,
          remaining: usageInfo.isUnlimited ? -1 : usageInfo.remainingKeywords - 1,
          limit: usageInfo.keywordLimit,
        },
      },
    });
  } catch (error) {
    console.error('Get domain rank error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve domain rank',
    });
  }
};

const getCompetitorAnalysis = async (req, res) => {
  try {
    const userId = req.userId;
    const { domain } = req.query;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Domain is required',
      });
    }

    const user = await User.findById(userId).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    const subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    subscription.checkExpiration();
    if (subscription.isExpired) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Subscription has expired',
      });
    }

    const usageInfo = await usageTrackingService.getRemainingLimit(userId);

    if (!usageInfo.isUnlimited && usageInfo.remainingKeywords <= 0) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Keyword usage limit reached',
      });
    }

    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await usageTrackingService.incrementKeywordCount(userId, 1, {
      logUsage: true,
      action: 'competitor_analysis',
      ipAddress: clientIP,
      metadata: {
        domain,
      },
    });

    const mockCompetitors = Array.from({ length: 10 }, (_, i) => ({
      domain: `competitor${i + 1}.com`,
      domainRating: Math.floor(Math.random() * 100),
      backlinks: Math.floor(Math.random() * 1000000),
      referringDomains: Math.floor(Math.random() * 100000),
      organicKeywords: Math.floor(Math.random() * 100000),
      organicTraffic: Math.floor(Math.random() * 1000000),
    }));

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Competitor analysis retrieved successfully',
      data: {
        domain,
        competitors: mockCompetitors,
        usage: {
          used: usageInfo.usedKeywords + 1,
          remaining: usageInfo.isUnlimited ? -1 : usageInfo.remainingKeywords - 1,
          limit: usageInfo.keywordLimit,
        },
      },
    });
  } catch (error) {
    console.error('Get competitor analysis error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve competitor analysis',
    });
  }
};

module.exports = {
  keywordSearch,
  getDomainMetrics,
  getBacklinks,
  getDomainRank,
  getCompetitorAnalysis,
};
