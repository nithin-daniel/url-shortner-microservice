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

## 🎯 Junior → Mid → Senior Developer Roadmap

> **For Junior Developers:** This roadmap is designed to help you grow from junior to mid/senior level by implementing industry-standard improvements step by step. Each phase builds on the previous one and teaches you essential skills that employers look for.

---

### 📍 Phase 1: Quick Wins (Week 1-2) 
**⏱️ Time: 10-12 hours | 🎓 Skills: Security Basics, Configuration Management**

These are beginner-friendly tasks that immediately improve your project and teach fundamental concepts.

| Task | Time | What You'll Learn |
|------|------|-------------------|
| Create `.env.example` files | 30 min | Environment variable management |
| Add environment validation (Joi) | 1 hr | Input validation, fail-fast principle |
| Install & configure Helmet.js | 30 min | HTTP security headers |
| Add express-rate-limit | 1 hr | Protecting APIs from abuse |
| Add express-mongo-sanitize | 30 min | NoSQL injection prevention |
| Set up ESLint + Prettier | 1 hr | Code quality standards |
| Add .editorconfig | 15 min | Consistent coding style |

<details>
<summary>📖 How to implement environment validation</summary>

```javascript
// config/env.js
const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5001),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  RABBITMQ_URL: Joi.string().required(),
}).unknown();

const { value: env, error } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

module.exports = env;
```
</details>

<details>
<summary>📖 How to add security middleware</summary>

```javascript
// middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Stricter for login/register
  message: { success: false, message: 'Too many attempts' }
});

module.exports = { helmet, limiter, authLimiter, mongoSanitize };
```
</details>

**✅ Checklist:**
- [ ] Create `.env.example` for auth-service
- [ ] Create `.env.example` for url-service
- [ ] Add environment validation with Joi
- [ ] Install and configure Helmet.js
- [ ] Add rate limiting to all endpoints
- [ ] Add stricter rate limiting to auth endpoints
- [ ] Add MongoDB sanitization
- [ ] Set up ESLint
- [ ] Set up Prettier
- [ ] Add .editorconfig file

---

### 📍 Phase 2: Testing Foundation (Week 3-4)
**⏱️ Time: 15-20 hours | 🎓 Skills: Unit Testing, Mocking, TDD**

> 💡 **Why this matters:** Testing is the #1 skill gap between junior and mid-level developers. Companies LOVE candidates who can write tests.

| Task | Time | What You'll Learn |
|------|------|-------------------|
| Set up Jest | 1 hr | Test framework configuration |
| Write JWT utility tests | 2 hr | Unit testing basics |
| Write controller tests | 4 hr | Mocking, dependency injection |
| Write middleware tests | 2 hr | Testing Express middleware |
| Add coverage reporting | 30 min | Code coverage metrics |
| Write integration tests | 6 hr | API testing with Supertest |

<details>
<summary>📖 Example: Testing JWT utilities</summary>

```javascript
// __tests__/unit/jwtUtils.test.js
const { generateToken, verifyToken } = require('../../utils/jwtUtils');

describe('JWT Utilities', () => {
  const mockUser = { _id: '12345', email: 'test@example.com', role: 'user' };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(mockUser._id);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid')).toThrow();
    });
  });
});
```
</details>

<details>
<summary>📖 Example: Testing controllers with mocks</summary>

```javascript
// __tests__/unit/authController.test.js
const { register } = require('../../controllers/authController');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('Auth Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 400 if email already exists', async () => {
      mockReq.body = { email: 'test@test.com', password: '123456', name: 'Test' };
      User.findOne.mockResolvedValue({ email: 'test@test.com' });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
```
</details>

**✅ Checklist:**
- [ ] Install Jest and configure package.json scripts
- [ ] Write tests for `jwtUtils.js` (auth-service)
- [ ] Write tests for `urlUtils.js` (url-service)
- [ ] Write tests for `authController.js`
- [ ] Write tests for `urlController.js`
- [ ] Write tests for auth middleware
- [ ] Set up Supertest for API testing
- [ ] Write integration tests for register/login flow
- [ ] Add coverage reporting with `jest --coverage`
- [ ] Aim for 70%+ code coverage

---

### 📍 Phase 3: API Documentation (Week 5)
**⏱️ Time: 8-10 hours | 🎓 Skills: OpenAPI, Documentation, API Design**

> 💡 **Interview Gold:** Being able to show well-documented APIs demonstrates professionalism that impresses interviewers.

| Task | Time | What You'll Learn |
|------|------|-------------------|
| Set up Swagger/OpenAPI | 2 hr | API specification standards |
| Document auth endpoints | 2 hr | JSDoc annotations |
| Document URL endpoints | 2 hr | Request/response schemas |
| Create Postman collection | 1 hr | API testing tools |
| Add error code documentation | 1 hr | Error handling patterns |

<details>
<summary>📖 Example: Swagger setup</summary>

```javascript
// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Authentication microservice for URL Shortener',
    },
    servers: [{ url: 'http://localhost:5001', description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
```

```javascript
// In your routes file - add JSDoc comments
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               name: { type: string }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation error or email exists }
 */
router.post('/register', register);
```
</details>

**✅ Checklist:**
- [ ] Install swagger-jsdoc and swagger-ui-express
- [ ] Create Swagger configuration
- [ ] Add JSDoc comments to auth routes
- [ ] Add JSDoc comments to URL routes
- [ ] Set up Swagger UI at `/api-docs`
- [ ] Create Postman collection
- [ ] Export and include in repo
- [ ] Document all error responses

---

### 📍 Phase 4: CI/CD Pipeline (Week 6)
**⏱️ Time: 6-8 hours | 🎓 Skills: GitHub Actions, Automation, DevOps Basics**

> 💡 **Senior Mindset:** Automating testing and deployment shows you think about the full software lifecycle.

| Task | Time | What You'll Learn |
|------|------|-------------------|
| Create GitHub Actions workflow | 2 hr | CI/CD concepts |
| Add automated testing | 1 hr | Pipeline stages |
| Add linting checks | 1 hr | Quality gates |
| Add Docker build step | 2 hr | Container automation |

<details>
<summary>📖 Example: GitHub Actions workflow</summary>

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [master, main]
  pull_request:
    branches: [master, main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: '**/package-lock.json'
      
      - name: Install & Test Auth Service
        working-directory: ./server/auth-service
        run: |
          npm ci
          npm run lint
          npm test -- --coverage
      
      - name: Install & Test URL Service
        working-directory: ./server/url-service
        run: |
          npm ci
          npm run lint
          npm test -- --coverage
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./server/auth-service/coverage/lcov.info,./server/url-service/coverage/lcov.info

  docker:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker Images
        run: |
          docker build -t auth-service ./server/auth-service
          docker build -t url-service ./server/url-service
```
</details>

**✅ Checklist:**
- [ ] Create `.github/workflows/ci.yml`
- [ ] Add test job for auth-service
- [ ] Add test job for url-service
- [ ] Add lint checks
- [ ] Add Docker build verification
- [ ] Add code coverage reporting
- [ ] Test pipeline with a PR

---

### 📍 Phase 5: Observability (Week 7-8)
**⏱️ Time: 12-15 hours | 🎓 Skills: Logging, Metrics, Monitoring**

> 💡 **Production Readiness:** This is what separates hobby projects from production-ready systems.

| Task | Time | What You'll Learn |
|------|------|-------------------|
| Add correlation IDs | 2 hr | Distributed tracing basics |
| Implement structured logging | 2 hr | Log analysis |
| Set up Prometheus metrics | 4 hr | Metrics collection |
| Create Grafana dashboard | 4 hr | Data visualization |
| Add health check endpoints | 2 hr | Container orchestration |

<details>
<summary>📖 Example: Correlation ID middleware</summary>

```javascript
// middleware/correlationId.js
const { v4: uuidv4 } = require('uuid');

const correlationIdMiddleware = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  
  // Add to all subsequent logs
  req.logger = req.app.get('logger').child({ 
    correlationId: req.correlationId 
  });
  
  next();
};

module.exports = correlationIdMiddleware;
```
</details>

<details>
<summary>📖 Example: Prometheus metrics</summary>

```javascript
// middleware/metrics.js
const promClient = require('prom-client');

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10]
});
register.registerMetric(httpDuration);

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });
  next();
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

module.exports = { metricsMiddleware, metricsEndpoint, register };
```
</details>

**✅ Checklist:**
- [ ] Add correlation ID middleware
- [ ] Update Winston for structured JSON logging
- [ ] Pass correlation IDs between services
- [ ] Install prom-client
- [ ] Add HTTP request metrics
- [ ] Add custom business metrics
- [ ] Create `/metrics` endpoint
- [ ] Set up Prometheus in docker-compose
- [ ] Create basic Grafana dashboard
- [ ] Add `/health` and `/ready` endpoints

---

### 📍 Phase 6: Advanced Security (Week 9-10)
**⏱️ Time: 15-20 hours | 🎓 Skills: Token Management, Redis, Security Patterns**

| Task | Time | What You'll Learn |
|------|------|-------------------|
| Implement refresh tokens | 4 hr | Token rotation strategy |
| Add Redis for token storage | 3 hr | Caching layer |
| Implement token blacklisting | 3 hr | Secure logout |
| Add password reset flow | 4 hr | Email integration |
| Implement CORS properly | 2 hr | Cross-origin security |

**✅ Checklist:**
- [ ] Add Redis to docker-compose
- [ ] Implement refresh token endpoint
- [ ] Store refresh tokens in Redis
- [ ] Implement token blacklisting for logout
- [ ] Add password reset with email
- [ ] Configure CORS with whitelist
- [ ] Add MongoDB authentication
- [ ] Create database indexes

---

### 📍 Phase 7: Performance & Caching (Week 11-12)
**⏱️ Time: 12-15 hours | 🎓 Skills: Caching, Optimization, Scalability**

| Task | Time | What You'll Learn |
|------|------|-------------------|
| Cache URL lookups in Redis | 4 hr | Cache-aside pattern |
| Add compression middleware | 1 hr | Response optimization |
| Implement pagination | 3 hr | Large dataset handling |
| Optimize Docker images | 2 hr | Multi-stage builds |
| Add database indexing | 2 hr | Query optimization |

**✅ Checklist:**
- [ ] Cache short URL → original URL in Redis
- [ ] Implement cache invalidation on URL delete
- [ ] Add compression (gzip) middleware
- [ ] Implement cursor-based pagination
- [ ] Use multi-stage Docker builds
- [ ] Add database indexes for common queries
- [ ] Add response caching headers

---

### 📍 Phase 8: Production Features (Week 13+)
**⏱️ Time: Ongoing | 🎓 Skills: Full-Stack, System Design**

These are "when you're ready" features that make your project stand out:

**URL Service Enhancements:**
- [ ] QR code generation for short URLs
- [ ] Click analytics (geographic, device, referrer)
- [ ] Bulk URL shortening API
- [ ] Custom domains support
- [ ] URL expiration notifications

**Auth Service Enhancements:**
- [ ] OAuth2 (Google, GitHub login)
- [ ] 2FA/MFA with TOTP
- [ ] Login audit log
- [ ] Account lockout policies

**New Microservices:**
- [ ] Notification Service (email, webhooks)
- [ ] Analytics Service (reports, dashboards)
- [ ] Admin Dashboard Service

---

## 📚 Learning Resources

| Phase | Topic | Free Resources |
|-------|-------|----------------|
| 1 | Security | [OWASP Node.js Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html) |
| 2 | Testing | [Jest Docs](https://jestjs.io/docs/getting-started) |
| 3 | API Design | [OpenAPI Tutorial](https://swagger.io/docs/specification/about/) |
| 4 | CI/CD | [GitHub Actions Docs](https://docs.github.com/en/actions) |
| 5 | Monitoring | [Prometheus Getting Started](https://prometheus.io/docs/introduction/first_steps/) |
| 6 | Redis | [Redis University](https://university.redis.com/) |
| 7 | System Design | [System Design Primer](https://github.com/donnemartin/system-design-primer) |

---

## 💼 How This Helps Your Career

| Phase Completed | Level You Can Claim | Interview Talking Points |
|-----------------|---------------------|--------------------------|
| Phase 1-2 | Strong Junior | "I understand security basics and write tests" |
| Phase 3-4 | Junior → Mid | "I document APIs and set up CI/CD pipelines" |
| Phase 5-6 | Mid-Level | "I build observable, production-ready systems" |
| Phase 7-8 | Mid → Senior | "I design for scale and implement complex features" |

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
