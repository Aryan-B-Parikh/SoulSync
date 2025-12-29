/**
 * Login Page
 * User authentication form
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/constants';

function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1a1a1d] rounded-lg p-8 shadow-xl">
        <h2 className="text-3xl font-serif text-center mb-6 text-gray-100">
          Welcome Back
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#0e0e10] border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#0e0e10] border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary hover:bg-primary-dark rounded text-white font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-primary hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

export default Login;
