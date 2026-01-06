const ipService = require('../services/ipService');
const { HTTP_STATUS, USER_ROLES } = require('../types');
const User = require('../models/User');

const addIPAddress = async (req, res) => {
  try {
    const { ipAddress, ownerId, ownerType = 'reseller', description = '' } = req.body;
    const userId = req.userId;

    if (!ipAddress || !ownerId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'IP address and owner ID are required',
      });
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Owner not found',
      });
    }

    if (ownerType === 'reseller' && owner.role !== USER_ROLES.RESELLER) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Owner is not a reseller',
      });
    }

    const ipEntry = await ipService.addIPAddress({
      ipAddress,
      ownerId,
      ownerType,
      description,
      userId,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'IP address added to whitelist successfully',
      data: {
        ip: {
          id: ipEntry._id || ipEntry.id,
          ipAddress: ipEntry.ipAddress,
          ownerId: ipEntry.ownerId,
          ownerType: ipEntry.ownerType,
          description: ipEntry.description,
          isActive: ipEntry.isActive,
          createdAt: ipEntry.createdAt,
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

    if (error.message.includes('Invalid') || error.message.includes('required')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Add IP address error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to add IP address to whitelist',
    });
  }
};

const removeIPAddress = async (req, res) => {
  try {
    const { ipId } = req.params;
    const userId = req.userId;

    if (!ipId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'IP ID is required',
      });
    }

    const result = await ipService.removeIPAddress(ipId, userId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message || 'IP address removed from whitelist successfully',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Remove IP address error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to remove IP address from whitelist',
    });
  }
};

const getIPAddress = async (req, res) => {
  try {
    const { ipId } = req.params;

    if (!ipId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'IP ID is required',
      });
    }

    const ipEntry = await ipService.getIPAddress(ipId);

    if (!ipEntry) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'IP address not found in whitelist',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'IP address retrieved successfully',
      data: {
        ip: {
          id: ipEntry._id || ipEntry.id,
          ipAddress: ipEntry.ipAddress,
          ownerId: ipEntry.ownerId,
          ownerType: ipEntry.ownerType,
          description: ipEntry.description,
          isActive: ipEntry.isActive,
          createdAt: ipEntry.createdAt,
          updatedAt: ipEntry.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get IP address error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve IP address',
    });
  }
};

const getAllIPAddresses = async (req, res) => {
  try {
    const { ownerId, ownerType, isActive, page = 1, limit = 50 } = req.query;

    const filters = {
      ownerId,
      ownerType,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await ipService.getAllIPAddresses(filters);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'IP addresses retrieved successfully',
      data: {
        ipAddresses: result.ipAddresses.map((ip) => ({
          id: ip._id || ip.id,
          ipAddress: ip.ipAddress,
          ownerId: ip.ownerId,
          ownerType: ip.ownerType,
          description: ip.description,
          isActive: ip.isActive,
          createdAt: ip.createdAt,
          updatedAt: ip.updatedAt,
        })),
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error('Get all IP addresses error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve IP addresses',
    });
  }
};

const checkIPWhitelisted = async (req, res) => {
  try {
    const { ipAddress } = req.query;
    const { ownerId } = req.query;

    if (!ipAddress) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'IP address is required',
      });
    }

    const isWhitelisted = await ipService.isIPWhitelisted(ipAddress, ownerId || null);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'IP whitelist check completed',
      data: {
        ipAddress,
        isWhitelisted,
      },
    });
  } catch (error) {
    console.error('Check IP whitelisted error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to check IP whitelist status',
    });
  }
};

const updateIPAddress = async (req, res) => {
  try {
    const { ipId } = req.params;
    const { ipAddress, description, isActive } = req.body;
    const userId = req.userId;

    if (!ipId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'IP ID is required',
      });
    }

    const updateData = {};
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'At least one field must be provided for update',
      });
    }

    const updatedIP = await ipService.updateIPAddress(ipId, updateData, userId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'IP address updated successfully',
      data: {
        ip: {
          id: updatedIP._id || updatedIP.id,
          ipAddress: updatedIP.ipAddress,
          ownerId: updatedIP.ownerId,
          ownerType: updatedIP.ownerType,
          description: updatedIP.description,
          isActive: updatedIP.isActive,
          updatedAt: updatedIP.updatedAt,
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

    if (error.message.includes('already exists') || error.message.includes('Invalid')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Update IP address error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update IP address',
    });
  }
};

const getIPAddressesByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { ownerType = 'reseller' } = req.query;

    if (!ownerId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Owner ID is required',
      });
    }

    const ipAddresses = await ipService.getIPAddressesByOwner(ownerId, ownerType);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'IP addresses retrieved successfully',
      data: {
        ipAddresses: ipAddresses.map((ip) => ({
          id: ip._id || ip.id,
          ipAddress: ip.ipAddress,
          ownerId: ip.ownerId,
          ownerType: ip.ownerType,
          description: ip.description,
          isActive: ip.isActive,
          createdAt: ip.createdAt,
          updatedAt: ip.updatedAt,
        })),
        count: ipAddresses.length,
      },
    });
  } catch (error) {
    console.error('Get IP addresses by owner error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve IP addresses',
    });
  }
};

const removeIPAddressByIP = async (req, res) => {
  try {
    const { ipAddress, ownerId, ownerType = 'reseller' } = req.body;
    const userId = req.userId;

    if (!ipAddress || !ownerId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'IP address and owner ID are required',
      });
    }

    const result = await ipService.removeIPAddressByIP(ipAddress, ownerId, ownerType, userId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message || 'IP address removed from whitelist successfully',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('Invalid') || error.message.includes('required')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Remove IP address by IP error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to remove IP address from whitelist',
    });
  }
};

module.exports = {
  addIPAddress,
  removeIPAddress,
  getIPAddress,
  getAllIPAddresses,
  checkIPWhitelisted,
  updateIPAddress,
  getIPAddressesByOwner,
  removeIPAddressByIP,
};
