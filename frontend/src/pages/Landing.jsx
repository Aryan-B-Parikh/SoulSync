import React from 'react';
import { Sparkles } from 'lucide-react';
import Footer from '../components/landing/Footer';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage({ onStart }) {
    return (
        <div className="min-h-screen relative overflow-hidden mesh-gradient flex flex-col items-center justify-center text-center px-4 transition-colors duration-300">
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[2px]" />

            {/* Header / Logo */}
            <div className="absolute top-8 left-0 right-0 flex justify-between items-center px-8 z-20 animate-fade-in max-w-6xl mx-auto w-full">
                <div className="flex items-center gap-2 glass-subtle px-6 py-2 rounded-full">
                    <span className="text-2xl">✨</span>
                    <span className="font-serif text-xl tracking-widest text-text-primary-light dark:text-slate-200">SoulSync</span>
                </div>
                <ThemeToggle />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-12 flex-1 flex flex-col justify-center">
                {/* Main Content */}
                <div className="space-y-6 animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 drop-shadow-sm leading-tight pb-2">
                        Speak to the Soul,<br />
                        <span className="italic text-text-muted-light dark:text-slate-300">Not the System.</span>
                    </h1>

                    <p className="text-xl text-text-muted-light dark:text-slate-400 font-light max-w-2xl mx-auto animate-slide-up">
                        A persistent companion for the introspective mind.
                    </p>
                </div>

                {/* CTA Button */}
                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <button
                        onClick={onStart}
                        className="group relative px-8 py-4 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 dark:border-white/10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl backdrop-blur-md"
                    >
                        <div className="flex items-center gap-3 text-lg font-medium tracking-wide text-text-primary-light dark:text-slate-200 group-hover:text-soul-violet dark:group-hover:text-white">
                            <span>Begin Journey</span>
                            <Sparkles className="w-5 h-5 text-soul-violet dark:text-violet-400 group-hover:rotate-12 transition-transform" />
                        </div>

                        {/* Inner Glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full pb-4 relative z-20 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <Footer />
            </div>
        </div>
    );
}
