/**
 * Chat Service
 * Handles AI conversation logic with history
 */

const { generateResponse } = require('./aiService');

const SYSTEM_PROMPT = "You're SoulSync, a sophisticated AI confidante — wise, thoughtful, calm, and caring. Respond with empathy, depth, and poetic insight. Keep responses thoughtful but concise.";
const MAX_HISTORY_MESSAGES = 20;

/**
 * Generate AI response with conversation history
 * @param {Array} history - Previous messages [{role, content}]
 * @returns {Promise<string>} AI response
 */
async function generateAIResponse(history) {
  // Prepare messages for AI
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-MAX_HISTORY_MESSAGES), // Keep last N messages
  ];

  // Get API configuration
  const config = {
    groqApiKey: process.env.GROQ_API_KEY,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
  };

  // Call AI service
  const response = await generateResponse(messages, config);
  return response;
}

module.exports = {
  generateAIResponse,
};
