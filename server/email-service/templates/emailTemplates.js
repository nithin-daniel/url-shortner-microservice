/**
 * Email Templates for URL Shortener Service
 * All templates return HTML strings
 */

const baseTemplate = (content, appName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #4F46E5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4F46E5;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 20px 0;
    }
    .button {
      display: inline-block;
      background-color: #4F46E5;
      color: #ffffff !important;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
    }
    .highlight {
      background-color: #F3F4F6;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    .url-box {
      background-color: #EEF2FF;
      border: 1px solid #C7D2FE;
      padding: 15px;
      border-radius: 5px;
      word-break: break-all;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔗 ${appName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This email was sent by ${appName}</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Welcome email for new users
 */
const welcomeEmail = (name, appName) => {
  const content = `
    <h2>Welcome, ${name}! 🎉</h2>
    <p>Thank you for joining <strong>${appName}</strong>!</p>
    <p>You can now start creating short, memorable URLs for your links.</p>
    
    <div class="highlight">
      <h3>What you can do:</h3>
      <ul>
        <li>✅ Create short URLs instantly</li>
        <li>✅ Track click statistics</li>
        <li>✅ Manage all your links in one place</li>
        <li>✅ Use custom short codes</li>
      </ul>
    </div>
    
    <p style="text-align: center;">
      <a href="#" class="button">Get Started</a>
    </p>
    
    <p>Happy URL shortening!</p>
  `;
  return baseTemplate(content, appName);
};

/**
 * Role update notification
 */
const roleUpdateEmail = (oldRole, newRole, appName) => {
  const content = `
    <h2>Your Role Has Been Updated 🔄</h2>
    <p>Your account role has been changed:</p>
    
    <div class="highlight">
      <p><strong>Previous Role:</strong> ${oldRole}</p>
      <p><strong>New Role:</strong> ${newRole}</p>
    </div>
    
    ${newRole === 'admin' ? `
      <p>🎉 Congratulations! As an admin, you now have access to:</p>
      <ul>
        <li>View all users</li>
        <li>Manage user accounts</li>
        <li>View all URLs in the system</li>
        <li>Delete any URL</li>
      </ul>
    ` : `
      <p>Your permissions have been updated accordingly.</p>
    `}
    
    <p>If you have any questions about this change, please contact support.</p>
  `;
  return baseTemplate(content, appName);
};

/**
 * Account deleted notification
 */
const accountDeletedEmail = (appName) => {
  const content = `
    <h2>Account Deleted 👋</h2>
    <p>Your account has been deleted from <strong>${appName}</strong>.</p>
    
    <div class="highlight">
      <p>All your data, including:</p>
      <ul>
        <li>Your profile information</li>
        <li>Your shortened URLs</li>
        <li>Your click statistics</li>
      </ul>
      <p>has been removed from our system.</p>
    </div>
    
    <p>If this was a mistake or you'd like to create a new account, you're always welcome to sign up again.</p>
    
    <p>Thank you for using ${appName}!</p>
  `;
  return baseTemplate(content, appName);
};

/**
 * URL created confirmation
 */
const urlCreatedEmail = (shortUrl, originalUrl, appName) => {
  const content = `
    <h2>Your Short URL is Ready! 🎉</h2>
    <p>Your URL has been shortened successfully:</p>
    
    <div class="url-box">
      <p><strong>Short URL:</strong></p>
      <p><a href="${shortUrl}">${shortUrl}</a></p>
    </div>
    
    <div class="url-box">
      <p><strong>Original URL:</strong></p>
      <p>${originalUrl}</p>
    </div>
    
    <p style="text-align: center;">
      <a href="${shortUrl}" class="button">Visit Short URL</a>
    </p>
    
    <p>You can view statistics for this URL in your dashboard.</p>
  `;
  return baseTemplate(content, appName);
};

/**
 * Password reset email
 */
const passwordResetEmail = (resetUrl, appName) => {
  const content = `
    <h2>Password Reset Request 🔐</h2>
    <p>We received a request to reset your password.</p>
    
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    
    <div class="highlight">
      <p>⚠️ This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
    
    <p>For security reasons, please don't share this link with anyone.</p>
  `;
  return baseTemplate(content, appName);
};

/**
 * Login notification email
 */
const loginNotificationEmail = (timestamp, appName) => {
  const loginTime = new Date(timestamp).toLocaleString();
  const content = `
    <h2>New Login Detected 🔔</h2>
    <p>We noticed a new login to your account.</p>
    
    <div class="highlight">
      <p><strong>Login Time:</strong> ${loginTime}</p>
    </div>
    
    <p>If this was you, you can safely ignore this email.</p>
    
    <p>⚠️ If you didn't log in, please secure your account immediately by changing your password.</p>
  `;
  return baseTemplate(content, appName);
};

module.exports = {
  baseTemplate,
  welcomeEmail,
  roleUpdateEmail,
  accountDeletedEmail,
  urlCreatedEmail,
  passwordResetEmail,
  loginNotificationEmail,
};
