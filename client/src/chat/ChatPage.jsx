/**
 * Authenticated Chat Page
 * Main chat interface with sidebar
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { API_CONFIG } from '../config/constants';
import ChatList from './ChatList';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import LoadingIndicator from '../components/LoadingIndicator';
import TypingIndicator from '../components/TypingIndicator';
import UserProfile from '../components/UserProfile';

function ChatPage() {
  const { user, logout, token } = useAuth();
  const { activeChat, messages, loading, sendMessage, createChat, fetchChats, loadChat, renameChat } = useChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameSuccess, setRenameSuccess] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const messageContent = input;
    setInput(''); // Clear input immediately
    setError('');
    setSending(true);

    try {
      // If no active chat, create one and send message directly
      if (!activeChat) {
        const newChat = await createChat();
        if (!newChat) {
          setError('Failed to create chat. Please try again.');
          setInput(messageContent);
          setSending(false);
          return;
        }
        
        // Send message using the new chat ID directly
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/chats/${newChat._id}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: messageContent }),
          }
        );

        if (response.ok) {
          await loadChat(newChat._id); // Load chat with new messages
        } else {
          throw new Error('Failed to send message');
        }
      } else {
        // Use existing chat
        await sendMessage(messageContent);
      }
    } catch (err) {
      console.error('Send error:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      setInput(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleRename = async () => {
    if (!renameValue.trim() || !activeChat) return;

    try {
      await renameChat(activeChat._id, renameValue);
      setIsRenaming(false);
      setRenameSuccess(true);
      setTimeout(() => setRenameSuccess(false), 1500);
    } catch (err) {
      console.error('Rename error:', err);
      setError('Failed to rename chat. Please try again.');
    }
  };

  const startRename = () => {
    if (activeChat) {
      setRenameValue(activeChat.title);
      setIsRenaming(true);
    }
  };

  const getLastActive = () => {
    if (!activeChat) return '';
    const date = new Date(activeChat.updatedAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-[#0b0c0f]">
      {/* Sidebar */}
      <ChatList />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-white/5 via-transparent to-transparent">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-3 border-b border-white/5 bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-transparent backdrop-blur-lg flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setIsRenaming(false);
                  }}
                  onBlur={handleRename}
                  maxLength={60}
                  autoFocus
                  className="bg-transparent border-b border-emerald-400/50 text-lg font-semibold text-slate-100 focus:outline-none w-full max-w-md"
                  placeholder="Name this chat..."
                />
                <span className="text-xs text-slate-400">{renameValue.length}/60</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-lg font-semibold text-slate-50 tracking-tight truncate">
                  {activeChat?.title || 'SoulSync AI'}
                </h1>
                {renameSuccess && (
                  <span className="text-emerald-400 text-sm animate-pulse">✓</span>
                )}
                {activeChat && (
                  <button
                    onClick={startRename}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-300 transition-opacity"
                    aria-label="Rename chat"
                  >
                    ✏️
                  </button>
                )}
              </div>
            )}
            {activeChat && (
              <p className="text-xs text-slate-400 mt-1">{getLastActive()}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <UserProfile />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-transparent via-white/2 to-transparent">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingIndicator />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="text-3xl animate-float">🌙</div>
              <h2 className="text-2xl font-semibold text-slate-50">
                Start a gentle conversation
              </h2>
              <p className="text-slate-400 max-w-md">
                Ask anything, share how you feel, or just say hello. I’m here to listen.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  role={msg.role}
                  content={msg.content}
                  className="animate-pop"
                />
              ))}
              {sending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="sticky bottom-0 px-6 py-4 bg-black/40 border-t border-white/5 backdrop-blur-lg">
          <div className="max-w-3xl mx-auto">
            {error && (
              <div className="mb-2 text-rose-300 text-sm text-center">
                {error}
              </div>
            )}
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={sending}
              placeholder="What’s on your mind today?"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
