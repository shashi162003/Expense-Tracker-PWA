const Expense = require('../models/Expense');
const { checkWeeklyLimit } = require('../cron/dailySummary');

// Get all expenses for the authenticated user
const getExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      category, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { userId };

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateTime;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    // Search filter (title and note)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get expenses with pagination
    const expenses = await Expense.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalExpenses = await Expense.countDocuments(filter);
    const totalPages = Math.ceil(totalExpenses / parseInt(limit));

    // Calculate total amount for current filter
    const totalAmountResult = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalExpenses,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        summary: {
          totalAmount,
          averageAmount: totalExpenses > 0 ? totalAmount / totalExpenses : 0,
          count: totalExpenses
        }
      }
    });

  } catch (error) {
    console.error('Get expenses error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses'
    });
  }
};

// Get single expense by ID
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const expense = await Expense.findOne({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: { expense }
    });

  } catch (error) {
    console.error('Get expense by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense'
    });
  }
};

// Create new expense
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, note, tags } = req.body;
    const userId = req.user._id;

    // Validation
    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount, and category are required'
      });
    }

    // Create expense
    const expense = new Expense({
      userId,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date) : new Date(),
      note: note ? note.trim() : '',
      tags: tags || []
    });

    await expense.save();

    // Check weekly limit after adding expense (async, don't wait)
    checkWeeklyLimit(userId).catch(error => {
      console.error('Error checking weekly limit:', error.message);
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense }
    });

  } catch (error) {
    console.error('Create expense error:', error.message);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating expense'
    });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, note, tags } = req.body;
    const userId = req.user._id;

    // Find expense
    const expense = await Expense.findOne({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update fields
    if (title !== undefined) expense.title = title.trim();
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);
    if (note !== undefined) expense.note = note.trim();
    if (tags !== undefined) expense.tags = tags;

    await expense.save();

    // Check weekly limit after updating expense (async, don't wait)
    checkWeeklyLimit(userId).catch(error => {
      console.error('Error checking weekly limit:', error.message);
    });

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense }
    });

  } catch (error) {
    console.error('Update expense error:', error.message);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating expense'
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully',
      data: { expense }
    });

  } catch (error) {
    console.error('Delete expense error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting expense'
    });
  }
};

// Get expense categories
const getCategories = async (req, res) => {
  try {
    const categories = [
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Healthcare',
      'Education',
      'Travel',
      'Groceries',
      'Personal Care',
      'Home & Garden',
      'Gifts & Donations',
      'Business',
      'Other'
    ];

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

// Bulk delete expenses
const bulkDeleteExpenses = async (req, res) => {
  try {
    const { expenseIds } = req.body;
    const userId = req.user._id;

    if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense IDs array is required'
      });
    }

    const result = await Expense.deleteMany({
      _id: { $in: expenseIds },
      userId
    });

    res.json({
      success: true,
      message: `${result.deletedCount} expenses deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });

  } catch (error) {
    console.error('Bulk delete expenses error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting expenses'
    });
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getCategories,
  bulkDeleteExpenses
};
