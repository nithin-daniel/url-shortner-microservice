const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  getAllUrls,
  getUserUrls,
  redirectUrl,
  resolveUrl,
  getUrlStats,
  deleteUrl,
  getAdminStats,
  getUserUrlCounts,
} = require('../controllers/urlController');
const { auth, authorize } = require('../middleware/auth');

// Create a shortened URL (authenticated users only)
router.post('/shorten', auth, createShortUrl);

// Get user's own URLs (authenticated users)
router.get('/urls/my', auth, getUserUrls);

// Get admin statistics (admin only)
router.get('/admin/stats', auth, authorize('admin'), getAdminStats);

// Get user URL counts (admin only)
router.get('/admin/user-url-counts', auth, authorize('admin'), getUserUrlCounts);

// Get all URLs (admin only) - supports ?status=active|expired|deleted
router.get('/urls', auth, authorize('admin'), getAllUrls);

// Get URL statistics by code (authenticated users)
router.get('/stats/:code', auth, getUrlStats);

// Delete a URL by code (authenticated users can delete their own, admins can delete any)
router.delete('/urls/:code', auth, deleteUrl);

// Resolve URL - Returns JSON with originalUrl (public - no auth required)
router.get('/resolve/:code', resolveUrl);

// Redirect to original URL (public - no auth required)
router.get('/:code', redirectUrl);

module.exports = router;
