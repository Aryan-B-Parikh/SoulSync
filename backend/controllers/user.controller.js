/**
 * User Controller (Prisma Refactor)
 * Handles user profile and personality settings
 */

const prisma = require('../config/prisma');
const { PERSONALITY_PROMPTS } = require('../services/aiService');

/**
 * Get current user's personality setting
 */
async function getPersonality(req, res, next) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { personality: true }
        });

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

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: { personality },
            select: { personality: true }
        });

        res.json({
            message: 'Personality updated successfully',
            personality: user.personality,
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        next(error);
    }
}

/**
 * Record that the user has consented to the AI training data policy.
 * Called once from the frontend Consent Gate modal.
 */
async function giveConsent(req, res, next) {
    try {
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { hasConsented: true },
        });

        res.json({ message: 'Consent recorded. Thank you.' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        next(error);
    }
}

module.exports = {
    getPersonality,
    updatePersonality,
    giveConsent,
};
