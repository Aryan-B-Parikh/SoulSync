/**
 * Input Validation Middleware
 * Validates and sanitizes user input
 */

/**
 * Sanitize text input
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  // Remove potentially harmful characters
  return text
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 2000); // Limit length
}

/**
 * Validate chat request body
 */
function validateChatRequest(req, res, next) {
  const { messages } = req.body;

  // Check if messages exist
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: 'Invalid request: messages array is required',
    });
  }

  // Check if messages array is not empty
  if (messages.length === 0) {
    return res.status(400).json({
      error: 'Invalid request: messages array cannot be empty',
    });
  }

  // Validate each message
  const sanitizedMessages = messages.map(msg => {
    if (!msg || typeof msg !== 'object') {
      throw new Error('Invalid message format');
    }

    if (!msg.role || !msg.content) {
      throw new Error('Message must have role and content');
    }

    if (!['user', 'assistant', 'system'].includes(msg.role)) {
      throw new Error('Invalid message role');
    }

    return {
      role: msg.role,
      content: sanitizeText(msg.content),
    };
  });

  // Replace original messages with sanitized version
  req.body.messages = sanitizedMessages;
  next();
}

module.exports = {
  validateChatRequest,
  sanitizeText,
};
