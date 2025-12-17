# Nginx API Gateway

This directory contains the Nginx configuration for the API Gateway.

## Configuration

The `nginx.conf` file routes incoming requests to the appropriate microservices:

- `/api/auth/*` → Auth Service (port 5001)
- `/api/shorten`, `/api/urls`, `/api/stats/*` → URL Service (port 5002)
- `/api/:code` → URL Service redirect endpoint
- `/health` → Gateway health check

## Features

- **Load Balancing**: Ready for horizontal scaling of services
- **Request Forwarding**: Proper headers forwarding (X-Real-IP, X-Forwarded-For, etc.)
- **Health Checks**: Gateway health endpoint at `/health`
- **Logging**: Access and error logs stored in volume
- **Timeouts**: Configured with 60s timeout for long-running requests

## Access

Once docker-compose is running, the API Gateway is accessible at:
- http://localhost (port 80)

All API requests should now go through the gateway instead of directly to services.

## Service Endpoints

### Auth Service (via /api/auth)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/users` - Get all users (admin)
- `PUT /api/auth/users/:userId/role` - Update user role (admin)
- `DELETE /api/auth/users/:userId` - Delete user (admin)

### URL Service (via /api)
- `POST /api/shorten` - Create shortened URL
- `GET /api/urls` - Get all URLs (admin)
- `GET /api/stats/:code` - Get URL statistics
- `DELETE /api/urls/:code` - Delete a URL (admin)
- `GET /api/:code` - Redirect to original URL
