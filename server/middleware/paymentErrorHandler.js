// server/middleware/paymentErrorHandler.js
const createPaymentError = {
  // Course-related errors
  invalidCourse: () => ({
    type: 'PAYMENT_ERROR',
    code: 'INVALID_COURSE',
    message: 'Course not found or unavailable for purchase',
    statusCode: 404
  }),

  courseInactive: () => ({
    type: 'PAYMENT_ERROR',
    code: 'COURSE_INACTIVE',
    message: 'This course is currently not available for purchase',
    statusCode: 400
  }),

  courseFull: () => ({
    type: 'PAYMENT_ERROR',
    code: 'COURSE_FULL',
    message: 'This course has reached maximum enrollment capacity',
    statusCode: 400
  }),

  // User-related errors
  invalidUser: () => ({
    type: 'PAYMENT_ERROR',
    code: 'INVALID_USER',
    message: 'User account not found or inactive',
    statusCode: 401
  }),

  alreadyEnrolled: () => ({
    type: 'PAYMENT_ERROR',
    code: 'ALREADY_ENROLLED',
    message: 'You are already enrolled in this course',
    statusCode: 409
  }),

  pendingEnrollment: () => ({
    type: 'PAYMENT_ERROR',
    code: 'PENDING_ENROLLMENT',
    message: 'You have a pending enrollment for this course',
    statusCode: 409
  }),

  // Payment amount errors
  invalidAmount: () => ({
    type: 'PAYMENT_ERROR',
    code: 'INVALID_AMOUNT',
    message: 'Invalid payment amount',
    statusCode: 400
  }),

  amountTooLow: () => ({
    type: 'PAYMENT_ERROR',
    code: 'AMOUNT_TOO_LOW',
    message: 'Payment amount must be at least $0.50',
    statusCode: 400
  }),

  amountTooHigh: () => ({
    type: 'PAYMENT_ERROR',
    code: 'AMOUNT_TOO_HIGH',
    message: 'Payment amount exceeds maximum limit of $10,000',
    statusCode: 400
  }),

  // Currency errors
  invalidCurrency: () => ({
    type: 'PAYMENT_ERROR',
    code: 'INVALID_CURRENCY',
    message: 'Unsupported currency. Supported currencies: USD, EUR, GBP, CAD, AUD',
    statusCode: 400
  }),

  // Payment session errors
  paymentNotFound: () => ({
    type: 'PAYMENT_ERROR',
    code: 'PAYMENT_NOT_FOUND',
    message: 'Payment session not found',
    statusCode: 404
  }),

  sessionExpired: () => ({
    type: 'PAYMENT_ERROR',
    code: 'SESSION_EXPIRED',
    message: 'Payment session has expired. Please try again',
    statusCode: 400
  }),

  pendingPayment: () => ({
    type: 'PAYMENT_ERROR',
    code: 'PENDING_PAYMENT',
    message: 'You have a pending payment for this course',
    statusCode: 409
  }),

  // Stripe-related errors
  stripeError: (message) => ({
    type: 'PAYMENT_ERROR',
    code: 'STRIPE_ERROR',
    message: message || 'Payment processing error',
    statusCode: 500
  }),

  webhookVerificationFailed: () => ({
    type: 'PAYMENT_ERROR',
    code: 'WEBHOOK_VERIFICATION_FAILED',
    message: 'Webhook signature verification failed',
    statusCode: 400
  }),

  // Refund errors
  refundNotAllowed: () => ({
    type: 'PAYMENT_ERROR',
    code: 'REFUND_NOT_ALLOWED',
    message: 'Refund is not allowed for this payment',
    statusCode: 400
  }),

  refundTimeLimitExceeded: () => ({
    type: 'PAYMENT_ERROR',
    code: 'REFUND_TIME_LIMIT_EXCEEDED',
    message: 'Refund request exceeds time limit of 90 days',
    statusCode: 400
  }),

  // General payment errors
  paymentFailed: (message) => ({
    type: 'PAYMENT_ERROR',
    code: 'PAYMENT_FAILED',
    message: message || 'Payment processing failed',
    statusCode: 500
  }),

  insufficientFunds: () => ({
    type: 'PAYMENT_ERROR',
    code: 'INSUFFICIENT_FUNDS',
    message: 'Insufficient funds to complete the payment',
    statusCode: 400
  }),

  cardDeclined: (reason) => ({
    type: 'PAYMENT_ERROR',
    code: 'CARD_DECLINED',
    message: `Card was declined: ${reason || 'Unknown reason'}`,
    statusCode: 400
  }),

  // Rate limiting
  tooManyRequests: () => ({
    type: 'PAYMENT_ERROR',
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many payment requests. Please try again later',
    statusCode: 429
  })
};

// Payment error handler middleware
const paymentErrorHandler = (error, req, res, next) => {
  // Check if it's a payment error
  if (error.type === 'PAYMENT_ERROR') {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        type: error.type,
        code: error.code,
        message: error.message
      }
    });
  }

  // Handle Stripe errors
  if (error.type && error.type.startsWith('Stripe')) {
    let paymentError;
    
    switch (error.code) {
      case 'card_declined':
        paymentError = createPaymentError.cardDeclined(error.decline_code);
        break;
      case 'insufficient_funds':
        paymentError = createPaymentError.insufficientFunds();
        break;
      case 'expired_card':
        paymentError = createPaymentError.cardDeclined('Card has expired');
        break;
      case 'incorrect_cvc':
        paymentError = createPaymentError.cardDeclined('Incorrect CVC');
        break;
      case 'processing_error':
        paymentError = createPaymentError.paymentFailed('Payment processing error');
        break;
      default:
        paymentError = createPaymentError.stripeError(error.message);
    }

    return res.status(paymentError.statusCode).json({
      success: false,
      error: {
        type: paymentError.type,
        code: paymentError.code,
        message: paymentError.message
      }
    });
  }

  // Pass to next error handler if not a payment error
  next(error);
};

module.exports = {
  createPaymentError,
  paymentErrorHandler
};