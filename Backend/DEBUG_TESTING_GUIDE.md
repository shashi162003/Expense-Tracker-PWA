# 🧪 Debug Testing Guide - Expense Tracker API

This guide will help you test all features of the Expense Tracker API (with INR currency) using the comprehensive debug interface.

## 🚀 Quick Start

### 1. Start the Server

```bash
cd Backend
npm run dev
```

### 2. Access Debug Page

Open your browser and go to: **http://localhost:5000/debug**

## 📋 Testing Checklist

### ✅ **Authentication Testing**

1. **Register a New User**

   - Navigate to "🔐 Authentication" section
   - Fill in username, email, password, and optional weekly limit
   - Click "Register" button
   - ✅ Should receive success response with JWT token

2. **Login**

   - Use the same credentials to login
   - ✅ Should receive JWT token and user data
   - ✅ Authentication status should update to "Logged in"

3. **Profile Management**
   - Go to "👤 Profile Management"
   - Click "Load Profile" to see current user data
   - Try updating username/email
   - Test password change functionality

### ✅ **Expense Management Testing**

4. **Add Expenses**

   - Navigate to "💰 Expense Management"
   - Add several test expenses with different:
     - Categories (Food, Transportation, etc.)
     - Amounts
     - Dates
     - Notes
   - ✅ Each expense should be created successfully

5. **View and Filter Expenses**

   - Click "Load Expenses" to see all expenses
   - Test filtering by:
     - Category
     - Date range
     - Search terms
   - ✅ Filters should work correctly

6. **Categories**
   - Go to "📂 Categories" section
   - Click "Load Categories"
   - ✅ Should display all 14 available categories

### ✅ **Reports Testing**

7. **Monthly Reports**

   - Navigate to "📊 Reports & Analytics"
   - Select current year and month
   - Click "Get Monthly Report"
   - ✅ Should show monthly summary with category breakdown

8. **Weekly Reports**

   - Select "Current Week" or "Last Week"
   - Click "Get Weekly Report"
   - ✅ Should show weekly spending with daily breakdown

9. **Category Reports**

   - Select period (week/month/year)
   - Click "Get Category Report"
   - ✅ Should show spending by category with percentages

10. **Email Reports** 📧
    - Click "📧 Email Monthly Report"
    - Click "📧 Email Weekly Report"
    - Click "📧 Email Category Report"
    - ✅ Should receive beautifully formatted HTML emails
    - ✅ Check your email inbox for detailed reports

### ✅ **Dashboard Testing**

11. **Dashboard Data**

    - Go to "📈 Dashboard"
    - Click "Load Dashboard"
    - ✅ Should show today/week/month summaries
    - ✅ Should show recent expenses and top categories

12. **Weekly Limit**

    - Set a weekly spending limit (e.g., ₹1000)
    - Click "Set Weekly Limit"
    - Add expenses that exceed this limit
    - ✅ Should trigger weekly limit checking

13. **Weekly Status**
    - Click "Weekly Status"
    - ✅ Should show current week's spending vs limit

### ✅ **Email Testing**

14. **Test Email Configuration**

    - Navigate to "📧 Email Testing"
    - Click "Send Test Email"
    - ✅ Should receive test email in your inbox
    - ✅ Check spam folder if not in inbox

15. **Email Reports Testing** 📧

    - Go to "📊 Reports & Analytics" section
    - Click "📧 Email Monthly Report"
    - Click "📧 Email Weekly Report"
    - Click "📧 Email Category Report"
    - ✅ Should receive beautifully formatted HTML reports via email
    - ✅ Reports include charts, summaries, and detailed breakdowns

16. **Weekly Limit Alerts**
    - Add expenses that exceed your weekly limit
    - ✅ Should automatically trigger limit alert email

### ✅ **Cron Jobs Testing**

15. **Cron Status**
    - Go to "⏰ Cron Jobs Management"
    - Click "Get Cron Status"
    - ✅ Should show daily and weekly job status
    - ✅ Jobs should be marked as "Running"

### ✅ **System Status Testing**

16. **API Health**

    - Navigate to "⚙️ API Status & Health"
    - Click "Get System Status"
    - ✅ Should show API online, database connected
    - Click "Health Check"
    - ✅ Should return healthy status

17. **Database Connection**
    - Click "Test Database"
    - ✅ Should show "Connected" status

### ✅ **Documentation Testing**

18. **API Documentation**
    - Go to "📚 API Documentation"
    - Click "Load API Documentation"
    - ✅ Should display all available endpoints

## 🎯 Advanced Testing Scenarios

### **Email Automation Testing**

1. **Daily Summary Email**

   - Add several expenses throughout the day
   - Wait for 11:59 PM or check cron job logs
   - ✅ Should receive daily summary email

2. **Weekly Summary Email**
   - Wait for Sunday 8:00 PM or check cron job logs
   - ✅ Should receive weekly summary email

### **Weekly Limit Alert Testing**

1. **Set Low Weekly Limit**

   - Set weekly limit to ₹500
   - Add expenses totaling ₹400 (80% threshold)
   - ✅ Should receive warning email

2. **Exceed Weekly Limit**
   - Add more expenses to exceed ₹500
   - ✅ Should receive over-budget alert email

### **Data Validation Testing**

1. **Invalid Data**

   - Try adding expense with negative amount
   - Try registering with invalid email
   - Try setting negative weekly limit
   - ✅ Should receive appropriate error messages

2. **Authentication Testing**
   - Try accessing protected endpoints without token
   - Try using expired/invalid token
   - ✅ Should receive 401 Unauthorized errors

## 🐛 Troubleshooting

### **Common Issues**

1. **API Offline**

   - Check if server is running on port 5000
   - Verify MongoDB connection
   - Check console for error messages

2. **Email Not Working**

   - Verify EMAIL_USER and EMAIL_PASS in .env
   - Check if Gmail 2FA is enabled
   - Verify app password is correct

3. **Database Connection Failed**

   - Check MongoDB Atlas connection string
   - Verify network access in MongoDB Atlas
   - Check if local MongoDB is running

4. **Cron Jobs Not Running**
   - Check server timezone settings
   - Verify cron expressions are valid
   - Check server logs for cron job execution

### **Debug Tips**

1. **Check Response Area**

   - All API responses are shown in the response areas
   - Look for error messages and status codes

2. **Browser Console**

   - Open browser developer tools (F12)
   - Check console for JavaScript errors

3. **Server Logs**
   - Monitor server console for error messages
   - Check database connection status

## 📊 Expected Results

After completing all tests, you should have:

- ✅ Successfully registered and logged in
- ✅ Created multiple expenses across different categories
- ✅ Generated various reports (monthly, weekly, category)
- ✅ Received test emails
- ✅ Set up weekly spending limits
- ✅ Verified all API endpoints are working
- ✅ Confirmed cron jobs are running
- ✅ Validated email automation features

## 🎉 Success Indicators

- **Green status indicators** in the debug interface
- **Successful API responses** (status: true)
- **Emails received** in your inbox
- **Data persistence** across page refreshes
- **Real-time updates** when adding/modifying data

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your .env configuration
3. Check server and browser console logs
4. Ensure all dependencies are installed (`npm install`)

Happy testing! 🚀
