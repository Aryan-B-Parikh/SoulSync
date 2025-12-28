/**
 * ErrorBoundary Component
 * Catches and handles React component errors gracefully
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-4">🌙</div>
            <h1 className="text-2xl font-bold text-teal-400 mb-2">
              Something Went Wrong
            </h1>
            <p className="text-gray-400 mb-6">
              The cosmos seems to be misaligned. Let's try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-full transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
