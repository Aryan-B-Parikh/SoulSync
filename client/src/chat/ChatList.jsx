/**
 * Chat List Component
 * Displays user's chat history with selection
 */

import React from 'react';
import { useChat } from '../context/ChatContext';

function ChatList() {
  const { chats, activeChat, loadChat, deleteChat, createChat } = useChat();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-72 bg-black/40 border-r border-white/5 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <button
          onClick={createChat}
          className="w-full py-2.5 px-4 rounded-full bg-emerald-500 text-slate-900 font-semibold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2"
        >
          <span className="text-lg">＋</span>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => loadChat(chat._id)}
                className={`p-3 rounded-xl cursor-pointer transition-all group border ${
                  activeChat?._id === chat._id
                    ? 'bg-emerald-500/15 border-emerald-400/40 shadow-emerald-500/20 shadow-lg'
                    : 'bg-white/0 border-transparent hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {chat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(chat.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this conversation?')) {
                        deleteChat(chat._id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-200 transition-opacity ml-2"
                    aria-label="Delete chat"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatList;
