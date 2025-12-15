const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  getAllUrls,
  redirectUrl,
  getUrlStats,
  deleteUrl,
} = require('../controllers/urlController');

// Create a shortened URL
router.post('/shorten', createShortUrl);

// Get all URLs
router.get('/urls', getAllUrls);

// Get URL statistics by code
router.get('/stats/:code', getUrlStats);

// Delete a URL by code
router.delete('/urls/:code', deleteUrl);

// Redirect to original URL (this should be last to avoid conflicts)
router.get('/:code', redirectUrl);

module.exports = router;
