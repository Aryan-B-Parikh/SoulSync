/**
 * Custom hook for managing chat state and interactions
 */

import { useState, useCallback } from 'react';
import { sendChatMessage, validateMessage } from '../utils/api';
import { ERROR_MESSAGES } from '../config/constants';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(async () => {
    // Validate input
    const validation = validateMessage(input);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    // Clear error and add user message
    setError(null);
    const userMessage = { sender: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Format messages for API
      const formattedMessages = newMessages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      // Get AI response
      const botReply = await sendChatMessage(formattedMessages);
      
      // Add bot message
      setMessages([...newMessages, { sender: 'bot', text: botReply }]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err.message || ERROR_MESSAGES.NETWORK_ERROR;
      
      // Add error message as bot response
      setMessages([
        ...newMessages,
        { sender: 'bot', text: errorMessage, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, messages]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((value) => {
    setInput(value);
    if (error) setError(null);
  }, [error]);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    input,
    loading,
    error,
    sendMessage,
    handleInputChange,
    setInput,
    clearMessages,
  };
};
