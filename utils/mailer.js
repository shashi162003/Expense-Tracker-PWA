const { createTransporter } = require('../config/email');
const {
  dailySummaryTemplate,
  weeklyLimitAlertTemplate,
  weeklySummaryTemplate,
  monthlyReportTemplate,
  categoryReportTemplate
} = require('./emailTemplates');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  // Initialize transporter
  async init() {
    try {
      this.transporter = createTransporter();
      await this.transporter.verify();
      console.log('Email service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize email service:', error.message);
      return false;
    }
  }

  // Send daily summary email
  async sendDailySummary(user, expenses, totalAmount, date = new Date()) {
    try {
      if (!this.transporter) {
        await this.init();
      }

      const htmlContent = dailySummaryTemplate(user, expenses, totalAmount, date);

      const mailOptions = {
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `📊 Daily Expense Summary - ${date.toLocaleDateString()}`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Daily summary email sent to ${user.email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending daily summary email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send weekly limit alert email
  async sendWeeklyLimitAlert(user, weeklySpent, weeklyLimit) {
    try {
      if (!this.transporter) {
        await this.init();
      }

      const percentageUsed = (weeklySpent / weeklyLimit) * 100;
      const isOverBudget = weeklySpent > weeklyLimit;

      const htmlContent = weeklyLimitAlertTemplate(user, weeklySpent, weeklyLimit, percentageUsed);

      const subject = isOverBudget
        ? `🚨 Weekly Budget Exceeded - ₹${weeklySpent.toFixed(2)} spent`
        : `⚠️ Weekly Budget Alert - ${percentageUsed.toFixed(1)}% used`;

      const mailOptions = {
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Weekly limit alert email sent to ${user.email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending weekly limit alert email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send weekly summary email
  async sendWeeklySummary(user, expenses, totalAmount, weeklyLimit, startDate, endDate) {
    try {
      if (!this.transporter) {
        await this.init();
      }

      const htmlContent = weeklySummaryTemplate(user, expenses, totalAmount, weeklyLimit, startDate, endDate);

      const mailOptions = {
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `📊 Weekly Expense Summary - ₹${totalAmount.toFixed(2)} spent`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Weekly summary email sent to ${user.email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending weekly summary email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    try {
      if (!this.transporter) {
        await this.init();
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Expense Tracker</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Expense Tracker!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey to better financial management starts here</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-top: 0;">Hello ${user.username}! 👋</h2>
              <p style="margin-bottom: 20px; color: #666;">
                Thank you for joining Expense Tracker! We're excited to help you take control of your finances.
              </p>

              <div style="background: #e8f5e8; border-left: 4px solid #27ae60; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <h3 style="margin: 0; color: #27ae60;">🚀 Getting Started</h3>
                <ul style="margin: 10px 0 0 0; color: #666;">
                  <li>Start adding your daily expenses</li>
                  <li>Set a weekly spending limit to stay on budget</li>
                  <li>Receive daily email summaries of your spending</li>
                  <li>Get alerts when you approach your weekly limit</li>
                </ul>
              </div>

              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
                <h3 style="margin: 0; color: #856404;">💡 Pro Tips</h3>
                <ul style="margin: 10px 0 0 0; color: #666;">
                  <li>Categorize your expenses for better insights</li>
                  <li>Add notes to remember what each expense was for</li>
                  <li>Review your weekly and monthly reports regularly</li>
                  <li>Adjust your weekly limit as needed</li>
                </ul>
              </div>
            </div>

            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
              <p>Happy budgeting! 💰</p>
              <p>- The Expense Tracker Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🎉 Welcome to Expense Tracker - Let\'s Start Managing Your Finances!',
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${user.email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send monthly report email
  async sendMonthlyReport(user, reportData) {
    try {
      if (!this.transporter) {
        await this.init();
      }

      const htmlContent = monthlyReportTemplate(user, reportData);

      const mailOptions = {
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `📊 Monthly Expense Report - ${reportData.period.monthName} ${reportData.period.year}`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Monthly report email sent to ${user.email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending monthly report email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send category report email
  async sendCategoryReport(user, reportData) {
    try {
      if (!this.transporter) {
        await this.init();
      }

      const htmlContent = categoryReportTemplate(user, reportData);

      const mailOptions = {
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `📊 Category Analysis Report - ${reportData.period.type} Report`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Category report email sent to ${user.email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending category report email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send weekly report email (enhanced version)
  async sendWeeklyReportEmail(user, reportData) {
    try {
      if (!this.transporter) {
        await this.init();
      }

      // Use the existing weekly summary template but with enhanced data
      const htmlContent = weeklySummaryTemplate(
        user,
        reportData.expenses,
        reportData.summary.totalAmount,
        reportData.summary.weeklyLimit,
        reportData.period.startDate,
        reportData.period.endDate
      );

      const mailOptions = {
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `📊 Weekly Expense Report - ₹${reportData.summary.totalAmount.toFixed(2)} spent`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Weekly report email sent to ${user.email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending weekly report email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Test email functionality
  async sendTestEmail(email) {
    try {
      if (!this.transporter) {
        await this.init();
      }

      const mailOptions = {
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✅ Email Configuration Test - Expense Tracker',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #27ae60;">✅ Email Test Successful!</h2>
            <p>Your email configuration is working correctly.</p>
            <p>You will receive automated emails for:</p>
            <ul>
              <li>Daily expense summaries</li>
              <li>Weekly budget alerts</li>
              <li>Weekly spending reports</li>
              <li>Monthly expense reports</li>
              <li>Category analysis reports</li>
            </ul>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is a test email from your Personal Expense Tracker.
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Test email sent to ${email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending test email:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
