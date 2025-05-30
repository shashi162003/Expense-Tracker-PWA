const User = require('../models/User');
const Expense = require('../models/Expense');
const emailService = require('../utils/mailer');

// Set or update weekly spending limit
const setWeeklyLimit = async (req, res) => {
  try {
    const { weeklyLimit } = req.body;
    const userId = req.user._id;

    // Validation
    if (weeklyLimit === undefined || weeklyLimit === null) {
      return res.status(400).json({
        success: false,
        message: 'Weekly limit is required'
      });
    }

    const limit = parseFloat(weeklyLimit);
    
    if (isNaN(limit) || limit < 0) {
      return res.status(400).json({
        success: false,
        message: 'Weekly limit must be a positive number'
      });
    }

    // Update user's weekly limit
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { weeklyLimit: limit },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Weekly limit updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          weeklyLimit: updatedUser.weeklyLimit,
          updatedAt: updatedUser.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Set weekly limit error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating weekly limit'
    });
  }
};

// Get current weekly spending status
const getWeeklyStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;

    // Calculate current week start and end
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get current week's expenses
    const weeklyExpenses = await Expense.getWeeklyExpenses(userId, startOfWeek, endOfWeek);
    const weeklySpent = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate status
    const weeklyLimit = user.weeklyLimit || 0;
    const percentageUsed = weeklyLimit > 0 ? (weeklySpent / weeklyLimit) * 100 : 0;
    const isOverBudget = weeklyLimit > 0 && weeklySpent > weeklyLimit;
    const remainingBudget = weeklyLimit > 0 ? weeklyLimit - weeklySpent : null;

    // Get daily breakdown for current week
    const dailyBreakdown = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfWeek, $lte: endOfWeek }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: {
          startDate: startOfWeek,
          endDate: endOfWeek
        },
        weeklyLimit,
        weeklySpent,
        remainingBudget,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        isOverBudget,
        status: isOverBudget ? 'over_budget' : percentageUsed >= 80 ? 'warning' : 'good',
        expenseCount: weeklyExpenses.length,
        averagePerDay: weeklySpent / 7,
        dailyBreakdown
      }
    });

  } catch (error) {
    console.error('Get weekly status error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weekly status'
    });
  }
};

// Get user dashboard data
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;

    // Get current month data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get current week data
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get today's data
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Fetch all data in parallel
    const [
      monthlyExpenses,
      weeklyExpenses,
      todayExpenses,
      recentExpenses,
      topCategories
    ] = await Promise.all([
      Expense.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
      Expense.find({ userId, date: { $gte: startOfWeek, $lte: endOfWeek } }),
      Expense.find({ userId, date: { $gte: startOfToday, $lte: endOfToday } }),
      Expense.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Expense.getCategorySummary(userId, startOfMonth, endOfMonth)
    ]);

    // Calculate totals
    const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const weeklyTotal = weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const todayTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Weekly budget status
    const weeklyLimit = user.weeklyLimit || 0;
    const weeklyPercentage = weeklyLimit > 0 ? (weeklyTotal / weeklyLimit) * 100 : 0;
    const isOverBudget = weeklyLimit > 0 && weeklyTotal > weeklyLimit;

    // Get spending trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const dayExpenses = await Expense.find({
        userId,
        date: { $gte: date, $lt: nextDay }
      });
      
      const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        amount: dayTotal,
        count: dayExpenses.length
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          today: {
            amount: todayTotal,
            count: todayExpenses.length
          },
          thisWeek: {
            amount: weeklyTotal,
            count: weeklyExpenses.length,
            limit: weeklyLimit,
            percentage: Math.round(weeklyPercentage * 100) / 100,
            isOverBudget,
            remaining: weeklyLimit > 0 ? weeklyLimit - weeklyTotal : null
          },
          thisMonth: {
            amount: monthlyTotal,
            count: monthlyExpenses.length,
            average: monthlyExpenses.length > 0 ? monthlyTotal / monthlyExpenses.length : 0
          }
        },
        recentExpenses,
        topCategories: topCategories.slice(0, 5),
        spendingTrend: last7Days,
        alerts: {
          weeklyBudget: isOverBudget ? {
            type: 'over_budget',
            message: `You've exceeded your weekly budget by $${(weeklyTotal - weeklyLimit).toFixed(2)}`,
            severity: 'high'
          } : weeklyPercentage >= 80 ? {
            type: 'approaching_limit',
            message: `You've used ${weeklyPercentage.toFixed(1)}% of your weekly budget`,
            severity: 'medium'
          } : null
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

// Send test email
const sendTestEmail = async (req, res) => {
  try {
    const user = req.user;
    
    const result = await emailService.sendTestEmail(user.email);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        data: { messageId: result.messageId }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Send test email error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while sending test email'
    });
  }
};

// Deactivate user account
const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Deactivate account error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating account'
    });
  }
};

module.exports = {
  setWeeklyLimit,
  getWeeklyStatus,
  getDashboard,
  sendTestEmail,
  deactivateAccount
};
