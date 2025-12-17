# URL Service

URL Shortener microservice for creating and managing shortened URLs.

## Features

- Create shortened URLs with optional custom codes
- URL expiration management
- Click tracking and analytics
- Public URL redirection
- Admin capabilities (view all URLs, delete URLs)
- RabbitMQ event publishing for URL actions

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
PORT=5002
MONGODB_URI=mongodb://mongodb:27017/url-service
JWT_SECRET=your_jwt_secret_key_here
RABBITMQ_URL=amqp://rabbitmq:5672
BASE_URL=http://localhost:5002
DEFAULT_EXPIRY_DAYS=30
```

## API Endpoints

### Authenticated Routes
- `POST /api/shorten` - Create a shortened URL (requires authentication)
  ```json
  {
    "originalUrl": "https://example.com",
    "customCode": "optional-custom-code",
    "expiresAt": "2025-12-31T23:59:59.000Z"
  }
  ```
- `GET /api/stats/:code` - Get URL statistics (requires authentication)

### Admin Routes
- `GET /api/urls` - Get all URLs
- `DELETE /api/urls/:code` - Delete a URL

### Public Routes
- `GET /api/:code` - Redirect to original URL

## Running Locally

```bash
npm install
npm start
```

## Running with Docker

```bash
docker build -t url-service .
docker run -p 5002:5002 --env-file .env url-service
```
