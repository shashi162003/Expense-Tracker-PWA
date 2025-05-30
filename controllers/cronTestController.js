const { 
  manualDailySummary, 
  manualWeeklySummary, 
  manualWeeklyLimitCheck,
  getCronJobStatus 
} = require('../cron/dailySummary');

// Manual trigger for daily summary email
const triggerDailySummary = async (req, res) => {
  try {
    console.log('🧪 Manual trigger requested: Daily Summary');
    
    const result = await manualDailySummary();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Daily summary emails triggered successfully',
        data: {
          emailsSent: result.emailsSent,
          emailsFailed: result.emailsFailed,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to trigger daily summary emails',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error triggering daily summary:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while triggering daily summary',
      error: error.message
    });
  }
};

// Manual trigger for weekly summary email
const triggerWeeklySummary = async (req, res) => {
  try {
    console.log('🧪 Manual trigger requested: Weekly Summary');
    
    const result = await manualWeeklySummary();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Weekly summary emails triggered successfully',
        data: {
          emailsSent: result.emailsSent,
          emailsFailed: result.emailsFailed,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to trigger weekly summary emails',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error triggering weekly summary:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while triggering weekly summary',
      error: error.message
    });
  }
};

// Manual trigger for weekly limit check
const triggerWeeklyLimitCheck = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('🧪 Manual trigger requested: Weekly Limit Check for user:', userId);
    
    const result = await manualWeeklyLimitCheck(userId);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          weeklySpent: result.weeklySpent,
          weeklyLimit: result.weeklyLimit,
          percentageUsed: result.percentageUsed,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Failed to check weekly limit',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error triggering weekly limit check:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while checking weekly limit',
      error: error.message
    });
  }
};

// Get cron job status
const getCronStatus = async (req, res) => {
  try {
    const status = getCronJobStatus();
    
    res.json({
      success: true,
      message: 'Cron job status retrieved successfully',
      data: {
        cronJobs: status,
        serverTime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });

  } catch (error) {
    console.error('Error getting cron status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while getting cron status',
      error: error.message
    });
  }
};

// Test all cron functionalities
const testAllCronJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('🧪 Testing all cron jobs for user:', userId);
    
    const results = {
      dailySummary: null,
      weeklySummary: null,
      weeklyLimitCheck: null
    };

    // Test daily summary
    try {
      results.dailySummary = await manualDailySummary();
    } catch (error) {
      results.dailySummary = { success: false, error: error.message };
    }

    // Test weekly summary
    try {
      results.weeklySummary = await manualWeeklySummary();
    } catch (error) {
      results.weeklySummary = { success: false, error: error.message };
    }

    // Test weekly limit check
    try {
      results.weeklyLimitCheck = await manualWeeklyLimitCheck(userId);
    } catch (error) {
      results.weeklyLimitCheck = { success: false, error: error.message };
    }

    const successCount = Object.values(results).filter(r => r && r.success).length;
    const totalTests = Object.keys(results).length;

    res.json({
      success: true,
      message: `Cron job testing completed: ${successCount}/${totalTests} successful`,
      data: {
        results,
        summary: {
          totalTests,
          successCount,
          failureCount: totalTests - successCount
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error testing all cron jobs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while testing cron jobs',
      error: error.message
    });
  }
};

module.exports = {
  triggerDailySummary,
  triggerWeeklySummary,
  triggerWeeklyLimitCheck,
  getCronStatus,
  testAllCronJobs
};
