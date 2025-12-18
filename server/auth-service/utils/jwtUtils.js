const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @returns {string} - JWT token
 */
const generateToken = (userId, userRole = 'user') => {
  return jwt.sign(
    { id: userId, role: userRole },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  );
};

module.exports = {
  generateToken,
  verifyToken,
};
