/**
 * User Controller
 * Handles user profile and personality settings
 */

const User = require('../models/user.model');
const { PERSONALITY_PROMPTS } = require('../services/aiService');

/**
 * Get current user's personality setting
 */
async function getPersonality(req, res, next) {
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
}

/**
 * Update user's personality preference
 */
async function updatePersonality(req, res, next) {
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

module.exports = {
    getPersonality,
    updatePersonality
};
