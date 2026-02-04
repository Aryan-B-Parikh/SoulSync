/**
 * Authentication Controller (Prisma Refactor)
 * Handles register and login requests
 */

const prisma = require('../config/prisma');
const { hashPassword, verifyPassword, generateToken } = require('../services/auth.service');
const { toMongo } = require('../utils/formatter');

/**
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        // personality default handled by schema
      },
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: toMongo({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login existing user
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      token,
      user: toMongo({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        personality: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: toMongo(user) });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;

    // Check if user exists first? Prisma throws if not found in update, 
    // or we can just update.

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: toMongo(user)
    });
  } catch (error) {
    if (error.code === 'P2025') { // Prisma Record Not Found
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
