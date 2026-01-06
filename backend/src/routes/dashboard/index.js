const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboardController');
const auth = require('../../middleware/auth');

/**
 * @route   GET /api/dashboard
 * @desc    Get role-based dashboard data
 * @access  Private (Authenticated users)
 * 
 * Returns different dashboard data based on user role:
 * - Super Admin: System-wide statistics
 * - Reseller Admin: User management and subscription stats
 * - User: Personal subscription and usage information
 */
router.get('/', auth, dashboardController.getDashboard);

module.exports = router;
