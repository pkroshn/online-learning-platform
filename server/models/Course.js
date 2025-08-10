const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 5000]
    }
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  instructor: {
    type: DataTypes.STRING(100),
    allowNull: true, // Made nullable since we're adding instructorId
    validate: {
      len: [2, 100]
    }
  },
  instructorId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Will be required in future, but optional for migration
    references: {
      model: 'users',
      key: 'id'
    }
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in hours
    allowNull: false,
    validate: {
      min: 1,
      max: 1000
    }
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
    defaultValue: 'beginner'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
    validate: {
      len: [3, 3]
    }
  },
  maxStudents: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  thumbnail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  syllabus: {
    type: DataTypes.JSON,
    allowNull: true
  },
  prerequisites: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  learningOutcomes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'courses',
  validate: {
    endDateAfterStartDate() {
      if (this.startDate && this.endDate && this.endDate <= this.startDate) {
        throw new Error('End date must be after start date');
      }
    }
  }
});

// Instance methods
Course.prototype.getEnrollmentCount = async function() {
  const Enrollment = require('./Enrollment');
  return await Enrollment.count({
    where: { courseId: this.id, status: 'active' }
  });
};

Course.prototype.hasAvailableSlots = async function() {
  if (!this.maxStudents) return true;
  const enrollmentCount = await this.getEnrollmentCount();
  return enrollmentCount < this.maxStudents;
};

module.exports = Course;