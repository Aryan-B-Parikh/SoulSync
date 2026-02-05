/**
 * User Personality Routes
 * GET /api/user/personality - Get current personality setting
 * PUT /api/user/personality - Update personality preference
 */

const express = require('express');
const { body } = require('express-validator');
const authenticate = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');
const { getPersonality, updatePersonality } = require('../controllers/user.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation
const updatePersonalityValidation = [
    body('personality')
        .isIn(['reflective', 'supportive', 'creative'])
        .withMessage('Invalid personality type'),
    handleValidationErrors,
];

/**
 * Get current user's personality setting
 */
router.get('/personality', getPersonality);

/**
 * Update user's personality preference
 */
router.put('/personality', updatePersonalityValidation, updatePersonality);

module.exports = router;
