const express = require('express');
const cors = require('cors');
const env = require('./config/env');

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const githubRoutes = require('./routes/githubRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const healthRoutes = require('./routes/healthRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');

const app = express();

// Middleware
const configuredOrigins = (env.CORS_ORIGINS || env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const hasConfiguredOrigins = configuredOrigins.length > 0;

const localOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];

const allowedOrigins = [...new Set([...configuredOrigins, ...localOrigins])];

app.use(cors({
  origin(origin, callback) {
    if (!origin || !hasConfiguredOrigins || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  }
}));
app.use(express.json());

// Route Registration
// Note: Ensure the route files export an express Router instance
app.use('/api/chat', chatRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/health', healthRoutes);
app.use('/', googleAuthRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
