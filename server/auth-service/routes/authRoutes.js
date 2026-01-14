const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile,
  getAllUsers,
  getUsersWithUrlCount,
  updateUserRole,
  deleteUser
} = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (authenticated users)
router.get('/profile', auth, getProfile);

// Admin only routes
router.get('/users', auth, authorize('admin'), getAllUsers);
router.get('/admin/users-stats', auth, authorize('admin'), getUsersWithUrlCount);
router.put('/users/:userId/role', auth, authorize('admin'), updateUserRole);
router.delete('/users/:userId', auth, authorize('admin'), deleteUser);

module.exports = router;
