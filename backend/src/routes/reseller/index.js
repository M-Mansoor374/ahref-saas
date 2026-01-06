// Reseller Admin routes
const express = require('express');
const router = express.Router();
const resellerController = require('../../controllers/resellerController');
const auth = require('../../middleware/auth');
const { requireReseller } = require('../../middleware/authorization');

/**
 * @route   POST /api/reseller/users
 * @desc    Add a new user under the reseller
 * @access  Private (Reseller only)
 */
router.post('/users', auth, requireReseller, resellerController.addUser);

/**
 * @route   PUT /api/reseller/users/:userId/expiry-date
 * @desc    Set expiry date for a user's subscription
 * @access  Private (Reseller only)
 */
router.put('/users/:userId/expiry-date', auth, requireReseller, resellerController.setUserExpiry);

/**
 * @route   GET /api/reseller/users/limit
 * @desc    Get user limit information (current count, max limit, remaining slots)
 * @access  Private (Reseller only)
 */
router.get('/users/limit', auth, requireReseller, resellerController.enforceMaxUserLimit);

/**
 * @route   GET /api/reseller/users
 * @desc    Get all users under this reseller with pagination
 * @access  Private (Reseller only)
 */
router.get('/users', auth, requireReseller, resellerController.getResellerUsers);

module.exports = router;
