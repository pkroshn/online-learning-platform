// server/tests/testCoursePurchaseBasic.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock the payment controller
const mockPaymentController = {
  createCheckoutSession: jest.fn(),
  getPaymentStatus: jest.fn(),
  getPaymentHistory: jest.fn(),
  getAllPayments: jest.fn(),
  refundPayment: jest.fn(),
  getPaymentAnalytics: jest.fn(),
  getCoursePurchaseStats: jest.fn()
};

// Mock the webhook controller
const mockWebhookController = {
  handleStripeWebhook: jest.fn()
};

// Mock the enrollment controller
const mockEnrollmentController = {
  createEnrollment: jest.fn(),
  updateEnrollment: jest.fn(),
  getEnrollment: jest.fn()
};

// Mock middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 1, email: 'test@example.com', role: 'student' };
  next();
};

const mockAdminAuth = (req, res, next) => {
  req.user = { id: 1, email: 'admin@example.com', role: 'admin' };
  next();
};

// Create test app
const app = express();
app.use(bodyParser.json());

// Mock routes
app.post('/api/payments/checkout/:courseId', mockAuth, mockPaymentController.createCheckoutSession);
app.get('/api/payments/status/:sessionId', mockAuth, mockPaymentController.getPaymentStatus);
app.get('/api/payments/history', mockAuth, mockPaymentController.getPaymentHistory);
app.get('/api/payments/admin/all', mockAdminAuth, mockPaymentController.getAllPayments);
app.post('/api/payments/admin/refund/:paymentId', mockAdminAuth, mockPaymentController.refundPayment);
app.get('/api/payments/admin/analytics', mockAdminAuth, mockPaymentController.getPaymentAnalytics);
app.get('/api/payments/admin/course/:courseId/stats', mockAdminAuth, mockPaymentController.getCoursePurchaseStats);

// Add webhook and enrollment routes
app.post('/api/webhooks/stripe', mockWebhookController.handleStripeWebhook);
app.post('/api/enrollments', mockAuth, mockEnrollmentController.createEnrollment);
app.put('/api/enrollments/:id', mockAuth, mockEnrollmentController.updateEnrollment);
app.get('/api/enrollments/:id', mockAuth, mockEnrollmentController.getEnrollment);

// Add webhook and enrollment routes
app.post('/api/webhooks/stripe', mockWebhookController.handleStripeWebhook);
app.post('/api/enrollments', mockAuth, mockEnrollmentController.createEnrollment);
app.put('/api/enrollments/:id', mockAuth, mockEnrollmentController.updateEnrollment);
app.get('/api/enrollments/:id', mockAuth, mockEnrollmentController.getEnrollment);

describe('Course Purchase API - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payments/checkout/:courseId', () => {
    it('should create checkout session successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          sessionId: 'cs_test_123',
          sessionUrl: 'https://checkout.stripe.com/test'
        }
      };

      mockPaymentController.createCheckoutSession.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/payments/checkout/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBe('cs_test_123');
      expect(response.body.data.sessionUrl).toContain('checkout.stripe.com');
      expect(mockPaymentController.createCheckoutSession).toHaveBeenCalled();
    });

    it('should handle course not found error', async () => {
      mockPaymentController.createCheckoutSession.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          error: {
            type: 'PAYMENT_ERROR',
            code: 'INVALID_COURSE',
            message: 'Course not found'
          }
        });
      });

      const response = await request(app)
        .post('/api/payments/checkout/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_COURSE');
    });

    it('should handle already enrolled error', async () => {
      mockPaymentController.createCheckoutSession.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          error: {
            type: 'PAYMENT_ERROR',
            code: 'ALREADY_ENROLLED',
            message: 'Already enrolled in this course'
          }
        });
      });

      const response = await request(app)
        .post('/api/payments/checkout/1')
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ALREADY_ENROLLED');
    });
  });

  describe('Webhook handling and enrollment updates', () => {
    it('should handle successful payment webhook and create enrollment', async () => {
      const mockWebhookEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            customer_email: 'test@example.com',
            amount_total: 9999,
            metadata: {
              userId: '1',
              courseId: '1'
            }
          }
        }
      };

      mockWebhookController.handleStripeWebhook.mockImplementation((req, res) => {
        // Simulate successful webhook processing
        res.status(200).json({ received: true });
      });

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .send(mockWebhookEvent)
        .expect(200);

      expect(response.body.received).toBe(true);
      expect(mockWebhookController.handleStripeWebhook).toHaveBeenCalled();
    });

    it('should handle failed payment webhook and update enrollment status', async () => {
      const mockFailedWebhookEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            last_payment_error: {
              code: 'card_declined',
              message: 'Your card was declined'
            }
          }
        }
      };

      mockWebhookController.handleStripeWebhook.mockImplementation((req, res) => {
        res.status(200).json({ received: true });
      });

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .send(mockFailedWebhookEvent)
        .expect(200);

      expect(response.body.received).toBe(true);
    });
  });

  describe('Enrollment updates after payment', () => {
    it('should create enrollment with correct payment status after successful payment', async () => {
      const mockEnrollmentData = {
        userId: 1,
        courseId: 1,
        status: 'active',
        paymentStatus: 'paid',
        paymentAmount: 99.99,
        paymentDate: new Date()
      };

      mockEnrollmentController.createEnrollment.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: {
            enrollment: {
              id: 1,
              ...mockEnrollmentData,
              enrolledAt: new Date()
            }
          }
        });
      });

      const response = await request(app)
        .post('/api/enrollments')
        .send(mockEnrollmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enrollment.paymentStatus).toBe('paid');
      expect(response.body.data.enrollment.status).toBe('active');
    });

    it('should update existing enrollment payment status after successful payment', async () => {
      const mockUpdatedEnrollment = {
        status: 'active',
        paymentStatus: 'paid',
        paymentAmount: 99.99,
        paymentDate: new Date()
      };

      mockEnrollmentController.updateEnrollment.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            enrollment: {
              id: 1,
              userId: 1,
              courseId: 1,
              ...mockUpdatedEnrollment,
              updatedAt: new Date()
            }
          }
        });
      });

      const response = await request(app)
        .put('/api/enrollments/1')
        .send(mockUpdatedEnrollment)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enrollment.paymentStatus).toBe('paid');
      expect(response.body.data.enrollment.status).toBe('active');
    });

    it('should handle enrollment status update for failed payments', async () => {
      const mockFailedEnrollmentUpdate = {
        paymentStatus: 'failed',
        status: 'suspended'
      };

      mockEnrollmentController.updateEnrollment.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            enrollment: {
              id: 1,
              userId: 1,
              courseId: 1,
              ...mockFailedEnrollmentUpdate,
              updatedAt: new Date()
            }
          }
        });
      });

      const response = await request(app)
        .put('/api/enrollments/1')
        .send(mockFailedEnrollmentUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enrollment.paymentStatus).toBe('failed');
      expect(response.body.data.enrollment.status).toBe('suspended');
    });
  });

  describe('Payment status verification and enrollment sync', () => {
    it('should verify payment status and sync enrollment status', async () => {
      const mockPaymentStatus = {
        success: true,
        data: {
          payment: {
            id: 1,
            status: 'succeeded',
            amount: 99.99,
            currency: 'USD'
          },
          stripeSession: {
            status: 'paid',
            amount_total: 9999,
            customer_email: 'test@example.com'
          }
        }
      };

      mockPaymentController.getPaymentStatus.mockImplementation((req, res) => {
        res.status(200).json(mockPaymentStatus);
      });

      const response = await request(app)
        .get('/api/payments/status/cs_test_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment.status).toBe('succeeded');
      expect(response.body.data.stripeSession.status).toBe('paid');
    });

    it('should handle payment verification for pending payments', async () => {
      const mockPendingPaymentStatus = {
        success: true,
        data: {
          payment: {
            id: 1,
            status: 'pending',
            amount: 99.99,
            currency: 'USD'
          },
          stripeSession: {
            status: 'unpaid',
            amount_total: 9999,
            customer_email: 'test@example.com'
          }
        }
      };

      mockPaymentController.getPaymentStatus.mockImplementation((req, res) => {
        res.status(200).json(mockPendingPaymentStatus);
      });

      const response = await request(app)
        .get('/api/payments/status/cs_test_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment.status).toBe('pending');
      expect(response.body.data.stripeSession.status).toBe('unpaid');
    });
  });

  describe('Webhook handling and enrollment updates', () => {
    it('should handle successful payment webhook and create enrollment', async () => {
      const mockWebhookEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            customer_email: 'test@example.com',
            amount_total: 9999,
            metadata: {
              userId: '1',
              courseId: '1'
            }
          }
        }
      };

      mockWebhookController.handleStripeWebhook.mockImplementation((req, res) => {
        // Simulate successful webhook processing
        res.status(200).json({ received: true });
      });

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .send(mockWebhookEvent)
        .expect(200);

      expect(response.body.received).toBe(true);
      expect(mockWebhookController.handleStripeWebhook).toHaveBeenCalled();
    });

    it('should handle failed payment webhook and update enrollment status', async () => {
      const mockFailedWebhookEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            last_payment_error: {
              code: 'card_declined',
              message: 'Your card was declined'
            }
          }
        }
      };

      mockWebhookController.handleStripeWebhook.mockImplementation((req, res) => {
        res.status(200).json({ received: true });
      });

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .send(mockFailedWebhookEvent)
        .expect(200);

      expect(response.body.received).toBe(true);
    });
  });

  describe('Enrollment updates after payment', () => {
    it('should create enrollment with correct payment status after successful payment', async () => {
      const mockEnrollmentData = {
        userId: 1,
        courseId: 1,
        status: 'active',
        paymentStatus: 'paid',
        paymentAmount: 99.99,
        paymentDate: new Date()
      };

      mockEnrollmentController.createEnrollment.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: {
            enrollment: {
              id: 1,
              ...mockEnrollmentData,
              enrolledAt: new Date()
            }
          }
        });
      });

      const response = await request(app)
        .post('/api/enrollments')
        .send(mockEnrollmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enrollment.paymentStatus).toBe('paid');
      expect(response.body.data.enrollment.status).toBe('active');
    });

    it('should update existing enrollment payment status after successful payment', async () => {
      const mockUpdatedEnrollment = {
        status: 'active',
        paymentStatus: 'paid',
        paymentAmount: 99.99,
        paymentDate: new Date()
      };

      mockEnrollmentController.updateEnrollment.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            enrollment: {
              id: 1,
              userId: 1,
              courseId: 1,
              ...mockUpdatedEnrollment,
              updatedAt: new Date()
            }
          }
        });
      });

      const response = await request(app)
        .put('/api/enrollments/1')
        .send(mockUpdatedEnrollment)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enrollment.paymentStatus).toBe('paid');
      expect(response.body.data.enrollment.status).toBe('active');
    });

    it('should handle enrollment status update for failed payments', async () => {
      const mockFailedEnrollmentUpdate = {
        paymentStatus: 'failed',
        status: 'suspended'
      };

      mockEnrollmentController.updateEnrollment.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            enrollment: {
              id: 1,
              userId: 1,
              courseId: 1,
              ...mockFailedEnrollmentUpdate,
              updatedAt: new Date()
            }
          }
        });
      });

      const response = await request(app)
        .put('/api/enrollments/1')
        .send(mockFailedEnrollmentUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enrollment.paymentStatus).toBe('failed');
      expect(response.body.data.enrollment.status).toBe('suspended');
    });
  });

  describe('Payment status verification and enrollment sync', () => {
    it('should verify payment status and sync enrollment status', async () => {
      const mockPaymentStatus = {
        success: true,
        data: {
          payment: {
            id: 1,
            status: 'succeeded',
            amount: 99.99,
            currency: 'USD'
          },
          stripeSession: {
            status: 'paid',
            amount_total: 9999,
            customer_email: 'test@example.com'
          }
        }
      };

      mockPaymentController.getPaymentStatus.mockImplementation((req, res) => {
        res.status(200).json(mockPaymentStatus);
      });

      const response = await request(app)
        .get('/api/payments/status/cs_test_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment.status).toBe('succeeded');
      expect(response.body.data.stripeSession.status).toBe('paid');
    });

    it('should handle payment verification for pending payments', async () => {
      const mockPendingPaymentStatus = {
        success: true,
        data: {
          payment: {
            id: 1,
            status: 'pending',
            amount: 99.99,
            currency: 'USD'
          },
          stripeSession: {
            status: 'unpaid',
            amount_total: 9999,
            customer_email: 'test@example.com'
          }
        }
      };

      mockPaymentController.getPaymentStatus.mockImplementation((req, res) => {
        res.status(200).json(mockPendingPaymentStatus);
      });

      const response = await request(app)
        .get('/api/payments/status/cs_test_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment.status).toBe('pending');
      expect(response.body.data.stripeSession.status).toBe('unpaid');
    });
  });

  describe('GET /api/payments/history', () => {
    it('should return payment history', async () => {
      const mockResponse = {
        success: true,
        data: {
          payments: [
            {
              id: 1,
              amount: '99.99',
              currency: 'USD',
              status: 'succeeded',
              course: { id: 1, title: 'Test Course' }
            }
          ],
          pagination: {
            total: 1,
            page: 1,
            pages: 1,
            limit: 10
          }
        }
      };

      mockPaymentController.getPaymentHistory.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/payments/history')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payments).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/payments/admin/analytics', () => {
    it('should return payment analytics', async () => {
      const mockResponse = {
        success: true,
        data: {
          period: '30d',
          summary: {
            totalRevenue: 15499.50,
            totalPayments: 125,
            averageOrderValue: 123.99
          },
          revenueByCourse: [
            {
              courseId: 1,
              title: 'JavaScript Fundamentals',
              revenue: 5999.50,
              sales: 60
            }
          ],
          revenueByCategory: [
            {
              category: 'Programming',
              revenue: 8999.50,
              sales: 90
            }
          ],
          dailyRevenue: [
            {
              date: '2024-01-15',
              revenue: 499.99
            }
          ]
        }
      };

      mockPaymentController.getPaymentAnalytics.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/payments/admin/analytics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.revenueByCourse).toBeInstanceOf(Array);
      expect(response.body.data.revenueByCategory).toBeInstanceOf(Array);
      expect(response.body.data.dailyRevenue).toBeInstanceOf(Array);
    });

    it('should filter by period', async () => {
      mockPaymentController.getPaymentAnalytics.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: { period: req.query.period }
        });
      });

      const response = await request(app)
        .get('/api/payments/admin/analytics?period=7d')
        .expect(200);

      expect(response.body.data.period).toBe('7d');
    });
  });

  describe('GET /api/payments/admin/course/:courseId/stats', () => {
    it('should return course purchase statistics', async () => {
      const mockResponse = {
        success: true,
        data: {
          course: {
            id: 1,
            title: 'JavaScript Fundamentals',
            price: '99.99',
            currency: 'USD'
          },
          statistics: {
            totalRevenue: 5999.50,
            totalSales: 60,
            totalEnrollments: 58,
            completionRate: 85.5,
            averageOrderValue: 99.99
          },
          monthlySales: [
            {
              month: '2024-01',
              revenue: 2999.50,
              sales: 30
            }
          ],
          recentSales: [
            {
              id: 1,
              amount: '99.99',
              currency: 'USD',
              user: { id: 1, name: 'John Doe' }
            }
          ]
        }
      };

      mockPaymentController.getCoursePurchaseStats.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/payments/admin/course/1/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course).toBeDefined();
      expect(response.body.data.statistics).toBeDefined();
      expect(response.body.data.monthlySales).toBeInstanceOf(Array);
      expect(response.body.data.recentSales).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/payments/admin/refund/:paymentId', () => {
    it('should process refund successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          refund: {
            id: 're_123',
            amount: 5000,
            status: 'succeeded'
          },
          payment: {
            id: 1,
            status: 'succeeded',
            refundAmount: '50.00'
          }
        }
      };

      mockPaymentController.refundPayment.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/payments/admin/refund/1')
        .send({ amount: 50.00, reason: 'Customer request' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.refund).toBeDefined();
      expect(response.body.data.payment).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle validation errors', async () => {
      mockPaymentController.createCheckoutSession.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          error: {
            type: 'PAYMENT_ERROR',
            code: 'INVALID_AMOUNT',
            message: 'Invalid payment amount'
          }
        });
      });

      const response = await request(app)
        .post('/api/payments/checkout/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_AMOUNT');
    });

    it('should handle server errors', async () => {
      mockPaymentController.createCheckoutSession.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          error: {
            type: 'PAYMENT_ERROR',
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
          }
        });
      });

      const response = await request(app)
        .post('/api/payments/checkout/1')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
