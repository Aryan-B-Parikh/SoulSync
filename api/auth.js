/**
 * Vercel Serverless Auth API
 * Handles authentication endpoints in serverless environment
 */

const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const User = require('../server/models/user.model');
const { hashPassword, verifyPassword, generateToken, verifyToken } = require('../server/services/auth.service');

// Database connection
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const dbUrl = process.env.MONGODB_URI || process.env.DB_URL;
    await mongoose.connect(dbUrl);
    isConnected = true;
    console.log('MongoDB connected (serverless)');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Helper to handle validation errors
function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  return null;
}

// Main handler
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    // POST /api/auth/register
    if (pathname === '/api/auth/register' && method === 'POST') {
      const { email, password, name } = req.body;

      // Validate
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check existing user
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const user = await User.create({
        email: email.toLowerCase(),
        passwordHash,
        name: name || undefined,
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    }

    // POST /api/auth/login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const { email, password } = req.body;

      // Validate
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      const token = generateToken(user._id);

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    }

    // GET /api/auth/profile
    if (pathname === '/api/auth/profile' && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      });
    }

    // Unknown route
    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
