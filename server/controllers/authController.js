const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    // Check if user already exists (including soft-deleted)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.deletedAt) {
        return errorResponse(res, 400, 'This email was previously used. Please contact support.');
      }
      return errorResponse(res, 400, 'User with this email already exists');
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    return successResponse(res, 201, 'User registered successfully', {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return errorResponse(res, 500, 'Server error', { details: error.message });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    // Find user by email
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id);

    return successResponse(res, 200, 'Login successful', {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return errorResponse(res, 500, 'Server error', { details: error.message });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id, deletedAt: null }).select('-password');
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'Profile retrieved successfully', { user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return errorResponse(res, 500, 'Server error', { details: error.message });
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ deletedAt: null }).select('-password').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Users retrieved successfully', { users, count: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    return errorResponse(res, 500, 'Server error', { details: error.message });
  }
};

/**
 * Update user role (admin only)
 */
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return errorResponse(res, 400, 'Invalid role. Must be either "user" or "admin"');
    }

    const user = await User.findOne({ _id: userId, deletedAt: null }).select('-password');
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    user.role = role;
    await user.save();

    return successResponse(res, 200, 'User role updated successfully', { user });
  } catch (error) {
    console.error('Error updating user role:', error);
    return errorResponse(res, 500, 'Server error', { details: error.message });
  }
};

/**
 * Delete user (admin only) - Soft delete
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return errorResponse(res, 400, 'You cannot delete your own account');
    }

    const user = await User.findOne({ _id: userId, deletedAt: null });
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Soft delete by setting deletedAt timestamp
    user.deletedAt = new Date();
    await user.save();

    return successResponse(res, 200, 'User deleted successfully', { 
      deletedUser: { id: user._id, email: user.email, name: user.name, deletedAt: user.deletedAt }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return errorResponse(res, 500, 'Server error', { details: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
