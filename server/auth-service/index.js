require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { connectRabbitMQ } = require('./config/rabbitmq');
const authRoutes = require('./routes/authRoutes');
const { successResponse, errorResponse } = require('./utils/responseHandler');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Connect to RabbitMQ (non-blocking)
connectRabbitMQ();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

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
