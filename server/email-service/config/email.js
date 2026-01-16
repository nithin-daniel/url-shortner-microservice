const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

/**
 * Create Gmail transporter for sending emails
 * Requires: GMAIL_USER and GMAIL_APP_PASSWORD environment variables
 *
 * To get Gmail App Password:
 * 1. Enable 2-Step Verification on your Google Account
 * 2. Go to https://myaccount.google.com/apppasswords
 * 3. Generate a new App Password for "Mail"
 * 4. Use that 16-character password as GMAIL_APP_PASSWORD
 */
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    logger.warn(
      "Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in environment variables."
    );
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    logger: true,
    debug: true,
  });
};

const transporter = createTransporter();

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    logger.error(`Email transporter verification failed: ${error.message}`);
  } else {
    logger.info("Email transporter is ready to send messages");
  }
});

module.exports = {
  transporter,
  createTransporter,
};
