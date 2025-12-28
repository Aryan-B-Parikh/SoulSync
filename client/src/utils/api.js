/**
 * API utility functions for making HTTP requests
 */

import { API_CONFIG, ERROR_MESSAGES } from '../config/constants';

/**
 * Send a chat message to the API
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<string>} Bot response message
 */
export const sendChatMessage = async (messages) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(ERROR_MESSAGES.RATE_LIMIT_ERROR);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.message || "I'm pondering that... 🧘‍♀️";
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    
    console.error('Chat API error:', error);
    throw error;
  }
};

/**
 * Validate message input
 * @param {string} message - Message to validate
 * @returns {Object} Validation result with isValid and error
 */
export const validateMessage = (message) => {
  if (!message || !message.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
    };
  }

  if (message.length > 2000) {
    return {
      isValid: false,
      error: 'Please keep your message under 2000 characters.',
    };
  }

  return { isValid: true };
};
