/**
 * Authentication Routes
 * POST /auth/register - Create new user
 * POST /auth/login - Authenticate user
 * GET /auth/profile - Get current user
 */

const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().trim().isLength({ max: 50 }),
  handleValidationErrors,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors,
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);

module.exports = router;
