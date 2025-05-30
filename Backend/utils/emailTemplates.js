// Email template for daily expense summary
const dailySummaryTemplate = (user, expenses, totalAmount, date) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const expenseRows = expenses.map(expense => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 8px; text-align: left;">${expense.title}</td>
      <td style="padding: 8px; text-align: center;">${expense.category}</td>
      <td style="padding: 8px; text-align: right; font-weight: bold; color: #e74c3c;">₹${expense.amount.toFixed(2)}</td>
      <td style="padding: 8px; text-align: left; font-size: 12px; color: #666;">${expense.note || '-'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Expense Summary</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💸 Daily Expense Summary</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${formattedDate}</p>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-top: 0;">Hello ${user.username}! 👋</h2>
          <p style="margin-bottom: 20px; color: #666;">Here's your expense summary for today:</p>

          <div style="background: #e8f5e8; border-left: 4px solid #27ae60; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <h3 style="margin: 0; color: #27ae60;">Total Spent Today: ₹${totalAmount.toFixed(2)}</h3>
            <p style="margin: 5px 0 0 0; color: #666;">Number of transactions: ${expenses.length}</p>
          </div>
        </div>

        ${expenses.length > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin-top: 0;">📋 Today's Expenses</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057;">Title</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6; color: #495057;">Category</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057;">Amount (₹)</th>
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057;">Note</th>
              </tr>
            </thead>
            <tbody>
              ${expenseRows}
            </tbody>
          </table>
        </div>
        ` : `
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
          <h3 style="color: #2c3e50; margin-top: 0;">🎉 No Expenses Today!</h3>
          <p style="color: #666; margin-bottom: 0;">You didn't spend any money today. Great job on saving! 💰</p>
        </div>
        `}

        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            💡 <strong>Tip:</strong> Keep track of your spending to reach your financial goals!
          </p>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automated email from your Personal Expense Tracker.</p>
          <p>Happy budgeting! 📊</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for weekly limit alert
const weeklyLimitAlertTemplate = (user, weeklySpent, weeklyLimit, percentageUsed) => {
  const overBudget = weeklySpent > weeklyLimit;
  const alertColor = overBudget ? '#e74c3c' : '#f39c12';
  const alertIcon = overBudget ? '🚨' : '⚠️';
  const alertTitle = overBudget ? 'Weekly Budget Exceeded!' : 'Weekly Budget Alert!';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly Budget Alert</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${alertColor}; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">${alertIcon} ${alertTitle}</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Budget Monitoring Alert</p>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-top: 0;">Hello ${user.username}! 👋</h2>
          <p style="margin-bottom: 20px; color: #666;">
            ${overBudget
      ? 'You have exceeded your weekly spending limit. Here are the details:'
      : 'You are approaching your weekly spending limit. Here are the details:'
    }
          </p>

          <div style="background: ${overBudget ? '#ffeaea' : '#fff3cd'}; border-left: 4px solid ${alertColor}; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h3 style="margin: 0; color: ${alertColor};">Weekly Spending Status</h3>
              <span style="background: ${alertColor}; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                ${percentageUsed.toFixed(1)}% Used
              </span>
            </div>

            <div style="margin-bottom: 10px;">
              <strong>Amount Spent:</strong> ₹${weeklySpent.toFixed(2)}
            </div>
            <div style="margin-bottom: 10px;">
              <strong>Weekly Limit:</strong> ₹${weeklyLimit.toFixed(2)}
            </div>
            <div style="margin-bottom: 15px;">
              <strong>${overBudget ? 'Over Budget:' : 'Remaining:'}</strong>
              <span style="color: ${overBudget ? '#e74c3c' : '#27ae60'}; font-weight: bold;">
                ₹${Math.abs(weeklyLimit - weeklySpent).toFixed(2)}
              </span>
            </div>

            <div style="background: #f8f9fa; border-radius: 8px; padding: 10px; margin-top: 15px;">
              <div style="background: ${alertColor}; height: 8px; border-radius: 4px; width: ${Math.min(percentageUsed, 100)}%;"></div>
              <div style="text-align: center; margin-top: 5px; font-size: 12px; color: #666;">
                Progress: ${percentageUsed.toFixed(1)}% of weekly limit
              </div>
            </div>
          </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin-top: 0;">💡 Budget Tips</h3>
          <ul style="color: #666; padding-left: 20px;">
            ${overBudget
      ? `
              <li>Review your recent expenses to identify unnecessary spending</li>
              <li>Consider adjusting your weekly budget if needed</li>
              <li>Try to limit discretionary spending for the rest of the week</li>
              <li>Focus on essential purchases only</li>
              `
      : `
              <li>You're doing great! Keep monitoring your spending</li>
              <li>Consider if upcoming purchases are necessary</li>
              <li>Try to stay within your remaining budget</li>
              <li>Review your expense categories to optimize spending</li>
              `
    }
          </ul>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automated alert from your Personal Expense Tracker.</p>
          <p>Stay on track with your financial goals! 💪</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for weekly summary report
const weeklySummaryTemplate = (user, expenses, totalAmount, weeklyLimit, startDate, endDate) => {
  const weekRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  const isOverBudget = weeklyLimit > 0 && totalAmount > weeklyLimit;

  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const categoryRows = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px; text-align: left;">${category}</td>
        <td style="padding: 8px; text-align: right; font-weight: bold;">₹${amount.toFixed(2)}</td>
        <td style="padding: 8px; text-align: right; color: #666;">${((amount / totalAmount) * 100).toFixed(1)}%</td>
      </tr>
    `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly Expense Summary</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📊 Weekly Expense Summary</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${weekRange}</p>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-top: 0;">Hello ${user.username}! 👋</h2>
          <p style="margin-bottom: 20px; color: #666;">Here's your weekly expense summary:</p>

          <div style="background: ${isOverBudget ? '#ffeaea' : '#e8f5e8'}; border-left: 4px solid ${isOverBudget ? '#e74c3c' : '#27ae60'}; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <h3 style="margin: 0; color: ${isOverBudget ? '#e74c3c' : '#27ae60'};">
              Total Spent This Week: ₹${totalAmount.toFixed(2)}
            </h3>
            <p style="margin: 5px 0 0 0; color: #666;">
              Number of transactions: ${expenses.length}
              ${weeklyLimit > 0 ? ` | Weekly limit: ₹${weeklyLimit.toFixed(2)}` : ''}
            </p>
            ${isOverBudget ? `
              <p style="margin: 10px 0 0 0; color: #e74c3c; font-weight: bold;">
                ⚠️ Over budget by ₹${(totalAmount - weeklyLimit).toFixed(2)}
              </p>
            ` : weeklyLimit > 0 ? `
              <p style="margin: 10px 0 0 0; color: #27ae60; font-weight: bold;">
                ✅ Under budget by ₹${(weeklyLimit - totalAmount).toFixed(2)}
              </p>
            ` : ''}
          </div>
        </div>

        ${Object.keys(categoryTotals).length > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin-top: 0;">📋 Spending by Category</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057;">Category</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057;">Amount (₹)</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057;">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automated weekly summary from your Personal Expense Tracker.</p>
          <p>Keep up the great work! 📈</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for monthly report
const monthlyReportTemplate = (user, reportData) => {
  const { period, summary, categoryBreakdown, dailyBreakdown, comparison } = reportData;

  const categoryRows = categoryBreakdown.map(category => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 8px; text-align: left;">${category._id}</td>
      <td style="padding: 8px; text-align: right; font-weight: bold;">₹${category.totalAmount.toFixed(2)}</td>
      <td style="padding: 8px; text-align: center;">${category.count}</td>
      <td style="padding: 8px; text-align: right; color: #666;">${category.percentage.toFixed(1)}%</td>
    </tr>
  `).join('');

  const trendIcon = comparison.trend === 'increase' ? '📈' : comparison.trend === 'decrease' ? '📉' : '➡️';
  const trendColor = comparison.trend === 'increase' ? '#e74c3c' : comparison.trend === 'decrease' ? '#27ae60' : '#6c757d';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Monthly Expense Report</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📊 Monthly Expense Report</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${period.monthName} ${period.year}</p>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-top: 0;">Hello ${user.username}! 👋</h2>
          <p style="margin-bottom: 20px; color: #666;">Here's your detailed monthly expense report:</p>

          <div style="background: #e8f5e8; border-left: 4px solid #27ae60; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
            <h3 style="margin: 0 0 15px 0; color: #27ae60;">💰 Monthly Summary</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 5px 0; color: #666;"><strong>Total Spent:</strong> ₹${summary.totalAmount.toFixed(2)}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Total Transactions:</strong> ${summary.count}</p>
              </div>
              <div>
                <p style="margin: 5px 0; color: #666;"><strong>Average per Transaction:</strong> ₹${summary.avgAmount.toFixed(2)}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Categories Used:</strong> ${summary.categories.length}</p>
              </div>
            </div>
          </div>

          <div style="background: #fff3cd; border-left: 4px solid ${trendColor}; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: ${trendColor};">${trendIcon} Month-over-Month Comparison</h4>
            <p style="margin: 0; color: #666;">
              <strong>Previous Month:</strong> ₹${comparison.previousMonth.totalAmount.toFixed(2)} |
              <strong>Change:</strong>
              <span style="color: ${trendColor}; font-weight: bold;">
                ${comparison.percentageChange > 0 ? '+' : ''}${comparison.percentageChange.toFixed(1)}%
              </span>
            </p>
          </div>
        </div>

        ${categoryBreakdown.length > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin-top: 0;">📋 Category Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057;">Category</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057;">Amount (₹)</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6; color: #495057;">Count</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057;">%</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #1565c0; font-size: 14px;">
            💡 <strong>Tip:</strong> Review your spending patterns to optimize your budget for next month!
          </p>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This monthly report was generated automatically by your Personal Expense Tracker.</p>
          <p>Keep tracking for better financial insights! 📈</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for category report
const categoryReportTemplate = (user, reportData) => {
  const { period, categories, summary, topSpendingDays } = reportData;

  const categoryRows = categories.map(category => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 8px; text-align: left;">
        <div style="display: flex; align-items: center;">
          <div style="width: 12px; height: 12px; background: #667eea; border-radius: 50%; margin-right: 8px;"></div>
          ${category._id}
        </div>
      </td>
      <td style="padding: 12px 8px; text-align: right; font-weight: bold;">₹${category.totalAmount.toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: center;">${category.count}</td>
      <td style="padding: 12px 8px; text-align: right;">₹${category.avgAmount.toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: right;">
        <div style="background: #f8f9fa; border-radius: 4px; padding: 4px 8px;">
          <span style="font-weight: bold; color: #667eea;">${category.percentage.toFixed(1)}%</span>
        </div>
      </td>
    </tr>
  `).join('');

  const topDaysRows = topSpendingDays.slice(0, 5).map(day => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 8px; text-align: left;">${new Date(day.date).toLocaleDateString()}</td>
      <td style="padding: 8px; text-align: right; font-weight: bold; color: #e74c3c;">₹${day.totalAmount.toFixed(2)}</td>
      <td style="padding: 8px; text-align: center;">${day.count}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Category Expense Report</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📊 Category Analysis Report</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
          ${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}
        </p>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-top: 0;">Hello ${user.username}! 👋</h2>
          <p style="margin-bottom: 20px; color: #666;">Here's your detailed category-wise spending analysis:</p>

          <div style="background: #e8f5e8; border-left: 4px solid #27ae60; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
            <h3 style="margin: 0 0 15px 0; color: #27ae60;">📈 Overall Summary</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> ₹${summary.totalAmount.toFixed(2)}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Categories Used:</strong> ${summary.totalCategories}</p>
              </div>
              <div>
                <p style="margin: 5px 0; color: #666;"><strong>Avg per Category:</strong> ₹${summary.averagePerCategory.toFixed(2)}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Period:</strong> ${period.type}</p>
              </div>
            </div>
          </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin-top: 0;">🏷️ Category Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057;">Category</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057;">Total (₹)</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6; color: #495057;">Count</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057;">Avg (₹)</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057;">Share</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows}
            </tbody>
          </table>
        </div>

        ${topSpendingDays.length > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin-top: 0;">🔥 Top Spending Days</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057;">Date</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057;">Amount (₹)</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6; color: #495057;">Transactions</th>
              </tr>
            </thead>
            <tbody>
              ${topDaysRows}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            💡 <strong>Insight:</strong> Focus on your top spending categories to optimize your budget!
          </p>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This category analysis was generated by your Personal Expense Tracker.</p>
          <p>Use these insights to make smarter spending decisions! 🎯</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  dailySummaryTemplate,
  weeklyLimitAlertTemplate,
  weeklySummaryTemplate,
  monthlyReportTemplate,
  categoryReportTemplate
};
