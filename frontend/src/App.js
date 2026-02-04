import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LandingPage from './pages/Landing';
import AuthPage from './pages/Auth';
import ChatPage from './pages/Chat';
import './index.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [view, setView] = useState('landing'); // 'landing', 'auth', 'chat'

  // Effect to automatically switch to chat if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setView('chat');
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <div className="w-16 h-1 bg-white/10 overflow-hidden rounded-full">
          <div className="w-full h-full bg-violet-500/50 animate-progress origin-left" />
        </div>
      </div>
    );
  }

  // If authenticated, always show ChatPage (unless explicitly logging out, which handles itself)
  if (isAuthenticated) {
    return (
      <ChatProvider>
        <ChatPage />
      </ChatProvider>
    );
  }

  // Navigation flow
  switch (view) {
    case 'landing':
      return <LandingPage onStart={() => setView('auth')} />;
    case 'auth':
      return <AuthPage onComplete={() => setView('chat')} />;
    default:
      return <LandingPage onStart={() => setView('auth')} />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
