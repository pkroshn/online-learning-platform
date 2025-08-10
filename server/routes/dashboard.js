const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get comprehensive dashboard statistics (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                         totalCourses:
 *                           type: integer
 *                         totalEnrollments:
 *                           type: integer
 *                         completionRate:
 *                           type: integer
 *                         totalRevenue:
 *                           type: number
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         students:
 *                           type: integer
 *                         instructors:
 *                           type: integer
 *                     courses:
 *                       type: object
 *                     enrollments:
 *                       type: object
 *                     trends:
 *                       type: object
 *                     popular:
 *                       type: object
 *                     recent:
 *                       type: object
 *                     analytics:
 *                       type: object
 *                     systemHealth:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', authenticate, authorize('admin'), dashboardController.getDashboardStats);

module.exports = router;