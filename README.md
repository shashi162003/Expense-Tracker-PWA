# 💰 Expense Tracker API

A comprehensive, production-ready expense tracking REST API built with Node.js, Express, and MongoDB. Features automated email reports, real-time dashboard analytics, and robust authentication.

## 🚀 Live API

**Base URL**: `https://expense-tracker-api-g2os.onrender.com`

## ✨ Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 💸 **Expense Management** - Full CRUD operations for expenses
- 📊 **Dashboard Analytics** - Real-time spending summaries and insights
- 📧 **Automated Email Reports** - Daily and weekly expense summaries
- ⏰ **Cron Job Scheduling** - Automated report generation
- 🏷️ **Category Management** - 14 predefined expense categories
- 🔍 **Advanced Filtering** - Filter by date, category, and amount
- 📱 **CORS Enabled** - Ready for frontend integration
- 🛡️ **Security** - Password hashing, input validation, and error handling
- 💰 **Budget Tracking** - Weekly spending limits and percentage tracking

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Email Service**: Nodemailer
- **Task Scheduling**: node-cron
- **Development**: Nodemon for hot reloading

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud)
- Email service credentials (Gmail recommended)

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd expense-tracker-api
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=10000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Optional: Email Service Provider
EMAIL_SERVICE=gmail
```

### 3. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

🎉 **API is now running at**: `http://localhost:10000`

## 📚 API Documentation

### 🔐 Authentication Endpoints

#### Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "weeklyLimit": 5000
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "weeklyLimit": 5000
    },
    "token": "jwt_token_here"
  }
}
```

#### User Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

#### Get User Profile

```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "weeklyLimit": 5000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 💸 Expense Management Endpoints

#### Get All Expenses

```http
GET /api/expenses?page=1&limit=10&category=Food&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by expense category
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)
- `minAmount` (optional): Minimum amount filter
- `maxAmount` (optional): Maximum amount filter

**Response:**

```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "expense_id",
        "title": "Lunch at Restaurant",
        "amount": 850,
        "category": "Food & Dining",
        "date": "2024-01-15T00:00:00.000Z",
        "note": "Team lunch meeting",
        "createdAt": "2024-01-15T12:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalExpenses": 47,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "totalAmount": 25000,
      "averageAmount": 531.91
    }
  }
}
```

#### Create New Expense

```http
POST /api/expenses
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "amount": 1200,
  "category": "Groceries",
  "date": "2024-01-15",
  "note": "Weekly grocery shopping"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "expense": {
      "id": "new_expense_id",
      "title": "Grocery Shopping",
      "amount": 1200,
      "category": "Groceries",
      "date": "2024-01-15T00:00:00.000Z",
      "note": "Weekly grocery shopping",
      "userId": "user_id",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Update Expense

```http
PUT /api/expenses/:expenseId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Grocery Shopping",
  "amount": 1350,
  "category": "Groceries",
  "note": "Updated amount after checking receipt"
}
```

#### Delete Expense

```http
DELETE /api/expenses/:expenseId
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

### 📊 Dashboard Analytics

#### Get Dashboard Data

```http
GET /api/users/dashboard
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "today": {
        "amount": 1200,
        "count": 3
      },
      "thisWeek": {
        "amount": 4500,
        "count": 12,
        "limit": 5000,
        "percentage": 90,
        "remaining": 500
      },
      "thisMonth": {
        "amount": 18500,
        "count": 45
      },
      "lastMonth": {
        "amount": 22000,
        "count": 52
      }
    },
    "recentExpenses": [
      {
        "id": "expense_id",
        "title": "Coffee",
        "amount": 150,
        "category": "Food & Dining",
        "date": "2024-01-15T00:00:00.000Z"
      }
    ],
    "topCategories": [
      {
        "_id": "Food & Dining",
        "totalAmount": 8500,
        "count": 15,
        "percentage": 45.9
      },
      {
        "_id": "Transportation",
        "totalAmount": 3200,
        "count": 8,
        "percentage": 17.3
      }
    ],
    "monthlyTrend": [
      {
        "month": "2024-01",
        "amount": 18500,
        "count": 45
      }
    ]
  }
}
```

### 📈 Reports Endpoints

#### Weekly Report

```http
GET /api/reports/weekly
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-08T00:00:00.000Z",
      "endDate": "2024-01-14T23:59:59.999Z",
      "week": 2,
      "year": 2024
    },
    "summary": {
      "totalAmount": 4500,
      "totalExpenses": 12,
      "averagePerDay": 642.86,
      "weeklyLimit": 5000,
      "percentageUsed": 90,
      "remaining": 500
    },
    "categoryBreakdown": [
      {
        "category": "Food & Dining",
        "amount": 2100,
        "count": 6,
        "percentage": 46.7
      }
    ],
    "dailyBreakdown": [
      {
        "date": "2024-01-08",
        "amount": 650,
        "count": 2
      }
    ]
  }
}
```

#### Monthly Report

```http
GET /api/reports/monthly?month=1&year=2024
Authorization: Bearer <jwt_token>
```

#### Category Report

```http
GET /api/reports/category?category=Food&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <jwt_token>
```

### 🏷️ Expense Categories

The API supports these predefined categories:

| Category            | Description                             | Icon |
| ------------------- | --------------------------------------- | ---- |
| `Food & Dining`     | Restaurants, cafes, food delivery       | 🍽️   |
| `Transportation`    | Fuel, public transport, taxi            | 🚗   |
| `Shopping`          | Clothing, electronics, general shopping | 🛍️   |
| `Entertainment`     | Movies, games, subscriptions            | 🎬   |
| `Bills & Utilities` | Electricity, water, internet, phone     | 💡   |
| `Healthcare`        | Medical expenses, pharmacy              | 🏥   |
| `Education`         | Books, courses, training                | 📚   |
| `Travel`            | Flights, hotels, vacation               | ✈️   |
| `Groceries`         | Supermarket, daily essentials           | 🛒   |
| `Personal Care`     | Salon, cosmetics, hygiene               | 💄   |
| `Home & Garden`     | Furniture, repairs, gardening           | 🏠   |
| `Gifts & Donations` | Presents, charity                       | 🎁   |
| `Business`          | Work-related expenses                   | 💼   |
| `Other`             | Miscellaneous expenses                  | 📦   |

## 📧 Automated Email Reports

The API automatically sends email reports using cron jobs:

### Daily Summary (11:59 PM)

- Total expenses for the day
- Category breakdown
- Weekly progress update

### Weekly Summary (Sunday 8:00 PM)

- Week's total expenses
- Budget utilization
- Top spending categories
- Comparison with previous week

### Email Template Features

- 📊 Beautiful HTML templates
- 📱 Mobile-responsive design
- 🎨 Category-wise color coding
- 📈 Progress bars and charts
- 💰 Indian Rupee (₹) formatting

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Detailed error responses (dev) / Generic (prod)
- **CORS Protection**: Configurable cross-origin requests
- **Rate Limiting**: Built-in request throttling
- **Environment Variables**: Sensitive data protection

## 📊 Response Format

All API responses follow this consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)",
  "code": "ERROR_CODE"
}
```

## 🚨 HTTP Status Codes

| Code  | Description              |
| ----- | ------------------------ |
| `200` | ✅ Success               |
| `201` | ✅ Created               |
| `400` | ❌ Bad Request           |
| `401` | 🔒 Unauthorized          |
| `403` | 🚫 Forbidden             |
| `404` | 🔍 Not Found             |
| `422` | ⚠️ Validation Error      |
| `500` | 💥 Internal Server Error |

## 🔧 Development

### Project Structure

```
expense-tracker-api/
├── controllers/          # Route handlers
├── models/              # MongoDB schemas
├── routes/              # API routes
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── cron/                # Scheduled jobs
├── config/              # Configuration files
├── public/              # Static files
└── app.js               # Main application file
```

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (if configured)
npm run lint       # Run ESLint
```

## 🌐 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-jwt-secret
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-password
```

### Render Deployment

The API is deployed on Render with:

- ✅ Automatic deployments from GitHub
- ✅ Environment variable management
- ✅ SSL certificates
- ✅ Custom domain support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the robust database
- Nodemailer team for email functionality
- All open-source contributors

---

**Made with ❤️ for efficient expense tracking**
