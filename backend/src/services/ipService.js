const mongoose = require('mongoose');
const { validateIPAddress } = require('../utils/validators');
const { ACTIVITY_LOG_TYPES } = require('../types');

let IPWhitelist = null;
let ActivityLog = null;

try {
  IPWhitelist = require('../models/IPWhitelist');
} catch (error) {
  console.warn('IPWhitelist model not found. IP operations will use fallback.');
}

try {
  ActivityLog = require('../models/ActivityLog');
} catch (error) {
  console.warn('ActivityLog model not found. Activity logging will be skipped.');
}

const logActivity = async (userId, action, ipAddress) => {
  if (ActivityLog && userId && ipAddress) {
    try {
      await ActivityLog.create({
        userId,
        action,
        ipAddress,
      });
    } catch (error) {
      console.error('Error logging IP activity:', error);
    }
  }
};

const createIPWhitelistModel = (ipAddress, ownerId, ownerType, description = '') => {
  if (!IPWhitelist) {
    return {
      ipAddress,
      ownerId: new mongoose.Types.ObjectId(ownerId),
      ownerType,
      description,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  return new IPWhitelist({
    ipAddress,
    ownerId,
    ownerType,
    description,
    isActive: true,
  });
};

const addIPAddress = async (ipData) => {
  try {
    const { ipAddress, ownerId, ownerType = 'reseller', description = '', userId } = ipData;

    if (!ipAddress) {
      throw new Error('IP address is required');
    }

    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    const ipValidation = validateIPAddress(ipAddress);
    if (!ipValidation.valid) {
      throw new Error(ipValidation.error);
    }

    const validatedIP = ipValidation.value;

    if (IPWhitelist) {
      const existingIP = await IPWhitelist.findOne({
        ipAddress: validatedIP,
        ownerId,
        ownerType,
      });

      if (existingIP) {
        throw new Error('IP address already exists in whitelist for this owner');
      }

      const ipWhitelist = await IPWhitelist.create({
        ipAddress: validatedIP,
        ownerId: new mongoose.Types.ObjectId(ownerId),
        ownerType,
        description: description.trim(),
        isActive: true,
      });

      await logActivity(userId, ACTIVITY_LOG_TYPES.IP.ADD, validatedIP);

      return ipWhitelist;
    }

    const ipEntry = createIPWhitelistModel(validatedIP, ownerId, ownerType, description);
    await logActivity(userId, ACTIVITY_LOG_TYPES.IP.ADD, validatedIP);

    return ipEntry;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('IP address already exists in whitelist');
    }
    throw error;
  }
};

const removeIPAddress = async (ipId, userId = null) => {
  try {
    if (!ipId) {
      throw new Error('IP ID is required');
    }

    if (IPWhitelist) {
      const ipEntry = await IPWhitelist.findById(ipId);

      if (!ipEntry) {
        throw new Error('IP address not found in whitelist');
      }

      const ipAddress = ipEntry.ipAddress;
      await IPWhitelist.findByIdAndDelete(ipId);

      await logActivity(userId, ACTIVITY_LOG_TYPES.IP.REMOVE, ipAddress);

      return { success: true, message: 'IP address removed from whitelist' };
    }

    throw new Error('IP whitelist model not configured');
  } catch (error) {
    throw error;
  }
};

const getIPAddress = async (ipId) => {
  try {
    if (!ipId) {
      throw new Error('IP ID is required');
    }

    if (IPWhitelist) {
      const ipEntry = await IPWhitelist.findById(ipId);

      if (!ipEntry) {
        return null;
      }

      return ipEntry;
    }

    return null;
  } catch (error) {
    throw error;
  }
};

const getAllIPAddresses = async (filters = {}) => {
  try {
    const { ownerId, ownerType, isActive = true, page = 1, limit = 50 } = filters;

    if (IPWhitelist) {
      const query = {};

      if (ownerId) {
        query.ownerId = new mongoose.Types.ObjectId(ownerId);
      }

      if (ownerType) {
        query.ownerType = ownerType;
      }

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);

      const ipAddresses = await IPWhitelist.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await IPWhitelist.countDocuments(query);

      return {
        ipAddresses,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };
    }

    return {
      ipAddresses: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0,
      },
    };
  } catch (error) {
    throw error;
  }
};

const isIPWhitelisted = async (ipAddress, ownerId = null) => {
  try {
    if (!ipAddress) {
      return false;
    }

    const ipValidation = validateIPAddress(ipAddress);
    if (!ipValidation.valid) {
      return false;
    }

    const validatedIP = ipValidation.value;

    if (IPWhitelist) {
      const query = {
        ipAddress: validatedIP,
        isActive: true,
      };

      if (ownerId) {
        query.ownerId = new mongoose.Types.ObjectId(ownerId);
      }

      const ipEntry = await IPWhitelist.findOne(query);

      return !!ipEntry;
    }

    return false;
  } catch (error) {
    console.error('Error checking IP whitelist:', error);
    return false;
  }
};

const updateIPAddress = async (ipId, updateData, userId = null) => {
  try {
    const { ipAddress, description, isActive } = updateData;

    if (!ipId) {
      throw new Error('IP ID is required');
    }

    if (IPWhitelist) {
      const ipEntry = await IPWhitelist.findById(ipId);

      if (!ipEntry) {
        throw new Error('IP address not found in whitelist');
      }

      const updateFields = {};

      if (ipAddress) {
        const ipValidation = validateIPAddress(ipAddress);
        if (!ipValidation.valid) {
          throw new Error(ipValidation.error);
        }

        const existingIP = await IPWhitelist.findOne({
          ipAddress: ipValidation.value,
          ownerId: ipEntry.ownerId,
          ownerType: ipEntry.ownerType,
          _id: { $ne: ipId },
        });

        if (existingIP) {
          throw new Error('IP address already exists in whitelist for this owner');
        }

        updateFields.ipAddress = ipValidation.value;
      }

      if (description !== undefined) {
        updateFields.description = description.trim();
      }

      if (isActive !== undefined) {
        updateFields.isActive = isActive;
      }

      updateFields.updatedAt = new Date();

      const updatedIP = await IPWhitelist.findByIdAndUpdate(ipId, updateFields, {
        new: true,
        runValidators: true,
      });

      await logActivity(userId, ACTIVITY_LOG_TYPES.IP.UPDATE, updatedIP.ipAddress);

      return updatedIP;
    }

    throw new Error('IP whitelist model not configured');
  } catch (error) {
    throw error;
  }
};

const whitelistIPAddress = async (ipId, userId = null) => {
  try {
    if (!ipId) {
      throw new Error('IP ID is required');
    }

    if (IPWhitelist) {
      const ipEntry = await IPWhitelist.findByIdAndUpdate(
        ipId,
        { isActive: true, updatedAt: new Date() },
        { new: true }
      );

      if (!ipEntry) {
        throw new Error('IP address not found in whitelist');
      }

      await logActivity(userId, ACTIVITY_LOG_TYPES.IP.WHITELIST, ipEntry.ipAddress);

      return ipEntry;
    }

    throw new Error('IP whitelist model not configured');
  } catch (error) {
    throw error;
  }
};

const getIPAddressesByOwner = async (ownerId, ownerType = 'reseller') => {
  try {
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    if (IPWhitelist) {
      const ipAddresses = await IPWhitelist.find({
        ownerId: new mongoose.Types.ObjectId(ownerId),
        ownerType,
        isActive: true,
      }).sort({ createdAt: -1 });

      return ipAddresses;
    }

    return [];
  } catch (error) {
    throw error;
  }
};

const removeIPAddressByIP = async (ipAddress, ownerId, ownerType = 'reseller', userId = null) => {
  try {
    if (!ipAddress || !ownerId) {
      throw new Error('IP address and owner ID are required');
    }

    const ipValidation = validateIPAddress(ipAddress);
    if (!ipValidation.valid) {
      throw new Error(ipValidation.error);
    }

    const validatedIP = ipValidation.value;

    if (IPWhitelist) {
      const ipEntry = await IPWhitelist.findOneAndDelete({
        ipAddress: validatedIP,
        ownerId: new mongoose.Types.ObjectId(ownerId),
        ownerType,
      });

      if (!ipEntry) {
        throw new Error('IP address not found in whitelist for this owner');
      }

      await logActivity(userId, ACTIVITY_LOG_TYPES.IP.REMOVE, validatedIP);

      return { success: true, message: 'IP address removed from whitelist' };
    }

    throw new Error('IP whitelist model not configured');
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addIPAddress,
  removeIPAddress,
  getIPAddress,
  getAllIPAddresses,
  isIPWhitelisted,
  updateIPAddress,
  whitelistIPAddress,
  getIPAddressesByOwner,
  removeIPAddressByIP,
};
