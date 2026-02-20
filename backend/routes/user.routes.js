/**
 * User Personality & Consent Routes
 */

const express = require('express');
const { body } = require('express-validator');
const authenticate = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');
const { getPersonality, updatePersonality, giveConsent } = require('../controllers/user.controller');

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

router.get('/personality', getPersonality);
router.put('/personality', updatePersonalityValidation, updatePersonality);

/**
 * Record that the user has accepted the AI training data policy.
 * Called once from the ConsentGate modal.
 */
router.put('/consent', giveConsent);

module.exports = router;
