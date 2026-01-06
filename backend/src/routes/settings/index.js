const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/authorization');

/**
 * @route   GET /api/settings
 * @desc    Get settings (read-only for Admin/Reseller, restricted for Users)
 * @access  Private (Admin/Reseller only, Users are restricted)
 * 
 * Note: This endpoint is protected by RestrictedRoute on the frontend.
 * Regular users should not be able to access this endpoint.
 */
router.get('/', auth, requireAdmin, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Settings retrieved successfully',
    data: {
      settings: {
        accountStatus: 'active',
        roleType: req.userRole,
        subscriptionState: 'active',
        systemPermissions: {
          canManageUsers: req.userRole === 'super_admin' || req.userRole === 'reseller',
          canManageBranding: true,
          canViewSettings: true,
        },
      },
      note: 'Settings are read-only. Contact super admin for modifications.',
    },
  });
});

module.exports = router;
