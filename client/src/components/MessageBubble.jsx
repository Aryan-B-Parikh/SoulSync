/**
 * MessageBubble Component
 * Displays a single chat message with appropriate styling
 */

import { useState } from 'react';

// Renders a single message bubble for user or assistant
const MessageBubble = ({ role, content, isError, isStreaming, messageId, feedback: initialFeedback, onFeedback, className = '' }) => {
  const [feedback, setFeedback] = useState(initialFeedback || null);
  const [submitting, setSubmitting] = useState(false);

  const isUser = role === 'user';

  return (
    <div className={`group flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      {!isUser && <div className="text-lg">🤖</div>}
      <div
        className={`p-4 rounded-3xl max-w-[80%] text-sm whitespace-pre-wrap shadow-lg ${isUser
          ? 'bg-emerald-500 text-slate-900 rounded-br-md shadow-emerald-500/25'
          : isError
            ? 'bg-rose-500/15 text-rose-100 border border-rose-400/50 rounded-bl-md'
            : 'bg-white/5 text-slate-100 border border-white/10 rounded-bl-md shadow-black/30'
          }`}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse" />
        )}
      </div>

      {/* Feedback buttons for assistant messages */}
      {!isUser && !isStreaming && messageId && (
        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={async () => {
              if (submitting || feedback) return;
              setSubmitting(true);
              try {
                await onFeedback?.(messageId, 'up');
                setFeedback('up');
              } catch (error) {
                console.error('Failed to submit feedback:', error);
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting || feedback !== null}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${feedback === 'up' ? 'text-green-400' : 'text-slate-400'
              } ${feedback !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            title="Good response"
          >
            👍
          </button>
          <button
            onClick={async () => {
              if (submitting || feedback) return;
              setSubmitting(true);
              try {
                await onFeedback?.(messageId, 'down');
                setFeedback('down');
              } catch (error) {
                console.error('Failed to submit feedback:', error);
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting || feedback !== null}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${feedback === 'down' ? 'text-red-400' : 'text-slate-400'
              } ${feedback !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            title="Bad response"
          >
            👎
          </button>
        </div>
      )}

      {isUser && <div className="text-lg">👤</div>}
    </div>
  );
};

export default MessageBubble;
