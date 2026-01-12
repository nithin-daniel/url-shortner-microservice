const amqp = require('amqplib');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();
    
    // Assert exchanges that we'll be consuming from
    await channel.assertExchange('user_events', 'topic', { durable: true });
    await channel.assertExchange('url_events', 'topic', { durable: true });
    
    logger.info('RabbitMQ Connected');
    
    connection.on('error', (err) => {
      logger.error(`RabbitMQ connection error: ${err.message}`);
    });
    
    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed. Reconnecting...');
      setTimeout(connectRabbitMQ, 5000);
    });
    
    return channel;
  } catch (error) {
    logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
    logger.info('Retrying in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
};

/**
 * Subscribe to events from an exchange
 * @param {string} exchange - The exchange name to subscribe to
 * @param {string} routingPattern - The routing key pattern (e.g., 'user.*', 'url.created')
 * @param {string} queueName - The name of the queue to create
 * @param {function} callback - The callback function to handle messages
 */
const subscribeToEvent = async (exchange, routingPattern, queueName, callback) => {
  try {
    if (!channel) {
      logger.error('RabbitMQ channel not initialized');
      return false;
    }

    // Assert the exchange exists
    await channel.assertExchange(exchange, 'topic', { durable: true });

    // Create a durable queue
    const q = await channel.assertQueue(queueName, { 
      durable: true,
      deadLetterExchange: `${exchange}_dlx`,
    });

    // Bind the queue to the exchange with the routing pattern
    await channel.bindQueue(q.queue, exchange, routingPattern);

    logger.info(`Subscribed to ${exchange} with pattern ${routingPattern} on queue ${queueName}`);

    // Consume messages from the queue
    channel.consume(q.queue, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;

          logger.info(`Received message from ${exchange} with routing key ${routingKey}`);

          // Execute the callback with the message content
          await callback(routingKey, content);

          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          logger.error(`Error processing message: ${error.message}`);
          // Reject the message and don't requeue
          channel.nack(msg, false, false);
        }
      }
    }, { noAck: false });

    return true;
  } catch (error) {
    logger.error(`Error subscribing to event: ${error.message}`);
    return false;
  }
};

/**
 * Initialize consumers for Email service
 * Listens to user and URL events to send email notifications
 */
const initializeConsumers = async () => {
  // ==================== USER EVENTS ====================
  
  // Send welcome email when user registers
  await subscribeToEvent('user_events', 'user.registered', 'email_service_user_registered', async (routingKey, data) => {
    logger.info(`Processing ${routingKey} event for user: ${data.email}`);
    await emailService.sendWelcomeEmail(data.email, data.name);
  });

  // Send notification when user role is updated
  await subscribeToEvent('user_events', 'user.role_updated', 'email_service_user_role_updated', async (routingKey, data) => {
    logger.info(`Processing ${routingKey} event for user: ${data.email}`);
    await emailService.sendRoleUpdateEmail(data.email, data.oldRole, data.newRole);
  });

  // Send notification when user account is deleted
  await subscribeToEvent('user_events', 'user.deleted', 'email_service_user_deleted', async (routingKey, data) => {
    logger.info(`Processing ${routingKey} event for user: ${data.email}`);
    await emailService.sendAccountDeletedEmail(data.email);
  });

  // ==================== URL EVENTS ====================

  // Send confirmation when URL is created (optional - can be disabled)
  await subscribeToEvent('url_events', 'url.created', 'email_service_url_created', async (routingKey, data) => {
    logger.info(`Processing ${routingKey} event for URL: ${data.urlCode}`);
    // URL creation emails are optional - uncomment if needed
    // await emailService.sendUrlCreatedEmail(data.userEmail, data.shortUrl, data.originalUrl);
  });

  logger.info('Email Service consumers initialized');
};

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  subscribeToEvent,
  initializeConsumers,
  getChannel,
};
