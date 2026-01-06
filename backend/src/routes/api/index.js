const express = require('express');
const router = express.Router();
const apiController = require('../../controllers/apiController');
const auth = require('../../middleware/auth');
const { subscriptionCheck } = require('../../middleware/subscriptionCheck');
const { checkUsageLimitOnly } = require('../../middleware/usageLimits');

/**
 * @route   POST /api/api/keyword-search
 * @desc    Search for keyword metrics
 * @access  Private (Authenticated users with active subscription)
 */
router.post('/keyword-search', auth, subscriptionCheck, checkUsageLimitOnly, apiController.keywordSearch);

/**
 * @route   GET /api/api/domain-metrics
 * @desc    Get domain metrics and statistics
 * @access  Private (Authenticated users with active subscription)
 */
router.get('/domain-metrics', auth, subscriptionCheck, checkUsageLimitOnly, apiController.getDomainMetrics);

/**
 * @route   GET /api/api/backlinks
 * @desc    Get backlinks for a domain
 * @access  Private (Authenticated users with active subscription)
 */
router.get('/backlinks', auth, subscriptionCheck, checkUsageLimitOnly, apiController.getBacklinks);

/**
 * @route   GET /api/api/domain-rank
 * @desc    Get domain ranking information
 * @access  Private (Authenticated users with active subscription)
 */
router.get('/domain-rank', auth, subscriptionCheck, checkUsageLimitOnly, apiController.getDomainRank);

/**
 * @route   GET /api/api/competitor-analysis
 * @desc    Get competitor analysis for a domain
 * @access  Private (Authenticated users with active subscription)
 */
router.get('/competitor-analysis', auth, subscriptionCheck, checkUsageLimitOnly, apiController.getCompetitorAnalysis);

module.exports = router;
