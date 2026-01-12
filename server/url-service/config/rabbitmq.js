const amqp = require('amqplib');
const logger = require('../utils/logger');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();
    
    // Assert exchanges for future use
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

const publishEvent = async (exchange, routingKey, message) => {
  try {
    if (!channel) {
      logger.error('RabbitMQ channel not initialized');
      return false;
    }
    
    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    logger.info(`Event published to ${exchange} with routing key ${routingKey}`);
    return true;
  } catch (error) {
    logger.error(`Error publishing event: ${error.message}`);
    return false;
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
      deadLetterExchange: `${exchange}_dlx`,  // Dead letter exchange for failed messages
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
          // Reject the message and don't requeue (send to dead letter queue if configured)
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
 * Initialize consumers for URL service
 * Listens to user events from auth-service
 */
const initializeConsumers = async () => {
  // Listen for user deletion events to handle orphaned URLs
  await subscribeToEvent('user_events', 'user.deleted', 'url_service_user_deleted', async (routingKey, data) => {
    logger.info(`Processing ${routingKey} event for user: ${data.userId}`);
    // Handle user deletion - could mark URLs as orphaned or delete them
    // Add your business logic here
  });

  // Listen for user role updates
  await subscribeToEvent('user_events', 'user.role_updated', 'url_service_user_role_updated', async (routingKey, data) => {
    logger.info(`Processing ${routingKey} event for user: ${data.userId}, new role: ${data.newRole}`);
    // Handle role updates if needed
    // Add your business logic here
  });

  logger.info('URL Service consumers initialized');
};

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  publishEvent,
  subscribeToEvent,
  initializeConsumers,
  getChannel,
};
