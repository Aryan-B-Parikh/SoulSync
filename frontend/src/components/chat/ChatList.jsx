import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Plus, Trash2, Sparkles, Pencil, Check, X } from 'lucide-react';

function ChatList() {
  const { chats, activeChat, loadChat, deleteChat, createChat, renameChat } = useChat();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const startEditing = (e, chat) => {
    e.stopPropagation();
    setEditingId(chat._id);
    setEditTitle(chat.title);
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const saveTitle = async (e, chatId) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      try {
        await renameChat(chatId, editTitle.trim());
      } catch (error) {
        console.error('Failed to rename:', error);
      }
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e, chatId) => {
    if (e.key === 'Enter') {
      saveTitle(e, chatId);
    } else if (e.key === 'Escape') {
      cancelEditing(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Journey Button */}
      <div className="mb-6">
        <button
          onClick={() => createChat()}
          className="group w-full py-3 px-4 rounded-xl bg-soul-violet/10 hover:bg-soul-violet/20 border border-soul-violet/20 hover:border-soul-violet/30 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-soul-violet group-hover:rotate-90 transition-transform" />
          <span className="text-sm font-medium text-soul-violet">New Journey</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {chats.length === 0 ? (
          <div className="text-center mt-10 space-y-3 opacity-50">
            <Sparkles className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-light italic">Your journal is empty.</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => editingId !== chat._id && loadChat(chat._id)}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-300 border ${activeChat?._id === chat._id
                ? 'bg-soul-violet/10 border-soul-violet/30'
                : 'bg-transparent border-transparent hover:bg-white/10 dark:hover:bg-white/5 hover:border-white/10 dark:hover:border-white/5'
                }`}
            >
              <div className="flex items-start justify-between gap-2 overflow-hidden">
                <div className="flex-1 min-w-0">
                  {editingId === chat._id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, chat._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-2 py-1 rounded border border-soul-violet/50 focus:outline-none focus:border-soul-violet"
                        autoFocus
                      />
                      <button
                        onClick={(e) => saveTitle(e, chat._id)}
                        className="p-1 rounded hover:bg-emerald-500/20 text-emerald-500"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className={`text-sm truncate transition-colors ${activeChat?._id === chat._id
                        ? 'text-soul-violet font-medium'
                        : 'text-slate-700 dark:text-slate-200 group-hover:text-soul-violet'
                        }`}>
                        {chat.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light">
                        {formatDate(chat.updatedAt)}
                      </p>
                    </>
                  )}
                </div>

                {editingId !== chat._id && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={(e) => startEditing(e, chat)}
                      className="p-1.5 rounded-md hover:bg-soul-violet/20 text-slate-400 hover:text-soul-violet transition-colors"
                      title="Rename"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Forget this memory?')) {
                          deleteChat(chat._id);
                        }
                      }}
                      className="p-1.5 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Active Indicator */}
              {activeChat?._id === chat._id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-soul-violet shadow-[0_0_10px_rgba(139,92,246,0.5)] rounded-r-full" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;


