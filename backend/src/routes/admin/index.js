// Super Admin routes
const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const ipController = require('../../controllers/ipController');
const auth = require('../../middleware/auth');
const { requireSuperAdmin } = require('../../middleware/authorization');

/**
 * @route   GET /api/admin/resellers
 * @desc    Get all resellers
 * @access  Private (Super Admin only)
 */
router.get('/resellers', auth, requireSuperAdmin, adminController.getResellers);

/**
 * @route   POST /api/admin/resellers
 * @desc    Add a new reseller
 * @access  Private (Super Admin only)
 */
router.post('/resellers', auth, requireSuperAdmin, adminController.addReseller);

/**
 * @route   POST /api/admin/users
 * @desc    Add a new user
 * @access  Private (Super Admin only)
 */
router.post('/users', auth, requireSuperAdmin, adminController.addUser);

/**
 * @route   PUT /api/admin/users/:userId/keyword-limit
 * @desc    Set keyword limit for a user's subscription
 * @access  Private (Super Admin only)
 */
router.put('/users/:userId/keyword-limit', auth, requireSuperAdmin, adminController.setKeywordLimit);

/**
 * @route   PUT /api/admin/users/:userId/expiry-date
 * @desc    Set expiry date for a user's subscription
 * @access  Private (Super Admin only)
 */
router.put('/users/:userId/expiry-date', auth, requireSuperAdmin, adminController.setExpiryDate);

/**
 * @route   PUT /api/admin/cookies/:ownerId
 * @desc    Update Ahrefs cookies for a user or reseller
 * @access  Private (Super Admin only)
 */
router.put('/cookies/:ownerId', auth, requireSuperAdmin, adminController.updateAhrefsCookies);

/**
 * @route   GET /api/admin/users/active
 * @desc    View active users with pagination
 * @access  Private (Super Admin only)
 */
router.get('/users/active', auth, requireSuperAdmin, adminController.viewActiveUsers);

/**
 * @route   GET /api/admin/ips
 * @desc    Get all IP addresses
 * @access  Private (Super Admin only)
 */
router.get('/ips', auth, requireSuperAdmin, ipController.getAllIPAddresses);

/**
 * @route   POST /api/admin/ips
 * @desc    Add a new IP address
 * @access  Private (Super Admin only)
 */
router.post('/ips', auth, requireSuperAdmin, ipController.addIPAddress);

/**
 * @route   PUT /api/admin/ips/:ipId
 * @desc    Update an IP address
 * @access  Private (Super Admin only)
 */
router.put('/ips/:ipId', auth, requireSuperAdmin, ipController.updateIPAddress);

/**
 * @route   DELETE /api/admin/ips/:ipId
 * @desc    Remove an IP address
 * @access  Private (Super Admin only)
 */
router.delete('/ips/:ipId', auth, requireSuperAdmin, ipController.removeIPAddress);

module.exports = router;
