require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const urlRoutes = require('./routes/urlRoutes');
const authRoutes = require('./routes/authRoutes');
const { successResponse, errorResponse } = require('./utils/responseHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.get('/', (req, res) => {
  successResponse(res, 200, 'Welcome to URL Shortener API', {
    endpoints: {
      'POST /api/auth/register': 'Register a new user',
      'POST /api/auth/login': 'Login user',
      'GET /api/auth/profile': 'Get user profile (protected)',
      'POST /api/shorten': 'Create a shortened URL',
      'GET /api/urls': 'Get all URLs',
      'GET /api/stats/:code': 'Get URL statistics',
      'DELETE /api/urls/:code': 'Delete a URL',
      'GET /api/:code': 'Redirect to original URL'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', urlRoutes);
app.use('/api', urlRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  errorResponse(res, 500, 'Something went wrong!', { details: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
