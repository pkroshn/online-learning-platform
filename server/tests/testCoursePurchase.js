// server/tests/testCoursePurchase.js
const request = require('supertest');
const app = require('../index');
const { User, Course, Payment, Enrollment } = require('../models');
const jwt = require('jsonwebtoken');

describe('Course Purchase API', () => {
  let testUser, testAdmin, testCourse, userToken, adminToken;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'student',
      isActive: true
    });

    // Create test admin
    testAdmin = await User.create({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'testadmin@example.com',
      password: 'password123',
      role: 'admin',
      isActive: true
    });

    // Create test course
    testCourse = await Course.create({
      title: 'Test Course for Purchase',
      description: 'A test course for purchase API testing',
      shortDescription: 'Test course',
      instructor: 'Test Instructor',
      duration: 10,
      level: 'beginner',
      category: 'Testing',
      price: 99.99,
      currency: 'USD',
      maxStudents: 50,
      isActive: true
    });

    // Generate tokens
    userToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { id: testAdmin.id, email: testAdmin.email, role: testAdmin.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await Payment.destroy({ where: { userId: testUser.id } });
    await Enrollment.destroy({ where: { userId: testUser.id } });
    await Course.destroy({ where: { id: testCourse.id } });
    await User.destroy({ where: { id: [testUser.id, testAdmin.id] } });
  });

  describe('POST /api/payments/checkout/:courseId', () => {
    it('should create checkout session for valid course', async () => {
      const response = await request(app)
        .post(`/api/payments/checkout/${testCourse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBeDefined();
      expect(response.body.data.sessionUrl).toBeDefined();
      expect(response.body.data.sessionUrl).toContain('checkout.stripe.com');
    });

    it('should return error for non-existent course', async () => {
      const response = await request(app)
        .post('/api/payments/checkout/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_COURSE');
    });

    it('should return error for inactive course', async () => {
      // Deactivate course
      await testCourse.update({ isActive: false });

      const response = await request(app)
        .post(`/api/payments/checkout/${testCourse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('COURSE_INACTIVE');

      // Reactivate course
      await testCourse.update({ isActive: true });
    });

    it('should return error if user already enrolled', async () => {
      // Create enrollment
      await Enrollment.create({
        userId: testUser.id,
        courseId: testCourse.id,
        paymentStatus: 'paid'
      });

      const response = await request(app)
        .post(`/api/payments/checkout/${testCourse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ALREADY_ENROLLED');

      // Clean up enrollment
      await Enrollment.destroy({ where: { userId: testUser.id, courseId: testCourse.id } });
    });

    it('should return error for unauthorized user', async () => {
      const response = await request(app)
        .post(`/api/payments/checkout/${testCourse.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payments/history', () => {
    beforeEach(async () => {
      // Create test payments
      await Payment.create({
        userId: testUser.id,
        courseId: testCourse.id,
        stripeSessionId: 'cs_test_123',
        amount: 99.99,
        currency: 'USD',
        status: 'succeeded',
        paidAt: new Date()
      });
    });

    afterEach(async () => {
      await Payment.destroy({ where: { userId: testUser.id } });
    });

    it('should return user payment history', async () => {
      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payments).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/payments/history?status=succeeded')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payments.length).toBeGreaterThan(0);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/payments/history?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/payments/admin/all', () => {
    beforeEach(async () => {
      // Create test payments
      await Payment.create({
        userId: testUser.id,
        courseId: testCourse.id,
        stripeSessionId: 'cs_test_admin_123',
        amount: 99.99,
        currency: 'USD',
        status: 'succeeded',
        paidAt: new Date()
      });
    });

    afterEach(async () => {
      await Payment.destroy({ where: { userId: testUser.id } });
    });

    it('should return all payments for admin', async () => {
      const response = await request(app)
        .get('/api/payments/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payments).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter by course ID', async () => {
      const response = await request(app)
        .get(`/api/payments/admin/all?courseId=${testCourse.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payments.length).toBeGreaterThan(0);
    });

    it('should filter by user ID', async () => {
      const response = await request(app)
        .get(`/api/payments/admin/all?userId=${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payments.length).toBeGreaterThan(0);
    });

    it('should require admin privileges', async () => {
      const response = await request(app)
        .get('/api/payments/admin/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payments/admin/analytics', () => {
    beforeEach(async () => {
      // Create test payments for analytics
      await Payment.create({
        userId: testUser.id,
        courseId: testCourse.id,
        stripeSessionId: 'cs_test_analytics_123',
        amount: 99.99,
        currency: 'USD',
        status: 'succeeded',
        paidAt: new Date()
      });
    });

    afterEach(async () => {
      await Payment.destroy({ where: { userId: testUser.id } });
    });

    it('should return payment analytics', async () => {
      const response = await request(app)
        .get('/api/payments/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.revenueByCourse).toBeInstanceOf(Array);
      expect(response.body.data.revenueByCategory).toBeInstanceOf(Array);
      expect(response.body.data.dailyRevenue).toBeInstanceOf(Array);
    });

    it('should filter by period', async () => {
      const response = await request(app)
        .get('/api/payments/admin/analytics?period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('7d');
    });

    it('should filter by course ID', async () => {
      const response = await request(app)
        .get(`/api/payments/admin/analytics?courseId=${testCourse.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/payments/admin/course/:courseId/stats', () => {
    beforeEach(async () => {
      // Create test payments and enrollments
      await Payment.create({
        userId: testUser.id,
        courseId: testCourse.id,
        stripeSessionId: 'cs_test_stats_123',
        amount: 99.99,
        currency: 'USD',
        status: 'succeeded',
        paidAt: new Date()
      });

      await Enrollment.create({
        userId: testUser.id,
        courseId: testCourse.id,
        status: 'active',
        paymentStatus: 'paid'
      });
    });

    afterEach(async () => {
      await Payment.destroy({ where: { userId: testUser.id } });
      await Enrollment.destroy({ where: { userId: testUser.id } });
    });

    it('should return course purchase statistics', async () => {
      const response = await request(app)
        .get(`/api/payments/admin/course/${testCourse.id}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course).toBeDefined();
      expect(response.body.data.statistics).toBeDefined();
      expect(response.body.data.monthlySales).toBeInstanceOf(Array);
      expect(response.body.data.recentSales).toBeInstanceOf(Array);
    });

    it('should return error for non-existent course', async () => {
      const response = await request(app)
        .get('/api/payments/admin/course/99999/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_COURSE');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid course ID format', async () => {
      const response = await request(app)
        .post('/api/payments/checkout/invalid')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle missing authentication', async () => {
      const response = await request(app)
        .post(`/api/payments/checkout/${testCourse.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should handle invalid token', async () => {
      const response = await request(app)
        .post(`/api/payments/checkout/${testCourse.id}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
