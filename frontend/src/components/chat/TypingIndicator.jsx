import React from 'react';
import { Sparkles } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-4 animate-fade-in pl-1">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-violet-900/50 flex items-center justify-center border border-white/10 shrink-0 mt-1">
        <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
      </div>

      <div className="flex items-center h-8 gap-1.5 px-2">
        <div className="w-1.5 h-1.5 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1.5 h-1.5 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
