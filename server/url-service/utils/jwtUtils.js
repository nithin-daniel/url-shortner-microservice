const jwt = require('jsonwebtoken');

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
  verifyToken,
};
