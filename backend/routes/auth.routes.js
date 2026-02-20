/**
 * Authentication Routes
 * POST /auth/register - DISABLED (returns 410)
 * POST /auth/login    - Authenticate existing password users
 * POST /auth/google   - Google Sign-In (Silent Link or Create)
 * GET  /auth/profile  - Get current user
 */

const express = require('express');
const { body } = require('express-validator');
const { register, login, googleAuth, getProfile, updateProfile } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors,
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 50 }),
  handleValidationErrors,
];

// Routes
router.post('/register', register);                                          // 410 — disabled
router.post('/login', loginValidation, login);                               // legacy password login
router.post('/google', body('credential').notEmpty(), googleAuth);           // Google Sign-In
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfileValidation, updateProfile);

module.exports = router;
