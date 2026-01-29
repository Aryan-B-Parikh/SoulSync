/**
 * User Personality Routes
 * GET /api/user/personality - Get current personality setting
 * PUT /api/user/personality - Update personality preference
 */

const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user.model');
const authenticate = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');
const { PERSONALITY_PROMPTS } = require('../services/aiService');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get current user's personality setting
 */
router.get('/personality', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            personality: user.personality || 'reflective',
            availablePersonalities: {
                reflective: {
                    name: '🌙 Deep & Reflective',
                    description: 'Introspective, philosophical, and contemplative',
                    prompt: PERSONALITY_PROMPTS.reflective,
                },
                supportive: {
                    name: '🌤 Supportive Friend',
                    description: 'Warm, encouraging, and validating',
                    prompt: PERSONALITY_PROMPTS.supportive,
                },
                creative: {
                    name: '✨ Creative & Poetic',
                    description: 'Imaginative, metaphorical, and artistic',
                    prompt: PERSONALITY_PROMPTS.creative,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Update user's personality preference
 */
router.put(
    '/personality',
    [
        body('personality')
            .isIn(['reflective', 'supportive', 'creative'])
            .withMessage('Invalid personality type'),
        handleValidationErrors,
    ],
    async (req, res, next) => {
        try {
            const { personality } = req.body;

            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            user.personality = personality;
            await user.save();

            res.json({
                message: 'Personality updated successfully',
                personality: user.personality,
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
