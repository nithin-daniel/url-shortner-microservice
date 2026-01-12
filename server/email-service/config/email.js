const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Create email transporter based on environment
 * Supports: SMTP, Gmail, SendGrid, Mailgun, etc.
 */
const createTransporter = () => {
  // For development/testing - use Ethereal (fake SMTP)
  if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
    logger.info('Using Ethereal test email service');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'test@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'testpassword',
      },
    });
  }

  // For production - use configured SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Gmail configuration (alternative)
 */
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  });
};

const transporter = createTransporter();

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    logger.error(`Email transporter verification failed: ${error.message}`);
  } else {
    logger.info('Email transporter is ready to send messages');
  }
});

module.exports = {
  transporter,
  createTransporter,
  createGmailTransporter,
};
