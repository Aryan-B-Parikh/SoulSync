/**
 * AI Service - Handles interactions with AI providers
 * Supports Groq (primary) and HuggingFace (fallback)
 */

const fetch = require('node-fetch');

const AI_CONFIG = {
  SYSTEM_PROMPT: "You're SoulSync, a sophisticated AI confidante — wise, thoughtful, calm, and caring. Respond with empathy, depth, and poetic insight. Keep responses thoughtful but concise.",
  MODEL: 'llama-3.3-70b-versatile',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
};

/**
 * Call Groq API for chat completion
 * @param {Array} messages - Conversation history
 * @param {string} apiKey - Groq API key
 * @returns {Promise<string>} AI response
 */
async function callGroqAPI(messages, apiKey) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.MODEL,
      messages: [
        { role: 'system', content: AI_CONFIG.SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Groq API error');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I'm pondering that... 🧘‍♀️";
}

/**
 * Call HuggingFace API as fallback
 * @param {Array} messages - Conversation history
 * @param {string} apiKey - HuggingFace API key
 * @returns {Promise<string>} AI response
 */
async function callHuggingFaceAPI(messages, apiKey) {
  const userMessage = messages[messages.length - 1]?.content || '';
  
  const response = await fetch(
    'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: userMessage,
        parameters: {
          max_length: AI_CONFIG.MAX_TOKENS,
          temperature: AI_CONFIG.TEMPERATURE,
          do_sample: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'HuggingFace API error');
  }

  const data = await response.json();
  return data[0]?.generated_text || "I'm pondering that... 🧘‍♀️";
}

/**
 * Generate AI response with fallback support
 * @param {Array} messages - Conversation messages
 * @param {Object} config - API configuration
 * @returns {Promise<string>} AI response
 */
async function generateResponse(messages, config) {
  try {
    // Try Groq API first
    if (config.groqApiKey) {
      return await callGroqAPI(messages, config.groqApiKey);
    }

    // Fall back to HuggingFace if available
    if (config.huggingfaceApiKey) {
      console.warn('Using HuggingFace fallback');
      return await callHuggingFaceAPI(messages, config.huggingfaceApiKey);
    }

    throw new Error('No API keys configured');
  } catch (error) {
    console.error('AI Service error:', error.message);
    throw error;
  }
}

/**
 * Validate message format
 * @param {Array} messages - Messages to validate
 * @returns {boolean} True if valid
 */
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return false;
  }

  return messages.every(
    msg =>
      msg &&
      typeof msg === 'object' &&
      typeof msg.role === 'string' &&
      typeof msg.content === 'string'
  );
}

module.exports = {
  generateResponse,
  validateMessages,
  AI_CONFIG,
};
