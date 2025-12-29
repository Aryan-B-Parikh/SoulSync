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
    <div className="w-64 bg-[#1a1a1d] border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={createChat}
          className="w-full py-2 px-4 bg-primary hover:bg-primary-dark rounded text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span>➕</span>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          <div className="p-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => loadChat(chat._id)}
                className={`p-3 mb-2 rounded cursor-pointer transition-colors group ${
                  activeChat?._id === chat._id
                    ? 'bg-primary/20 border border-primary'
                    : 'hover:bg-[#0e0e10] border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-100 truncate">
                      {chat.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
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
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity ml-2"
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
