// server/utils/paymentValidation.js
const { createPaymentError } = require('../middleware/paymentErrorHandler');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const stripe = require('../config/stripe');

const paymentValidation = {
  // Validate course for payment
  async validateCourseForPayment(courseId, userId) {
    // Check if course exists and is available
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw createPaymentError.invalidCourse();
    }

    // Check if course is active/published
    if (course.status !== 'published') {
      throw createPaymentError.invalidCourse();
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { userId, courseId }
    });

    if (existingEnrollment && existingEnrollment.paymentStatus === 'paid') {
      throw createPaymentError.alreadyEnrolled();
    }

    // Check for pending payments
    const pendingPayment = await Payment.findOne({
      where: {
        userId,
        courseId,
        status: 'pending',
        createdAt: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes
        }
      }
    });

    if (pendingPayment) {
      // Check if Stripe session is still valid
      try {
        const session = await stripe.checkout.sessions.retrieve(pendingPayment.stripeSessionId);
        if (session.status === 'open') {
          throw createPaymentError.pendingPayment();
        }
      } catch (stripeError) {
        // If session doesn't exist, mark payment as expired
        await pendingPayment.update({ status: 'canceled' });
      }
    }

    return course;
  },

  // Validate payment amount
  validatePaymentAmount(amount, currency = 'USD') {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Payment amount must be a positive number');
    }

    if (numAmount < 0.50) {
      throw new Error('Payment amount must be at least $0.50');
    }

    if (numAmount > 999999.99) {
      throw new Error('Payment amount exceeds maximum limit');
    }

    // Currency-specific validations
    if (currency === 'USD' && numAmount * 100 !== Math.floor(numAmount * 100)) {
      throw new Error('USD amounts must not have more than 2 decimal places');
    }

    return true;
  },

  // Validate refund request
  async validateRefundRequest(paymentId, refundAmount) {
    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: Course, as: 'course' },
        { model: require('../models/User'), as: 'user' }
      ]
    });

    if (!payment) {
      throw createPaymentError.paymentNotFound();
    }

    if (payment.status !== 'succeeded') {
      throw createPaymentError.refundNotAllowed();
    }

    // Check refund amount
    const maxRefundAmount = payment.amount - payment.refundAmount;
    
    if (refundAmount && refundAmount > maxRefundAmount) {
      throw new Error(`Refund amount cannot exceed $${maxRefundAmount.toFixed(2)}`);
    }

    // Check refund time limit (e.g., 90 days)
    const refundTimeLimit = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    const paymentAge = Date.now() - new Date(payment.paidAt).getTime();
    
    if (paymentAge > refundTimeLimit) {
      throw new Error('Refund request exceeds time limit of 90 days');
    }

    return payment;
  },

  // Validate webhook signature
  validateWebhookSignature(payload, signature, secret) {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      throw createPaymentError.webhookVerificationFailed();
    }
  },

  // Sanitize payment metadata
  sanitizePaymentMetadata(metadata) {
    const sanitized = {};
    const allowedKeys = [
      'courseTitle', 'courseThumbnail', 'customerEmail', 
      'sessionUrl', 'successUrl', 'cancelUrl',
      'paymentMethod', 'receiptUrl', 'refunds'
    ];

    for (const key in metadata) {
      if (allowedKeys.includes(key) && metadata[key] !== null && metadata[key] !== undefined) {
        sanitized[key] = String(metadata[key]).slice(0, 500); // Limit string length
      }
    }

    return sanitized;
  },

  // Validate payment session status
  async validatePaymentSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      // Check if session is expired
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        throw createPaymentError.sessionExpired();
      }

      return session;
    } catch (stripeError) {
      if (stripeError.type === 'StripeInvalidRequestError') {
        throw createPaymentError.sessionExpired();
      }
      throw stripeError;
    }
  }
};

module.exports = paymentValidation;