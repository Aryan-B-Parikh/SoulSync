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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,0.12),transparent_30%),#0b0c0f]">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-3 overflow-hidden flex items-center justify-center">
            <img src="/soulsync.png" alt="SoulSync Logo" className="w-full h-full object-contain scale-150 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
          </div>
          <h2 className="text-5xl font-bold text-slate-50 font-serif tracking-wider">SoulSync</h2>
          <p className="text-sm text-emerald-200/80 mt-2">Welcome back</p>
          <p className="text-sm text-slate-400 mt-1">Log in to your calm corner.</p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-emerald-500/10 animate-drop-in">
          {error && (
            <div className="mb-4 p-3 rounded-xl border border-rose-400/40 bg-rose-500/15 text-rose-100 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-300/60 transition shadow-inner shadow-emerald-500/5"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-300/60 transition shadow-inner shadow-emerald-500/5"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-emerald-500 text-slate-900 font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-150 hover:bg-emerald-400 active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            New here?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-emerald-300 hover:text-emerald-200 font-medium"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
