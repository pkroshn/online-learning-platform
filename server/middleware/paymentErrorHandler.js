// server/middleware/paymentErrorHandler.js
const stripe = require('../config/stripe');

class PaymentError extends Error {
  constructor(message, type, statusCode = 500) {
    super(message);
    this.name = 'PaymentError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

const paymentErrorHandler = (error, req, res, next) => {
  console.error('Payment Error:', error);

  // Stripe specific errors
  if (error.type && error.type.startsWith('Stripe')) {
    return handleStripeError(error, res);
  }

  // Custom payment errors
  if (error instanceof PaymentError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      type: error.type,
      timestamp: new Date().toISOString()
    });
  }

  // Database errors related to payments
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Payment validation failed',
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message
      })),
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference in payment data',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  next(error);
};

const handleStripeError = (error, res) => {
  let message = 'Payment processing failed';
  let statusCode = 500;

  switch (error.type) {
    case 'StripeCardError':
      // Card was declined
      message = error.message || 'Your card was declined.';
      statusCode = 400;
      break;

    case 'StripeRateLimitError':
      message = 'Too many requests to payment processor. Please try again later.';
      statusCode = 429;
      break;

    case 'StripeInvalidRequestError':
      message = 'Invalid payment request.';
      statusCode = 400;
      break;

    case 'StripeAPIError':
      message = 'Payment processor error. Please try again.';
      statusCode = 502;
      break;

    case 'StripeConnectionError':
      message = 'Network error. Please check your connection and try again.';
      statusCode = 503;
      break;

    case 'StripeAuthenticationError':
      message = 'Payment configuration error.';
      statusCode = 500;
      break;

    default:
      message = error.message || 'An unexpected payment error occurred.';
      statusCode = 500;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    type: 'payment_error',
    code: error.code,
    timestamp: new Date().toISOString()
  });
};

// Utility functions for creating payment errors
const createPaymentError = {
  invalidCourse: () => new PaymentError('Course not found or unavailable', 'invalid_course', 404),
  alreadyEnrolled: () => new PaymentError('Already enrolled in this course', 'already_enrolled', 400),
  pendingPayment: () => new PaymentError('Payment already in progress', 'pending_payment', 400),
  paymentNotFound: () => new PaymentError('Payment record not found', 'payment_not_found', 404),
  refundNotAllowed: () => new PaymentError('Refund not allowed for this payment', 'refund_not_allowed', 400),
  sessionExpired: () => new PaymentError('Payment session has expired', 'session_expired', 400),
  insufficientFunds: () => new PaymentError('Insufficient funds', 'insufficient_funds', 400),
  webhookVerificationFailed: () => new PaymentError('Webhook verification failed', 'webhook_verification_failed', 400)
};

module.exports = {
  PaymentError,
  paymentErrorHandler,
  createPaymentError,
  handleStripeError
};