const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  enrollmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'dropped', 'suspended'),
    allowNull: false,
    defaultValue: 'active'
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  completionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  grade: {
    type: DataTypes.STRING(5),
    allowNull: true,
    validate: {
      isIn: [['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']]
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'enrollments',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['enrollment_date']
    }
  ],
  hooks: {
    beforeUpdate: (enrollment) => {
      if (enrollment.changed('status') && enrollment.status === 'completed' && !enrollment.completionDate) {
        enrollment.completionDate = new Date();
        enrollment.progress = 100;
      }
    }
  }
});

// Instance methods
Enrollment.prototype.calculateProgress = function() {
  // This would typically calculate based on completed lessons/modules
  // For now, return the stored progress
  return this.progress;
};

Enrollment.prototype.isActive = function() {
  return this.status === 'active';
};

Enrollment.prototype.canBeCompleted = function() {
  return this.status === 'active' && this.progress >= 80;
};

module.exports = Enrollment;