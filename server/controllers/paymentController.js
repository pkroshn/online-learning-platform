// server/controllers/paymentController.js
const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { Op } = require('sequelize');

const paymentController = {
  // Create Stripe Checkout Session
  async createCheckoutSession(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Get course details
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if user is already enrolled
      const existingEnrollment = await Enrollment.findOne({
        where: { userId, courseId }
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      // Check for existing pending payment
      const existingPayment = await Payment.findOne({
        where: {
          userId,
          courseId,
          status: 'pending'
        }
      });

      if (existingPayment) {
        return res.status(400).json({
          success: false,
          message: 'Payment already in progress for this course'
        });
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: course.title,
                description: course.description,
                images: course.thumbnail ? [course.thumbnail] : [],
              },
              unit_amount: Math.round(course.price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        customer_email: req.user.email,
        metadata: {
          userId: userId.toString(),
          courseId: courseId.toString(),
        },
      });

      // Create payment record
      await Payment.create({
        userId,
        courseId,
        stripeSessionId: session.id,
        amount: course.price,
        currency: 'USD',
        status: 'pending',
        metadata: {
          sessionUrl: session.url
        }
      });

      res.status(200).json({
        success: true,
        data: {
          sessionId: session.id,
          sessionUrl: session.url
        }
      });

    } catch (error) {
      console.error('Create checkout session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create checkout session',
        error: error.message
      });
    }
  },

  // Get payment status
  async getPaymentStatus(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const payment = await Payment.findOne({
        where: {
          stripeSessionId: sessionId,
          userId
        },
        include: [
          { model: Course, as: 'course' }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Get session from Stripe to check latest status
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      res.status(200).json({
        success: true,
        data: {
          payment,
          stripeSession: {
            status: session.payment_status,
            amount_total: session.amount_total,
            customer_email: session.customer_email
          }
        }
      });

    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment status',
        error: error.message
      });
    }
  },

  // Get user's payment history
  async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const whereClause = { userId };
      if (status) {
        whereClause.status = status;
      }

      const payments = await Payment.findAndCountAll({
        where: whereClause,
        include: [
          { model: Course, as: 'course' }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.status(200).json({
        success: true,
        data: {
          payments: payments.rows,
          pagination: {
            total: payments.count,
            page: parseInt(page),
            pages: Math.ceil(payments.count / parseInt(limit)),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment history',
        error: error.message
      });
    }
  },

  // Admin: Get all payments
  async getAllPayments(req, res) {
    try {
      const { page = 1, limit = 10, status, courseId, userId } = req.query;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (courseId) whereClause.courseId = courseId;
      if (userId) whereClause.userId = userId;

      const payments = await Payment.findAndCountAll({
        where: whereClause,
        include: [
          { model: Course, as: 'course' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.status(200).json({
        success: true,
        data: {
          payments: payments.rows,
          pagination: {
            total: payments.count,
            page: parseInt(page),
            pages: Math.ceil(payments.count / parseInt(limit)),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payments',
        error: error.message
      });
    }
  },

  // Refund payment
  async refundPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: 'Can only refund successful payments'
        });
      }

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
        reason: reason || 'requested_by_customer',
        metadata: {
          paymentId: payment.id.toString()
        }
      });

      // Update payment record
      const refundAmount = refund.amount / 100;
      await payment.update({
        status: refund.amount === (payment.amount * 100) ? 'refunded' : 'succeeded',
        refundAmount: payment.refundAmount + refundAmount,
        refundedAt: new Date(),
        metadata: {
          ...payment.metadata,
          refunds: [...(payment.metadata?.refunds || []), {
            id: refund.id,
            amount: refundAmount,
            reason: refund.reason,
            created: refund.created
          }]
        }
      });

      res.status(200).json({
        success: true,
        data: {
          refund,
          payment
        }
      });

    } catch (error) {
      console.error('Refund payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error.message
      });
    }
  }
};

module.exports = paymentController;