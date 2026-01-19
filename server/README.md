# URL Shortener Microservices

A production-ready microservices-based URL shortener application with authentication, email notifications, and event-driven architecture. Built with Node.js, Express, MongoDB, RabbitMQ, and Nginx API Gateway.

**Live API:** `https://api-clingo.nithindaniel.tech`

📖 **[API Documentation](./API_DOCS.md)** - Complete API reference with all endpoints, request/response examples, and error codes.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NGINX API Gateway (SSL)                              │
│                         (Port 80/443)                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│  Auth Service   │           │   URL Service   │           │  Email Service  │
│   (Port 5001)   │           │   (Port 5002)   │           │   (Port 5003)   │
└─────────────────┘           └─────────────────┘           └─────────────────┘
         │                             │                             │
         │                             │                             │
         ▼                             ▼                             │
┌─────────────────────────────────────────┐                         │
│              MongoDB 7.0                 │                         │
│           (Port 27017)                   │                         │
└─────────────────────────────────────────┘                         │
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RabbitMQ Message Broker                               │
│                    (AMQP: 5672 | Management UI: 15672)                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Features

### Auth Service (Port 5001)
| Feature | Description |
|---------|-------------|
| User Registration | Register new users with email and password |
| User Login | Authenticate users and issue JWT tokens |
| JWT Token Generation | Secure token-based authentication |
| Role-based Access Control | User and Admin roles with permission management |
| User Profile Management | View and update user profiles |
| Admin User Management | Admin can view, update roles, and delete users |
| Soft Delete Users | Safe deletion with recovery capability |
| Token Validation Endpoint | Internal `/validate` endpoint for Nginx auth |
| Event Publishing | Publishes user events to RabbitMQ |
| Password Hashing | Secure password storage with bcrypt |
| Request Logging | Comprehensive logging with Winston |
| Admin Seeder | Auto-create admin user on startup |

### URL Service (Port 5002)
| Feature | Description |
|---------|-------------|
| Create Shortened URLs | Generate short URLs from long URLs |
| Custom Short Codes | Allow users to specify custom URL codes |
| URL Expiration | Configurable expiry (default: 30 days) |
| Click Tracking | Track number of clicks per URL |
| URL Redirection | Redirect short URLs to original URLs |
| User's URL History | View all URLs created by the user |
| Admin URL Management | Admin can view and manage all URLs |
| URL Status Filtering | Filter by active, expired, or deleted status |
| Soft Delete URLs | Safe deletion with recovery capability |
| Event Publishing | Publishes URL events to RabbitMQ |
| Request Logging | Comprehensive logging with Winston |

### Email Service (Port 5003)
| Feature | Description |
|---------|-------------|
| Welcome Emails | Send welcome email on user registration |
| Login Notifications | Notify users of new login activity |
| URL Created Notifications | Confirm short URL creation via email |
| Role Update Notifications | Notify users when their role changes |
| Account Deletion Notifications | Inform users when account is deleted |
| Gmail SMTP Integration | Uses Gmail App Password for sending |
| Event-Driven Architecture | Consumes events from RabbitMQ queues |
| HTML Email Templates | Professional styled email templates |

### Infrastructure
| Component | Description |
|-----------|-------------|
| Nginx API Gateway | Reverse proxy with SSL termination |
| JWT Auth Validation | Nginx `auth_request` directive for protected routes |
| MongoDB 7.0 | Document database with separate DBs per service |
| RabbitMQ 3.13 | Message broker with management UI |
| Docker Compose | Full containerized deployment |
| Health Checks | Health endpoints for all services |
| Cloudflare SSL | Origin certificates for HTTPS |
| Certbot Integration | Let's Encrypt certificate support |
| Volume Persistence | Persistent storage for data and logs |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Gmail account with App Password (for email service)

### 1. Clone the Repository
```bash
git clone https://github.com/nithin-daniel/url-shortner-microservice.git
cd url-shortner-microservice/server
```

### 2. Create Environment File
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# MongoDB
MONGODB_PORT=27017
MONGO_INITDB_DATABASE=url_shortener
AUTH_DB_NAME=auth-service
URL_DB_NAME=url-service

# RabbitMQ
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=admin123
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672

# Service Ports
AUTH_SERVICE_PORT=5001
URL_SERVICE_PORT=5002
EMAIL_SERVICE_PORT=5003

# URL Service
BASE_URL=https://your-domain.com
DEFAULT_EXPIRY_DAYS=30

# Email Service (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
APP_NAME=URL Shortener

# Admin User
ADMIN_EMAIL=admin@urlshortener.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Admin User

# Timezone
TZ=Asia/Kolkata

# Logging
LOG_LEVEL=info
NODE_ENV=production
```

### 3. Start the Services
```bash
docker-compose up -d
```

### 4. Verify Services are Running
```bash
docker-compose ps
```

All services should show as "healthy" or "running".

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET | `/api/auth/profile` | Yes | Get current user profile |
| PUT | `/api/auth/profile` | Yes | Update current user profile |
| GET | `/api/auth/users` | Admin | Get all users |
| PUT | `/api/auth/users/:id/role` | Admin | Update user role |
| DELETE | `/api/auth/users/:id` | Admin | Soft delete user |

### URL Shortener (`/api`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/shorten` | Yes | Create a shortened URL |
| GET | `/api/urls` | Admin | Get all URLs (with filters) |
| GET | `/api/my-urls` | Yes | Get current user's URLs |
| GET | `/api/stats/:code` | Yes | Get URL statistics |
| DELETE | `/api/urls/:code` | Admin | Soft delete a URL |
| GET | `/api/:code` | No | Redirect to original URL |

### Health Checks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Nginx gateway health |
| GET | `/api/auth/` | Auth service health |
| GET | `/api/` | URL service health |

---

## 🔧 Development

### Running Locally (without Docker)

**1. Start MongoDB and RabbitMQ:**
```bash
docker-compose up -d mongodb rabbitmq
```

**2. Install dependencies for each service:**
```bash
cd auth-service && npm install
cd ../url-service && npm install
cd ../email-service && npm install
```

**3. Run services in development mode:**
```bash
# Terminal 1 - Auth Service
cd auth-service && npm run dev

# Terminal 2 - URL Service
cd url-service && npm run dev

# Terminal 3 - Email Service
cd email-service && npm run dev
```

### Seeding Admin User
```bash
cd auth-service
npm run seed:admin
```

---

## 📊 RabbitMQ Events

The services communicate via RabbitMQ message queues:

### Exchanges
| Exchange | Type | Description |
|----------|------|-------------|
| `user_events` | topic | User-related events |
| `url_events` | topic | URL-related events |

### Events Published
| Event | Producer | Consumer | Description |
|-------|----------|----------|-------------|
| `user.registered` | Auth Service | Email Service | New user registered |
| `user.logged_in` | Auth Service | Email Service | User logged in |
| `user.role_updated` | Auth Service | Email Service | User role changed |
| `user.deleted` | Auth Service | Email Service | User account deleted |
| `url.created` | URL Service | Email Service | New URL created |

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service
docker-compose logs -f url-service
docker-compose logs -f email-service

# Restart a service
docker-compose restart auth-service

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild services
docker-compose up -d --build
```

---

## 📁 Project Structure

```
server/
├── docker-compose.yml          # Docker orchestration
├── README.md                   # This file
├── RABBITMQ_TUTORIAL.md        # RabbitMQ guide
│
├── auth-service/               # Authentication microservice
│   ├── Dockerfile
│   ├── index.js                # Entry point
│   ├── package.json
│   ├── config/                 # Database & RabbitMQ config
│   ├── controllers/            # Route handlers
│   ├── middleware/             # Auth & logging middleware
│   ├── models/                 # Mongoose models
│   ├── routes/                 # Express routes
│   ├── seeders/                # Admin user seeder
│   └── utils/                  # JWT, logger, response handler
│
├── url-service/                # URL shortener microservice
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   ├── config/                 # Database & RabbitMQ config
│   ├── controllers/            # URL operations
│   ├── middleware/             # Auth & logging middleware
│   ├── models/                 # URL model
│   ├── routes/                 # Express routes
│   └── utils/                  # URL utils, logger, JWT
│
├── email-service/              # Email notification microservice
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   ├── config/                 # Email & RabbitMQ config
│   ├── services/               # Email sending logic
│   ├── templates/              # HTML email templates
│   └── utils/                  # Logger
│
└── nginx/                      # API Gateway
    ├── nginx.conf              # Nginx configuration
    ├── certs/                  # SSL certificates
    └── www/                    # Certbot webroot
```

---

## 🔐 Security Features

- **JWT Authentication** - Stateless token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Role-based Access Control** - User and Admin permissions
- **Nginx Auth Validation** - Centralized auth via `auth_request`
- **SSL/TLS Encryption** - HTTPS with Cloudflare origin certificates
- **Soft Delete** - Data is never permanently deleted immediately
- **Input Validation** - Request validation on all endpoints

---

## 📝 Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB 7.0 |
| **Message Broker** | RabbitMQ 3.13 |
| **API Gateway** | Nginx |
| **Email** | Nodemailer (Gmail SMTP) |
| **Authentication** | JWT (jsonwebtoken) |
| **Password Hashing** | bcryptjs |
| **Logging** | Winston |
| **Containerization** | Docker, Docker Compose |

---

## 📄 License

ISC License
