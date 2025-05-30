const express = require('express');
const router = express.Router();
const { authenticateToken, rateLimit } = require('../middleware/auth');
const {
  setWeeklyLimit,
  getWeeklyStatus,
  getDashboard,
  sendTestEmail,
  deactivateAccount
} = require('../controllers/userController');

// Apply rate limiting to user routes
const userRateLimit = rateLimit(50, 15 * 60 * 1000); // 50 requests per 15 minutes

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', userRateLimit, getDashboard);

// @route   GET /api/users/weekly-status
// @desc    Get current weekly spending status
// @access  Private
router.get('/weekly-status', getWeeklyStatus);

// @route   PUT /api/users/weekly-limit
// @desc    Set or update weekly spending limit
// @access  Private
router.put('/weekly-limit', setWeeklyLimit);

// @route   POST /api/users/test-email
// @desc    Send test email to user
// @access  Private
router.post('/test-email', sendTestEmail);

// @route   PUT /api/users/deactivate
// @desc    Deactivate user account
// @access  Private
router.put('/deactivate', deactivateAccount);

module.exports = router;
