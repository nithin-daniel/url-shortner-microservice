const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Authentication middleware to protect routes
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided, authorization denied');
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = verifyToken(token);

    // Find user (exclude soft-deleted users)
    const user = await User.findOne({ _id: decoded.id, deletedAt: null }).select('-password');
    
    if (!user) {
      return errorResponse(res, 401, 'User not found, authorization denied');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, 401, 'Token is not valid');
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
