import React, { useState } from 'react';
import { Sparkles, Brain, HeartPulse, Moon, Sun, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/landing/Footer';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage({ onStart }) {
    const [vibe, setVibe] = useState('deep'); // 'deep' | 'supportive' | 'creative'

    const vibes = {
        deep: {
            icon: Moon,
            label: "Deep & Reflective",
            color: "from-indigo-900/40 via-purple-900/40 to-slate-900/40",
            text: "I am ready to listen deeply.",
            accent: "text-indigo-400"
        },
        supportive: {
            icon: Sun,
            label: "Supportive Friend",
            color: "from-amber-500/20 via-orange-500/20 to-rose-500/20",
            text: "I'm here to support you.",
            accent: "text-amber-400"
        },
        creative: {
            icon: Wand2,
            label: "Creative & Poetic",
            color: "from-fuchsia-500/20 via-pink-500/20 to-cyan-500/20",
            text: "Let's weave stories together.",
            accent: "text-fuchsia-400"
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center transition-colors duration-700">
            {/* Dynamic Background Overlay based on Vibe */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${vibes[vibe].color} backdrop-blur-[2px]`}
                initial={false}
                animate={{ className: `absolute inset-0 bg-gradient-to-br ${vibes[vibe].color} backdrop-blur-[2px]` }}
                transition={{ duration: 0.8 }}
            />

            {/* Header */}
            <div className="absolute top-8 left-0 right-0 flex justify-between items-center px-8 z-20 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-1 glass-subtle px-5 py-2 rounded-full">
                    <div className="w-14 h-14 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        <img src="/soulsync.png" alt="SoulSync Logo" className="w-full h-full object-contain scale-150 drop-shadow-lg" />
                    </div>
                    <span className="font-serif text-4xl font-bold tracking-widest text-text-primary-light dark:text-slate-100 drop-shadow-sm">SoulSync</span>
                </div>
                <ThemeToggle />
            </div>

            <main className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-32 pb-12 flex flex-col items-center">
                {/* Hero Section */}
                <div className="text-center space-y-6 max-w-4xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 drop-shadow-sm leading-tight pb-4">
                            Speak to the Soul,<br />
                            <span className="italic text-indigo-600 dark:text-slate-300 bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Not the System.</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
                            An AI companion that <span className="font-medium text-soul-violet">remembers your past</span>, <span className="font-medium text-soul-violet">visualizes your mood</span>, and <span className="font-medium text-soul-violet">adapts to your personality</span>. Built for deep, long-term connection.
                        </p>
                    </motion.div>
                </div>

                {/* Vibe Check (Pre-Login Interaction) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-12 glass-panel p-2 rounded-full flex items-center gap-2 relative bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md shadow-sm"
                >
                    {Object.entries(vibes).map(([key, data]) => {
                        const Icon = data.icon;
                        const isActive = vibe === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setVibe(key)}
                                className={`relative px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 ${isActive
                                    ? 'bg-white/80 dark:bg-white/10 text-slate-800 dark:text-white shadow-lg'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? data.accent : ''}`} />
                                <span className={`text-sm font-medium ${isActive ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto transition-all'}`}>
                                    {data.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="vibe-indicator"
                                        className="absolute inset-0 border border-black/5 dark:border-white/20 rounded-full"
                                    />
                                )}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Dynamic Hook Text */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={vibe}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`text-lg font-serif italic mb-8 ${vibes[vibe].accent} drop-shadow-sm`}
                    >
                        "{vibes[vibe].text}"
                    </motion.p>
                </AnimatePresence>

                {/* Begin Journey Button */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mb-24"
                >
                    <button
                        onClick={onStart}
                        className="group relative px-10 py-5 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-white/40 dark:border-white/10 rounded-full transition-all duration-300 shadow-xl backdrop-blur-md overflow-hidden"
                    >
                        <div className="flex items-center gap-3 text-xl font-medium tracking-wide text-slate-800 dark:text-slate-100">
                            <span>Begin Journey</span>
                            <Sparkles className="w-6 h-6 text-soul-violet dark:text-violet-400 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </button>
                </motion.div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                    <FeatureCard
                        icon={Brain}
                        title="Deep Memory"
                        delay={0.4}
                        description="Unlike standard chatbots, SoulSync remembers. It recalls your past conversations and stories to provide context-aware advice."
                    />
                    <FeatureCard
                        icon={HeartPulse}
                        title="Emotional Insights"
                        delay={0.5}
                        description="Track your emotional journey. View interactive heatmaps and trends to understand your mental wellbeing over time."
                    />
                    <FeatureCard
                        icon={Wand2}
                        title="Adaptive Personality"
                        delay={0.6}
                        description="Choose your companion. Whether you need a 'Supportive Friend' or a 'Deep Philosopher,' SoulSync shifts to match your vibe."
                    />
                </div>

                {/* Trust Footer Line */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                    Your memories are safe. Encrypted, private, and yours alone.
                </motion.p>
            </main>

            <div className="pb-4 relative z-20">
                <Footer />
            </div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.6 }}
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-2xl border border-white/20 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-white/10 transition-colors group text-left shadow-sm hover:shadow-md"
        >
            <div className="mb-4 w-12 h-12 rounded-xl bg-white/50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-soul-violet dark:text-violet-300" />
            </div>
            <h3 className="text-xl font-serif font-medium text-slate-800 dark:text-slate-200 mb-3 group-hover:text-soul-violet transition-colors">
                {title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {description}
            </p>
        </motion.div>
    );
}
