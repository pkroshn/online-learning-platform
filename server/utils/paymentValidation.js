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
    if (!course.isActive) {
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
      throw createPaymentError.invalidAmount();
    }

    // Check minimum amount (50 cents)
    if (numAmount < 0.50) {
      throw createPaymentError.amountTooLow();
    }

    // Check maximum amount ($10,000)
    if (numAmount > 10000) {
      throw createPaymentError.amountTooHigh();
    }

    return numAmount;
  },

  // Validate currency
  validateCurrency(currency) {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
      throw createPaymentError.invalidCurrency();
    }
    return currency.toUpperCase();
  },

  // Check course availability
  async checkCourseAvailability(courseId) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw createPaymentError.invalidCourse();
    }

    if (!course.isActive) {
      throw createPaymentError.courseInactive();
    }

    // Check if course has available slots
    if (course.maxStudents) {
      const enrollmentCount = await course.getEnrollmentCount();
      if (enrollmentCount >= course.maxStudents) {
        throw createPaymentError.courseFull();
      }
    }

    return course;
  },

  // Validate user eligibility
  async validateUserEligibility(userId, courseId) {
    // Check if user exists and is active
    const User = require('../models/User');
    const user = await User.findByPk(userId);
    if (!user || !user.isActive) {
      throw createPaymentError.invalidUser();
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { userId, courseId }
    });

    if (existingEnrollment) {
      if (existingEnrollment.paymentStatus === 'paid') {
        throw createPaymentError.alreadyEnrolled();
      } else if (existingEnrollment.paymentStatus === 'pending') {
        throw createPaymentError.pendingEnrollment();
      }
    }

    return user;
  },

  // Validate payment session
  async validatePaymentSession(sessionId, userId) {
    const payment = await Payment.findOne({
      where: {
        stripeSessionId: sessionId,
        userId
      }
    });

    if (!payment) {
      throw createPaymentError.paymentNotFound();
    }

    // Check if session is expired (30 minutes)
    const sessionAge = Date.now() - payment.createdAt.getTime();
    if (sessionAge > 30 * 60 * 1000) { // 30 minutes
      await payment.update({ status: 'canceled' });
      throw createPaymentError.sessionExpired();
    }

    return payment;
  }
};

module.exports = paymentValidation;