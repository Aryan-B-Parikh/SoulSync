/**
 * UserProfile Component
 * User profile dropdown and settings modal
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Initialize displayName when modal opens
  React.useEffect(() => {
    if (showSettings) {
      setDisplayName(user?.name || '');
      setSaveError('');
    }
  }, [showSettings, user]);

  if (!user) return null;

  const getInitials = () => {
    if (user.name) return user.name[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getJoinedDate = () => {
    if (user.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return 'Recently';
  };

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-900 font-semibold text-sm cursor-pointer hover:scale-105 transition-transform"
        aria-label="User profile"
      >
        {getInitials()}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute top-12 right-0 w-64 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-emerald-500/10 p-4 z-50 animate-fade-in">
            {/* Profile Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-900 font-semibold">
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Joined Date */}
            <p className="text-xs text-slate-500 mt-2 mb-3">
              Member since {getJoinedDate()}
            </p>

            {/* Actions */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  setShowSettings(true);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-200 transition-colors"
              >
                ⚙️ Profile Settings
              </button>
              <button
                onClick={() => {
                  // Open personality selector (will be handled by parent)
                  window.dispatchEvent(new CustomEvent('openPersonalitySelector'));
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-purple-200 transition-colors"
              >
                ✨ AI Personality
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-200 transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Settings Modal */}
      {showSettings && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div
              className="fixed inset-0"
              onClick={() => setShowSettings(false)}
            />
            <div className="relative max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-emerald-500/10 animate-drop-in">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                Profile Settings
              </h2>

              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-300/60 transition"
                    placeholder="Your name"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {saveError && (
                <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                  {saveError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setSaving(true);
                    setSaveError('');
                    try {
                      await updateUser({ name: displayName });
                      setShowSettings(false);
                    } catch (error) {
                      setSaveError(error.message || 'Failed to update profile');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-900 font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserProfile;
