/**
 * Mood Analytics Controller (Prisma Refactor)
 * Handles retrieval of mood statistics and trends
 */

const prisma = require('../config/prisma');

/**
 * Helper: Calculate stats from array of messages with sentiment
 */
function calculateMoodStats(messages) {
    if (!messages.length) return null;

    let totalScore = 0;
    let totalComparative = 0;
    const moodCounts = {};

    messages.forEach(msg => {
        totalScore += msg.sentimentScore;
        totalComparative += msg.sentimentComparative;
        const mood = msg.sentimentMood || 'neutral';
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    const dominantMood = Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    return {
        count: messages.length,
        avgScore: totalScore / messages.length,
        avgComparative: totalComparative / messages.length,
        moodCounts,
        dominantMood
    };
}

/**
 * Get overall mood summary for the authenticated user
 */
async function getMoodSummary(req, res, next) {
    try {
        // Fetch all user messages in one query (efficient enough for <10k messages)
        const messages = await prisma.message.findMany({
            where: {
                chat: { userId: req.user.userId },
                role: 'user',
            },
            select: {
                sentimentScore: true,
                sentimentComparative: true,
                sentimentMood: true
            }
        });

        const stats = calculateMoodStats(messages);

        if (!stats) {
            return res.json({
                totalMessages: 0,
                averageScore: 0,
                averageComparative: 0,
                dominantMood: 'neutral',
                moodDistribution: {}
            });
        }

        res.json({
            totalMessages: stats.count,
            averageScore: Math.round(stats.avgScore * 100) / 100,
            averageComparative: Math.round(stats.avgComparative * 100) / 100,
            dominantMood: stats.dominantMood,
            moodDistribution: stats.moodCounts
        });
    } catch (error) {
        console.error('Error fetching mood summary:', error);
        next(error);
    }
}

/**
 * Get daily mood data for calendar view
 */
async function getCalendarData(req, res, next) {
    try {
        const { month } = req.params;
        const [year, monthNum] = month.split('-').map(Number);

        if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM.' });
        }

        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        const messages = await prisma.message.findMany({
            where: {
                chat: { userId: req.user.userId },
                role: 'user',
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                createdAt: true, // Need date for grouping
                sentimentComparative: true,
                sentimentMood: true
            }
        });

        // Group by Day (YYYY-MM-DD)
        const daysMap = {};
        messages.forEach(msg => {
            const dateStr = msg.createdAt.toISOString().split('T')[0];
            if (!daysMap[dateStr]) daysMap[dateStr] = [];
            daysMap[dateStr].push(msg);
        });

        const calendarData = Object.entries(daysMap).map(([date, msgs]) => {
            const stats = calculateMoodStats(msgs);
            return {
                date,
                mood: stats.dominantMood,
                avgComparative: Math.round(stats.avgComparative * 100) / 100,
                messageCount: stats.count,
                moodDistribution: stats.moodCounts
            };
        }).sort((a, b) => a.date.localeCompare(b.date));

        res.json({ month, days: calendarData });
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        next(error);
    }
}

/**
 * Get mood trend data for charts
 */
async function getTrends(req, res, next) {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const messages = await prisma.message.findMany({
            where: {
                chat: { userId: req.user.userId },
                role: 'user',
                createdAt: { gte: startDate }
            },
            select: {
                createdAt: true,
                sentimentScore: true,
                sentimentComparative: true,
                sentimentMood: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // Group by Day
        const daysMap = {};
        messages.forEach(msg => {
            const dateStr = msg.createdAt.toISOString().split('T')[0];
            if (!daysMap[dateStr]) daysMap[dateStr] = [];
            daysMap[dateStr].push(msg);
        });

        const trendData = Object.entries(daysMap).map(([date, msgs]) => {
            const stats = calculateMoodStats(msgs);
            return {
                date,
                avgScore: Math.round(stats.avgScore * 100) / 100,
                avgComparative: Math.round(stats.avgComparative * 100) / 100,
                messageCount: stats.count,
                moods: Object.keys(stats.moodCounts) // Just list of moods present
            };
        }).sort((a, b) => a.date.localeCompare(b.date));

        res.json({ days, trends: trendData });
    } catch (error) {
        console.error('Error fetching mood trends:', error);
        next(error);
    }
}

/**
 * Get comprehensive mood analytics for a date range
 */
async function getAnalytics(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const messages = await prisma.message.findMany({
            where: {
                chat: { userId: req.user.userId },
                role: 'user',
                createdAt: { gte: start, lte: end }
            },
            select: {
                sentimentScore: true,
                sentimentComparative: true,
                sentimentConfidence: true,
                sentimentMood: true,
                createdAt: true
            }
        });

        const stats = calculateMoodStats(messages);

        // Weekly Trends
        // Not implemented in JS version for brevity, can require advanced grouping
        // Returning basics

        const analyticsData = stats ? {
            totalMessages: stats.count,
            avgScore: stats.avgScore,
            avgComparative: stats.avgComparative,
            avgConfidence: messages.reduce((s, m) => s + m.sentimentConfidence, 0) / messages.length || 0,
            moodDistribution: Object.entries(stats.moodCounts).map(([k, v]) => ({ _id: k, count: v })) // Match old format
        } : {
            totalMessages: 0,
            avgScore: 0,
            avgComparative: 0,
            avgConfidence: 0,
            moodDistribution: []
        };

        res.json({
            period: { start, end },
            data: analyticsData // Adapted structure
        });

    } catch (error) {
        console.error('Error fetching mood analytics:', error);
        next(error);
    }
}

module.exports = {
    getMoodSummary,
    getCalendarData,
    getTrends,
    getAnalytics
};
