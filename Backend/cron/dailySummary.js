const cron = require('node-cron');
const User = require('../models/User');
const Expense = require('../models/Expense');
const emailService = require('../utils/mailer');

// Daily summary email job - runs every day at 23:59 (11:59 PM)
const dailySummaryJob = cron.schedule('59 23 * * *', async () => {
  console.log('🕚 Running daily summary email job...');

  try {
    // Get all active users
    const users = await User.find({ isActive: true });
    console.log(`Found ${users.length} active users for daily summary`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each user
    for (const user of users) {
      try {
        // Get today's expenses for the user
        const todayExpenses = await Expense.getDailyExpenses(user._id, today);

        // Calculate total amount spent today
        const totalAmount = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Send daily summary email (even if no expenses - user might want to know they spent nothing)
        const result = await emailService.sendDailySummary(user, todayExpenses, totalAmount, today);

        if (result.success) {
          emailsSent++;
          console.log(`✅ Daily summary sent to ${user.email}`);
        } else {
          emailsFailed++;
          console.error(`❌ Failed to send daily summary to ${user.email}:`, result.error);
        }

        // Add a small delay between emails to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (userError) {
        emailsFailed++;
        console.error(`❌ Error processing daily summary for user ${user.email}:`, userError.message);
      }
    }

    console.log(`📧 Daily summary job completed: ${emailsSent} sent, ${emailsFailed} failed`);

  } catch (error) {
    console.error('❌ Error in daily summary job:', error.message);
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: "America/New_York" // Adjust timezone as needed
});

// Weekly limit check job - runs every time an expense is added (called from expense controller)
const checkWeeklyLimit = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.weeklyLimit || user.weeklyLimit <= 0) {
      return; // No weekly limit set
    }

    // Calculate start and end of current week (Monday to Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get weekly expenses
    const weeklyExpenses = await Expense.getWeeklyExpenses(user._id, startOfWeek, endOfWeek);
    const weeklySpent = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Check if limit is exceeded and if we haven't sent an alert recently
    const percentageUsed = (weeklySpent / user.weeklyLimit) * 100;
    const shouldSendAlert = percentageUsed >= 80; // Send alert at 80% and when exceeded

    // Check if we've already sent an alert this week
    const lastAlert = user.lastLimitAlert;
    const alertAlreadySentThisWeek = lastAlert &&
      lastAlert >= startOfWeek &&
      lastAlert <= endOfWeek;

    if (shouldSendAlert && !alertAlreadySentThisWeek) {
      const result = await emailService.sendWeeklyLimitAlert(user, weeklySpent, user.weeklyLimit);

      if (result.success) {
        // Update last alert timestamp
        await User.findByIdAndUpdate(userId, { lastLimitAlert: new Date() });
        console.log(`✅ Weekly limit alert sent to ${user.email} (${percentageUsed.toFixed(1)}% used)`);
      } else {
        console.error(`❌ Failed to send weekly limit alert to ${user.email}:`, result.error);
      }
    }

  } catch (error) {
    console.error('❌ Error checking weekly limit:', error.message);
  }
};

// Weekly summary job - runs every Sunday at 20:00 (8:00 PM)
const weeklySummaryJob = cron.schedule('0 20 * * 0', async () => {
  console.log('📊 Running weekly summary email job...');

  try {
    // Get all active users
    const users = await User.find({ isActive: true });
    console.log(`Found ${users.length} active users for weekly summary`);

    // Calculate last week's date range
    const endOfLastWeek = new Date();
    endOfLastWeek.setDate(endOfLastWeek.getDate() - endOfLastWeek.getDay()); // Last Sunday
    endOfLastWeek.setHours(23, 59, 59, 999);

    const startOfLastWeek = new Date(endOfLastWeek);
    startOfLastWeek.setDate(endOfLastWeek.getDate() - 6); // Previous Monday
    startOfLastWeek.setHours(0, 0, 0, 0);

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each user
    for (const user of users) {
      try {
        // Get last week's expenses for the user
        const weeklyExpenses = await Expense.getWeeklyExpenses(user._id, startOfLastWeek, endOfLastWeek);

        // Calculate total amount spent last week
        const totalAmount = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Only send weekly summary if there were expenses
        if (weeklyExpenses.length > 0) {
          const result = await emailService.sendWeeklySummary(
            user,
            weeklyExpenses,
            totalAmount,
            user.weeklyLimit,
            startOfLastWeek,
            endOfLastWeek
          );

          if (result.success) {
            emailsSent++;
            console.log(`✅ Weekly summary sent to ${user.email}`);
          } else {
            emailsFailed++;
            console.error(`❌ Failed to send weekly summary to ${user.email}:`, result.error);
          }
        } else {
          console.log(`ℹ️ No expenses for ${user.email} last week, skipping weekly summary`);
        }

        // Add a small delay between emails
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (userError) {
        emailsFailed++;
        console.error(`❌ Error processing weekly summary for user ${user.email}:`, userError.message);
      }
    }

    console.log(`📧 Weekly summary job completed: ${emailsSent} sent, ${emailsFailed} failed`);

  } catch (error) {
    console.error('❌ Error in weekly summary job:', error.message);
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: "America/New_York" // Adjust timezone as needed
});

// Function to start all cron jobs
const startCronJobs = () => {
  console.log('🚀 Starting cron jobs...');

  // Start daily summary job
  dailySummaryJob.start();
  console.log('✅ Daily summary job started (runs at 23:59 every day)');

  // Start weekly summary job
  weeklySummaryJob.start();
  console.log('✅ Weekly summary job started (runs at 20:00 every Sunday)');
};

// Function to stop all cron jobs
const stopCronJobs = () => {
  console.log('🛑 Stopping cron jobs...');
  dailySummaryJob.stop();
  weeklySummaryJob.stop();
  console.log('✅ All cron jobs stopped');
};

// Function to get cron job status
const getCronJobStatus = () => {
  return {
    dailySummary: {
      running: dailySummaryJob.running,
      schedule: '59 23 * * *', // 11:59 PM daily
      description: 'Daily expense summary email'
    },
    weeklySummary: {
      running: weeklySummaryJob.running,
      schedule: '0 20 * * 0', // 8:00 PM every Sunday
      description: 'Weekly expense summary email'
    }
  };
};

// Manual trigger functions for testing
const manualDailySummary = async () => {
  console.log('🧪 Manual trigger: Running daily summary email job...');

  try {
    // Get all active users
    const User = require('../models/User');
    const users = await User.find({ isActive: true });
    console.log(`Found ${users.length} active users for manual daily summary`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each user
    for (const user of users) {
      try {
        // Get today's expenses for the user
        const todayExpenses = await Expense.getDailyExpenses(user._id, today);

        // Calculate total amount spent today
        const totalAmount = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Send daily summary email
        const result = await emailService.sendDailySummary(user, todayExpenses, totalAmount, today);

        if (result.success) {
          emailsSent++;
          console.log(`✅ Manual daily summary sent to ${user.email}`);
        } else {
          emailsFailed++;
          console.error(`❌ Failed to send manual daily summary to ${user.email}:`, result.error);
        }

        // Add a small delay between emails
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (userError) {
        emailsFailed++;
        console.error(`❌ Error processing manual daily summary for user ${user.email}:`, userError.message);
      }
    }

    console.log(`📧 Manual daily summary completed: ${emailsSent} sent, ${emailsFailed} failed`);
    return { success: true, emailsSent, emailsFailed };

  } catch (error) {
    console.error('❌ Error in manual daily summary:', error.message);
    return { success: false, error: error.message };
  }
};

const manualWeeklySummary = async () => {
  console.log('🧪 Manual trigger: Running weekly summary email job...');

  try {
    // Get all active users
    const User = require('../models/User');
    const users = await User.find({ isActive: true });
    console.log(`Found ${users.length} active users for manual weekly summary`);

    // Calculate current week's date range (for testing, use current week instead of last week)
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each user
    for (const user of users) {
      try {
        // Get current week's expenses for the user
        const weeklyExpenses = await Expense.getWeeklyExpenses(user._id, startOfWeek, endOfWeek);

        // Calculate total amount spent this week
        const totalAmount = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Send weekly summary if there were expenses
        if (weeklyExpenses.length > 0) {
          const result = await emailService.sendWeeklySummary(
            user,
            weeklyExpenses,
            totalAmount,
            user.weeklyLimit,
            startOfWeek,
            endOfWeek
          );

          if (result.success) {
            emailsSent++;
            console.log(`✅ Manual weekly summary sent to ${user.email}`);
          } else {
            emailsFailed++;
            console.error(`❌ Failed to send manual weekly summary to ${user.email}:`, result.error);
          }
        } else {
          console.log(`ℹ️ No expenses for ${user.email} this week, skipping weekly summary`);
        }

        // Add a small delay between emails
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (userError) {
        emailsFailed++;
        console.error(`❌ Error processing manual weekly summary for user ${user.email}:`, userError.message);
      }
    }

    console.log(`📧 Manual weekly summary completed: ${emailsSent} sent, ${emailsFailed} failed`);
    return { success: true, emailsSent, emailsFailed };

  } catch (error) {
    console.error('❌ Error in manual weekly summary:', error.message);
    return { success: false, error: error.message };
  }
};

const manualWeeklyLimitCheck = async (userId) => {
  console.log('🧪 Manual trigger: Running weekly limit check...');

  try {
    const User = require('../models/User');
    const user = await User.findById(userId);

    if (!user || !user.weeklyLimit || user.weeklyLimit <= 0) {
      return { success: false, message: 'No weekly limit set for user' };
    }

    // Calculate start and end of current week
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get weekly expenses
    const weeklyExpenses = await Expense.getWeeklyExpenses(user._id, startOfWeek, endOfWeek);
    const weeklySpent = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate status
    const percentageUsed = (weeklySpent / user.weeklyLimit) * 100;
    const shouldSendAlert = percentageUsed >= 80; // Send alert at 80% and when exceeded

    if (shouldSendAlert) {
      const result = await emailService.sendWeeklyLimitAlert(user, weeklySpent, user.weeklyLimit);

      if (result.success) {
        // Update last alert timestamp
        await User.findByIdAndUpdate(userId, { lastLimitAlert: new Date() });
        console.log(`✅ Manual weekly limit alert sent to ${user.email} (${percentageUsed.toFixed(1)}% used)`);
        return {
          success: true,
          message: `Weekly limit alert sent (${percentageUsed.toFixed(1)}% used)`,
          weeklySpent,
          weeklyLimit: user.weeklyLimit,
          percentageUsed
        };
      } else {
        console.error(`❌ Failed to send manual weekly limit alert to ${user.email}:`, result.error);
        return { success: false, error: result.error };
      }
    } else {
      return {
        success: true,
        message: `No alert needed (${percentageUsed.toFixed(1)}% used)`,
        weeklySpent,
        weeklyLimit: user.weeklyLimit,
        percentageUsed
      };
    }

  } catch (error) {
    console.error('❌ Error in manual weekly limit check:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  startCronJobs,
  stopCronJobs,
  getCronJobStatus,
  checkWeeklyLimit,
  dailySummaryJob,
  weeklySummaryJob,
  manualDailySummary,
  manualWeeklySummary,
  manualWeeklyLimitCheck
};
