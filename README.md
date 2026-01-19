# URL Shortener Microservice

A full-stack URL shortener application built with microservices architecture. Features include user authentication, URL shortening with custom codes, click tracking, email notifications, and an admin dashboard.

**🌐 Live Demo:** [clingo.nithindaniel.tech](https://clingo.nithindaniel.tech)  
**📡 API:** [api-clingo.nithindaniel.tech](https://api-clingo.nithindaniel.tech)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              React Frontend                                  │
│                         (Vite + Tailwind CSS)                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NGINX API Gateway (SSL)                              │
│                           (Port 80/443)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│  Auth Service   │           │   URL Service   │           │  Email Service  │
│   (Port 5001)   │           │   (Port 5002)   │           │   (Port 5003)   │
│   Node.js       │           │   Node.js       │           │   Node.js       │
└─────────────────┘           └─────────────────┘           └─────────────────┘
         │                             │                             │
         └──────────────┬──────────────┘                             │
                        ▼                                            │
         ┌─────────────────────────────┐                             │
         │        MongoDB 7.0          │                             │
         │       (Port 27017)          │                             │
         └─────────────────────────────┘                             │
                        │                                            │
                        ▼                                            ▼
         ┌─────────────────────────────────────────────────────────────────┐
         │                    RabbitMQ Message Broker                       │
         │                 (AMQP: 5672 | UI: 15672)                        │
         └─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### User Features
- 🔐 User registration and login with JWT authentication
- 🔗 Create shortened URLs with optional custom codes
- ⏰ URL expiration dates (configurable, default 30 days)
- 📊 Click tracking and analytics per URL
- 📋 Copy short URLs to clipboard
- 🗑️ Delete your own URLs

### Admin Features
- 👥 View and manage all users
- 🔄 Update user roles (user/admin)
- 📋 View all URLs across the platform
- 🗑️ Delete any URL
- 📈 Filter URLs by status (active/expired/deleted)

### System Features
- 📧 Email notifications (welcome, login alerts, URL creation)
- 🔄 Event-driven architecture with RabbitMQ
- 🔒 SSL/TLS encryption with Cloudflare
- 🐳 Fully containerized with Docker
- 📝 Comprehensive logging with Winston

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB 7.0 |
| **Message Broker** | RabbitMQ 3.13 |
| **API Gateway** | Nginx |
| **Email** | Nodemailer (Gmail SMTP) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Containerization** | Docker, Docker Compose |
| **Hosting** | Vercel (Frontend), VPS (Backend) |

---

## 📁 Project Structure

```
url-shortner-microservice/
├── README.md                    # This file
├── client/                      # React frontend
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Redirect.jsx
│   │   ├── components/         # Reusable components
│   │   ├── utils/
│   │   │   └── api.js          # Axios configuration
│   │   └── App.jsx             # Main app with routing
│   └── package.json
│
└── server/                      # Backend microservices
    ├── docker-compose.yml       # Docker orchestration
    ├── nginx/                   # API Gateway config
    │   └── nginx.conf
    ├── auth-service/            # Authentication service
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   └── Dockerfile
    ├── url-service/             # URL shortening service
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   └── Dockerfile
    └── email-service/           # Email notification service
        ├── services/
        ├── templates/
        └── Dockerfile
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/nithin-daniel/url-shortner-microservice.git
cd url-shortner-microservice
```

### 2. Start Backend Services
```bash
cd server

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d
```

### 3. Start Frontend (Development)
```bash
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/profile` | Yes | Get user profile |
| GET | `/api/auth/users` | Admin | Get all users |
| PUT | `/api/auth/users/:id/role` | Admin | Update user role |
| DELETE | `/api/auth/users/:id` | Admin | Delete user |

### URL Shortening
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/shorten` | Yes | Create short URL |
| GET | `/api/my-urls` | Yes | Get user's URLs |
| GET | `/api/urls` | Admin | Get all URLs |
| GET | `/api/stats/:code` | Yes | Get URL statistics |
| DELETE | `/api/urls/:code` | Admin | Delete URL |
| GET | `/api/:code` | No | Redirect to original URL |

---

## ⚙️ Environment Variables

### Server (.env)
```env
# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# MongoDB
MONGODB_PORT=27017
AUTH_DB_NAME=auth-service
URL_DB_NAME=url-service

# RabbitMQ
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=admin123

# Services
AUTH_SERVICE_PORT=5001
URL_SERVICE_PORT=5002
EMAIL_SERVICE_PORT=5003

# URL Service
BASE_URL=https://your-domain.com
DEFAULT_EXPIRY_DAYS=30

# Email (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

### Client (.env)
```env
VITE_API_BASE_URL=https://api-clingo.nithindaniel.tech
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Stop and remove volumes
docker-compose down -v
```

---

## 📧 Email Notifications

The email service sends notifications for:
- **Welcome Email** - When a new user registers
- **Login Alert** - When a user logs in
- **URL Created** - When a new short URL is created
- **Role Updated** - When an admin changes a user's role
- **Account Deleted** - When an account is deleted

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Nginx auth validation for protected routes
- SSL/TLS encryption
- Input validation on all endpoints
- Soft delete for data safety

---

## 📊 Monitoring

| Service | URL | Credentials |
|---------|-----|-------------|
| RabbitMQ UI | http://localhost:15672 | admin / admin123 |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👤 Author

**Nithin Daniel**
- GitHub: [@nithin-daniel](https://github.com/nithin-daniel)

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [RabbitMQ](https://www.rabbitmq.com/)
