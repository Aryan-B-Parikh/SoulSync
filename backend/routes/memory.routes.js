/**
 * Memory Routes
 * API endpoints for memory management and insights
 */

const express = require('express');
const { query } = require('express-validator');
const authenticate = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');
const {
    getStats,
    searchMemories,
    deleteAllMemories,
    toggleMemoryStatus,
    getRecentMemories
} = require('../controllers/memory.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation
const searchValidation = [
    query('query').trim().notEmpty().withMessage('Query parameter is required'),
    handleValidationErrors
];

/**
 * Get user's memory statistics
 * GET /api/memory/stats
 */
router.get('/stats', getStats);

/**
 * Search memories manually
 * GET /api/memory/search?query=hiking&limit=5
 */
router.get('/search', searchValidation, searchMemories);

/**
 * Delete all user memories
 * DELETE /api/memory/all
 */
router.delete('/all', deleteAllMemories);

/**
 * Mark message as important memory
 * POST /api/memory/messages/:id/mark-memory
 * Note: Fixed path to match logical structure, updated from inline logic
 */
router.post('/messages/:id/mark-memory', toggleMemoryStatus);

/**
 * Get recent memories
 * GET /api/memory/recent
 */
router.get('/recent', getRecentMemories);

module.exports = router;
