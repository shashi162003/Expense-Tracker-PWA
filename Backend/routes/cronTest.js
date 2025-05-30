const express = require('express');
const router = express.Router();
const { authenticateToken, rateLimit } = require('../middleware/auth');
const {
  triggerDailySummary,
  triggerWeeklySummary,
  triggerWeeklyLimitCheck,
  getCronStatus,
  testAllCronJobs
} = require('../controllers/cronTestController');

// Apply rate limiting to cron test routes (more restrictive)
const cronTestRateLimit = rateLimit(10, 15 * 60 * 1000); // 10 requests per 15 minutes

// All routes require authentication
router.use(authenticateToken);

// @route   POST /api/cron-test/daily-summary
// @desc    Manually trigger daily summary emails for all users
// @access  Private
router.post('/daily-summary', cronTestRateLimit, triggerDailySummary);

// @route   POST /api/cron-test/weekly-summary
// @desc    Manually trigger weekly summary emails for all users
// @access  Private
router.post('/weekly-summary', cronTestRateLimit, triggerWeeklySummary);

// @route   POST /api/cron-test/weekly-limit-check
// @desc    Manually trigger weekly limit check for current user
// @access  Private
router.post('/weekly-limit-check', cronTestRateLimit, triggerWeeklyLimitCheck);

// @route   GET /api/cron-test/status
// @desc    Get current cron job status
// @access  Private
router.get('/status', getCronStatus);

// @route   POST /api/cron-test/test-all
// @desc    Test all cron job functionalities
// @access  Private
router.post('/test-all', cronTestRateLimit, testAllCronJobs);

module.exports = router;
