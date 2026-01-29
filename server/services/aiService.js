/**
 * AI Service - Handles interactions with AI providers
 * Supports Groq (primary) and HuggingFace (fallback)
 */

const fetch = require('node-fetch');

const PERSONALITY_PROMPTS = {
  reflective: "You're SoulSync, a sophisticated AI confidante — wise, thoughtful, calm, and deeply introspective. You respond with philosophical depth, poetic insight, and gentle wisdom. You help users explore their inner world through thoughtful questions and profound observations. Keep responses contemplative yet concise.",

  supportive: "You're SoulSync, a warm and encouraging companion — empathetic, validating, and nurturing. You respond with emotional support, positive reinforcement, and genuine care. You prioritize making users feel heard, understood, and valued. Keep responses warm and uplifting yet concise.",

  creative: "You're SoulSync, an imaginative and artistic soul — poetic, metaphorical, and creatively expressive. You respond with vivid imagery, artistic analogies, and creative perspectives. You help users see their experiences through a lens of beauty and wonder. Keep responses evocative yet concise.",
};

const AI_CONFIG = {
  MODEL: 'llama-3.3-70b-versatile',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
};

/**
 * Call Groq API for chat completion
 * @param {Array} messages - Conversation history
 * @param {string} apiKey - Groq API key
 * @param {string} personality - Personality mode (reflective/supportive/creative)
 * @returns {Promise<string>} AI response
 */
async function callGroqAPI(messages, apiKey, personality = 'reflective') {
  const systemPrompt = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.reflective;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
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
 * Call Groq API with streaming support
 * @param {Array} messages - Conversation history
 * @param {string} apiKey - Groq API key
 * @param {string} personality - Personality mode (reflective/supportive/creative)
 * @returns {AsyncGenerator<string>} Yields text chunks as they arrive
 */
async function* callGroqAPIStreaming(messages, apiKey, personality = 'reflective') {
  const systemPrompt = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.reflective;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
      stream: true, // Enable streaming
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Groq API error');
  }

  // Read the stream
  const reader = response.body;
  let buffer = '';

  for await (const chunk of reader) {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;

      if (trimmed.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch (e) {
          // Skip invalid JSON
          console.warn('Failed to parse SSE chunk:', e.message);
        }
      }
    }
  }
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
 * @param {string} personality - Personality mode (reflective/supportive/creative)
 * @returns {Promise<string>} AI response
 */
async function generateResponse(messages, config, personality = 'reflective') {
  try {
    // Try Groq API first
    if (config.groqApiKey) {
      return await callGroqAPI(messages, config.groqApiKey, personality);
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
 * Generate AI response with streaming support
 * @param {Array} messages - Conversation messages
 * @param {Object} config - API configuration
 * @param {string} personality - Personality mode (reflective/supportive/creative)
 * @returns {AsyncGenerator<string>} Yields text chunks
 */
async function* generateStreamingResponse(messages, config, personality = 'reflective') {
  try {
    if (!config.groqApiKey) {
      throw new Error('Streaming requires Groq API key');
    }

    yield* callGroqAPIStreaming(messages, config.groqApiKey, personality);
  } catch (error) {
    console.error('AI Streaming error:', error.message);
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
  generateStreamingResponse,
  validateMessages,
  AI_CONFIG,
  PERSONALITY_PROMPTS,
};
