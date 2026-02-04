/**
 * Feedback Routes
 * API endpoints for message feedback (thumbs up/down)
 */

const express = require('express');
const { body } = require('express-validator');
const authenticate = require('../middleware/auth');
const router = express.Router();
const {
    submitFeedback,
    removeFeedback,
    getFeedbackStats
} = require('../controllers/feedback.controller');
const { handleValidationErrors } = require('../middleware/validator');

// All routes require authentication
router.use(authenticate);

// Validation rules
const feedbackValidation = [
    body('feedback').isIn(['up', 'down']).withMessage('Feedback must be "up" or "down"'),
    handleValidationErrors
];

/**
 * Submit feedback for a message
 * POST /api/messages/:id/feedback
 */
router.post('/:id/feedback', feedbackValidation, submitFeedback);

/**
 * Remove feedback from a message
 * DELETE /api/messages/:id/feedback
 */
router.delete('/:id/feedback', removeFeedback);

/**
 * Get feedback statistics (admin/analytics)
 * GET /api/messages/analytics/feedback
 */
router.get('/analytics/feedback', getFeedbackStats);

module.exports = router;
