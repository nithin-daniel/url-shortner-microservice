const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();
    
    // Assert exchanges for future use
    await channel.assertExchange('url_events', 'topic', { durable: true });
    
    console.log('RabbitMQ Connected');
    
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });
    
    connection.on('close', () => {
      console.log('RabbitMQ connection closed. Reconnecting...');
      setTimeout(connectRabbitMQ, 5000);
    });
    
    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
};

const publishEvent = async (exchange, routingKey, message) => {
  try {
    if (!channel) {
      console.error('RabbitMQ channel not initialized');
      return false;
    }
    
    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    console.log(`Event published to ${exchange} with routing key ${routingKey}`);
    return true;
  } catch (error) {
    console.error('Error publishing event:', error);
    return false;
  }
};

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  publishEvent,
  getChannel,
};
