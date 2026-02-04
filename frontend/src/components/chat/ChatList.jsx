import React from 'react';
import { useChat } from '../../context/ChatContext';
import { Plus, Trash2, Sparkles } from 'lucide-react';

function ChatList() {
  const { chats, activeChat, loadChat, deleteChat, createChat } = useChat();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Journey Button */}
      <div className="mb-6">
        <button
          onClick={() => createChat()}
          className="group w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-violet-400 group-hover:rotate-90 transition-transform" />
          <span className="text-sm font-medium text-slate-300 group-hover:text-white">New Journey</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {chats.length === 0 ? (
          <div className="text-center mt-10 space-y-3 opacity-50">
            <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm text-slate-500 font-light italic">Your journal is empty.</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => loadChat(chat._id)}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-300 border ${activeChat?._id === chat._id
                ? 'bg-white/5 border-violet-500/30'
                : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                }`}
            >
              <div className="flex items-start justify-between gap-2 overflow-hidden">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm truncate transition-colors ${activeChat?._id === chat._id ? 'text-violet-200 font-medium' : 'text-slate-400 group-hover:text-slate-200'
                    }`}>
                    {chat.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 font-light group-hover:text-slate-500">
                    {formatDate(chat.updatedAt)}
                  </p>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Forget this memory?')) {
                        deleteChat(chat._id);
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Active Indicator */}
              {activeChat?._id === chat._id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)] rounded-r-full" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;
