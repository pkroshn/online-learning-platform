const { Course, User, Enrollment } = require('../models');
const { Op } = require('sequelize');

const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      instructor,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const whereClause = { isActive: true };
    
    if (category) {
      whereClause.category = { [Op.iLike]: `%${category}%` };
    }
    
    if (level) {
      whereClause.level = level;
    }
    
    if (instructor) {
      whereClause.instructor = { [Op.iLike]: `%${instructor}%` };
    }
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { instructor: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [
        {
          association: 'instructorUser',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
          required: false
        },
        {
          association: 'enrollments',
          attributes: ['id', 'status'],
          where: { status: 'active' },
          required: false
        }
      ]
    });

    // Add enrollment count to each course
    const coursesWithStats = courses.map(course => {
      const courseData = course.toJSON();
      courseData.enrollmentCount = course.enrollments ? course.enrollments.length : 0;
      courseData.availableSlots = course.maxStudents ? 
        course.maxStudents - courseData.enrollmentCount : null;
      delete courseData.enrollments;
      return courseData;
    });

    res.json({
      success: true,
      data: {
        courses: coursesWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findOne({
      where: { id, isActive: true },
      include: [
        {
          association: 'instructorUser',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
          required: false
        },
        {
          association: 'enrollments',
          attributes: ['id', 'status', 'enrollmentDate'],
          where: { status: 'active' },
          required: false,
          include: [
            {
              association: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const courseData = course.toJSON();
    courseData.enrollmentCount = course.enrollments ? course.enrollments.length : 0;
    courseData.availableSlots = course.maxStudents ? 
      course.maxStudents - courseData.enrollmentCount : null;
    
    // Check if current user is enrolled (if authenticated)
    if (req.user) {
      const userEnrollment = course.enrollments?.find(
        enrollment => enrollment.user.id === req.user.id
      );
      courseData.isEnrolled = !!userEnrollment;
      courseData.userEnrollment = userEnrollment || null;
    }

    res.json({
      success: true,
      data: { course: courseData }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    
    // If instructorId is provided, verify the instructor exists and has proper role
    if (courseData.instructorId) {
      const instructor = await User.findOne({
        where: { 
          id: courseData.instructorId, 
          role: { [Op.in]: ['instructor', 'admin'] },
          isActive: true 
        }
      });
      
      if (!instructor) {
        return res.status(400).json({
          success: false,
          message: 'Invalid instructor selected'
        });
      }
      
      // Set instructor name for backward compatibility
      courseData.instructor = `${instructor.firstName} ${instructor.lastName}`;
    }
    
    const course = await Course.create(courseData);
    
    // Fetch the created course with instructor information
    const courseWithInstructor = await Course.findByPk(course.id, {
      include: [
        {
          association: 'instructorUser',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
          required: false
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course: courseWithInstructor }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If instructorId is provided, verify the instructor exists and has proper role
    if (updateData.instructorId) {
      const instructor = await User.findOne({
        where: { 
          id: updateData.instructorId, 
          role: { [Op.in]: ['instructor', 'admin'] },
          isActive: true 
        }
      });
      
      if (!instructor) {
        return res.status(400).json({
          success: false,
          message: 'Invalid instructor selected'
        });
      }
      
      // Set instructor name for backward compatibility
      updateData.instructor = `${instructor.firstName} ${instructor.lastName}`;
    }

    await course.update(updateData);
    
    // Fetch the updated course with instructor information
    const updatedCourse = await Course.findByPk(id, {
      include: [
        {
          association: 'instructorUser',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course has active enrollments
    const activeEnrollments = await Enrollment.count({
      where: { courseId: id, status: 'active' }
    });

    if (activeEnrollments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active enrollments'
      });
    }

    // Soft delete by setting isActive to false
    await course.update({ isActive: false });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getCourseCategories = async (req, res) => {
  try {
    const categories = await Course.findAll({
      attributes: ['category'],
      where: { isActive: true },
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(c => c.category);

    res.json({
      success: true,
      data: { categories: categoryList }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getCourseStats = async (req, res) => {
  try {
    const totalCourses = await Course.count({ where: { isActive: true } });
    const totalEnrollments = await Enrollment.count({ where: { status: 'active' } });
    
    const categoriesStats = await Course.findAll({
      attributes: [
        'category',
        [Course.sequelize.fn('COUNT', Course.sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['category'],
      order: [[Course.sequelize.fn('COUNT', Course.sequelize.col('id')), 'DESC']]
    });

    const levelStats = await Course.findAll({
      attributes: [
        'level',
        [Course.sequelize.fn('COUNT', Course.sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['level']
    });

    res.json({
      success: true,
      data: {
        totalCourses,
        totalEnrollments,
        categoriesStats: categoriesStats.map(c => ({
          category: c.category,
          count: parseInt(c.dataValues.count)
        })),
        levelStats: levelStats.map(l => ({
          level: l.level,
          count: parseInt(l.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseCategories,
  getCourseStats
};