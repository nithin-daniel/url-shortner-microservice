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

    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
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

module.exports = auth;
