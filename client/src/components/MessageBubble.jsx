/**
 * MessageBubble Component
 * Displays a single chat message with appropriate styling
 */

import React from 'react';

// Renders a single message bubble for user or assistant
const MessageBubble = ({ role, content, isError, className = '' }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      {!isUser && <div className="text-lg">🤖</div>}
      <div
        className={`p-4 rounded-3xl max-w-[80%] text-sm whitespace-pre-wrap shadow-lg ${
          isUser
            ? 'bg-emerald-500 text-slate-900 rounded-br-md shadow-emerald-500/25'
            : isError
            ? 'bg-rose-500/15 text-rose-100 border border-rose-400/50 rounded-bl-md'
            : 'bg-white/5 text-slate-100 border border-white/10 rounded-bl-md shadow-black/30'
        }`}
      >
        {content}
      </div>
      {isUser && <div className="text-lg">👤</div>}
    </div>
  );
};

export default MessageBubble;
