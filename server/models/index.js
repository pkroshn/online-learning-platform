const { sequelize, testConnection } = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const Enrollment = require('./Enrollment');
const Payment = require('./Payment');

// Define associations
User.hasMany(Enrollment, {
  foreignKey: 'user_id',
  as: 'enrollments',
  onDelete: 'CASCADE'
});

Course.hasMany(Enrollment, {
  foreignKey: 'course_id',
  as: 'enrollments',
  onDelete: 'CASCADE'
});

Enrollment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Enrollment.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// Many-to-many relationship through Enrollment
User.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: 'user_id',
  otherKey: 'course_id',
  as: 'courses'
});

Course.belongsToMany(User, {
  through: Enrollment,
  foreignKey: 'course_id',
  otherKey: 'user_id',
  as: 'students'
});

// Course-Instructor relationship
Course.belongsTo(User, {
  foreignKey: 'instructor_id',
  as: 'instructorUser'
});

User.hasMany(Course, {
  foreignKey: 'instructor_id',
  as: 'instructedCourses'
});

// Payment associations
User.hasMany(Payment, {
  foreignKey: 'user_id',
  as: 'payments',
  onDelete: 'CASCADE'
});

Course.hasMany(Payment, {
  foreignKey: 'course_id',
  as: 'payments',
  onDelete: 'CASCADE'
});

Payment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Payment.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// Sync database
const syncDatabase = async (force = false) => {
  try {
    // Sync models in the correct order to avoid foreign key issues
    if (force) {
      // Drop all tables and recreate them
      await sequelize.drop();
    }
    
    // Sync in order: User -> Course -> Enrollment -> Payment
    await User.sync({ force });
    await Course.sync({ force });
    await Enrollment.sync({ force });
    await Payment.sync({ force });
    
    console.log('✅ Database synchronized successfully.');
    
    // Create default users if not exists
    if (force || process.env.NODE_ENV === 'development') {
      await createDefaultAdmin();
      await createDefaultStudent();
    }
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: process.env.ADMIN_EMAIL || 'admin@learningplatform.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Default admin user created');
    }
  } catch (error) {
    console.error('❌ Error creating default admin user:', error);
  }
};

const createDefaultStudent = async () => {
  try {
    const studentExists = await User.findOne({ where: { email: 'student@example.com' } });
    
    if (!studentExists) {
      await User.create({
        firstName: 'Demo',
        lastName: 'Student',
        email: 'student@example.com',
        password: 'student123',
        role: 'student',
        isActive: true
      });
      console.log('✅ Default student user created');
    }
  } catch (error) {
    console.error('❌ Error creating default student user:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  User,
  Course,
  Enrollment,
  Payment,
  syncDatabase
};