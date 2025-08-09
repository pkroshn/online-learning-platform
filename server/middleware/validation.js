const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
];

// Course validation rules
const validateCourse = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Course description must be between 10 and 5000 characters'),
  
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description must not exceed 500 characters'),
  
  body('instructor')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Instructor name must be between 2 and 100 characters'),
  
  body('duration')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Duration must be between 1 and 1000 hours'),
  
  body('level')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be beginner, intermediate, or advanced'),
  
  body('category')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('maxStudents')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum students must be at least 1'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date')
];

// Enrollment validation rules
const validateEnrollment = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  
  body('courseId')
    .isInt({ min: 1 })
    .withMessage('Valid course ID is required'),
  
  body('paymentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Payment amount must be a positive number')
];

const validateEnrollmentUpdate = [
  body('status')
    .optional()
    .isIn(['active', 'completed', 'dropped', 'suspended'])
    .withMessage('Status must be active, completed, dropped, or suspended'),
  
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  
  body('grade')
    .optional()
    .isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'])
    .withMessage('Grade must be a valid letter grade'),
  
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'refunded', 'failed'])
    .withMessage('Payment status must be pending, paid, refunded, or failed')
];

// Common validation rules
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateCourse,
  validateEnrollment,
  validateEnrollmentUpdate,
  validateId,
  validatePagination
};