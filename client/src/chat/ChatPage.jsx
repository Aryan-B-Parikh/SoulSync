/**
 * Authenticated Chat Page
 * Main chat interface with sidebar
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { API_CONFIG } from '../config/constants';
import ChatList from './ChatList';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import LoadingIndicator from '../components/LoadingIndicator';

function ChatPage() {
  const { user, logout, token } = useAuth();
  const { activeChat, messages, loading, sendMessage, createChat, fetchChats, loadChat } = useChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="flex h-screen bg-[#0b0c0f]">
      {/* Sidebar */}
      <ChatList />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-white/5 via-transparent to-transparent">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-transparent flex items-center justify-between backdrop-blur-lg">
          <div>
            <h1 className="text-xl font-semibold text-slate-50 tracking-tight">
              {activeChat?.title || 'SoulSync AI'}
            </h1>
            {user && (
              <p className="text-sm text-slate-400 mt-1">{user.email}</p>
            )}
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm rounded-full border border-white/10 text-slate-200 hover:text-emerald-200 hover:border-emerald-300/50 transition-all"
          >
            Logout
          </button>
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
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  role={msg.role}
                  content={msg.content}
                  className="animate-pop"
                />
              ))}
              {sending && <LoadingIndicator />}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/5 backdrop-blur-lg">
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
