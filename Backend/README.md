# 💸 Personal Expense Tracker API - Backend

A comprehensive RESTful backend API for tracking personal expenses in Indian Rupees (INR) with automated email notifications and detailed reporting.

## 🚀 Features

✅ **User Management**

- User registration & login with JWT authentication
- Profile management and password changes
- Account deactivation

✅ **Expense Management**

- CRUD operations for expenses
- Advanced filtering (date, category, amount, search)
- Bulk operations
- 14 predefined categories

✅ **Smart Notifications**

- Weekly spending limit alerts
- Daily email summaries
- Welcome emails for new users
- Test email functionality

✅ **Comprehensive Reports**

- Monthly spending summaries
- Category-wise breakdowns
- Weekly reports with budget tracking
- Yearly overviews with trends

✅ **Automated Jobs**

- Daily summary emails (11:59 PM)
- Weekly summary emails (8:00 PM Sundays)
- Real-time weekly limit monitoring

## 🏗️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + Bcrypt
- **Email Service:** Nodemailer (Gmail/SMTP)
- **Scheduler:** node-cron
- **Security:** CORS, Rate Limiting

## 📦 Project Structure

```
Backend/
├── config/
│   ├── database.js         # MongoDB connection
│   └── email.js           # Email configuration
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── expenseController.js # Expense CRUD operations
│   ├── reportController.js # Report generation
│   └── userController.js   # User management
├── cron/
│   ├── dailySummary.js     # Cron jobs for emails
│   └── cronManager.js      # Cron job management
├── middleware/
│   └── auth.js            # JWT authentication
├── models/
│   ├── User.js            # User schema
│   └── Expense.js         # Expense schema
├── routes/
│   ├── auth.js            # Auth routes
│   ├── expenses.js        # Expense routes
│   ├── reports.js         # Report routes
│   └── users.js           # User routes
├── utils/
│   ├── mailer.js          # Email service
│   └── emailTemplates.js  # HTML email templates
├── app.js                 # Main application
├── package.json
└── .env.example          # Environment variables template
```

## 🛠️ Setup & Installation

### 1. Clone and Install Dependencies

```bash
cd Backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/expense-tracker

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Database Setup

Make sure MongoDB is running locally or provide a MongoDB Atlas connection string.

### 4. Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

### 5. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 📖 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| POST   | `/auth/register`        | Register new user |
| POST   | `/auth/login`           | Login user        |
| GET    | `/auth/profile`         | Get user profile  |
| PUT    | `/auth/profile`         | Update profile    |
| PUT    | `/auth/change-password` | Change password   |

### Expense Endpoints

| Method | Endpoint                | Description                 |
| ------ | ----------------------- | --------------------------- |
| GET    | `/expenses`             | Get expenses (with filters) |
| POST   | `/expenses`             | Create expense              |
| GET    | `/expenses/:id`         | Get expense by ID           |
| PUT    | `/expenses/:id`         | Update expense              |
| DELETE | `/expenses/:id`         | Delete expense              |
| GET    | `/expenses/categories`  | Get categories              |
| POST   | `/expenses/bulk-delete` | Delete multiple expenses    |

### Report Endpoints

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| GET    | `/reports/monthly`  | Monthly summary    |
| GET    | `/reports/category` | Category breakdown |
| GET    | `/reports/weekly`   | Weekly report      |
| GET    | `/reports/yearly`   | Yearly overview    |

### User Management Endpoints

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | `/users/dashboard`     | Dashboard data         |
| GET    | `/users/weekly-status` | Weekly spending status |
| PUT    | `/users/weekly-limit`  | Set weekly limit       |
| POST   | `/users/test-email`    | Send test email        |
| PUT    | `/users/deactivate`    | Deactivate account     |

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📧 Email Features

### Daily Summary Email

- Sent every day at 11:59 PM
- Lists all expenses for the day
- Shows total amount spent
- Beautiful HTML template

### Weekly Limit Alert

- Triggered when 80% of weekly limit is reached
- Sent when weekly limit is exceeded
- Shows spending progress and remaining budget

### Weekly Summary Email

- Sent every Sunday at 8:00 PM
- Category-wise breakdown
- Comparison with weekly limit
- Spending trends

## ⚙️ Cron Jobs

The application uses `node-cron` for automated tasks:

```javascript
// Daily summary - 11:59 PM every day
"59 23 * * *";

// Weekly summary - 8:00 PM every Sunday
"0 20 * * 0";
```

### Cron Job Management

```javascript
const { cronManager } = require("./cron/cronManager");

// Start all jobs
cronManager.startAll();

// Stop all jobs
cronManager.stopAll();

// Get job status
const status = cronManager.getStatus();
```

## 🗃️ Database Models

### User Model

```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  weeklyLimit: Number (default: 0),
  lastLimitAlert: Date,
  isActive: Boolean (default: true)
}
```

### Expense Model

```javascript
{
  userId: ObjectId (ref: User),
  title: String (required),
  amount: Number (required),
  category: String (enum),
  date: Date (default: now),
  note: String,
  tags: [String]
}
```

## 🔍 Query Parameters

### Expense Filtering

```
GET /api/expenses?page=1&limit=10&category=Food&startDate=2024-01-01&endDate=2024-01-31&search=coffee&sortBy=date&sortOrder=desc
```

### Report Parameters

```
GET /api/reports/monthly?year=2024&month=1
GET /api/reports/category?period=month&startDate=2024-01-01&endDate=2024-01-31
GET /api/reports/weekly?weekOffset=-1
```

## 🛡️ Security Features

- **Password Hashing:** Bcrypt with salt rounds
- **JWT Authentication:** Secure token-based auth
- **Rate Limiting:** Prevents API abuse
- **Input Validation:** Mongoose schema validation
- **CORS Protection:** Configurable origins
- **Error Handling:** Comprehensive error responses

## 📊 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/health
```

### API Status

```bash
curl http://localhost:5000/api/status
```

### Test Email

```bash
curl -X POST http://localhost:5000/api/users/test-email \
  -H "Authorization: Bearer <token>"
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker
JWT_SECRET=your_production_secret
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASS=your_production_app_password
```

### PM2 Deployment

```bash
npm install -g pm2
pm2 start app.js --name expense-tracker-api
pm2 startup
pm2 save
```

## 🔧 Troubleshooting

### Common Issues

1. **Email not sending**

   - Check Gmail app password
   - Verify 2FA is enabled
   - Test with `/api/users/test-email`

2. **Database connection failed**

   - Verify MongoDB is running
   - Check connection string
   - Ensure network access for Atlas

3. **Cron jobs not running**
   - Check server timezone
   - Verify cron expressions
   - Check `/api/status` endpoint

## 📝 License

ISC License - See LICENSE file for details

## 👨‍💻 Author

**Shashi Kumar Gupta**

---

For more information, visit the API documentation at `http://localhost:5000/api/docs`
