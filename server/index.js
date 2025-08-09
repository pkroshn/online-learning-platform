require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import configurations and middleware
const { testConnection, syncDatabase } = require('./models');
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
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

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(generalLimiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// API Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', apiLimiter, courseRoutes);
app.use('/api/enrollments', apiLimiter, enrollmentRoutes);
app.use('/api/users', apiLimiter, userRoutes);

// API Info endpoint
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
      users: '/api/users'
    },
    features: [
      'JWT Authentication',
      'Role-based Authorization',
      'Course Management',
      'Enrollment Tracking',
      'User Management',
      'RESTful API Design',
      'Comprehensive Validation',
      'Rate Limiting',
      'Security Headers',
      'API Documentation'
    ]
  });
});

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
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔑 Default Admin Credentials:`);
        console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@learningplatform.com'}`);
        console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;