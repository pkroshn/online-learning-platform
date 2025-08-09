const { sequelize } = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const Enrollment = require('./Enrollment');

// Define associations
User.hasMany(Enrollment, {
  foreignKey: 'userId',
  as: 'enrollments',
  onDelete: 'CASCADE'
});

Course.hasMany(Enrollment, {
  foreignKey: 'courseId',
  as: 'enrollments',
  onDelete: 'CASCADE'
});

Enrollment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Enrollment.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// Many-to-many relationship through Enrollment
User.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: 'userId',
  otherKey: 'courseId',
  as: 'courses'
});

Course.belongsToMany(User, {
  through: Enrollment,
  foreignKey: 'courseId',
  otherKey: 'userId',
  as: 'students'
});

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully.');
    
    // Create default admin user if not exists
    if (force || process.env.NODE_ENV === 'development') {
      await createDefaultAdmin();
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
      console.log('✅ Default admin user created.');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Course,
  Enrollment,
  syncDatabase
};