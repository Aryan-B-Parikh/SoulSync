/**
 * SoulSync AI - Main Application Component
 * A sophisticated AI companion for thoughtful conversations
 */

import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './components/Hero';
import Features from './components/Features';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Footer from './components/Footer';
import { useChat } from './hooks/useChat';
import './index.css';

function App() {
  const {
    messages,
    input,
    loading,
    error,
    sendMessage,
    handleInputChange,
  } = useChat();

  return (
    <ErrorBoundary>
      <div className="bg-[#0e0e10] text-gray-100 min-h-screen flex flex-col font-serif transition-colors duration-700">
        <Hero />
        <Features />
        
        <ChatWindow messages={messages} loading={loading} />

        <footer className="sticky bottom-0 bg-[#111] backdrop-blur border-t border-gray-700 px-4 py-4 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            {error && (
              <div className="mb-2 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <MessageInput
              value={input}
              onChange={handleInputChange}
              onSend={sendMessage}
              disabled={loading}
            />
          </div>
        </footer>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
