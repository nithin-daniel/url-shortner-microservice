# URL Shortener Server

A Node.js server with Express and CORS for URL shortening service.

## Folder Structure

```
server/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── index.js         # Main server file
├── .env             # Environment variables
├── .env.example     # Example environment variables
├── .gitignore       # Git ignore file
└── package.json     # Node.js dependencies
```

## Getting Started

### With Docker (Recommended)

Build and run with Docker Compose:
```bash
docker-compose up -d
```

Stop the containers:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

### Without Docker

Installation:
```bash
npm install
```

Make sure MongoDB is running locally, then start the server.

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
## Technologies Used

- Express.js - Web framework
- CORS - Cross-Origin Resource Sharing
- Mongoose - MongoDB ODM
- Docker & Docker Compose - Containerization
- MongoDB - Databasedefault (or the PORT specified in .env).

## Environment Variables

Copy `.env.example` to `.env` and configure your environment variables:

```
PORT=5000
NODE_ENV=development
```

## API Endpoints

- `GET /` - Welcome message

## Technologies Used

- Express.js - Web framework
- CORS - Cross-Origin Resource Sharing
- dotenv - Environment variable management
- nodemon - Development auto-reload
