const express = require('express');
const cors = require('cors');

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const githubRoutes = require('./routes/githubRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const healthRoutes = require('./routes/healthRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');

const app = express();

// Middleware
app.use(cors());
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
