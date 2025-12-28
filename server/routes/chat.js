/**
 * Chat Routes
 * Handles chat-related API endpoints
 */

const express = require('express');
const { generateResponse, validateMessages } = require('../services/aiService');
const { validateChatRequest } = require('../middleware/validator');

const router = express.Router();

/**
 * POST /api/chat
 * Send a message and receive AI response
 */
router.post('/chat', validateChatRequest, async (req, res, next) => {
  try {
    const { messages } = req.body;
    const config = req.app.get('config');

    // Validate message format
    if (!validateMessages(messages)) {
      return res.status(400).json({
        error: 'Invalid message format',
      });
    }

    // Generate AI response
    const response = await generateResponse(messages, config);

    res.json({ message: response });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/chat-fallback
 * Fallback endpoint with mock responses for testing
 */
router.post('/chat-fallback', validateChatRequest, async (req, res, next) => {
  try {
    const { messages } = req.body;
    const config = req.app.get('config');

    // Try real AI first
    try {
      const response = await generateResponse(messages, config);
      return res.json({ message: response });
    } catch (apiError) {
      // Fall back to mock responses
      console.warn('Using mock responses:', apiError.message);
      
      const mockResponses = [
        "I hear you, dear soul. Sometimes the quietest moments hold the deepest wisdom. 🌙",
        "Your thoughts are like ripples on still water - each one matters. Tell me more. 💭",
        "In the garden of consciousness, every feeling is a flower worthy of attention. 🌸",
        "The heart speaks in whispers, but I'm here to listen to every word. ✨",
        "Your inner world is vast and beautiful. What calls to you today? 🕊️",
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ message: randomResponse });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
