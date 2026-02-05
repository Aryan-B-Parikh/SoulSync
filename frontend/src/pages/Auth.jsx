import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, Sparkles, User, Lock, Mail } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function AuthCard({ onComplete }) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth(); // AuthContext only exposes login (state setter)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const url = `http://localhost:5001/api${endpoint}`;

        try {
            const body = isLogin
                ? { email: formData.email, password: formData.password }
                : { email: formData.email, password: formData.password, name: formData.name };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Update Global Auth State
            login(data.token, data.user);

            onComplete?.();
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden mesh-gradient px-4 transition-colors duration-300">
            {/* Soft Background overlay */}
            <div className="absolute inset-0 bg-white/40 dark:bg-black/30 backdrop-blur-sm" />

            {/* Theme Toggle Positioned Top Right */}
            <div className="absolute top-8 right-8 z-30">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md relative z-10 animate-slide-up">
                {/* Glass Card */}
                <div className="bg-surface-light dark:bg-surface-dark backdrop-blur-2xl rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-white/20 dark:border-white/10">
                    {/* Decorative glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-soul-violet to-transparent opacity-50" />

                    {/* Header */}
                    <div className="text-center mb-8 space-y-2">
                        <h2 className="text-3xl font-serif text-text-primary-light dark:text-slate-100 tracking-wide">
                            {isLogin ? 'Welcome Back' : 'Join the Journey'}
                        </h2>
                        <p className="text-text-muted-light dark:text-slate-400 text-sm font-light">
                            {isLogin
                                ? 'Enter the sanctuary of your mind.'
                                : 'Begin your path to self-discovery.'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">

                            {/* Name Input (Register Only) */}
                            {!isLogin && (
                                <div className="group relative animate-fade-in">
                                    <User className="absolute left-0 top-3 w-5 h-5 text-text-muted-light dark:text-slate-500 group-focus-within:text-soul-violet transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Identity (Name)"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent border-b border-text-muted-light/30 dark:border-white/10 py-3 pl-8 text-text-primary-light dark:text-slate-200 placeholder-text-muted-light dark:placeholder-slate-600 focus:border-soul-violet focus:outline-none transition-colors"
                                        required
                                    />
                                </div>
                            )}

                            {/* Email Input (Always Visible) */}
                            <div className="group relative">
                                <Mail className="absolute left-0 top-3 w-5 h-5 text-text-muted-light dark:text-slate-500 group-focus-within:text-soul-violet transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Contact (Email)"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-transparent border-b border-text-muted-light/30 dark:border-white/10 py-3 pl-8 text-text-primary-light dark:text-slate-200 placeholder-text-muted-light dark:placeholder-slate-600 focus:border-soul-violet focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="group relative">
                                <Lock className="absolute left-0 top-3 w-5 h-5 text-text-muted-light dark:text-slate-500 group-focus-within:text-soul-violet transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Secret (Password)"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-transparent border-b border-text-muted-light/30 dark:border-white/10 py-3 pl-8 pr-8 text-text-primary-light dark:text-slate-200 placeholder-text-muted-light dark:placeholder-slate-600 focus:border-soul-violet focus:outline-none transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-3 text-text-muted-light dark:text-slate-500 hover:text-text-primary-light dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-rose-500 text-sm text-center bg-rose-500/10 py-2 rounded animate-fade-in border border-rose-500/20">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-surface-light dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl transition-all duration-300 hover:shadow-lg group relative overflow-hidden text-text-primary-light dark:text-white font-medium"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>{isLogin ? 'Enter' : 'Begin'}</span>
                                        <Sparkles className="w-4 h-4 text-soul-violet dark:text-violet-400 group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Switch Mode */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-text-muted-light dark:text-slate-500 hover:text-text-primary-light dark:hover:text-slate-300 transition-colors"
                        >
                            {isLogin ? "Need a new identity?" : "Already possess one?"}
                            <span className="ml-1 text-soul-violet dark:text-violet-400 hover:underline">
                                {isLogin ? "Create account" : "Log in"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
