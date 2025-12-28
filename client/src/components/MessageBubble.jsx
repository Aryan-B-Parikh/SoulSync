/**
 * MessageBubble Component
 * Displays a single chat message with appropriate styling
 */

import React from 'react';

const MessageBubble = ({ message }) => {
  const { sender, text, isError } = message;
  const isUser = sender === 'user';

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      } animate-slide-up`}
    >
      {!isUser && <div className="text-xl">🤖</div>}
      <div
        className={`
          p-4 rounded-3xl shadow-md max-w-[80%] text-sm whitespace-pre-wrap
          ${
            isUser
              ? 'bg-teal-600 text-white rounded-br-none'
              : isError
              ? 'bg-red-900/30 text-red-200 border border-red-700 rounded-bl-none'
              : 'bg-gray-800 text-gray-100 rounded-bl-none'
          }
        `}
      >
        {text}
      </div>
      {isUser && <div className="text-xl">👤</div>}
    </div>
  );
};

export default MessageBubble;
