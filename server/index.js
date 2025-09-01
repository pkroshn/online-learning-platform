// server.js - Fixed version with proper middleware order

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

// Import configurations and middleware
const { testConnection, syncDatabase } = require('./models');
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const { paymentErrorHandler } = require('./middleware/paymentErrorHandler');
const {
  generalLimiter,
  authLimiter,
  apiLimiter,
  helmetConfig,
  corsOptions,
  sanitizeInput,
  requestLogger
} = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// IMPORTANT: Health check endpoint BEFORE rate limiting
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// IMPORTANT: API Info endpoint BEFORE rate limiting
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Online Learning Platform API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      enrollments: '/api/enrollments',
      users: '/api/users',
      dashboard: '/api/dashboard',
      payments: '/api/payments'
    },
    features: [
      'JWT Authentication',
      'Role-based Authorization',
      'Course Management',
      'Enrollment Tracking',
      'User Management',
      'Payment Processing',
      'Stripe Integration',
      'RESTful API Design',
      'Comprehensive Validation',
      'Rate Limiting',
      'Security Headers',
      'API Documentation'
    ]
  });
});

// Stripe webhook endpoint with raw body parsing (MUST come before JSON parsing)
app.use('/api/payments/webhook', bodyParser.raw({ type: 'application/json' }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Documentation (before rate limiting for easy access)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// NOW apply rate limiting to API routes only
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', apiLimiter, courseRoutes);
app.use('/api/enrollments', apiLimiter, enrollmentRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Payment error handler (before global error handler)
app.use('/api/payments', paymentErrorHandler);

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models
    await syncDatabase(process.env.FORCE_DB_SYNC === 'true');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📊 API Info: http://localhost:${PORT}/api`);
      console.log(`💳 Payment API: http://localhost:${PORT}/api/payments`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔑 Default Admin Credentials:`);
        console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@learningplatform.com'}`);
        console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
        console.log(`\n💳 Stripe Configuration:`);
        console.log(`   Secret Key: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not Set'}`);
        console.log(`   Webhook Secret: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configured' : '❌ Not Set'}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;