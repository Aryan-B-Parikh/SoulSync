import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/constants';
import { Loader2, Sparkles } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import ConsentGate from '../components/ConsentGate';
import Footer from '../components/landing/Footer';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function AuthCard({ onComplete }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConsent, setShowConsent] = useState(false);
    const [pendingToken, setPendingToken] = useState(null);
    const [pendingUser, setPendingUser] = useState(null);

    const { login } = useAuth();

    // Called by Google after the user picks an account
    const handleGoogleCredential = useCallback(async (response) => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            if (!data.user.hasConsented) {
                // Show consent gate before granting access
                setPendingToken(data.token);
                setPendingUser(data.user);
                setShowConsent(true);
            } else {
                login(data.token, data.user);
                onComplete?.();
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [login, onComplete]);

    // Initialise Google Identity Services
    useEffect(() => {
        const initGSI = () => {
            if (!window.google) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCredential,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-btn'),
                {
                    theme: 'outline',
                    size: 'large',
                    width: 320,
                    text: 'continue_with',
                    shape: 'pill',
                    logo_alignment: 'center',
                }
            );
        };

        // Load the GSI script if not already present
        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initGSI;
            document.body.appendChild(script);
        } else {
            initGSI();
        }
    }, [handleGoogleCredential]);

    const handleConsentAccepted = () => {
        login(pendingToken, pendingUser);
        setShowConsent(false);
        onComplete?.();
    };

    return (
        <>
            {/* Consent Gate — shown once before granting access */}
            {showConsent && (
                <ConsentGate
                    token={pendingToken}
                    onAccepted={handleConsentAccepted}
                />
            )}

            <div className="min-h-screen flex items-center justify-center relative overflow-hidden mesh-gradient px-4 transition-colors duration-300">
                {/* Background overlay */}
                <div className="absolute inset-0 bg-white/40 dark:bg-black/30 backdrop-blur-sm" />

                {/* Theme Toggle */}
                <div className="absolute top-8 right-8 z-30">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md relative z-10 animate-slide-up">
                    <div className="bg-surface-light dark:bg-surface-dark backdrop-blur-2xl rounded-2xl p-10 shadow-2xl relative overflow-hidden border border-white/20 dark:border-white/10">
                        {/* Decorative glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-soul-violet to-transparent opacity-50" />

                        {/* Header */}
                        <div className="text-center mb-10 space-y-3">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Sparkles className="w-6 h-6 text-soul-violet animate-pulse" />
                                <span className="text-2xl font-serif text-text-primary-light dark:text-slate-100 tracking-wide">
                                    SoulSync
                                </span>
                            </div>
                            <h2 className="text-3xl font-serif text-text-primary-light dark:text-slate-100 tracking-wide">
                                Welcome Back
                            </h2>
                            <p className="text-text-muted-light dark:text-slate-400 text-sm font-light">
                                Enter the sanctuary of your mind.
                            </p>
                        </div>

                        {/* Google Sign-In Button (rendered by GSI) */}
                        <div className="flex flex-col items-center gap-4">
                            {loading ? (
                                <div className="flex items-center gap-2 text-text-muted-light dark:text-slate-400 py-3">
                                    <Loader2 className="w-5 h-5 animate-spin text-soul-violet" />
                                    <span className="text-sm">Authenticating…</span>
                                </div>
                            ) : (
                                <div id="google-signin-btn" className="w-full flex justify-center" />
                            )}

                            {/* Error */}
                            {error && (
                                <div className="text-rose-500 text-sm text-center bg-rose-500/10 py-2 px-4 rounded-xl animate-fade-in border border-rose-500/20 w-full">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Footer note */}
                        <p className="mt-8 text-center text-xs text-text-muted-light dark:text-slate-600 leading-relaxed">
                            By continuing, you agree to our{' '}
                            <span className="text-soul-violet cursor-pointer hover:underline">
                                Terms of Service
                            </span>{' '}
                            and{' '}
                            <span className="text-soul-violet cursor-pointer hover:underline">
                                Privacy Policy
                            </span>
                            .
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
