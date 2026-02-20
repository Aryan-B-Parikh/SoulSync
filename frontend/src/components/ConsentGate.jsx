import React, { useState } from 'react';
import { API_CONFIG } from '../config/constants';
import { Shield, Database, Brain, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * ConsentGate
 *
 * Full-screen glassmorphic modal shown ONCE to every user before they access chat.
 * Records hasConsented = true in the DB on accept.
 *
 * Props:
 *   token       — JWT for the authenticated user (used for the PUT request)
 *   onAccepted  — called after consent is saved; caller handles navigation
 */
export default function ConsentGate({ token, onAccepted }) {
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAccept = async () => {
        if (!checked) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/user/consent`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to record consent');
            }
            onAccepted();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-8 animate-fade-in overflow-y-auto">
            <div className="w-full max-w-lg bg-surface-light dark:bg-surface-dark border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-8 relative my-auto">
                {/* Top glow accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-soul-violet to-transparent opacity-60 rounded-t-2xl" />

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-soul-violet/10 border border-soul-violet/20 mb-4">
                        <Shield className="w-7 h-7 text-soul-violet" />
                    </div>
                    <h2 className="text-2xl font-serif text-text-primary-light dark:text-slate-100 mb-1">
                        Before You Begin
                    </h2>
                    <p className="text-sm text-text-muted-light dark:text-slate-400">
                        Please take a moment to understand how SoulSync works.
                    </p>
                </div>

                {/* Policy Points */}
                <div className="space-y-4 mb-6">
                    <PolicyPoint icon={<Database className="w-5 h-5 text-violet-400" />} title="Your memories are stored securely">
                        SoulSync stores your conversation history in an encrypted vector database (Pinecone) to give the AI long-term context about you. This data is never sold or shared with third parties.
                    </PolicyPoint>

                    <PolicyPoint icon={<Brain className="w-5 h-5 text-indigo-400" />} title="Helping train better AI models">
                        Anonymised snippets of highly-rated conversations may be used to fine-tune our future AI models. Before any processing, all personal identifiers (names, emails, phone numbers) are automatically scrubbed. Raw data is never exported.
                    </PolicyPoint>

                    <PolicyPoint icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} title="Your rights">
                        You can delete all your memories and conversations at any time from within the app. You may request full data deletion by contacting us — GDPR deletion requests are honoured within 30 days.
                    </PolicyPoint>
                </div>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group mb-6 select-none">
                    <div className="relative mt-0.5 flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            className="sr-only"
                        />
                        <div
                            className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center
                                ${checked
                                    ? 'bg-soul-violet border-soul-violet'
                                    : 'border-white/30 dark:border-white/20 group-hover:border-soul-violet/60'
                                }`}
                        >
                            {checked && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="text-sm text-text-muted-light dark:text-slate-400 leading-relaxed">
                        I understand that my conversations are stored to power personalised AI responses, and that anonymised, scrubbed data may be used to improve future models.
                    </span>
                </label>

                {/* Error */}
                {error && (
                    <div className="text-rose-500 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2 mb-4 text-center">
                        {error}
                    </div>
                )}

                {/* Accept Button */}
                <button
                    onClick={handleAccept}
                    disabled={!checked || loading}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                        ${checked && !loading
                            ? 'bg-soul-violet hover:bg-violet-600 text-white shadow-lg shadow-soul-violet/30 hover:shadow-soul-violet/50'
                            : 'bg-white/5 dark:bg-white/5 text-text-muted-light dark:text-slate-600 cursor-not-allowed border border-white/10'
                        }`}
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'I Understand — Enter SoulSync'
                    )}
                </button>
            </div>
        </div>
    );
}

function PolicyPoint({ icon, title, children }) {
    return (
        <div className="flex gap-3 p-4 rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/5">
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div>
                <p className="text-sm font-medium text-text-primary-light dark:text-slate-200 mb-1">{title}</p>
                <p className="text-xs text-text-muted-light dark:text-slate-500 leading-relaxed">{children}</p>
            </div>
        </div>
    );
}
