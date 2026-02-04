/**
 * Mood Analytics Controller
 * Handles retrieval of mood statistics and trends
 */

const Message = require('../models/message.model');

/**
 * Get overall mood summary for the authenticated user
 */
async function getMoodSummary(req, res, next) {
    try {
        const userId = req.user.userId;

        // Get all user messages with sentiment data
        const messagesWithSentiment = await Message.aggregate([
            {
                $lookup: {
                    from: 'chats',
                    localField: 'chatId',
                    foreignField: '_id',
                    as: 'chat'
                }
            },
            {
                $match: {
                    'chat.userId': userId,
                    role: 'user', // Only analyze user messages
                    'sentiment.mood': { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    totalMessages: { $sum: 1 },
                    avgScore: { $avg: '$sentiment.score' },
                    avgComparative: { $avg: '$sentiment.comparative' },
                    moodCounts: {
                        $push: '$sentiment.mood'
                    }
                }
            }
        ]);

        if (!messagesWithSentiment.length) {
            return res.json({
                totalMessages: 0,
                averageScore: 0,
                averageComparative: 0,
                dominantMood: 'neutral',
                moodDistribution: {}
            });
        }

        const data = messagesWithSentiment[0];

        // Calculate mood distribution
        const moodDistribution = data.moodCounts.reduce((acc, mood) => {
            acc[mood] = (acc[mood] || 0) + 1;
            return acc;
        }, {});

        // Find dominant mood
        const dominantMood = Object.entries(moodDistribution)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

        res.json({
            totalMessages: data.totalMessages,
            averageScore: Math.round(data.avgScore * 100) / 100,
            averageComparative: Math.round(data.avgComparative * 100) / 100,
            dominantMood,
            dominantMood,
            moodDistribution
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
        const userId = req.user.userId;
        const { month } = req.params;

        // Parse month (format: YYYY-MM)
        const [year, monthNum] = month.split('-').map(Number);

        // Basic validation
        if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM.' });
        }

        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        // Get daily mood aggregations
        const dailyMoods = await Message.aggregate([
            {
                $lookup: {
                    from: 'chats',
                    localField: 'chatId',
                    foreignField: '_id',
                    as: 'chat'
                }
            },
            {
                $match: {
                    'chat.userId': userId,
                    role: 'user',
                    createdAt: { $gte: startDate, $lte: endDate },
                    'sentiment.mood': { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    avgComparative: { $avg: '$sentiment.comparative' },
                    moods: { $push: '$sentiment.mood' },
                    messageCount: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Process daily data
        const calendarData = dailyMoods.map(day => {
            const moodCounts = day.moods.reduce((acc, mood) => {
                acc[mood] = (acc[mood] || 0) + 1;
                return acc;
            }, {});

            const dominantMood = Object.entries(moodCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

            return {
                date: day._id,
                mood: dominantMood,
                avgComparative: Math.round(day.avgComparative * 100) / 100,
                messageCount: day.messageCount,
                moodDistribution: moodCounts
            };
        });

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
        const userId = req.user.userId;
        const days = parseInt(req.query.days) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get daily mood trends
        const trends = await Message.aggregate([
            {
                $lookup: {
                    from: 'chats',
                    localField: 'chatId',
                    foreignField: '_id',
                    as: 'chat'
                }
            },
            {
                $match: {
                    'chat.userId': userId,
                    role: 'user',
                    createdAt: { $gte: startDate },
                    'sentiment.mood': { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    avgScore: { $avg: '$sentiment.score' },
                    avgComparative: { $avg: '$sentiment.comparative' },
                    messageCount: { $sum: 1 },
                    moods: { $push: '$sentiment.mood' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const trendData = trends.map(day => ({
            date: day._id,
            avgScore: Math.round(day.avgScore * 100) / 100,
            avgComparative: Math.round(day.avgComparative * 100) / 100,
            messageCount: day.messageCount,
            moods: day.moods
        }));

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
        const userId = req.user.userId;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const analytics = await Message.aggregate([
            {
                $lookup: {
                    from: 'chats',
                    localField: 'chatId',
                    foreignField: '_id',
                    as: 'chat'
                }
            },
            {
                $match: {
                    'chat.userId': userId,
                    role: 'user',
                    createdAt: { $gte: start, $lte: end },
                    'sentiment.mood': { $exists: true }
                }
            },
            {
                $facet: {
                    overview: [
                        {
                            $group: {
                                _id: null,
                                totalMessages: { $sum: 1 },
                                avgScore: { $avg: '$sentiment.score' },
                                avgComparative: { $avg: '$sentiment.comparative' },
                                avgConfidence: { $avg: '$sentiment.confidence' }
                            }
                        }
                    ],
                    moodBreakdown: [
                        {
                            $group: {
                                _id: '$sentiment.mood',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    weeklyTrends: [
                        {
                            $group: {
                                _id: {
                                    $week: '$createdAt'
                                },
                                avgComparative: { $avg: '$sentiment.comparative' }
                            }
                        },
                        {
                            $sort: { _id: 1 }
                        }
                    ]
                }
            }
        ]);

        res.json({
            period: { start, end },
            data: analytics[0]
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
