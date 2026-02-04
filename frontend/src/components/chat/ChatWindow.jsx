/**
 * ChatWindow Component
 * Displays the conversation history with scrollable container
 */

import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import LoadingIndicator from '../common/LoadingIndicator';

const ChatWindow = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <main className="flex-1 overflow-y-auto px-4 py-2 animate-slide-up">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <div className="text-5xl mb-4">🌙</div>
            <p className="text-lg italic">
              Begin your conversation with SoulSync...
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}

        {loading && <LoadingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </main>
  );
};

export default ChatWindow;
