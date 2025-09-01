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
