const { User, Course, Enrollment, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get comprehensive dashboard statistics for admin panel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
      User.count(),
      Course.count({ where: { isActive: true } }),
      Enrollment.count({ where: { status: 'active' } })
    ]);

    // User statistics
    const [activeUsers, studentCount, instructorCount] = await Promise.all([
      User.count({ where: { isActive: true } }),
      User.count({ where: { role: 'student' } }),
      User.count({ where: { role: { [Op.in]: ['instructor', 'admin'] } } })
    ]);

    // Course statistics
    const [publishedCourses, draftCourses] = await Promise.all([
      Course.count({ where: { isActive: true } }),
      Course.count({ where: { isActive: false } })
    ]);

    // Enrollment statistics
    const [completedEnrollments, pendingEnrollments] = await Promise.all([
      Enrollment.count({ where: { status: 'completed' } }),
      Enrollment.count({ where: { status: 'dropped' } })
    ]);

    // Calculate completion rate
    const completionRate = totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100) 
      : 0;

    // Revenue calculation (sum of prices for enrolled courses)
    const revenueResult = await sequelize.query(`
      SELECT COALESCE(SUM(c.price), 0) as totalRevenue
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.status = 'active'
    `, { type: sequelize.QueryTypes.SELECT });
    
    const totalRevenue = parseFloat(revenueResult[0]?.totalRevenue || 0);

    // Monthly enrollment trends (last 6 months) - MySQL compatible
    const enrollmentTrends = await sequelize.query(`
      SELECT 
        DATE_FORMAT(enrollment_date, '%Y-%m-01') as month,
        COUNT(*) as enrollments
      FROM enrollments
      WHERE enrollment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND status = 'active'
      GROUP BY DATE_FORMAT(enrollment_date, '%Y-%m-01')
      ORDER BY month DESC
      LIMIT 6
    `, { type: sequelize.QueryTypes.SELECT });

    // Popular courses (top 5 by enrollment count)
    const popularCourses = await sequelize.query(`
      SELECT 
        c.id,
        c.title,
        c.instructor,
        c.price,
        COALESCE(COUNT(e.id), 0) as enrollmentCount
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      WHERE c.is_active = true
      GROUP BY c.id, c.title, c.instructor, c.price
      ORDER BY enrollmentCount DESC
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });

    // Recent enrollments (last 10)
    const recentEnrollments = await Enrollment.findAll({
      limit: 10,
      order: [['enrollmentDate', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'instructor']
        }
      ]
    });

    // Recent users (last 10)
    const recentUsers = await User.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt', 'isActive']
    });

    // Course categories distribution
    const categoryStats = await Course.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['category'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // User roles distribution
    const roleStats = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true
    });

    // System health metrics
    const coursesWithEnrollmentsResult = await sequelize.query(`
      SELECT COUNT(DISTINCT c.id) as count
      FROM courses c
      INNER JOIN enrollments e ON c.id = e.course_id
      WHERE c.is_active = true AND e.status = 'active'
    `, { type: sequelize.QueryTypes.SELECT });

    const systemHealth = {
      activeUsersPercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      coursesWithEnrollments: parseInt(coursesWithEnrollmentsResult[0]?.count || 0),
      averageEnrollmentsPerCourse: publishedCourses > 0 ? Math.round(totalEnrollments / publishedCourses) : 0
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          completionRate,
          totalRevenue
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          students: studentCount,
          instructors: instructorCount
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          draft: draftCourses
        },
        enrollments: {
          total: totalEnrollments,
          active: totalEnrollments - completedEnrollments - pendingEnrollments,
          completed: completedEnrollments,
          pending: pendingEnrollments
        },
        trends: {
          enrollmentTrends: enrollmentTrends.map(trend => ({
            month: trend.month,
            enrollments: parseInt(trend.enrollments)
          }))
        },
        popular: {
          courses: popularCourses.map(course => ({
            ...course,
            enrollmentCount: parseInt(course.enrollmentCount)
          }))
        },
        recent: {
          enrollments: recentEnrollments,
          users: recentUsers
        },
        analytics: {
          categoryStats: categoryStats.map(stat => ({
            category: stat.category,
            count: parseInt(stat.count)
          })),
          roleStats: roleStats.map(stat => ({
            role: stat.role,
            count: parseInt(stat.count)
          }))
        },
        systemHealth
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDashboardStats
};