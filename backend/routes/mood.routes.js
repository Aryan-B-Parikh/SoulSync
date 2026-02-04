/**
 * Mood Analytics Routes
 * Endpoints for retrieving mood statistics and trends
 */

const express = require('express');
const { param, query } = require('express-validator');
const authenticate = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');
const {
    getMoodSummary,
    getCalendarData,
    getTrends,
    getAnalytics
} = require('../controllers/mood.controller');

const router = express.Router();

// Middleware
router.use(authenticate);

// Validation
const calendarValidation = [
    param('month').matches(/^\d{4}-\d{2}$/).withMessage('Invalid month format. Use YYYY-MM'),
    handleValidationErrors
];

const trendsValidation = [
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
    handleValidationErrors
];

const analyticsValidation = [
    query('startDate').optional().isISO8601().withMessage('Invalid startDate format'),
    query('endDate').optional().isISO8601().withMessage('Invalid endDate format'),
    handleValidationErrors
];

/**
 * GET /api/mood/summary
 * Get overall mood summary
 */
router.get('/summary', getMoodSummary);

/**
 * GET /api/mood/calendar/:month
 * Get daily mood data for calendar view
 */
router.get('/calendar/:month', calendarValidation, getCalendarData);

/**
 * GET /api/mood/trends
 * Get mood trend data for charts
 */
router.get('/trends', trendsValidation, getTrends);

/**
 * GET /api/mood/analytics
 * Get comprehensive mood analytics
 */
router.get('/analytics', analyticsValidation, getAnalytics);

module.exports = router;
