import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

const MessageBubble = ({ role, content, isError, isStreaming, messageId, feedback: initialFeedback, onFeedback, className = '' }) => {
  const [feedback, setFeedback] = useState(initialFeedback || null);
  const [submitting, setSubmitting] = useState(false);

  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} ${className}`}
    >
      {/* AI Avatar - Pulsing Orb */}
      {!isUser && (
        <motion.div
          className={`w-9 h-9 rounded-full bg-gradient-to-br from-soul-violet to-soul-gold flex items-center justify-center shrink-0 mt-1 shadow-lg ${isStreaming ? 'shadow-soul-violet/50' : 'shadow-soul-violet/20'}`}
          animate={isStreaming ? {
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 0 20px rgba(139, 92, 246, 0.3)',
              '0 0 35px rgba(139, 92, 246, 0.6)',
              '0 0 20px rgba(139, 92, 246, 0.3)'
            ]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: isStreaming ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </motion.div>
      )}

      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Content */}
        <div
          className={`relative text-sm whitespace-pre-wrap transition-all duration-300 ${isUser
            ? 'bg-surface-light dark:bg-surface-dark backdrop-blur-md px-6 py-3 rounded-2xl rounded-tr-sm text-text-primary-light dark:text-text-primary-dark shadow-sm border border-white/10 font-sans'
            : isError
              ? 'text-rose-500 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20'
              : 'text-text-primary-light dark:text-text-primary-dark font-serif text-lg leading-relaxed px-1'
            }`}
        >
          {content}

          {/* Glowing Streaming Cursor */}
          {isStreaming && (
            <motion.span
              className="inline-block w-2 h-5 ml-1 bg-gradient-to-t from-soul-violet to-soul-gold rounded-sm align-middle"
              animate={{
                opacity: [1, 0.4, 1],
                boxShadow: [
                  '0 0 8px rgba(139, 92, 246, 0.8)',
                  '0 0 15px rgba(251, 191, 36, 0.6)',
                  '0 0 8px rgba(139, 92, 246, 0.8)'
                ]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>

        {/* Feedback Actions (AI Only) */}
        {!isUser && !isStreaming && !isError && messageId && (
          <motion.div
            className="flex gap-2 mt-2 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
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
              className={`p-1.5 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-all opacity-0 group-hover:opacity-100 ${feedback === 'up' ? 'text-emerald-500 opacity-100' : 'text-text-muted-light dark:text-text-muted-dark hover:text-emerald-400'
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
              className={`p-1.5 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-all opacity-0 group-hover:opacity-100 ${feedback === 'down' ? 'text-rose-500 opacity-100' : 'text-text-muted-light dark:text-text-muted-dark hover:text-rose-400'
                }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;

