/**
 * Chat Context
 * Manages chat list and active chat state
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_CONFIG } from '../config/constants';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { token } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's chats
  const fetchChats = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  }, [token]);

  // Create new chat
  const createChat = async (title = 'New Conversation') => {
    if (!token) {
      console.error('No token available for createChat');
      return null;
    }

    try {
      console.log('Creating chat with title:', title);
      const response = await fetch(`${API_CONFIG.BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      console.log('Create chat response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Chat created successfully:', data.chat);
        setChats([data.chat, ...chats]);
        setActiveChat(data.chat);
        setMessages([]);
        return data.chat;
      } else {
        const errorData = await response.json();
        console.error('Create chat failed:', errorData);
        throw new Error(errorData.error || 'Failed to create chat');
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  };

  // Load chat messages
  const loadChat = async (chatId) => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setActiveChat(data.chat);
        setMessages(data.messages || []);
      } else {
        const error = await response.json();
        console.error('Load chat failed:', error);
        throw new Error(error.error || 'Failed to load chat');
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      alert('Failed to load chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send message to active chat
  const sendMessage = async (content) => {
    if (!activeChat || !token) {
      console.error('Cannot send message: no active chat or token');
      return;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/chats/${activeChat._id}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Use functional update to get latest messages
        setMessages((prevMessages) => [...prevMessages, data.userMessage, data.assistantMessage]);

        // Update chat in list
        setChats((prevChats) =>
          prevChats.map((c) =>
            c._id === activeChat._id ? data.chat : c
          )
        );
        setActiveChat(data.chat);

        return data.assistantMessage.content;
      } else {
        const error = await response.json();
        console.error('Send message failed:', error);
        throw new Error(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  // Send message with streaming response
  const sendStreamingMessage = async (content, onChunk) => {
    if (!activeChat || !token) {
      console.error('Cannot send message: no active chat or token');
      return;
    }

    try {
      // Add user message immediately
      const tempUserMessage = {
        _id: `temp-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      // Create temporary assistant message for streaming
      const tempAssistantId = `temp-assistant-${Date.now()}`;
      const tempAssistantMessage = {
        _id: tempAssistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, tempAssistantMessage]);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/chats/${activeChat._id}/messages/stream`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.chunk) {
                const currentFullResponse = fullResponse + data.chunk;
                fullResponse = currentFullResponse;

                // Update the streaming message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg._id === tempAssistantId
                      ? { ...msg, content: currentFullResponse }
                      : msg
                  )
                );

                // Call onChunk callback if provided
                if (onChunk) {
                  onChunk(data.chunk);
                }
              }

              if (data.done) {
                // Replace temp messages with real ones
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg._id === tempUserMessage._id) {
                      return { ...msg, _id: data.userMessageId };
                    }
                    if (msg._id === tempAssistantId) {
                      return {
                        ...msg,
                        _id: data.assistantMessageId,
                        isStreaming: false,
                      };
                    }
                    return msg;
                  })
                );

                // Update chat title if changed
                if (data.chatTitle && data.chatTitle !== activeChat.title) {
                  setActiveChat((prev) => ({ ...prev, title: data.chatTitle }));
                  setChats((prevChats) =>
                    prevChats.map((c) =>
                      c._id === activeChat._id ? { ...c, title: data.chatTitle } : c
                    )
                  );
                }
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
            }
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Failed to send streaming message:', error);
      // Remove temp messages on error
      setMessages((prev) =>
        prev.filter(
          (msg) =>
            !msg._id.startsWith('temp-')
        )
      );
      throw error;
    }
  };

  // Delete chat
  const deleteChat = async (chatId) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/chats/${chatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setChats(chats.filter((c) => c._id !== chatId));
        if (activeChat?._id === chatId) {
          setActiveChat(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  // Rename chat
  const renameChat = async (chatId, newTitle) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/chats/${chatId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update chat in list
        setChats((prevChats) =>
          prevChats.map((c) => (c._id === chatId ? data.chat : c))
        );
        // Update active chat if it's the one being renamed
        if (activeChat?._id === chatId) {
          setActiveChat(data.chat);
        }
        return data.chat;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rename chat');
      }
    } catch (error) {
      console.error('Failed to rename chat:', error);
      throw error;
    }
  };

  // Load chats on mount
  useEffect(() => {
    if (token) {
      fetchChats();
    } else {
      setChats([]);
      setActiveChat(null);
      setMessages([]);
    }
  }, [token, fetchChats]);

  const value = {
    chats,
    activeChat,
    messages,
    loading,
    fetchChats,
    createChat,
    loadChat,
    sendMessage,
    sendStreamingMessage,
    deleteChat,
    renameChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
