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
    <div className="flex items-end gap-3 bg-black/40 border border-white/10 rounded-2xl p-3 shadow-2xl shadow-emerald-500/10">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
        className="flex-1 rounded-xl bg-transparent text-slate-100 placeholder:text-slate-500 px-4 py-3 border border-white/10 focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-300/60 transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder={placeholder || "What’s on your mind today?"}
        maxLength={2000}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="px-4 py-3 rounded-xl bg-emerald-500 text-slate-900 font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 active:translate-y-[1px] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        ⮕
      </button>
    </div>
  );
};

export default MessageInput;
