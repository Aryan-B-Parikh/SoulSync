/**
 * MessageInput Component
 * Text input area with send button for user messages
 */

import React from 'react';

const MessageInput = ({ value, onChange, onSend, disabled, placeholder }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
        className="flex-1 rounded-xl border border-teal-500 bg-[#1e1e20] text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder={placeholder || "What's on your mind, darling?"}
        maxLength={2000}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-500"
        aria-label="Send message"
      >
        ➤
      </button>
    </div>
  );
};

export default MessageInput;
