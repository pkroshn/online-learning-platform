const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500
  };

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    error.message = 'Validation Error';
    error.statusCode = 400;
    error.errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Duplicate field value';
    error.statusCode = 409;
    error.errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`,
      value: e.value
    }));
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error.message = 'Invalid reference';
    error.statusCode = 400;
  }

  // Sequelize database connection error
  if (err.name === 'SequelizeConnectionError') {
    error.message = 'Database connection error';
    error.statusCode = 503;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File too large';
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Unexpected file field';
    error.statusCode = 400;
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    error.statusCode = 400;
  }

  // Remove stack trace in production
  if (process.env.NODE_ENV !== 'development') {
    delete error.stack;
  } else {
    error.stack = err.stack;
  }

  res.status(error.statusCode).json(error);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = errorHandler;