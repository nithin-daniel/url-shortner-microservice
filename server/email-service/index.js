require('dotenv').config();
const express = require('express');
const { connectRabbitMQ, initializeConsumers } = require('./config/rabbitmq');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.EMAIL_SERVICE_PORT || 5003;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Email Service is running',
    service: 'email-service',
    version: '1.0.0',
    status: 'healthy'
  });
});

// Health check for container orchestration
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Initialize RabbitMQ connection and consumers
const initializeRabbitMQ = async () => {
  try {
    await connectRabbitMQ();
    await initializeConsumers();
    logger.info('RabbitMQ connection and consumers initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize RabbitMQ: ${error.message}`);
  }
};

// Start server and initialize RabbitMQ
app.listen(PORT, () => {
  logger.info(`Email Service is running on port ${PORT}`);
  initializeRabbitMQ();
});

module.exports = app;
