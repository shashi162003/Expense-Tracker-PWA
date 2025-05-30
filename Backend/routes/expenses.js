const express = require('express');
const router = express.Router();
const { authenticateToken, rateLimit } = require('../middleware/auth');
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getCategories,
  bulkDeleteExpenses
} = require('../controllers/expenseController');

// Apply rate limiting to expense routes
const expenseRateLimit = rateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes

// @route   GET /api/expenses/categories
// @desc    Get all available expense categories
// @access  Public
router.get('/categories', getCategories);

// All routes below require authentication
router.use(authenticateToken);

// @route   GET /api/expenses
// @desc    Get all expenses for authenticated user with filtering and pagination
// @access  Private
// Query params: page, limit, category, startDate, endDate, minAmount, maxAmount, search, sortBy, sortOrder
router.get('/', expenseRateLimit, getExpenses);

// @route   POST /api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', expenseRateLimit, createExpense);

// @route   POST /api/expenses/bulk-delete
// @desc    Delete multiple expenses
// @access  Private
router.post('/bulk-delete', expenseRateLimit, bulkDeleteExpenses);

// @route   GET /api/expenses/:id
// @desc    Get single expense by ID
// @access  Private
router.get('/:id', getExpenseById);

// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', expenseRateLimit, updateExpense);

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', deleteExpense);

module.exports = router;
