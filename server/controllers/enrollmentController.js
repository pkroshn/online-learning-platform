const { Enrollment, User, Course } = require('../models');
const { Op } = require('sequelize');

const getAllEnrollments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      courseId,
      userId,
      sortBy = 'enrollmentDate',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    if (userId) {
      whereClause.userId = userId;
    }

    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [
        {
          association: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          association: 'course',
          attributes: ['id', 'title', 'instructor', 'duration', 'level', 'category']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          association: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          association: 'course',
          attributes: ['id', 'title', 'description', 'instructor', 'duration', 'level', 'category', 'price']
        }
      ]
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      data: { enrollment }
    });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createEnrollment = async (req, res) => {
  try {
    const { userId, courseId, paymentAmount } = req.body;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if course exists and is active
    const course = await Course.findOne({
      where: { id: courseId, isActive: true }
    });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or inactive'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { userId, courseId }
    });
    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'User is already enrolled in this course'
      });
    }

    // Check if course has available slots
    const hasSlots = await course.hasAvailableSlots();
    if (!hasSlots) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      paymentAmount: paymentAmount || course.price,
      paymentStatus: paymentAmount ? 'paid' : 'pending',
      paymentDate: paymentAmount ? new Date() : null
    });

    // Fetch complete enrollment data
    const completeEnrollment = await Enrollment.findByPk(enrollment.id, {
      include: [
        {
          association: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          association: 'course',
          attributes: ['id', 'title', 'instructor', 'duration', 'level']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully',
      data: { enrollment: completeEnrollment }
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    await enrollment.update(updateData);

    // Fetch updated enrollment with associations
    const updatedEnrollment = await Enrollment.findByPk(id, {
      include: [
        {
          association: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          association: 'course',
          attributes: ['id', 'title', 'instructor', 'duration', 'level']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Enrollment updated successfully',
      data: { enrollment: updatedEnrollment }
    });
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    await enrollment.destroy();

    res.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Check if course exists and is active
    const course = await Course.findOne({
      where: { id: courseId, isActive: true }
    });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or inactive'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { userId, courseId }
    });
    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Check if course has available slots
    const hasSlots = await course.hasAvailableSlots();
    if (!hasSlots) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      paymentAmount: course.price,
      paymentStatus: course.price > 0 ? 'pending' : 'paid',
      paymentDate: course.price === 0 ? new Date() : null
    });

    // Fetch complete enrollment data
    const completeEnrollment = await Enrollment.findByPk(enrollment.id, {
      include: [
        {
          association: 'course',
          attributes: ['id', 'title', 'instructor', 'duration', 'level', 'price']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: { enrollment: completeEnrollment }
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = { userId };
    
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['enrollmentDate', 'DESC']],
      include: [
        {
          association: 'course',
          attributes: ['id', 'title', 'description', 'instructor', 'duration', 'level', 'category', 'thumbnail']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getEnrollmentStats = async (req, res) => {
  try {
    const totalEnrollments = await Enrollment.count();
    const activeEnrollments = await Enrollment.count({ where: { status: 'active' } });
    const completedEnrollments = await Enrollment.count({ where: { status: 'completed' } });
    const droppedEnrollments = await Enrollment.count({ where: { status: 'dropped' } });

    const statusStats = await Enrollment.findAll({
      attributes: [
        'status',
        [Enrollment.sequelize.fn('COUNT', Enrollment.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const monthlyEnrollments = await Enrollment.findAll({
      attributes: [
        [Enrollment.sequelize.fn('DATE_FORMAT', Enrollment.sequelize.col('enrollment_date'), '%Y-%m'), 'month'],
        [Enrollment.sequelize.fn('COUNT', Enrollment.sequelize.col('id')), 'count']
      ],
      group: [Enrollment.sequelize.fn('DATE_FORMAT', Enrollment.sequelize.col('enrollment_date'), '%Y-%m')],
      order: [[Enrollment.sequelize.fn('DATE_FORMAT', Enrollment.sequelize.col('enrollment_date'), '%Y-%m'), 'DESC']],
      limit: 12
    });

    res.json({
      success: true,
      data: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        droppedEnrollments,
        statusStats: statusStats.map(s => ({
          status: s.status,
          count: parseInt(s.dataValues.count)
        })),
        monthlyEnrollments: monthlyEnrollments.map(m => ({
          month: m.dataValues.month,
          count: parseInt(m.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Get enrollment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentStats
};