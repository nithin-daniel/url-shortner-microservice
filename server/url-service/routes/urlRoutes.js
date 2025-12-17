const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  getAllUrls,
  redirectUrl,
  getUrlStats,
  deleteUrl,
} = require('../controllers/urlController');
const { auth, authorize } = require('../middleware/auth');

// Create a shortened URL (authenticated users only)
router.post('/shorten', auth, createShortUrl);

// Get all URLs (admin only)
router.get('/urls', auth, authorize('admin'), getAllUrls);

// Get URL statistics by code (authenticated users)
router.get('/stats/:code', auth, getUrlStats);

// Delete a URL by code (admin only)
router.delete('/urls/:code', auth, authorize('admin'), deleteUrl);

// Redirect to original URL (public - no auth required)
router.get('/:code', redirectUrl);

module.exports = router;
