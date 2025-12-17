# Auth Service

Authentication microservice for URL Shortener application.

## Features

- User registration and login
- JWT-based authentication
- Role-based access control (user/admin)
- User profile management
- Admin capabilities (manage users, update roles)
- RabbitMQ event publishing for user actions

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
PORT=5001
MONGODB_URI=mongodb://mongodb:27017/auth-service
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
RABBITMQ_URL=amqp://rabbitmq:5672
```

## API Endpoints

### Public Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Protected Routes
- `GET /api/auth/profile` - Get user profile (requires authentication)

### Admin Routes
- `GET /api/auth/users` - Get all users
- `PUT /api/auth/users/:userId/role` - Update user role
- `DELETE /api/auth/users/:userId` - Delete user

## Running Locally

```bash
npm install
npm start
```

## Running with Docker

```bash
docker build -t auth-service .
docker run -p 5001:5001 --env-file .env auth-service
```
