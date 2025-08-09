const request = require('supertest');
const app = require('../index');
const { User, Course } = require('../models');

describe('Courses Endpoints', () => {
  let adminToken;
  let studentToken;
  let adminUser;
  let studentUser;

  beforeAll(async () => {
    // Setup test database
    await require('../models').syncDatabase(true);

    // Create admin user
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'Password123',
      role: 'admin'
    });

    // Create student user
    studentUser = await User.create({
      firstName: 'Student',
      lastName: 'User',
      email: 'student@test.com',
      password: 'Password123',
      role: 'student'
    });

    // Login admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Password123'
      });
    adminToken = adminLogin.body.data.token;

    // Login student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@test.com',
        password: 'Password123'
      });
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    // Cleanup
    await Course.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('GET /api/courses', () => {
    beforeEach(async () => {
      // Create test courses
      await Course.bulkCreate([
        {
          title: 'JavaScript Fundamentals',
          description: 'Learn JavaScript basics',
          instructor: 'John Doe',
          duration: 40,
          level: 'beginner',
          category: 'Programming',
          price: 99.99
        },
        {
          title: 'Advanced React',
          description: 'Master React development',
          instructor: 'Jane Smith',
          duration: 60,
          level: 'advanced',
          category: 'Programming',
          price: 149.99
        }
      ]);
    });

    afterEach(async () => {
      await Course.destroy({ where: {} });
    });

    it('should get all courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter courses by category', async () => {
      const response = await request(app)
        .get('/api/courses?category=Programming')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toHaveLength(2);
    });

    it('should filter courses by level', async () => {
      const response = await request(app)
        .get('/api/courses?level=beginner')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toHaveLength(1);
      expect(response.body.data.courses[0].level).toBe('beginner');
    });

    it('should search courses by title', async () => {
      const response = await request(app)
        .get('/api/courses?search=JavaScript')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toHaveLength(1);
      expect(response.body.data.courses[0].title).toContain('JavaScript');
    });
  });

  describe('POST /api/courses', () => {
    const validCourseData = {
      title: 'Node.js Masterclass',
      description: 'Complete Node.js course',
      instructor: 'Expert Developer',
      duration: 80,
      level: 'intermediate',
      category: 'Backend',
      price: 199.99
    };

    it('should create course with admin token', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCourseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course.title).toBe(validCourseData.title);
    });

    it('should not create course with student token', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validCourseData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should not create course without token', async () => {
      const response = await request(app)
        .post('/api/courses')
        .send(validCourseData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not create course with invalid data', async () => {
      const invalidData = {
        title: 'A', // Too short
        description: 'Short', // Too short
        instructor: '',
        duration: -1, // Invalid
        level: 'invalid',
        category: '',
        price: -10 // Invalid
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/courses/:id', () => {
    let courseId;

    beforeEach(async () => {
      const course = await Course.create({
        title: 'Test Course',
        description: 'Test course description',
        instructor: 'Test Instructor',
        duration: 30,
        level: 'beginner',
        category: 'Test',
        price: 50.00
      });
      courseId = course.id;
    });

    afterEach(async () => {
      await Course.destroy({ where: { id: courseId } });
    });

    it('should get course by valid ID', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course.id).toBe(courseId);
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/courses/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/courses/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/courses/:id', () => {
    let courseId;

    beforeEach(async () => {
      const course = await Course.create({
        title: 'Original Title',
        description: 'Original description',
        instructor: 'Original Instructor',
        duration: 30,
        level: 'beginner',
        category: 'Original',
        price: 50.00
      });
      courseId = course.id;
    });

    afterEach(async () => {
      await Course.destroy({ where: { id: courseId } });
    });

    it('should update course with admin token', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
        instructor: 'Updated Instructor',
        duration: 45,
        level: 'intermediate',
        category: 'Updated',
        price: 75.00
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course.title).toBe(updateData.title);
    });

    it('should not update course with student token', async () => {
      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'New Title' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    let courseId;

    beforeEach(async () => {
      const course = await Course.create({
        title: 'Course to Delete',
        description: 'This course will be deleted',
        instructor: 'Test Instructor',
        duration: 30,
        level: 'beginner',
        category: 'Test',
        price: 50.00
      });
      courseId = course.id;
    });

    it('should delete course with admin token', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify course is soft deleted
      const deletedCourse = await Course.findByPk(courseId);
      expect(deletedCourse.isActive).toBe(false);
    });

    it('should not delete course with student token', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});