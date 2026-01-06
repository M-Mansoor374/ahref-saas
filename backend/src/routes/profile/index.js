const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { HTTP_STATUS } = require('../../types');

/**
 * @route   GET /api/profile
 * @desc    Get user profile (read-only for Admin/Reseller, restricted for Users)
 * @access  Private (Admin/Reseller only, Users are restricted)
 * 
 * Note: This endpoint is protected by RestrictedRoute on the frontend.
 * Regular users should not be able to access this endpoint.
 */
router.get('/', auth, async (req, res) => {
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

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        profile: {
          id: user._id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin || null,
        },
        note: 'Profile is read-only. Contact administrator for modifications.',
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve profile',
    });
  }
});

module.exports = router;
