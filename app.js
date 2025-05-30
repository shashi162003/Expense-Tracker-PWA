require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { testEmailConfig } = require('./config/email');
const { startCronJobs, getCronJobStatus } = require('./cron/dailySummary');

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const cronTestRoutes = require('./routes/cronTest');

const app = express();

// Connect to MongoDB
connectDB();

// Test email configuration on startup
testEmailConfig().then(isValid => {
  if (isValid) {
    console.log('✅ Email service is ready');
  } else {
    console.log('⚠️ Email service configuration issue - check your environment variables');
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (for debug page)
app.use('/public', express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Expense Tracker API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  const cronStatus = getCronJobStatus();

  res.json({
    success: true,
    data: {
      api: 'running',
      database: 'connected',
      cronJobs: cronStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cron-test', cronTestRoutes);

// Debug page route
app.get('/debug', (req, res) => {
  res.sendFile(__dirname + '/public/debug.html');
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '💸 Personal Expense Tracker API',
    version: '1.0.0',
    documentation: '/api/docs',
    debugPage: '/debug',
    endpoints: {
      auth: '/api/auth',
      expenses: '/api/expenses',
      reports: '/api/reports',
      users: '/api/users'
    },
    features: [
      'User registration & authentication',
      'CRUD operations for expenses',
      'Weekly spending limits with email alerts',
      'Daily email summaries',
      'Monthly and category reports',
      'Automated cron jobs for email notifications'
    ]
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    documentation: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/change-password': 'Change password'
      },
      expenses: {
        'GET /api/expenses': 'Get all expenses (with filters)',
        'POST /api/expenses': 'Create new expense',
        'GET /api/expenses/:id': 'Get expense by ID',
        'PUT /api/expenses/:id': 'Update expense',
        'DELETE /api/expenses/:id': 'Delete expense',
        'GET /api/expenses/categories': 'Get expense categories',
        'POST /api/expenses/bulk-delete': 'Delete multiple expenses'
      },
      reports: {
        'GET /api/reports/monthly': 'Get monthly summary',
        'GET /api/reports/category': 'Get category-wise summary',
        'GET /api/reports/weekly': 'Get weekly report',
        'GET /api/reports/yearly': 'Get yearly overview',
        'POST /api/reports/email/monthly': 'Email monthly report',
        'POST /api/reports/email/category': 'Email category report',
        'POST /api/reports/email/weekly': 'Email weekly report'
      },
      users: {
        'GET /api/users/dashboard': 'Get dashboard data',
        'GET /api/users/weekly-status': 'Get weekly spending status',
        'PUT /api/users/weekly-limit': 'Set weekly spending limit',
        'POST /api/users/test-email': 'Send test email',
        'PUT /api/users/deactivate': 'Deactivate account'
      },
      cronTest: {
        'POST /api/cron-test/daily-summary': 'Trigger daily summary emails',
        'POST /api/cron-test/weekly-summary': 'Trigger weekly summary emails',
        'POST /api/cron-test/weekly-limit-check': 'Trigger weekly limit check',
        'POST /api/cron-test/test-all': 'Test all cron job functions',
        'GET /api/cron-test/status': 'Get cron job status'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);

  // Start cron jobs after server starts
  startCronJobs();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
