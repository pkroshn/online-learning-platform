const jwt = require('jsonwebtoken');
const { User } = require('../models');

const adminMiddleware = async (req, res, next) => {
  try {
    // Check if user is authenticated (should have user from auth middleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No authentication token provided.' 
      });
    }

    // Check if user role is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // If user is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in admin authentication' 
    });
  }
};

module.exports = adminMiddleware;
