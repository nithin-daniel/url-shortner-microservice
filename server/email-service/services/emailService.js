const { transporter } = require('../config/email');
const logger = require('../utils/logger');
const emailTemplates = require('../templates/emailTemplates');

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@urlshortener.com';
const APP_NAME = process.env.APP_NAME || 'URL Shortener';

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @param {string} text - Plain text content (fallback)
 */
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
    
    // For Ethereal test emails, log the preview URL
    if (info.messageId && process.env.NODE_ENV === 'development') {
      const nodemailer = require('nodemailer');
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`Preview URL: ${previewUrl}`);
      }
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = `Welcome to ${APP_NAME}!`;
  const html = emailTemplates.welcomeEmail(name || 'User', APP_NAME);
  return sendEmail(email, subject, html);
};

/**
 * Send role update notification
 */
const sendRoleUpdateEmail = async (email, oldRole, newRole) => {
  const subject = `Your role has been updated - ${APP_NAME}`;
  const html = emailTemplates.roleUpdateEmail(oldRole, newRole, APP_NAME);
  return sendEmail(email, subject, html);
};

/**
 * Send account deleted notification
 */
const sendAccountDeletedEmail = async (email) => {
  const subject = `Your account has been deleted - ${APP_NAME}`;
  const html = emailTemplates.accountDeletedEmail(APP_NAME);
  return sendEmail(email, subject, html);
};

/**
 * Send URL created confirmation
 */
const sendUrlCreatedEmail = async (email, shortUrl, originalUrl) => {
  const subject = `Your short URL is ready - ${APP_NAME}`;
  const html = emailTemplates.urlCreatedEmail(shortUrl, originalUrl, APP_NAME);
  return sendEmail(email, subject, html);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const subject = `Password Reset Request - ${APP_NAME}`;
  const html = emailTemplates.passwordResetEmail(resetUrl, APP_NAME);
  return sendEmail(email, subject, html);
};

/**
 * Send custom email
 */
const sendCustomEmail = async (email, subject, htmlContent) => {
  return sendEmail(email, subject, htmlContent);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendRoleUpdateEmail,
  sendAccountDeletedEmail,
  sendUrlCreatedEmail,
  sendPasswordResetEmail,
  sendCustomEmail,
};
