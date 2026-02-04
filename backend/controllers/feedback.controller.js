/**
 * Feedback Controller
 * Handles message feedback (thumbs up/down)
 */

const Message = require('../models/message.model');
const Chat = require('../models/chat.model');

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

        // Find message
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Verify user owns the chat
        const chat = await Chat.findOne({ _id: message.chatId, userId: req.user.userId });
        if (!chat) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Only allow feedback on assistant messages
        if (message.role !== 'assistant') {
            return res.status(400).json({ error: 'Can only provide feedback on assistant messages' });
        }

        // Update feedback
        message.feedback = feedback;
        message.feedbackAt = new Date();
        await message.save();

        res.json({
            messageId: message._id,
            feedback: message.feedback,
            feedbackAt: message.feedbackAt,
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

        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Verify user owns the chat
        const chat = await Chat.findOne({ _id: message.chatId, userId: req.user.userId });
        if (!chat) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Remove feedback
        message.feedback = null;
        message.feedbackAt = null;
        await message.save();

        res.json({
            messageId: message._id,
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
        const totalMessages = await Message.countDocuments({ role: 'assistant' });
        const upvotes = await Message.countDocuments({ feedback: 'up' });
        const downvotes = await Message.countDocuments({ feedback: 'down' });
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
