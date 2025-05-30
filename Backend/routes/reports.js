const express = require('express');
const router = express.Router();
const { authenticateToken, rateLimit } = require('../middleware/auth');
const {
  getMonthlySummary,
  getCategorySummary,
  getWeeklyReport,
  getYearlyOverview,
  emailMonthlyReport,
  emailCategoryReport,
  emailWeeklyReport
} = require('../controllers/reportController');

// Apply rate limiting to report routes
const reportRateLimit = rateLimit(50, 15 * 60 * 1000); // 50 requests per 15 minutes

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/reports/monthly
// @desc    Get monthly spending summary
// @access  Private
// Query params: year, month
router.get('/monthly', reportRateLimit, getMonthlySummary);

// @route   GET /api/reports/category
// @desc    Get category-wise spending summary
// @access  Private
// Query params: startDate, endDate, period (week/month/year)
router.get('/category', reportRateLimit, getCategorySummary);

// @route   GET /api/reports/weekly
// @desc    Get weekly spending report
// @access  Private
// Query params: weekOffset (0 = current week, -1 = last week, etc.)
router.get('/weekly', reportRateLimit, getWeeklyReport);

// @route   GET /api/reports/yearly
// @desc    Get yearly overview
// @access  Private
// Query params: year
router.get('/yearly', reportRateLimit, getYearlyOverview);

// Email report routes
// @route   POST /api/reports/email/monthly
// @desc    Send monthly report via email
// @access  Private
// Query params: year, month
router.post('/email/monthly', reportRateLimit, emailMonthlyReport);

// @route   POST /api/reports/email/category
// @desc    Send category report via email
// @access  Private
// Query params: startDate, endDate, period (week/month/year)
router.post('/email/category', reportRateLimit, emailCategoryReport);

// @route   POST /api/reports/email/weekly
// @desc    Send weekly report via email
// @access  Private
// Query params: weekOffset (0 = current week, -1 = last week, etc.)
router.post('/email/weekly', reportRateLimit, emailWeeklyReport);

module.exports = router;
