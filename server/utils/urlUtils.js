const crypto = require('crypto');

/**
 * Generate a random short code for URL
 * @param {number} length - Length of the short code
 * @returns {string} - Random alphanumeric string
 */
const generateShortCode = (length = 6) => {
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, length);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

module.exports = {
  generateShortCode,
  isValidUrl,
};
