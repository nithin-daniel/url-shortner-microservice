# URL Shortener Microservices

A production-ready microservices-based URL shortener application with authentication, built with Node.js, Express, MongoDB, RabbitMQ, and Nginx API Gateway.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NGINX API Gateway                               │
│                                  (Port 80)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                 ┌─────────────────────┼─────────────────────┐
                 │                     │                     │
                 ▼                     ▼                     ▼
        ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
        │  Auth Service   │   │   URL Service   │   │ Auth Validator  │
        │   (Port 5001)   │   │   (Port 5002)   │   │   (Port 9000)   │
        └─────────────────┘   └─────────────────┘   └─────────────────┘
                 │                     │                     │
                 │                     │                     │
                 ▼                     ▼                     │
        ┌─────────────────────────────────────────┐         │
        │              MongoDB                     │         │
        │           (Port 27017)                   │         │
        └─────────────────────────────────────────┘         │
                 │                     │                     │
                 ▼                     ▼                     │
        ┌─────────────────────────────────────────┐         │
        │            RabbitMQ                      │◄────────┘
        │      (AMQP: 5672 | UI: 15672)           │
        └─────────────────────────────────────────┘
```

---

## 📦 Current Features

### Auth Service (Port 5001)
| Feature | Status |
|---------|--------|
| User Registration | ✅ |
| User Login | ✅ |
| JWT Token Generation | ✅ |
| Role-based Access Control (user/admin) | ✅ |
| User Profile Management | ✅ |
| Admin User Management | ✅ |
| Soft Delete Users | ✅ |
| Event Publishing (RabbitMQ) | ✅ |
| Password Hashing (bcrypt) | ✅ |
| Request Logging (Winston) | ✅ |

### URL Service (Port 5002)
| Feature | Status |
|---------|--------|
| Create Shortened URLs | ✅ |
| Custom Short Codes | ✅ |
| URL Expiration | ✅ |
| Click Tracking | ✅ |
| URL Redirection | ✅ |
| Admin URL Management | ✅ |
| Soft Delete URLs | ✅ |
| Event Publishing (RabbitMQ) | ✅ |
| Request Logging (Winston) | ✅ |

### Infrastructure
| Component | Status |
|-----------|--------|
| Nginx API Gateway | ✅ |
| Auth Validator (JWT) | ✅ |
| MongoDB Database | ✅ |
| RabbitMQ Message Broker | ✅ |
| Docker Compose Setup | ✅ |
| Health Checks | ✅ |

---

## 📋 TODO: Industrial Standard Improvements

### 🔴 Priority 1: Critical (Security & Reliability)

#### Environment Variables Security
- [ ] Use secrets management (HashiCorp Vault, AWS Secrets Manager, or Docker Secrets)
- [ ] Remove hardcoded JWT secrets from docker-compose.yml
- [ ] Add `.env.example` files with placeholders for all services
- [ ] Implement environment validation on startup (using Joi or envalid)

#### Authentication & Security Enhancements
- [ ] Implement refresh tokens with rotation
- [ ] Add token blacklisting for logout (Redis-based)
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add brute force protection (express-slow-down)
- [ ] Implement password reset functionality
- [ ] Add email verification for registration
- [ ] Implement HTTPS/TLS (SSL certificates with Let's Encrypt)
- [ ] Add Helmet.js for security headers
- [ ] Implement CORS properly (whitelist specific origins)
- [ ] Add input sanitization (express-mongo-sanitize)
- [ ] Implement XSS protection (xss-clean)
- [ ] Add CSRF protection for web clients
- [ ] Implement API key authentication for service-to-service calls

#### Database Security
- [ ] Add MongoDB authentication (username/password)
- [ ] Implement database connection pooling
- [ ] Add database replica sets for high availability
- [ ] Encrypt sensitive data at rest
- [ ] Implement proper database indexing strategy
- [ ] Add database backup automation

---

### 🟠 Priority 2: Testing & Quality Assurance

#### Unit Testing
- [ ] Set up Jest testing framework
- [ ] Write unit tests for auth-service controllers
- [ ] Write unit tests for url-service controllers
- [ ] Write unit tests for utility functions (jwtUtils, urlUtils)
- [ ] Write unit tests for middleware
- [ ] Aim for 80%+ code coverage

#### Integration Testing
- [ ] Set up Supertest for API testing
- [ ] Write integration tests for auth endpoints
- [ ] Write integration tests for URL endpoints
- [ ] Test RabbitMQ event publishing
- [ ] Test database operations with test database
- [ ] Add MongoDB memory server for isolated tests

#### End-to-End Testing
- [ ] Set up E2E testing framework
- [ ] Write E2E tests for user registration flow
- [ ] Write E2E tests for URL shortening flow
- [ ] Test complete user journeys

#### Code Quality
- [ ] Set up ESLint with Airbnb/Standard config
- [ ] Set up Prettier for code formatting
- [ ] Add Husky pre-commit hooks
- [ ] Set up lint-staged for staged files
- [ ] Add SonarQube/SonarCloud for code analysis
- [ ] Implement commit message linting (commitlint)

---

### 🟡 Priority 3: Observability & Monitoring

#### Logging
- [ ] Implement structured logging (JSON format)
- [ ] Add correlation IDs for request tracing across services
- [ ] Set up log rotation
- [ ] Integrate with ELK Stack (Elasticsearch, Logstash, Kibana)
- [ ] Add log aggregation (Fluentd/Fluent Bit)
- [ ] Implement log levels per environment

#### Metrics & Monitoring
- [ ] Set up Prometheus metrics collection
- [ ] Create Grafana dashboards
- [ ] Add custom application metrics:
  - [ ] Request count per endpoint
  - [ ] Response time percentiles
  - [ ] Error rates
  - [ ] Active users
  - [ ] URLs created per hour
  - [ ] Redirects per hour
- [ ] Set up alerting rules (PagerDuty, Slack, Email)

#### Distributed Tracing
- [ ] Implement Jaeger/Zipkin for distributed tracing
- [ ] Add OpenTelemetry instrumentation
- [ ] Trace requests across microservices
- [ ] Add span context propagation

#### Health Checks
- [ ] Implement liveness probes
- [ ] Implement readiness probes
- [ ] Add dependency health checks (MongoDB, RabbitMQ)
- [ ] Create health check dashboard
- [ ] Add startup probes for slow-starting containers

---

### 🟢 Priority 4: Performance & Scalability

#### Caching
- [ ] Add Redis for caching
- [ ] Cache frequently accessed URLs
- [ ] Implement cache invalidation strategy
- [ ] Add session storage in Redis
- [ ] Cache user authentication tokens
- [ ] Implement cache-aside pattern

#### Performance Optimization
- [ ] Implement database connection pooling
- [ ] Add database query optimization (explain analyze)
- [ ] Implement pagination for list endpoints
- [ ] Add compression middleware (gzip/brotli)
- [ ] Optimize Docker images (multi-stage builds)
- [ ] Add response caching headers
- [ ] Implement lazy loading for heavy operations

#### Scalability
- [ ] Add horizontal scaling support
- [ ] Implement load balancing with Nginx upstream
- [ ] Set up Kubernetes deployment
- [ ] Add auto-scaling policies (HPA)
- [ ] Implement circuit breaker pattern (Opossum)
- [ ] Add retry logic with exponential backoff
- [ ] Implement bulkhead pattern for isolation

---

### 🔵 Priority 5: DevOps & CI/CD

#### CI/CD Pipeline
- [ ] Set up GitHub Actions workflow
- [ ] Implement automated testing in pipeline
- [ ] Add code coverage reporting
- [ ] Add Docker image building and pushing to registry
- [ ] Implement staging environment deployment
- [ ] Add production deployment workflow
- [ ] Implement blue-green deployments
- [ ] Add rollback capabilities
- [ ] Implement semantic versioning

#### Infrastructure as Code
- [ ] Create Kubernetes manifests
- [ ] Create Helm charts for easy deployment
- [ ] Set up Terraform for cloud infrastructure
- [ ] Implement GitOps with ArgoCD/Flux
- [ ] Add infrastructure documentation

#### Container Optimization
- [ ] Use multi-stage Docker builds
- [ ] Optimize Docker layer caching
- [ ] Implement Docker image vulnerability scanning (Trivy)
- [ ] Use distroless/Alpine base images
- [ ] Add container resource limits
- [ ] Implement proper signal handling (graceful shutdown)

---

### 🟣 Priority 6: Documentation & Developer Experience

#### API Documentation
- [ ] Implement OpenAPI/Swagger specification
- [ ] Set up Swagger UI at `/api-docs`
- [ ] Add API versioning (v1, v2)
- [ ] Create Postman collection
- [ ] Create Insomnia collection
- [ ] Document all error codes and responses
- [ ] Add request/response examples

#### Developer Documentation
- [ ] Write contribution guidelines (CONTRIBUTING.md)
- [ ] Add code of conduct (CODE_OF_CONDUCT.md)
- [ ] Create architecture decision records (ADRs)
- [ ] Document deployment process (DEPLOYMENT.md)
- [ ] Add troubleshooting guide (TROUBLESHOOTING.md)
- [ ] Create runbook for operations

#### Local Development
- [ ] Add docker-compose.dev.yml for development
- [ ] Create Makefile for common tasks
- [ ] Add VS Code launch configurations (.vscode/launch.json)
- [ ] Add VS Code recommended extensions
- [ ] Implement hot reloading in Docker containers
- [ ] Create development scripts

---

### ⚪ Priority 7: Additional Features

#### URL Service Enhancements
- [ ] Add QR code generation for short URLs
- [ ] Implement detailed analytics (geographic data, referrers, devices)
- [ ] Add bulk URL shortening API
- [ ] Implement URL password protection
- [ ] Add URL tags/categories
- [ ] Implement URL preview feature (unfurl)
- [ ] Add URL validation (check if destination exists)
- [ ] Implement custom domains support
- [ ] Add link expiration notifications

#### Auth Service Enhancements
- [ ] Add OAuth2/Social login (Google, GitHub, Facebook)
- [ ] Implement 2FA/MFA (TOTP)
- [ ] Add session management
- [ ] Implement account lockout policies
- [ ] Add login history/audit log
- [ ] Implement password strength requirements
- [ ] Add account recovery options

#### New Microservices
- [ ] **Notification Service**
  - [ ] Email notifications (welcome, password reset)
  - [ ] Webhook notifications
  - [ ] Consume RabbitMQ events
  - [ ] Integration with SendGrid/Mailgun
  
- [ ] **Analytics Service**
  - [ ] Track detailed click analytics
  - [ ] Generate reports (daily, weekly, monthly)
  - [ ] Export analytics data (CSV, PDF)
  - [ ] Real-time analytics dashboard
  
- [ ] **Admin Dashboard Service**
  - [ ] System health monitoring
  - [ ] User management UI
  - [ ] URL management UI
  - [ ] Analytics visualization

---

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose v2.0+
- Node.js 20+ (for local development)
- Git

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/nithin-daniel/url-shortner-microservice.git
cd url-shortner-microservice/server

# Start all services
docker compose up --build

# Seed admin user (optional)
docker exec -it auth-service npm run seed:admin
```

### Services Endpoints
| Service | URL |
|---------|-----|
| API Gateway | http://localhost |
| Auth Service | http://localhost/api/auth |
| URL Service | http://localhost/api |
| RabbitMQ Management | http://localhost:15672 (admin/admin123) |

### Local Development

```bash
# Auth Service
cd auth-service
npm install
cp .env.example .env
npm run dev

# URL Service
cd url-service
npm install
cp .env.example .env
npm run dev
```

---

## 📚 API Reference

### Auth Service

#### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |

**Register Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Protected Endpoints (Requires JWT)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/auth/profile` | Get current user profile | User |
| GET | `/api/auth/users` | Get all users | Admin |
| PUT | `/api/auth/users/:userId/role` | Update user role | Admin |
| DELETE | `/api/auth/users/:userId` | Delete user (soft) | Admin |

### URL Service

#### Protected Endpoints (Requires JWT)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/shorten` | Create shortened URL | User |
| GET | `/api/urls` | Get all URLs | Admin |
| GET | `/api/stats/:code` | Get URL statistics | User |
| DELETE | `/api/urls/:code` | Delete a URL | Admin |

**Shorten URL Request:**
```json
{
  "originalUrl": "https://example.com/very-long-url",
  "customCode": "my-code",    // optional
  "expiresAt": "2025-12-31"   // optional
}
```

#### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/:code` | Redirect to original URL |

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token by registering or logging in through the Auth Service.

---

## 📨 RabbitMQ Events

### User Events (auth-service → user_events exchange)
| Event | Description |
|-------|-------------|
| `user.registered` | Published when a new user registers |
| `user.logged_in` | Published when a user logs in |
| `user.role_updated` | Published when user role is updated |
| `user.deleted` | Published when a user is deleted |

### URL Events (url-service → url_events exchange)
| Event | Description |
|-------|-------------|
| `url.created` | Published when a new short URL is created |
| `url.clicked` | Published when a short URL is accessed |
| `url.deleted` | Published when a URL is deleted |

---

## ⚙️ Environment Variables

### Auth Service
```env
PORT=5001
MONGODB_URI=mongodb://mongodb:27017/auth-service
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672
LOG_LEVEL=http
```

### URL Service
```env
PORT=5002
MONGODB_URI=mongodb://mongodb:27017/url-service
JWT_SECRET=your_super_secret_jwt_key_change_in_production
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672
BASE_URL=http://localhost/api
DEFAULT_EXPIRY_DAYS=30
LOG_LEVEL=info
```

---

## 📂 Project Structure

```
server/
├── docker-compose.yml          # Docker orchestration
├── README.md                   # This file
│
├── nginx/                      # API Gateway
│   ├── nginx.conf
│   └── README.md
│
├── auth-service/               # Authentication microservice
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js
│   ├── config/
│   │   ├── database.js
│   │   └── rabbitmq.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── requestLogger.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── seeders/
│   │   └── adminSeeder.js
│   ├── utils/
│   │   ├── jwtUtils.js
│   │   ├── logger.js
│   │   └── responseHandler.js
│   └── __tests__/
│       └── unit/
│
├── url-service/                # URL Shortener microservice
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js
│   ├── config/
│   │   ├── database.js
│   │   └── rabbitmq.js
│   ├── controllers/
│   │   └── urlController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── requestLogger.js
│   ├── models/
│   │   └── Url.js
│   ├── routes/
│   │   └── urlRoutes.js
│   ├── utils/
│   │   ├── jwtUtils.js
│   │   ├── logger.js
│   │   ├── responseHandler.js
│   │   └── urlUtils.js
│   └── __tests__/
│       └── unit/
│
├── auth-validator/             # JWT validation service for Nginx
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
│
└── prometheus/                 # Metrics collection (TODO)
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| API Gateway | Nginx |
| Backend | Node.js 20, Express.js 5 |
| Database | MongoDB 7.0 |
| Message Broker | RabbitMQ 3.13 |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Logging | Winston |
| Containerization | Docker, Docker Compose |

---

## 🧪 Testing the APIs

### 1. Register a User
```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Create Short URL (use token from login)
```bash
curl -X POST http://localhost/api/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "originalUrl": "https://www.example.com/very-long-path"
  }'
```

### 4. Access Short URL
```bash
curl -L http://localhost/api/SHORTCODE
```

---

## 🛑 Stopping Services

```bash
# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v
```

---

## 📊 Monitoring

| Service | URL | Credentials |
|---------|-----|-------------|
| RabbitMQ Management | http://localhost:15672 | admin / admin123 |

---

## 📄 License

ISC

---

## 👥 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

---

## 📞 Support

For questions and support, please open an issue in the repository.
