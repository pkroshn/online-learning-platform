const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateCourse,
  validateId,
  validatePagination,
  handleValidationErrors
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - instructor
 *         - duration
 *         - level
 *         - category
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the course
 *         title:
 *           type: string
 *           description: Course title
 *         description:
 *           type: string
 *           description: Course description
 *         shortDescription:
 *           type: string
 *           description: Short course description
 *         instructor:
 *           type: string
 *           description: Instructor name
 *         duration:
 *           type: integer
 *           description: Course duration in hours
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Course difficulty level
 *         category:
 *           type: string
 *           description: Course category
 *         price:
 *           type: number
 *           format: decimal
 *           description: Course price
 *         maxStudents:
 *           type: integer
 *           description: Maximum number of students
 *         thumbnail:
 *           type: string
 *           description: Course thumbnail URL
 *         syllabus:
 *           type: array
 *           items:
 *             type: string
 *           description: Course syllabus
 *         prerequisites:
 *           type: string
 *           description: Course prerequisites
 *         learningOutcomes:
 *           type: array
 *           items:
 *             type: string
 *           description: Learning outcomes
 *         isActive:
 *           type: boolean
 *           description: Whether the course is active
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Course start date
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Course end date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by level
 *       - in: query
 *         name: instructor
 *         schema:
 *           type: string
 *         description: Filter by instructor
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, instructor, or category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 */
router.get('/', validatePagination, handleValidationErrors, optionalAuth, courseController.getAllCourses);

/**
 * @swagger
 * /api/courses/categories:
 *   get:
 *     summary: Get all course categories
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', courseController.getCourseCategories);

/**
 * @swagger
 * /api/courses/stats:
 *   get:
 *     summary: Get course statistics
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', authenticate, authorize('admin'), courseController.getCourseStats);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get('/:id', validateId, handleValidationErrors, optionalAuth, courseController.getCourseById);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: Course created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, authorize('admin'), validateCourse, handleValidationErrors, courseController.createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       404:
 *         description: Course not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticate, authorize('admin'), validateId, validateCourse, handleValidationErrors, courseController.updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 *       400:
 *         description: Cannot delete course with active enrollments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticate, authorize('admin'), validateId, handleValidationErrors, courseController.deleteCourse);

module.exports = router;