// User routes
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const auth = require('../../middleware/auth');
const { subscriptionCheck } = require('../../middleware/subscriptionCheck');
const { checkUsageLimitOnly } = require('../../middleware/usageLimits');

/**
 * @route   GET /api/user/dashboard
 * @desc    Get dashboard data for the user
 * @access  Private (User only)
 */
router.get('/dashboard', auth, subscriptionCheck, userController.getDashboardData);

/**
 * @route   GET /api/user/usage-stats
 * @desc    Get usage statistics for the user
 * @access  Private (User only)
 */
router.get('/usage-stats', auth, subscriptionCheck, userController.getUsageStats);

/**
 * @route   POST /api/user/tool/access
 * @desc    Access tool endpoint (validates subscription and usage limits)
 * @access  Private (User only)
 */
router.post('/tool/access', auth, subscriptionCheck, checkUsageLimitOnly, userController.accessTool);

module.exports = router;
