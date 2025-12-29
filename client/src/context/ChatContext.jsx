/**
 * Chat Context
 * Manages chat list and active chat state
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const fetchChats = async () => {
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
  };

  // Create new chat
  const createChat = async (title = 'New Conversation') => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const data = await response.json();
        setChats([data.chat, ...chats]);
        setActiveChat(data.chat);
        setMessages([]);
        return data.chat;
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
    return null;
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
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send message to active chat
  const sendMessage = async (content) => {
    if (!activeChat || !token) return;

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
        setMessages([...messages, data.userMessage, data.assistantMessage]);
        
        // Update chat in list
        setChats(
          chats.map((c) =>
            c._id === activeChat._id ? data.chat : c
          )
        );
        setActiveChat(data.chat);
        
        return data.assistantMessage.content;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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

  // Load chats on mount
  useEffect(() => {
    if (token) {
      fetchChats();
    } else {
      setChats([]);
      setActiveChat(null);
      setMessages([]);
    }
  }, [token]);

  const value = {
    chats,
    activeChat,
    messages,
    loading,
    fetchChats,
    createChat,
    loadChat,
    sendMessage,
    deleteChat,
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
