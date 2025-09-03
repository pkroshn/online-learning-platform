// server/controllers/paymentController.js
const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { Op } = require('sequelize');
const paymentValidation = require('../utils/paymentValidation');
const { createPaymentError } = require('../middleware/paymentErrorHandler');

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
        // Return the existing payment session URL so user can continue
        return res.status(200).json({
          success: true,
          data: {
            sessionId: existingPayment.stripeSessionId,
            sessionUrl: existingPayment.metadata?.sessionUrl,
            message: 'Payment session already exists. You can continue with your existing payment.'
          }
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
  },

  // Get payment analytics (admin only)
  async getPaymentAnalytics(req, res) {
    try {
      const { period = '30d', courseId } = req.query;
      const userId = req.user.id;

      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Build where clause
      const whereClause = {
        createdAt: {
          [Op.gte]: startDate
        },
        status: 'succeeded'
      };

      if (courseId) {
        whereClause.courseId = courseId;
      }

      // Get payment statistics
      const payments = await Payment.findAll({
        where: whereClause,
        include: [
          { model: Course, as: 'course', attributes: ['id', 'title', 'category'] },
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Calculate analytics
      const totalRevenue = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const totalPayments = payments.length;
      const averageOrderValue = totalPayments > 0 ? totalRevenue / totalPayments : 0;

      // Revenue by course
      const revenueByCourse = {};
      payments.forEach(payment => {
        const courseTitle = payment.course.title;
        if (!revenueByCourse[courseTitle]) {
          revenueByCourse[courseTitle] = {
            courseId: payment.course.id,
            title: courseTitle,
            revenue: 0,
            sales: 0
          };
        }
        revenueByCourse[courseTitle].revenue += parseFloat(payment.amount);
        revenueByCourse[courseTitle].sales += 1;
      });

      // Revenue by category
      const revenueByCategory = {};
      payments.forEach(payment => {
        const category = payment.course.category;
        if (!revenueByCategory[category]) {
          revenueByCategory[category] = {
            category,
            revenue: 0,
            sales: 0
          };
        }
        revenueByCategory[category].revenue += parseFloat(payment.amount);
        revenueByCategory[category].sales += 1;
      });

      // Daily revenue for chart
      const dailyRevenue = {};
      payments.forEach(payment => {
        const date = payment.createdAt.toISOString().split('T')[0];
        if (!dailyRevenue[date]) {
          dailyRevenue[date] = 0;
        }
        dailyRevenue[date] += parseFloat(payment.amount);
      });

      res.status(200).json({
        success: true,
        data: {
          period,
          summary: {
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalPayments,
            averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
            startDate: startDate.toISOString(),
            endDate: now.toISOString()
          },
          revenueByCourse: Object.values(revenueByCourse),
          revenueByCategory: Object.values(revenueByCategory),
          dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
            date,
            revenue: parseFloat(revenue.toFixed(2))
          })).sort((a, b) => a.date.localeCompare(b.date)),
          recentPayments: payments.slice(0, 10).map(payment => ({
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paidAt: payment.paidAt,
            course: {
              id: payment.course.id,
              title: payment.course.title,
              category: payment.course.category
            },
            user: {
              id: payment.user.id,
              name: `${payment.user.firstName} ${payment.user.lastName}`
            }
          }))
        }
      });

    } catch (error) {
      console.error('Get payment analytics error:', error);
      res.status(500).json({
        success: false,
        error: {
          type: 'PAYMENT_ERROR',
          code: 'ANALYTICS_ERROR',
          message: 'Failed to get payment analytics'
        }
      });
    }
  },

  // Get course purchase statistics
  async getCoursePurchaseStats(req, res) {
    try {
      const { courseId } = req.params;

      // Validate course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: {
            type: 'PAYMENT_ERROR',
            code: 'INVALID_COURSE',
            message: 'Course not found'
          }
        });
      }

      // Get payment statistics for this course
      const payments = await Payment.findAll({
        where: {
          courseId,
          status: 'succeeded'
        },
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Get enrollment statistics
      const enrollments = await Enrollment.findAll({
        where: { courseId },
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });

      // Calculate statistics
      const totalRevenue = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const totalSales = payments.length;
      const totalEnrollments = enrollments.length;
      const completionRate = enrollments.length > 0 
        ? (enrollments.filter(e => e.status === 'completed').length / enrollments.length * 100).toFixed(1)
        : 0;

      // Monthly sales data
      const monthlySales = {};
      payments.forEach(payment => {
        const month = payment.createdAt.toISOString().substring(0, 7); // YYYY-MM
        if (!monthlySales[month]) {
          monthlySales[month] = {
            month,
            revenue: 0,
            sales: 0
          };
        }
        monthlySales[month].revenue += parseFloat(payment.amount);
        monthlySales[month].sales += 1;
      });

      res.status(200).json({
        success: true,
        data: {
          course: {
            id: course.id,
            title: course.title,
            price: course.price,
            currency: course.currency
          },
          statistics: {
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalSales,
            totalEnrollments,
            completionRate: parseFloat(completionRate),
            averageOrderValue: totalSales > 0 ? parseFloat((totalRevenue / totalSales).toFixed(2)) : 0
          },
          monthlySales: Object.values(monthlySales).sort((a, b) => a.month.localeCompare(b.month)),
          recentSales: payments.slice(0, 10).map(payment => ({
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            paidAt: payment.paidAt,
            user: {
              id: payment.user.id,
              name: `${payment.user.firstName} ${payment.user.lastName}`
            }
          }))
        }
      });

    } catch (error) {
      console.error('Get course purchase stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          type: 'PAYMENT_ERROR',
          code: 'STATS_ERROR',
          message: 'Failed to get course purchase statistics'
        }
      });
    }
  },

  // Cancel pending payment
  async cancelPendingPayment(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Find existing pending payment
      const existingPayment = await Payment.findOne({
        where: {
          userId,
          courseId,
          status: 'pending'
        }
      });

      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          message: 'No pending payment found for this course'
        });
      }

      // Update payment status to canceled
      await existingPayment.update({
        status: 'canceled',
        metadata: {
          ...existingPayment.metadata,
          canceledAt: new Date(),
          canceledBy: 'user'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Pending payment cancelled successfully'
      });

    } catch (error) {
      console.error('Cancel pending payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel pending payment',
        error: error.message
      });
    }
  }
};

module.exports = paymentController;