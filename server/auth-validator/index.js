const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.AUTH_VALIDATOR_PORT || 9000;
const JWT_SECRET = process.env.JWT_SECRET;

// Auth validation endpoint for nginx
app.get('/validate', (req, res) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Extract and verify token
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    // Return user info in headers for nginx to forward
    res.setHeader('X-User-Id', decoded.id);
    res.setHeader('X-User-Role', decoded.role || 'user');
    res.setHeader('X-User-Email', decoded.email || '');
    res.status(200).json({ valid: true, userId: decoded.id, role: decoded.role || 'user', email: decoded.email || '' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token', details: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Auth validator service running on port ${PORT}`);
});

module.exports = app;
