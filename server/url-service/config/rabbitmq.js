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

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  publishEvent,
  getChannel,
};
