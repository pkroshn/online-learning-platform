const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateEnrollment,
  validateEnrollmentUpdate,
  validateId,
  validatePagination,
  handleValidationErrors
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       required:
 *         - userId
 *         - courseId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the enrollment
 *         userId:
 *           type: integer
 *           description: ID of the enrolled user
 *         courseId:
 *           type: integer
 *           description: ID of the course
 *         enrollmentDate:
 *           type: string
 *           format: date-time
 *           description: Date of enrollment
 *         status:
 *           type: string
 *           enum: [active, completed, dropped, suspended]
 *           description: Enrollment status
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Course completion progress
 *         completionDate:
 *           type: string
 *           format: date-time
 *           description: Date of course completion
 *         grade:
 *           type: string
 *           enum: [A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F]
 *           description: Final grade
 *         notes:
 *           type: string
 *           description: Additional notes
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, refunded, failed]
 *           description: Payment status
 *         paymentAmount:
 *           type: number
 *           format: decimal
 *           description: Payment amount
 *         paymentDate:
 *           type: string
 *           format: date-time
 *           description: Payment date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get all enrollments (Admin only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, dropped, suspended]
 *         description: Filter by status
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, authorize('admin'), validatePagination, handleValidationErrors, enrollmentController.getAllEnrollments);

/**
 * @swagger
 * /api/enrollments/my:
 *   get:
 *     summary: Get current user's enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, dropped, suspended]
 *         description: Filter by status
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
 *     responses:
 *       200:
 *         description: User enrollments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticate, validatePagination, handleValidationErrors, enrollmentController.getMyEnrollments);

/**
 * @swagger
 * /api/enrollments/stats:
 *   get:
 *     summary: Get enrollment statistics (Admin only)
 *     tags: [Enrollments]
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
router.get('/stats', authenticate, authorize('admin'), enrollmentController.getEnrollmentStats);

/**
 * @swagger
 * /api/enrollments/enroll/{courseId}:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID to enroll in
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
 *       400:
 *         description: Course is full or other validation error
 *       404:
 *         description: Course not found
 *       409:
 *         description: Already enrolled in course
 *       401:
 *         description: Unauthorized
 */
router.post('/enroll/:courseId', authenticate, validateId, handleValidationErrors, enrollmentController.enrollInCourse);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     summary: Get enrollment by ID
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment retrieved successfully
 *       404:
 *         description: Enrollment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, validateId, handleValidationErrors, enrollmentController.getEnrollmentById);

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Create new enrollment (Admin only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courseId
 *             properties:
 *               userId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *               paymentAmount:
 *                 type: number
 *                 format: decimal
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 *       400:
 *         description: Course is full or validation error
 *       404:
 *         description: User or course not found
 *       409:
 *         description: User already enrolled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize('admin'), validateEnrollment, handleValidationErrors, enrollmentController.createEnrollment);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   put:
 *     summary: Update enrollment by ID (Admin only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, completed, dropped, suspended]
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               grade:
 *                 type: string
 *                 enum: [A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F]
 *               notes:
 *                 type: string
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, refunded, failed]
 *     responses:
 *       200:
 *         description: Enrollment updated successfully
 *       404:
 *         description: Enrollment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticate, authorize('admin'), validateId, validateEnrollmentUpdate, handleValidationErrors, enrollmentController.updateEnrollment);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     summary: Delete enrollment by ID (Admin only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment deleted successfully
 *       404:
 *         description: Enrollment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticate, authorize('admin'), validateId, handleValidationErrors, enrollmentController.deleteEnrollment);

module.exports = router;