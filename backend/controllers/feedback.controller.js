/**
 * Feedback Controller (Prisma Refactor)
 * Handles message feedback (thumbs up/down)
 */

const prisma = require('../config/prisma');

/**
 * Submit feedback for a message
 */
async function submitFeedback(req, res, next) {
    try {
        const { id } = req.params;
        const { feedback } = req.body;

        // Validate feedback value
        if (!['up', 'down'].includes(feedback)) {
            return res.status(400).json({ error: 'Feedback must be "up" or "down"' });
        }

        // Find message to get chatId
        const message = await prisma.message.findUnique({
            where: { id },
            include: { chat: true }
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Verify user owns the chat
        // message.chat.userId is available due to include
        if (message.chat.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Only allow feedback on assistant messages
        if (message.role !== 'assistant') {
            return res.status(400).json({ error: 'Can only provide feedback on assistant messages' });
        }

        // Update feedback (string) and rating (numeric for ML pipelines)
        const updatedMessage = await prisma.message.update({
            where: { id },
            data: {
                feedback,
                feedbackAt: new Date(),
                rating: feedback === 'up' ? 1 : -1,
            }
        });

        res.json({
            messageId: updatedMessage.id,
            feedback: updatedMessage.feedback,
            feedbackAt: updatedMessage.feedbackAt,
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        next(error);
    }
}

/**
 * Remove feedback from a message
 */
async function removeFeedback(req, res, next) {
    try {
        const { id } = req.params;

        // Find message
        const message = await prisma.message.findUnique({
            where: { id },
            include: { chat: true }
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Verify user owns the chat
        if (message.chat.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Remove feedback
        const updatedMessage = await prisma.message.update({
            where: { id },
            data: {
                feedback: null,
                feedbackAt: null,
            }
        });

        res.json({
            messageId: updatedMessage.id,
            feedback: null,
        });
    } catch (error) {
        console.error('Remove feedback error:', error);
        next(error);
    }
}

/**
 * Get feedback statistics (admin/analytics)
 */
async function getFeedbackStats(req, res, next) {
    try {
        // Count all assistant messages
        const totalMessages = await prisma.message.count({
            where: { role: 'assistant' }
        });

        const upvotes = await prisma.message.count({
            where: { feedback: 'up' }
        });

        const downvotes = await prisma.message.count({
            where: { feedback: 'down' }
        });

        const noFeedback = totalMessages - upvotes - downvotes;

        const upvoteRate = totalMessages > 0 ? (upvotes / totalMessages * 100).toFixed(2) : 0;
        const downvoteRate = totalMessages > 0 ? (downvotes / totalMessages * 100).toFixed(2) : 0;

        res.json({
            totalMessages,
            upvotes,
            downvotes,
            noFeedback,
            upvoteRate: `${upvoteRate}%`,
            downvoteRate: `${downvoteRate}%`,
        });
    } catch (error) {
        console.error('Get feedback stats error:', error);
        next(error);
    }
}

module.exports = {
    submitFeedback,
    removeFeedback,
    getFeedbackStats
};
