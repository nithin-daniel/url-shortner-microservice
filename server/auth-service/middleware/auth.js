const User = require('../models/User');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Authentication middleware to protect routes
 * Gets user info from nginx headers (JWT validated at gateway)
 */
const auth = async (req, res, next) => {
  try {
    // Get user info from nginx headers
    const userId = req.header('X-User-Id');
    const userRole = req.header('X-User-Role');
    
    if (!userId) {
      return errorResponse(res, 401, 'No user information provided, authorization denied');
    }

    // Find user (exclude soft-deleted users)
    const user = await User.findOne({ _id: userId, deletedAt: null }).select('-password');
    
    if (!user) {
      return errorResponse(res, 401, 'User not found, authorization denied');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, 401, 'Authentication failed');
  }
};

/**
 * Authorization middleware to check user roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res, 
        403, 
        `Access denied. Required role: ${roles.join(' or ')}`
      );
    }

    next();
  };
};

module.exports = { auth, authorize };
