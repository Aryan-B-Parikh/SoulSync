import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AuroraBackground from './components/AuroraBackground';
import LandingPage from './pages/Landing';
import AuthPage from './pages/Auth';
import ChatPage from './pages/Chat';
import './index.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [view, setView] = useState('landing'); // 'landing', 'auth', 'chat'

  // Automatically switch to chat if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setView('chat');
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="w-16 h-1 bg-white/10 overflow-hidden rounded-full">
          <div className="w-full h-full bg-soul-violet/50 animate-progress origin-left" />
        </div>
      </div>
    );
  }

  // Chat has its own full-screen layout — no footer
  if (isAuthenticated) {
    return (
      <ChatProvider>
        <ChatPage />
      </ChatProvider>
    );
  }

  // Views handle their own backgrounds and footers
  return (
    <>
      {view === 'landing' && <LandingPage onStart={() => setView('auth')} />}
      {view === 'auth' && <AuthPage onComplete={() => setView('chat')} />}
      {view !== 'landing' && view !== 'auth' && <LandingPage onStart={() => setView('auth')} />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          {/* Ambient Aurora Background */}
          <AuroraBackground />
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
