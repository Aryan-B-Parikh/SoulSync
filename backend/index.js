/**
 * SoulSync AI - Backend Server
 * Express server with AI chat capabilities + Authentication
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateEnv, getConfig } = require('./config/env');
const { connectDB } = require('./config/database');
const createRateLimiter = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const userRoutes = require('./routes/user.routes');
const memoryRoutes = require('./routes/memory.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const moodRoutes = require('./routes/mood.routes');
// Legacy route removed

// Validate environment variables
validateEnv(process.env.NODE_ENV === 'production');

// Get configuration
const config = getConfig();

// Initialize Express app
const app = express();

// Store config in app
app.set('config', config);

// Connect to database
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Middleware
app.use(cors(config.cors));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rate limiting
app.use('/api', createRateLimiter(config.rateLimit));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/messages', feedbackRoutes);
app.use('/api/mood', moodRoutes);
// Legacy route removed

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'soulsync-ai' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SoulSync AI API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      auth: 'POST /api/auth/register | /login',
      chats: 'GET /api/chats',
      messages: 'POST /api/chats/:id/messages',
      health: 'GET /api/health',
    },
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   🚀 SoulSync AI Server Started       ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n  Environment: ${config.nodeEnv}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  URL: http://localhost:${config.port}`);
  console.log(`  API: http://localhost:${config.port}/api`);
  console.log('\n  Endpoints:');
  console.log(`    POST /api/auth/register`);
  console.log(`    POST /api/auth/login`);
  console.log(`    GET  /api/chats`);
  console.log(`    POST /api/chats/:id/messages`);
  console.log(`    GET  /api/health`);
  console.log('\n═══════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
