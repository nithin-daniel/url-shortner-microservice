const { verifyToken } = require('../utils/jwtUtils');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Authentication middleware to protect routes
 * Validates JWT token without checking user in database
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

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user'
    };
    
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
