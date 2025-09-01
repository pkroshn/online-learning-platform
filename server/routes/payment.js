// server/routes/payment.js
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const paymentController = require('../controllers/paymentController');
const webhookController = require('../controllers/webhookController');
const { authenticate } = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');
const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Webhook endpoint (uses raw body parsing from main app)
router.post('/webhook', webhookController.handleStripeWebhook);

// User routes (require authentication)
router.use(authenticate); // Apply auth middleware to all routes below

// Create checkout session for course purchase
router.post('/checkout/:courseId',
  [
    param('courseId').isInt().withMessage('Course ID must be a valid integer')
  ],
  validateRequest,
  paymentController.createCheckoutSession
);

// Get payment status by session ID
router.get('/status/:sessionId',
  [
    param('sessionId').notEmpty().withMessage('Session ID is required')
  ],
  validateRequest,
  paymentController.getPaymentStatus
);

// Get user's payment history
router.get('/history',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['pending', 'succeeded', 'failed', 'canceled', 'refunded'])
      .withMessage('Status must be one of: pending, succeeded, failed, canceled, refunded')
  ],
  validateRequest,
  paymentController.getPaymentHistory
);

// Admin routes (require admin privileges)
router.use(adminMiddleware);

// Get all payments (admin only)
router.get('/admin/all',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['pending', 'succeeded', 'failed', 'canceled', 'refunded'])
      .withMessage('Status must be one of: pending, succeeded, failed, canceled, refunded'),
    query('courseId').optional().isInt().withMessage('Course ID must be a valid integer'),
    query('userId').optional().isInt().withMessage('User ID must be a valid integer')
  ],
  validateRequest,
  paymentController.getAllPayments
);

// Refund payment (admin only)
router.post('/admin/refund/:paymentId',
  [
    param('paymentId').isInt().withMessage('Payment ID must be a valid integer'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('reason').optional().isString().isLength({ max: 500 })
      .withMessage('Reason must be a string with max 500 characters')
  ],
  validateRequest,
  paymentController.refundPayment
);

// Get payment analytics (admin only)
router.get('/admin/analytics',
  [
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Period must be one of: 7d, 30d, 90d, 1y'),
    query('courseId').optional().isInt().withMessage('Course ID must be a valid integer')
  ],
  validateRequest,
  paymentController.getPaymentAnalytics
);

// Get course purchase statistics (admin only)
router.get('/admin/course/:courseId/stats',
  [
    param('courseId').isInt().withMessage('Course ID must be a valid integer')
  ],
  validateRequest,
  paymentController.getCoursePurchaseStats
);

module.exports = router;