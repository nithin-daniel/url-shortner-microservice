# URL Shortener Microservices

A microservices-based URL shortener application with authentication, built with Node.js, Express, MongoDB, and RabbitMQ.

## Architecture

This project consists of two independent microservices:

1. **Auth Service** (Port 5001) - Handles user authentication and authorization
2. **URL Service** (Port 5002) - Manages URL shortening and redirection

Both services communicate via RabbitMQ for event-driven architecture and share JWT-based authentication.

## Services Overview

### Auth Service
- User registration and login
- JWT token generation and validation
- Role-based access control (user/admin)
- User management (admin features)
- Publishes user events to RabbitMQ

### URL Service
- Create shortened URLs
- Custom short codes support
- URL expiration management
- Click tracking and analytics
- Public URL redirection
- Publishes URL events to RabbitMQ

### Infrastructure
- **MongoDB**: Database for both services (separate databases)
- **RabbitMQ**: Message broker for inter-service communication
  - Management UI: http://localhost:15672 (admin/admin123)

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (for local development)

### Quick Start with Docker

1. Navigate to the server directory
2. Start all services:

```bash
docker compose up --build
```

This will start:
- MongoDB on port 27017
- RabbitMQ on ports 5672 (AMQP) and 15672 (Management UI)
- Auth Service on port 5001
- URL Service on port 5002

### Local Development

#### Auth Service
```bash
cd auth-service
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### URL Service
```bash
cd url-service
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## API Documentation

### Auth Service (http://localhost:5001)

#### Public Endpoints
- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

#### Protected Endpoints (Requires JWT token)
- `GET /api/auth/profile` - Get current user profile
- `GET /api/auth/users` - Get all users (admin only)
- `PUT /api/auth/users/:userId/role` - Update user role (admin only)
- `DELETE /api/auth/users/:userId` - Delete user (admin only)

### URL Service (http://localhost:5002)

#### Public Endpoints
- `GET /api/:code` - Redirect to original URL

#### Protected Endpoints (Requires JWT token)
- `POST /api/shorten` - Create shortened URL
  ```json
  {
    "originalUrl": "https://example.com",
    "customCode": "optional-code",
    "expiresAt": "2025-12-31T23:59:59.000Z"
  }
  ```
- `GET /api/stats/:code` - Get URL statistics

#### Admin Endpoints
- `GET /api/urls` - Get all URLs
- `DELETE /api/urls/:code` - Delete a URL

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token by registering or logging in through the Auth Service.

## RabbitMQ Events

### User Events (auth-service)
- `user.registered` - Published when a new user registers
- `user.logged_in` - Published when a user logs in
- `user.role_updated` - Published when user role is updated
- `user.deleted` - Published when a user is deleted

### URL Events (url-service)
- `url.created` - Published when a new short URL is created
- `url.clicked` - Published when a short URL is accessed
- `url.deleted` - Published when a URL is deleted

## Environment Variables

### Auth Service
```env
PORT=5001
MONGODB_URI=mongodb://mongodb:27017/auth-service
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672
```

### URL Service
```env
PORT=5002
MONGODB_URI=mongodb://mongodb:27017/url-service
JWT_SECRET=your_jwt_secret_key
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672
BASE_URL=http://localhost:5002/api
DEFAULT_EXPIRY_DAYS=30
```

## Project Structure

```
server/
├── auth-service/
│   ├── config/
│   │   ├── database.js
│   │   └── rabbitmq.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── utils/
│   │   ├── jwtUtils.js
│   │   └── responseHandler.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── index.js
│   ├── package.json
│   └── README.md
│
├── url-service/
│   ├── config/
│   │   ├── database.js
│   │   └── rabbitmq.js
│   ├── controllers/
│   │   └── urlController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── Url.js
│   ├── routes/
│   │   └── urlRoutes.js
│   ├── utils/
│   │   ├── jwtUtils.js
│   │   ├── responseHandler.js
│   │   └── urlUtils.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── index.js
│   ├── package.json
│   └── README.md
│
└── docker-compose.yml
```

## Stopping Services

```bash
docker compose down
```

To remove volumes as well:
```bash
docker compose down -v
```

## Testing the APIs

### 1. Register a User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Create Short URL (use token from login)
```bash
curl -X POST http://localhost:5002/api/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "originalUrl": "https://www.example.com"
  }'
```

### 4. Access Short URL
```bash
curl -L http://localhost:5002/api/SHORTCODE
```

## Monitoring

- **RabbitMQ Management UI**: http://localhost:15672
  - Username: admin
  - Password: admin123

## Future Enhancements

- API Gateway for unified entry point
- Service discovery (Consul/Eureka)
- Circuit breaker pattern
- Distributed tracing (Jaeger)
- Centralized logging (ELK Stack)
- Kubernetes deployment
- Redis caching layer
- Rate limiting
- Additional microservices (Analytics, Notifications)

## License

ISC
