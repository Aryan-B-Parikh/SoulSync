/**
 * Authenticated Chat Page
 * Main chat interface with Floating Glass design
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { API_CONFIG } from '../config/constants';
import ChatList from '../components/chat/ChatList';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import MoodDashboard from '../components/mood/MoodDashboard';
import UserProfile from '../components/profile/UserProfile';
import PersonalitySelector from '../components/profile/PersonalitySelector';
import ThemeToggle from '../components/ThemeToggle';
import { Menu, X, Heart, MessageSquare, Sparkles, Plus } from 'lucide-react';

function ChatPage() {
  const { token } = useAuth();
  const { activeChat, messages, loading, sendStreamingMessage, createChat, loadChat } = useChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
  const [sidebarHovered, setSidebarHovered] = useState(false); // Desktop hover state
  const [view, setView] = useState('chat'); // 'chat' or 'mood'
  const [showPersonalitySelector, setShowPersonalitySelector] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Handle opening personality selector from UserProfile
  useEffect(() => {
    const handleOpenPersonalitySelector = () => setShowPersonalitySelector(true);
    window.addEventListener('openPersonalitySelector', handleOpenPersonalitySelector);
    return () => window.removeEventListener('openPersonalitySelector', handleOpenPersonalitySelector);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const messageContent = input;
    setInput('');
    setError('');
    setSending(true);

    try {
      if (!activeChat) {
        // Create new chat first
        const newChat = await createChat();
        if (!newChat) throw new Error('Failed to create chat');

        // Send message to new chat
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/chats/${newChat._id}/messages/stream`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: messageContent }),
          }
        );

        if (response.ok) {
          await loadChat(newChat._id);
        } else {
          throw new Error('Failed to send message');
        }
      } else {
        // Use streaming for existing chat
        await sendStreamingMessage(messageContent);
      }
    } catch (err) {
      console.error('Send error:', err);
      setError(err.message || 'Failed to send message.');
      setInput(messageContent);
    } finally {
      setSending(false);
    }
  };


  // Feedback handler
  const handleFeedback = async (messageId, feedback) => {
    try {
      await fetch(`${API_CONFIG.BASE_URL}/messages/${messageId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback }),
      });
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  // Determine if sidebar should be expanded
  const isSidebarExpanded = sidebarOpen || sidebarHovered;

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans p-3 gap-3">

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Collapsible Dock) */}
      <div
        className={`
          fixed md:relative z-40 h-[calc(100vh-24px)] md:h-[calc(100vh-24px)] h-full
          ${isSidebarExpanded ? 'w-72' : 'w-16'} 
          bg-white dark:bg-slate-800/95 backdrop-blur-2xl 
          rounded-r-2xl md:rounded-2xl border border-black/5 dark:border-white/10
          flex flex-col transition-all duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-xl shadow-black/10 dark:shadow-black/30
          top-0 left-0 md:top-auto md:left-auto
        `}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* User Profile / Status */}
        <div className={`p-3 border-b border-white/5 flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} mt-12 md:mt-0`}>
          {isSidebarExpanded ? (
            <>
              <UserProfile />
              <ThemeToggle />
            </>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-soul-violet to-soul-gold flex items-center justify-center text-white font-semibold text-sm">
              <Sparkles size={18} />
            </div>
          )}
        </div>

        {/* Mobile Close Button - Inside Sidebar */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-500 transition-colors bg-white/5 rounded-full"
        >
          <X size={20} />
        </button>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {isSidebarExpanded ? (
            <div className="px-2 py-4">
              <ChatList />
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 gap-3">
              {/* Icon-only mode - show recent chat indicators */}
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted-dark hover:bg-white/10 cursor-pointer transition-colors">
                <MessageSquare size={16} />
              </div>
            </div>
          )}
        </div>

        {/* Mood Journal Button */}
        <div className={`p-3 border-t border-white/5 ${!isSidebarExpanded ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => {
              setView(view === 'chat' ? 'mood' : 'chat');
              setSidebarOpen(false); // Close sidebar on mobile when switching views
            }}
            className={`
              ${isSidebarExpanded ? 'w-full py-2.5 px-4' : 'w-10 h-10'} 
              rounded-xl transition-all duration-300 flex items-center justify-center gap-2
              ${view === 'mood'
                ? 'bg-soul-violet/20 text-soul-violet border border-soul-violet/30'
                : 'bg-white/5 hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }
            `}
          >
            <Heart className="w-4 h-4" />
            {isSidebarExpanded && <span className="text-sm font-medium">{view === 'mood' ? 'Back to Chat' : 'Mood Journal'}</span>}
          </button>
        </div>
      </div>


      {/* Main Chat Area (Levitating Glass Container) */}
      <div className="flex-1 flex flex-col relative bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden transition-colors duration-300">

        {/* Unified Application Header - Always Visible */}
        <div className="h-14 min-h-[3.5rem] flex items-center justify-between px-4 border-b border-white/5 relative z-10 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-soul-violet transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>

          {/* App Title */}
          <h1 className="font-serif text-lg tracking-widest text-text-muted-light dark:text-slate-400 opacity-80 select-none">
            SoulSync
          </h1>

          {/* Mobile New Chat Action */}
          <button
            onClick={() => createChat()}
            className="md:hidden p-2 -mr-2 text-soul-violet hover:text-soul-gold transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="New Chat"
          >
            <Plus size={20} />
          </button>

          {/* Desktop Spacer to balance center text */}
          <div className="hidden md:block w-6" />
        </div>

        {view === 'mood' ? (
          // Mood Dashboard View
          <div className="flex-1 overflow-hidden relative">
            <MoodDashboard />
          </div>
        ) : (
          // Chat View
          <>
            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 scroll-smooth">
              {loading && !activeChat ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70 animate-fade-in">
                  <span className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">✨</span>
                  <p className="font-serif text-lg text-text-muted-light dark:text-slate-400 italic">"The soul speaks in whispers."</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-8 pb-32">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg._id}
                      role={msg.role}
                      content={msg.content}
                      isStreaming={msg.isStreaming}
                      messageId={msg._id}
                      feedback={msg.feedback}
                      onFeedback={handleFeedback}
                    />
                  ))}
                  {sending && <TypingIndicator />}
                  <div ref={messagesEndRef} />

                  {error && (
                    <div className="text-center text-rose-400 text-sm mt-4 bg-rose-500/10 py-2 rounded-lg mx-auto max-w-md border border-rose-500/20">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Floating Input Area (The Wand) */}
            <div className="absolute bottom-0 md:bottom-6 left-0 right-0 px-0 md:px-8 z-20 pointer-events-none">
              {/* Pointer events auto applied to children */}
              <div className="pointer-events-auto w-full max-w-3xl mx-auto">
                <MessageInput
                  value={input}
                  onChange={setInput}
                  onSend={handleSend}
                  disabled={sending}
                />
              </div>
            </div>
          </>
        )}

      </div>

      {/* Personality Selector Modal */}
      {showPersonalitySelector && (
        <PersonalitySelector onClose={() => setShowPersonalitySelector(false)} />
      )}
    </div>
  );
}

export default ChatPage;

