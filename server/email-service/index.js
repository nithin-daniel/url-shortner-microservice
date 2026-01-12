require('dotenv').config();
const express = require('express');
const { connectRabbitMQ, initializeConsumers } = require('./config/rabbitmq');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5003;

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

// Connect to RabbitMQ and initialize consumers
connectRabbitMQ().then(() => {
  initializeConsumers();
});

// Start server
app.listen(PORT, () => {
  logger.info(`Email Service is running on port ${PORT}`);
});

module.exports = app;
