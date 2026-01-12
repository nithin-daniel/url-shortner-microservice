# 📧 Email Service

A microservice for handling email notifications in the URL Shortener application. This service listens to RabbitMQ events and sends appropriate email notifications.

## 🚀 Features

- **Event-Driven Architecture**: Consumes events from RabbitMQ
- **Multiple Email Provider Support**: SMTP, Gmail, SendGrid, etc.
- **Beautiful HTML Templates**: Professional email templates with responsive design
- **Development Mode**: Uses Ethereal for testing without sending real emails
- **Health Checks**: Built-in health check endpoints for container orchestration

## 📨 Events Handled

| Event | Exchange | Routing Key | Action |
|-------|----------|-------------|--------|
| User Registration | `user_events` | `user.registered` | Sends welcome email |
| Role Update | `user_events` | `user.role_updated` | Sends role change notification |
| Account Deletion | `user_events` | `user.deleted` | Sends goodbye email |
| URL Created | `url_events` | `url.created` | Sends confirmation (optional) |

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd email-service
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run the Service

```bash
# Development
npm run dev

# Production
npm start
```

## 📧 Email Provider Configuration

### Using SMTP (Recommended for Production)

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

### Using Gmail

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

> ⚠️ For Gmail, you need to create an App Password. Regular passwords won't work.

### Using Ethereal (Development)

For development, the service automatically uses [Ethereal](https://ethereal.email/) to capture emails without sending them. Check the logs for preview URLs.

## 🐳 Docker

```bash
# Build
docker build -t email-service .

# Run
docker run -p 5003:5003 --env-file .env email-service
```

## 📁 Project Structure

```
email-service/
├── config/
│   ├── email.js          # Email transporter configuration
│   └── rabbitmq.js       # RabbitMQ connection & consumers
├── services/
│   └── emailService.js   # Email sending logic
├── templates/
│   └── emailTemplates.js # HTML email templates
├── utils/
│   └── logger.js         # Winston logger
├── logs/                  # Log files
├── index.js              # Entry point
├── Dockerfile
├── package.json
└── README.md
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check |

## 📝 Adding New Email Types

1. Add template in `templates/emailTemplates.js`:

```javascript
const newEmailTemplate = (data, appName) => {
  const content = `<h2>Your content here</h2>`;
  return baseTemplate(content, appName);
};
```

2. Add send function in `services/emailService.js`:

```javascript
const sendNewEmail = async (email, data) => {
  const subject = `Subject - ${APP_NAME}`;
  const html = emailTemplates.newEmailTemplate(data, APP_NAME);
  return sendEmail(email, subject, html);
};
```

3. Subscribe to the event in `config/rabbitmq.js`:

```javascript
await subscribeToEvent('exchange', 'routing.key', 'queue_name', async (routingKey, data) => {
  await emailService.sendNewEmail(data.email, data);
});
```

## 🧪 Testing

```bash
npm test
```

## 📄 License

ISC
