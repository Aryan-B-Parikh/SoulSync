/**
 * TypingIndicator Component
 * Shows animated dots when AI is thinking
 */

import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3 animate-pop">
      <div className="text-lg">🤖</div>
      <div className="bg-white/7 border border-white/10 rounded-3xl rounded-bl-sm px-4 py-3 shadow-md">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
