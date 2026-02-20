/**
 * AI Service - Handles interactions with AI providers
 * Supports Groq (primary) and HuggingFace (fallback)
 * Note: Uses Node 18+ built-in fetch (no node-fetch required)
 */


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
 * Call Groq API for streaming chat completion
 * @param {Array} messages - Conversation history
 * @param {string} apiKey - Groq API key
 * @param {string} personality - Personality mode
 * @param {string} systemPrompt - Full system prompt including memories
 * @yields {string} Response chunks
 */
async function* callGroqAPIStreaming(messages, apiKey, personality, systemPrompt) {
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
 * Helper function to format time ago
 * @param {string} timestamp - ISO timestamp
 * @returns {string} - Human-readable time ago
 */
function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}

/**
 * Generate streaming AI response with personality and memory context
 * @param {Array} messages - Chat history
 * @param {Object} config - API configuration
 * @param {string} personality - Personality mode
 * @param {Array} memories - Relevant memories from vector DB
 * @returns {AsyncGenerator} - Async generator yielding response chunks
 */
async function* generateStreamingResponse(messages, config, personality = 'reflective', memories = []) {
  try {
    if (!config.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    // Build memory context if memories exist
    let memoryContext = '';
    if (memories && memories.length > 0) {
      const memoryList = memories
        .map((m, i) => {
          const timeAgo = getTimeAgo(m.timestamp);
          return `${i + 1}. ${m.content} (${timeAgo})`;
        })
        .join('\n');

      memoryContext = `\n\nRelevant past memories (use only if contextually appropriate):\n${memoryList}`;
    }

    // Combine personality prompt with memory context
    const systemPrompt = `${PERSONALITY_PROMPTS[personality]}${memoryContext}`;

    yield* callGroqAPIStreaming(messages, config.groqApiKey, personality, systemPrompt);
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
