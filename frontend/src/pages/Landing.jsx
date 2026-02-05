import React from 'react';
import { Sparkles } from 'lucide-react';
import Footer from '../components/landing/Footer';

export default function LandingPage({ onStart }) {
    return (
        <div className="min-h-screen relative overflow-hidden mesh-gradient flex flex-col items-center justify-center text-center px-4">
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

            {/* Header / Logo */}
            <div className="absolute top-8 left-0 right-0 flex justify-center z-20 animate-fade-in">
                <div className="flex items-center gap-2 glass-subtle px-6 py-2 rounded-full">
                    <span className="text-2xl">✨</span>
                    <span className="font-serif text-xl tracking-widest text-slate-200">SoulSync</span>
                </div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-12 flex-1 flex flex-col justify-center">
                {/* Main Content */}
                <div className="space-y-6 animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 drop-shadow-sm leading-tight">
                        Speak to the Soul,<br />
                        <span className="italic text-slate-300">Not the System.</span>
                    </h1>

                    <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto animate-slide-up">
                        A persistent companion for the introspective mind.
                    </p>
                </div>

                {/* CTA Button */}
                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <button
                        onClick={onStart}
                        className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] backdrop-blur-md"
                    >
                        <div className="flex items-center gap-3 text-lg font-medium tracking-wide text-slate-200 group-hover:text-white">
                            <span>Begin Journey</span>
                            <Sparkles className="w-5 h-5 text-violet-400 group-hover:rotate-12 transition-transform" />
                        </div>

                        {/* Inner Glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
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
