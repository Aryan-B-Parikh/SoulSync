/**
 * Production-Ready ML Sentiment Service
 * Uses trained NLP.js model for 90%+ accuracy
 */

const { NlpManager } = require('node-nlp');
const path = require('path');

// Singleton manager instance
let manager = null;
let isLoaded = false;

/**
 * Load the trained ML model (call once on server startup)
 */
async function loadModel() {
    if (isLoaded) {
        return manager;
    }

    const modelPath = path.join(__dirname, '../../ml/models/sentiment-model.nlp');

    console.log('[ML Sentiment] Loading trained model...');
    manager = new NlpManager({ languages: ['en'] });

    try {
        await manager.load(modelPath);
        isLoaded = true;
        console.log('[ML Sentiment] Model loaded successfully ✅');
        return manager;
    } catch (err) {
        console.error('[ML Sentiment] Failed to load model:', err.message);
        console.error('[ML Sentiment] Train the model first: node backend/scripts/train_ml_model.js');
        throw err;
    }
}

/**
 * Analyze sentiment using ML model
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} Sentiment analysis result
 */
async function analyzeSentimentML(text) {
    if (!text || typeof text !== 'string') {
        return {
            score: 0,
            comparative: 0,
            mood: 'neutral',
            confidence: 0,
            method: 'ml'
        };
    }

    // Ensure model is loaded
    if (!isLoaded) {
        await loadModel();
    }

    // Process with NLP.js
    const result = await manager.process('en', text);

    const mood = result.intent || 'neutral';
    const confidence = Math.round((result.score || 0) * 100);

    // Map to our score format for consistency
    const scoreMap = {
        'very_positive': 5,
        'positive': 2,
        'neutral': 0,
        'negative': -2,
        'very_negative': -5
    };

    const score = scoreMap[mood] || 0;
    const comparative = score / 10; // Normalize to -0.5 to 0.5 range

    return {
        score,
        comparative,
        mood,
        confidence,
        method: 'ml',
        classifications: result.classifications || []
    };
}

/**
 * Get mood emoji
 */
function getMoodEmoji(mood) {
    const emojiMap = {
        very_positive: '😊',
        positive: '🙂',
        neutral: '😐',
        negative: '😔',
        very_negative: '😢'
    };
    return emojiMap[mood] || '😐';
}

/**
 * Get mood color
 */
function getMoodColor(mood) {
    const colorMap = {
        very_positive: '#10b981',
        positive: '#84cc16',
        neutral: '#94a3b8',
        negative: '#f59e0b',
        very_negative: '#ef4444'
    };
    return colorMap[mood] || '#94a3b8';
}

/**
 * Analyze multiple messages
 */
async function analyzeMultipleML(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return {
            averageScore: 0,
            averageComparative: 0,
            dominantMood: 'neutral',
            moodDistribution: {},
            method: 'ml'
        };
    }

    const analyses = await Promise.all(messages.map(msg => analyzeSentimentML(msg)));
    const totalScore = analyses.reduce((sum, a) => sum + a.score, 0);
    const totalComparative = analyses.reduce((sum, a) => sum + a.comparative, 0);

    // Mood distribution
    const moodDistribution = analyses.reduce((dist, a) => {
        dist[a.mood] = (dist[a.mood] || 0) + 1;
        return dist;
    }, {});

    // Dominant mood
    const dominantMood = Object.entries(moodDistribution)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    return {
        totalMessages: messages.length,
        averageScore: totalScore / messages.length,
        averageComparative: totalComparative / messages.length,
        dominantMood,
        moodDistribution,
        analyses,
        method: 'ml'
    };
}

module.exports = {
    loadModel,
    analyzeSentimentML,
    getMoodEmoji,
    getMoodColor,
    analyzeMultipleML
};
