const ipService = require('../services/ipService');
const User = require('../models/User');
const { HTTP_STATUS } = require('../types');

const checkIPWhitelist = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      });
    }

    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!clientIP) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Unable to determine client IP address',
      });
    }

    const ownerId = user.resellerId || user._id;
    const isWhitelisted = await ipService.isIPWhitelisted(clientIP, ownerId);

    if (!isWhitelisted) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Access denied. Your IP address is not whitelisted.',
        ipAddress: clientIP,
      });
    }

    req.clientIP = clientIP;
    next();
  } catch (error) {
    console.error('IP whitelist check error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to verify IP whitelist status',
    });
  }
};

const optionalIPWhitelist = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return next();
    }

    const user = await User.findById(userId);

    if (!user) {
      return next();
    }

    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!clientIP) {
      return next();
    }

    const ownerId = user.resellerId || user._id;
    const isWhitelisted = await ipService.isIPWhitelisted(clientIP, ownerId);

    req.clientIP = clientIP;
    req.isIPWhitelisted = isWhitelisted;

    next();
  } catch (error) {
    console.error('Optional IP whitelist check error:', error);
    req.isIPWhitelisted = false;
    next();
  }
};

module.exports = {
  checkIPWhitelist,
  optionalIPWhitelist,
};
