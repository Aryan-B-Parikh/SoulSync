import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Sparkles, User as UserIcon } from 'lucide-react';

const MessageBubble = ({ role, content, isError, isStreaming, messageId, feedback: initialFeedback, onFeedback, className = '' }) => {
  const [feedback, setFeedback] = useState(initialFeedback || null);
  const [submitting, setSubmitting] = useState(false);

  const isUser = role === 'user';

  return (
    <div className={`group flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} ${className} animate-fade-in`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-violet-900/50 flex items-center justify-center border border-white/10 shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
      )}

      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Content */}
        <div
          className={`relative text-sm whitespace-pre-wrap transition-all duration-300 ${isUser
              ? 'glass px-6 py-3 rounded-2xl rounded-tr-sm text-slate-200'
              : isError
                ? 'text-rose-300 bg-rose-900/20 px-4 py-2 rounded-lg border border-rose-500/20'
                : 'text-slate-200 font-serif text-lg leading-relaxed px-1' // AI: No bubble, larger serif text
            }`}
        >
          {content}

          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-violet-400 animate-pulse align-middle" />
          )}
        </div>

        {/* Feedback Actions (AI Only) */}
        {!isUser && !isStreaming && !isError && messageId && (
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            <button
              onClick={async () => {
                if (submitting || feedback) return;
                setSubmitting(true);
                try {
                  await onFeedback?.(messageId, 'up');
                  setFeedback('up');
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting || feedback !== null}
              className={`p-1 rounded-full hover:bg-white/5 transition-colors ${feedback === 'up' ? 'text-emerald-400' : 'text-slate-600 hover:text-emerald-400'
                }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={async () => {
                if (submitting || feedback) return;
                setSubmitting(true);
                try {
                  await onFeedback?.(messageId, 'down');
                  setFeedback('down');
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting || feedback !== null}
              className={`p-1 rounded-full hover:bg-white/5 transition-colors ${feedback === 'down' ? 'text-rose-400' : 'text-slate-600 hover:text-rose-400'
                }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/10 shrink-0 mt-1">
          <UserIcon className="w-4 h-4 text-slate-400" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
