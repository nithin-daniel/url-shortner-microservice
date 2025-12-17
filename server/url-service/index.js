require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { connectRabbitMQ } = require('./config/rabbitmq');
const urlRoutes = require('./routes/urlRoutes');
const { successResponse, errorResponse } = require('./utils/responseHandler');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 5002;

// Connect to MongoDB
connectDB();

// Connect to RabbitMQ (non-blocking)
connectRabbitMQ();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.get('/', (req, res) => {
  successResponse(res, 200, 'Welcome to URL Shortener Service API', {
    service: 'url-service',
    version: '1.0.0',
    endpoints: {
      'POST /api/shorten': 'Create a shortened URL (authenticated)',
      'GET /api/urls': 'Get all URLs (admin only)',
      'GET /api/stats/:code': 'Get URL statistics (authenticated)',
      'DELETE /api/urls/:code': 'Delete a URL (admin only)',
      'GET /api/:code': 'Redirect to original URL (public)',
    }
  });
});

// API Routes
app.use('/api', urlRoutes);

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
  logger.info(`URL Service is running on port ${PORT}`);
});

module.exports = app;
