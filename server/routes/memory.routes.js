/**
 * Memory Routes
 * API endpoints for memory management and insights
 */

const express = require('express');
const authenticate = require('../middleware/auth');
const Message = require('../models/message.model');
const { getMemoryStats, retrieveRelevantMemories, deleteUserMemories } = require('../services/vectorService');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get user's memory statistics
 * GET /api/memory/stats
 */
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await getMemoryStats(req.user.userId);

        // Also get count from MongoDB for verification
        const dbCount = await Message.countDocuments({
            vectorId: { $ne: null },
        });

        res.json({
            ...stats,
            dbCount,
        });
    } catch (error) {
        console.error('Get memory stats error:', error);
        next(error);
    }
});

/**
 * Search memories manually (for debugging/testing)
 * GET /api/memory/search?query=hiking&limit=5
 */
router.get('/search', async (req, res, next) => {
    try {
        const { query, limit = 5 } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter required' });
        }

        const memories = await retrieveRelevantMemories(
            req.user.userId,
            query,
            parseInt(limit, 10)
        );

        res.json({
            query,
            count: memories.length,
            memories,
        });
    } catch (error) {
        console.error('Search memories error:', error);
        next(error);
    }
});

/**
 * Delete all user memories (privacy feature)
 * DELETE /api/memory/all
 */
router.delete('/all', async (req, res, next) => {
    try {
        // Delete from vector database
        const deletedCount = await deleteUserMemories(req.user.userId);

        // Clear vectorId from MongoDB messages
        const result = await Message.updateMany(
            { vectorId: { $ne: null } },
            { $set: { vectorId: null, isMemory: false } }
        );

        res.json({
            message: 'All memories deleted successfully',
            vectorDbDeleted: deletedCount,
            mongoDbCleared: result.modifiedCount,
        });
    } catch (error) {
        console.error('Delete memories error:', error);
        next(error);
    }
});

/**
 * Mark message as important memory
 * POST /api/messages/:id/mark-memory
 */
router.post('/messages/:id/mark-memory', async (req, res, next) => {
    try {
        const { id } = req.params;

        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Toggle memory flag
        message.isMemory = !message.isMemory;
        await message.save();

        res.json({
            messageId: message._id,
            isMemory: message.isMemory,
        });
    } catch (error) {
        console.error('Mark memory error:', error);
        next(error);
    }
});

/**
 * Get recent memories (last 10)
 * GET /api/memory/recent
 */
router.get('/recent', async (req, res, next) => {
    try {
        const recentMessages = await Message.find({
            vectorId: { $ne: null },
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('content role createdAt isMemory');

        res.json({
            count: recentMessages.length,
            memories: recentMessages,
        });
    } catch (error) {
        console.error('Get recent memories error:', error);
        next(error);
    }
});

module.exports = router;
