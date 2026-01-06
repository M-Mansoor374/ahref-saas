const brandingService = require('../services/brandingService');
const User = require('../models/User');
const { HTTP_STATUS, USER_ROLES } = require('../types');

const getBrandingByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const branding = await brandingService.getBrandingByUser(userId);

    if (!branding) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Branding not found for this user',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Branding retrieved successfully',
      data: {
        branding: {
          id: branding._id,
          ownerType: branding.ownerType,
          ownerId: branding.ownerId,
          brandingText: branding.brandingText,
          createdAt: branding.createdAt,
          updatedAt: branding.updatedAt,
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

    console.error('Get branding by user error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve branding',
    });
  }
};

const updateBranding = async (req, res) => {
  try {
    const { ownerType, ownerId, brandingText } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!ownerType || !ownerId || !brandingText) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Owner type, owner ID, and branding text are required',
      });
    }

    if (typeof brandingText !== 'string' || brandingText.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Branding text must be a non-empty string',
      });
    }

    if (brandingText.length > 500) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Branding text cannot exceed 500 characters',
      });
    }

    const branding = await brandingService.updateBranding({
      ownerType,
      ownerId,
      brandingText,
      updatedBy: userId,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Branding updated successfully',
      data: {
        branding: {
          id: branding._id,
          ownerType: branding.ownerType,
          ownerId: branding.ownerId,
          brandingText: branding.brandingText,
          createdAt: branding.createdAt,
          updatedAt: branding.updatedAt,
        },
      },
    });
  } catch (error) {
    if (error.message.includes('Only super admin')) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('not found') || error.message.includes('required')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('already exists')) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Update branding error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update branding',
    });
  }
};

const getBrandingByOwner = async (req, res) => {
  try {
    const { ownerType, ownerId } = req.query;
    const userId = req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== USER_ROLES.SUPER_ADMIN) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Only super admin can view branding by owner',
      });
    }

    if (!ownerType || !ownerId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Owner type and owner ID are required',
      });
    }

    const branding = await brandingService.getBrandingByOwner(ownerType, ownerId);

    if (!branding) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Branding not found for this owner',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Branding retrieved successfully',
      data: {
        branding: {
          id: branding._id,
          ownerType: branding.ownerType,
          ownerId: branding.ownerId,
          brandingText: branding.brandingText,
          createdAt: branding.createdAt,
          updatedAt: branding.updatedAt,
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

    console.error('Get branding by owner error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve branding',
    });
  }
};

const deleteBranding = async (req, res) => {
  try {
    const { ownerType, ownerId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!ownerType || !ownerId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Owner type and owner ID are required',
      });
    }

    const branding = await brandingService.deleteBranding(ownerType, ownerId, userId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Branding deleted successfully',
      data: {
        branding: {
          id: branding._id,
          ownerType: branding.ownerType,
          ownerId: branding.ownerId,
          brandingText: branding.brandingText,
        },
      },
    });
  } catch (error) {
    if (error.message.includes('Only super admin')) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('not found')) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Delete branding error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete branding',
    });
  }
};

const getAllBrandings = async (req, res) => {
  try {
    const userId = req.userId;
    const { ownerType } = req.query;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const filters = {};
    if (ownerType) {
      filters.ownerType = ownerType;
    }

    const brandings = await brandingService.getAllBrandings(userId, filters);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Brandings retrieved successfully',
      data: {
        brandings: brandings.map((branding) => ({
          id: branding._id,
          ownerType: branding.ownerType,
          ownerId: branding.ownerId,
          brandingText: branding.brandingText,
          createdAt: branding.createdAt,
          updatedAt: branding.updatedAt,
        })),
        count: brandings.length,
      },
    });
  } catch (error) {
    if (error.message.includes('Only super admin')) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Get all brandings error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve brandings',
    });
  }
};

module.exports = {
  getBrandingByUser,
  updateBranding,
  getBrandingByOwner,
  deleteBranding,
  getAllBrandings,
};
