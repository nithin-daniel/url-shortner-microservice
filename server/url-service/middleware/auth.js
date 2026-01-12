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
    const userEmail = req.header('X-User-Email');
    
    if (!userId) {
      return errorResponse(res, 401, 'No user information provided, authorization denied');
    }

    // Attach user info to request
    req.user = {
      id: userId,
      role: userRole || 'user',
      email: userEmail || ''
    };
    
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
