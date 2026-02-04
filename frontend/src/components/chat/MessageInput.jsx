import React, { useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const MessageInput = ({ value, onChange, onSend, disabled, placeholder }) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; // Set new height, max 120px
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex items-end gap-3 glass-strong rounded-3xl p-2 pl-6 shadow-2xl animate-slide-up relative z-20">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
        className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-500 py-3 focus:outline-none resize-none overflow-hidden text-base disabled:opacity-50"
        placeholder={placeholder || "What's on your mind today?"}
        style={{ minHeight: '48px' }}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5 shrink-0"
        aria-label="Send message"
      >
        <Sparkles
          className={`w-5 h-5 text-violet-400 transition-transform duration-500 ${disabled ? '' : 'group-hover:rotate-180'}`}
        />
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
};

export default MessageInput;
