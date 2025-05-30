const Expense = require('../models/Expense');
const emailService = require('../utils/mailer');

// Get monthly spending summary
const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.query;

    // Default to current month if not provided
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;



    // Validate month
    if (targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }

    // Get monthly summary
    const monthlySummary = await Expense.getMonthlySummary(userId, targetYear, targetMonth);

    // Get category-wise breakdown for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    console.log('Date Range Debug:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Debug: Get all expenses for this user to see what we have
    const allUserExpenses = await Expense.find({ userId }).sort({ date: -1 });
    console.log('All User Expenses:', allUserExpenses.map(exp => ({
      title: exp.title,
      amount: exp.amount,
      date: exp.date.toISOString(),
      category: exp.category
    })));

    console.log('Monthly Summary Result:', monthlySummary);

    const categoryBreakdown = await Expense.getCategorySummary(userId, startDate, endDate);

    // Get daily breakdown for the month
    const dailyBreakdown = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get comparison with previous month
    const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1;
    const prevYear = targetMonth === 1 ? targetYear - 1 : targetYear;
    const prevMonthSummary = await Expense.getMonthlySummary(userId, prevYear, prevMonth);

    const currentTotal = monthlySummary.length > 0 ? monthlySummary[0].totalAmount : 0;
    const prevTotal = prevMonthSummary.length > 0 ? prevMonthSummary[0].totalAmount : 0;
    const percentageChange = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    res.json({
      success: true,
      data: {
        period: {
          year: targetYear,
          month: targetMonth,
          monthName: new Date(targetYear, targetMonth - 1).toLocaleString('default', { month: 'long' })
        },
        summary: monthlySummary.length > 0 ? monthlySummary[0] : {
          totalAmount: 0,
          count: 0,
          avgAmount: 0,
          categories: []
        },
        categoryBreakdown,
        dailyBreakdown,
        comparison: {
          previousMonth: {
            year: prevYear,
            month: prevMonth,
            totalAmount: prevTotal
          },
          percentageChange: Math.round(percentageChange * 100) / 100,
          trend: percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'same'
        }
      }
    });

  } catch (error) {
    console.error('Get monthly summary error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching monthly summary'
    });
  }
};

// Get category-wise spending summary
const getCategorySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, period = 'month' } = req.query;

    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // Default periods
      const now = new Date();
      switch (period) {
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
        case 'month':
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
      }
    }

    const categorySummary = await Expense.getCategorySummary(userId, start, end);

    // Calculate total for percentage calculation
    const totalAmount = categorySummary.reduce((sum, cat) => sum + cat.totalAmount, 0);

    // Add percentage to each category
    const categoriesWithPercentage = categorySummary.map(category => ({
      ...category,
      percentage: totalAmount > 0 ? Math.round((category.totalAmount / totalAmount) * 10000) / 100 : 0
    }));

    // Get top spending days in this period
    const topSpendingDays = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          date: { $first: '$date' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end,
          type: period
        },
        categories: categoriesWithPercentage,
        summary: {
          totalAmount,
          totalCategories: categorySummary.length,
          averagePerCategory: categorySummary.length > 0 ? totalAmount / categorySummary.length : 0
        },
        topSpendingDays
      }
    });

  } catch (error) {
    console.error('Get category summary error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category summary'
    });
  }
};

// Get weekly spending report
const getWeeklyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weekOffset = 0 } = req.query; // 0 = current week, -1 = last week, etc.

    // Calculate week start and end
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff + (parseInt(weekOffset) * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get weekly expenses
    const weeklyExpenses = await Expense.getWeeklyExpenses(userId, startOfWeek, endOfWeek);
    const totalAmount = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get daily breakdown
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
          count: { $sum: 1 },
          expenses: { $push: '$$ROOT' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Map day numbers to day names
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyData = dailyBreakdown.map(day => ({
      dayOfWeek: day._id,
      dayName: dayNames[day._id - 1],
      totalAmount: day.totalAmount,
      count: day.count,
      expenses: day.expenses
    }));

    // Get category breakdown for the week
    const categoryBreakdown = await Expense.getCategorySummary(userId, startOfWeek, endOfWeek);

    // Get user's weekly limit
    const user = req.user;
    const weeklyLimit = user.weeklyLimit || 0;
    const isOverBudget = weeklyLimit > 0 && totalAmount > weeklyLimit;
    const percentageUsed = weeklyLimit > 0 ? (totalAmount / weeklyLimit) * 100 : 0;

    res.json({
      success: true,
      data: {
        period: {
          startDate: startOfWeek,
          endDate: endOfWeek,
          weekOffset: parseInt(weekOffset)
        },
        summary: {
          totalAmount,
          totalExpenses: weeklyExpenses.length,
          averagePerDay: totalAmount / 7,
          weeklyLimit,
          isOverBudget,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          remainingBudget: weeklyLimit > 0 ? weeklyLimit - totalAmount : null
        },
        dailyBreakdown: dailyData,
        categoryBreakdown,
        expenses: weeklyExpenses
      }
    });

  } catch (error) {
    console.error('Get weekly report error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weekly report'
    });
  }
};

// Get yearly overview
const getYearlyOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year } = req.query;

    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    // Get monthly breakdown for the year
    const monthlyBreakdown = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get category summary for the year
    const categoryBreakdown = await Expense.getCategorySummary(userId, startDate, endDate);

    // Calculate yearly totals
    const yearlyTotal = monthlyBreakdown.reduce((sum, month) => sum + month.totalAmount, 0);
    const yearlyCount = monthlyBreakdown.reduce((sum, month) => sum + month.count, 0);

    // Get comparison with previous year
    const prevYearStart = new Date(targetYear - 1, 0, 1);
    const prevYearEnd = new Date(targetYear - 1, 11, 31, 23, 59, 59, 999);
    const prevYearSummary = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: prevYearStart, $lte: prevYearEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const prevYearTotal = prevYearSummary.length > 0 ? prevYearSummary[0].totalAmount : 0;
    const yearOverYearChange = prevYearTotal > 0 ? ((yearlyTotal - prevYearTotal) / prevYearTotal) * 100 : 0;

    res.json({
      success: true,
      data: {
        year: targetYear,
        summary: {
          totalAmount: yearlyTotal,
          totalExpenses: yearlyCount,
          averagePerMonth: yearlyTotal / 12,
          averagePerExpense: yearlyCount > 0 ? yearlyTotal / yearlyCount : 0
        },
        monthlyBreakdown,
        categoryBreakdown,
        comparison: {
          previousYear: {
            year: targetYear - 1,
            totalAmount: prevYearTotal
          },
          yearOverYearChange: Math.round(yearOverYearChange * 100) / 100,
          trend: yearOverYearChange > 0 ? 'increase' : yearOverYearChange < 0 ? 'decrease' : 'same'
        }
      }
    });

  } catch (error) {
    console.error('Get yearly overview error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching yearly overview'
    });
  }
};

// Send monthly report via email
const emailMonthlyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;
    const { year, month } = req.query;

    // Default to current month if not provided
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;

    // Validate month
    if (targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }

    // Get monthly summary
    const monthlySummary = await Expense.getMonthlySummary(userId, targetYear, targetMonth);

    // Get category-wise breakdown for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const categoryBreakdown = await Expense.getCategorySummary(userId, startDate, endDate);

    // Add percentage to each category
    const totalAmount = categoryBreakdown.reduce((sum, cat) => sum + cat.totalAmount, 0);
    const categoriesWithPercentage = categoryBreakdown.map(category => ({
      ...category,
      percentage: totalAmount > 0 ? (category.totalAmount / totalAmount) * 100 : 0
    }));

    // Get comparison with previous month
    const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1;
    const prevYear = targetMonth === 1 ? targetYear - 1 : targetYear;
    const prevMonthSummary = await Expense.getMonthlySummary(userId, prevYear, prevMonth);

    const currentTotal = monthlySummary.length > 0 ? monthlySummary[0].totalAmount : 0;
    const prevTotal = prevMonthSummary.length > 0 ? prevMonthSummary[0].totalAmount : 0;
    const percentageChange = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    const reportData = {
      period: {
        year: targetYear,
        month: targetMonth,
        monthName: new Date(targetYear, targetMonth - 1).toLocaleString('default', { month: 'long' })
      },
      summary: monthlySummary.length > 0 ? monthlySummary[0] : {
        totalAmount: 0,
        count: 0,
        avgAmount: 0,
        categories: []
      },
      categoryBreakdown: categoriesWithPercentage,
      comparison: {
        previousMonth: {
          year: prevYear,
          month: prevMonth,
          totalAmount: prevTotal
        },
        percentageChange: Math.round(percentageChange * 100) / 100,
        trend: percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'same'
      }
    };

    // Send email
    const emailResult = await emailService.sendMonthlyReport(user, reportData);

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Monthly report sent to your email successfully',
        data: {
          emailSent: true,
          messageId: emailResult.messageId,
          reportData
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send monthly report email',
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Email monthly report error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while sending monthly report email'
    });
  }
};

// Send category report via email
const emailCategoryReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;
    const { startDate, endDate, period = 'month' } = req.query;

    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // Default periods
      const now = new Date();
      switch (period) {
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
        case 'month':
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
      }
    }

    const categorySummary = await Expense.getCategorySummary(userId, start, end);

    // Calculate total for percentage calculation
    const totalAmount = categorySummary.reduce((sum, cat) => sum + cat.totalAmount, 0);

    // Add percentage to each category
    const categoriesWithPercentage = categorySummary.map(category => ({
      ...category,
      percentage: totalAmount > 0 ? (category.totalAmount / totalAmount) * 100 : 0
    }));

    // Get top spending days in this period
    const topSpendingDays = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          date: { $first: '$date' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const reportData = {
      period: {
        startDate: start,
        endDate: end,
        type: period
      },
      categories: categoriesWithPercentage,
      summary: {
        totalAmount,
        totalCategories: categorySummary.length,
        averagePerCategory: categorySummary.length > 0 ? totalAmount / categorySummary.length : 0
      },
      topSpendingDays
    };

    // Send email
    const emailResult = await emailService.sendCategoryReport(user, reportData);

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Category report sent to your email successfully',
        data: {
          emailSent: true,
          messageId: emailResult.messageId,
          reportData
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send category report email',
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Email category report error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while sending category report email'
    });
  }
};

// Send weekly report via email
const emailWeeklyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;
    const { weekOffset = 0 } = req.query; // 0 = current week, -1 = last week, etc.

    // Calculate week start and end
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff + (parseInt(weekOffset) * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get weekly expenses
    const weeklyExpenses = await Expense.getWeeklyExpenses(userId, startOfWeek, endOfWeek);
    const totalAmount = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get user's weekly limit
    const weeklyLimit = user.weeklyLimit || 0;
    const isOverBudget = weeklyLimit > 0 && totalAmount > weeklyLimit;
    const percentageUsed = weeklyLimit > 0 ? (totalAmount / weeklyLimit) * 100 : 0;

    const reportData = {
      period: {
        startDate: startOfWeek,
        endDate: endOfWeek,
        weekOffset: parseInt(weekOffset)
      },
      summary: {
        totalAmount,
        totalExpenses: weeklyExpenses.length,
        averagePerDay: totalAmount / 7,
        weeklyLimit,
        isOverBudget,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        remainingBudget: weeklyLimit > 0 ? weeklyLimit - totalAmount : null
      },
      expenses: weeklyExpenses
    };

    // Send email
    const emailResult = await emailService.sendWeeklyReportEmail(user, reportData);

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Weekly report sent to your email successfully',
        data: {
          emailSent: true,
          messageId: emailResult.messageId,
          reportData
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send weekly report email',
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Email weekly report error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while sending weekly report email'
    });
  }
};

module.exports = {
  getMonthlySummary,
  getCategorySummary,
  getWeeklyReport,
  getYearlyOverview,
  emailMonthlyReport,
  emailCategoryReport,
  emailWeeklyReport
};
