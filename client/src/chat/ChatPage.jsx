/**
 * Authenticated Chat Page
 * Main chat interface with sidebar
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ChatList from './ChatList';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import LoadingIndicator from '../components/LoadingIndicator';

function ChatPage() {
  const { user, logout } = useAuth();
  const { activeChat, messages, loading, sendMessage, createChat } = useChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    // Create chat if none active
    if (!activeChat) {
      await createChat();
    }

    setError('');
    setSending(true);

    try {
      await sendMessage(input);
      setInput('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0e0e10]">
      {/* Sidebar */}
      <ChatList />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#1a1a1d] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif text-gray-100">
              {activeChat?.title || 'SoulSync AI'}
            </h1>
            {user && (
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            )}
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingIndicator />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h2 className="text-2xl font-serif text-gray-100 mb-4">
                Start a conversation
              </h2>
              <p className="text-gray-400 max-w-md">
                I'm SoulSync, your thoughtful AI companion. Ask me anything or
                share what's on your mind.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  role={msg.role}
                  content={msg.content}
                />
              ))}
              {sending && <LoadingIndicator />}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-700 px-6 py-4 bg-[#1a1a1d]">
          <div className="max-w-3xl mx-auto">
            {error && (
              <div className="mb-2 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <MessageInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSend={handleSend}
              disabled={sending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
