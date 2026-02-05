/**
 * Authenticated Chat Page
 * Main chat interface with Midnight Glass design
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
import { Menu, X, Heart } from 'lucide-react';

function ChatPage() {
  const { token } = useAuth();
  const { activeChat, messages, loading, sendStreamingMessage, createChat, loadChat, renameChat } = useChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null); const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
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

  return (
    <div className="flex h-screen bg-midnight-950 text-slate-200 overflow-hidden font-sans">

      {/* Mobile Sidebar Toggle - Visible only on mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass rounded-full text-slate-300"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar (Memory Lane) */}
      <div className={`
        fixed md:relative z-40 h-full w-80 glass-panel flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* User Profile / Status */}
        <div className="p-6 border-b border-white/5">
          <UserProfile />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 py-4">
          {/* Passing styles to ChatList to match the theme if needed, but existing ChatList might look okay if basic text */}
          <ChatList />
        </div>

        {/* Mood Journal Button */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setView(view === 'chat' ? 'mood' : 'chat')}
            className={`w-full py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${view === 'mood'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
              }`}
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">{view === 'mood' ? 'Back to Chat' : 'Mood Journal'}</span>
          </button>
        </div>
      </div>


      {/* Main Chat Area (The Canvas) */}
      <div className="flex-1 flex flex-col relative bg-midnight-950">

        {view === 'mood' ? (
          // Mood Dashboard View
          <MoodDashboard />
        ) : (
          // Chat View
          <>
            {/* Header */}
            <div className="h-16 flex items-center justify-center border-b border-white/5 relative z-10 glass-subtle">
              <h1 className="font-serif text-xl tracking-widest text-slate-300 opacity-80">SoulSync</h1>
              <div className="absolute top-1/2 right-6 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 scroll-smooth">
              {loading && !activeChat ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70 animate-fade-in">
                  <span className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">✨</span>
                  <p className="font-serif text-lg text-slate-400 italic">"The soul speaks in whispers."</p>
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
            <div className="absolute bottom-8 left-0 right-0 px-4 md:px-0 z-20 pointer-events-none">
              {/* Pointer events auto applied to children */}
              <div className="pointer-events-auto w-full">
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
