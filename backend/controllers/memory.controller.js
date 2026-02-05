/**
 * Memory Controller (Prisma Refactor)
 * Handles memory storage, retrieval, and statistics
 */

const prisma = require('../config/prisma');
const { getMemoryStats, retrieveRelevantMemories, deleteUserMemories } = require('../services/vectorService');
const { toMongo } = require('../utils/formatter');

/**
 * Get user's memory statistics
 */
async function getStats(req, res, next) {
    try {
        const stats = await getMemoryStats(req.user.userId);

        // Also get count from Postgres for verification (scoped to current user)
        const dbCount = await prisma.message.count({
            where: {
                chat: { userId: req.user.userId },
                NOT: { vectorId: null }
            }
        });

        res.json({
            ...stats,
            dbCount,
        });
    } catch (error) {
        console.error('Get memory stats error:', error);
        next(error);
    }
}

/**
 * Search memories manually (for debugging/testing)
 */
async function searchMemories(req, res, next) {
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
}

/**
 * Delete all user memories (privacy feature)
 */
async function deleteAllMemories(req, res, next) {
    try {
        // Delete from vector database
        const deletedCount = await deleteUserMemories(req.user.userId);

        // Clear vectorId from Postgres messages
        const result = await prisma.message.updateMany({
            where: {
                chat: { userId: req.user.userId },
                NOT: { vectorId: null }
            },
            data: {
                vectorId: null,
                isMemory: false
            }
        });

        res.json({
            message: 'All memories deleted successfully',
            vectorDbDeleted: deletedCount,
            mongoDbCleared: result.count,
        });
    } catch (error) {
        console.error('Delete memories error:', error);
        next(error);
    }
}

/**
 * Mark message as important memory
 */
async function toggleMemoryStatus(req, res, next) {
    try {
        const { id } = req.params;

        // Find message and verify ownership through chat
        const message = await prisma.message.findUnique({
            where: { id },
            include: { chat: { select: { userId: true } } }
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Security: Verify the message belongs to the current user
        if (message.chat.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Toggle memory flag
        const updatedMessage = await prisma.message.update({
            where: { id },
            data: { isMemory: !message.isMemory }
        });

        res.json({
            messageId: updatedMessage.id,
            isMemory: updatedMessage.isMemory,
        });
    } catch (error) {
        console.error('Mark memory error:', error);
        next(error);
    }
}

/**
 * Get recent memories (last 10)
 */
async function getRecentMemories(req, res, next) {
    try {
        // Need to join Chat to filter by userId if we want to be safe, 
        // OR we trust the caller (but safer to filter by user ownership via Chat)
        const recentMessages = await prisma.message.findMany({
            where: {
                chat: { userId: req.user.userId },
                NOT: { vectorId: null }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                content: true,
                role: true,
                createdAt: true,
                isMemory: true
            }
        });

        res.json({
            count: recentMessages.length,
            memories: toMongo(recentMessages),
        });
    } catch (error) {
        console.error('Get recent memories error:', error);
        next(error);
    }
}

module.exports = {
    getStats,
    searchMemories,
    deleteAllMemories,
    toggleMemoryStatus,
    getRecentMemories
};
