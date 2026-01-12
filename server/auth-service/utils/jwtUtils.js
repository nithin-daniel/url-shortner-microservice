const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {string} userEmail - User email
 * @returns {string} - JWT token
 */
const generateToken = (userId, userRole = 'user', userEmail = '') => {
  return jwt.sign(
    { id: userId, role: userRole, email: userEmail },
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
