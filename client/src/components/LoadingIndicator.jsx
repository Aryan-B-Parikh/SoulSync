/**
 * LoadingIndicator Component
 * Shows typing indicator when AI is responding
 */

import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse italic">
      <span>SoulSync is responding</span>
      <div className="flex gap-1">
        <span className="animate-bounce">.</span>
        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;
