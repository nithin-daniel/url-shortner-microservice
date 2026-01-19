require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { connectRabbitMQ, initializeConsumers } = require('./config/rabbitmq');
const authRoutes = require('./routes/authRoutes');
const { successResponse, errorResponse } = require('./utils/responseHandler');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const { verifyToken } = require('./utils/jwtUtils');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 5001;

// Connect to MongoDB
connectDB();

// Connect to RabbitMQ and initialize consumers
connectRabbitMQ().then(() => {
  // Initialize consumers after successful connection
  initializeConsumers();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Auth validation endpoint for nginx (used by auth_request directive)
app.get('/validate', (req, res) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Extract and verify token
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    // Return user info in headers for nginx to forward
    res.setHeader('X-User-Id', decoded.id);
    res.setHeader('X-User-Role', decoded.role || 'user');
    res.setHeader('X-User-Email', decoded.email || '');
    res.status(200).json({ valid: true, userId: decoded.id, role: decoded.role || 'user', email: decoded.email || '' });
  } catch (error) {
    logger.error(`Token validation error: ${error.message}`);
    return res.status(401).json({ error: 'Invalid token', details: error.message });
  }
});

// Routes
app.get('/', (req, res) => {
  successResponse(res, 200, 'Welcome to Auth Service API', {
    service: 'auth-service',
    version: '1.0.0',
    endpoints: {
      'POST /api/auth/register': 'Register a new user',
      'POST /api/auth/login': 'Login user',
      'GET /api/auth/profile': 'Get user profile (protected)',
      'GET /api/auth/users': 'Get all users (admin only)',
      'PUT /api/auth/users/:userId/role': 'Update user role (admin only)',
      'DELETE /api/auth/users/:userId': 'Delete user (admin only)',
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  errorResponse(res, 404, 'Route not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}\nStack: ${err.stack}`);
  errorResponse(res, 500, 'Something went wrong!', { details: err.message });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Auth Service is running on port ${PORT}`);
});

module.exports = app;
