import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/constants';
import MoodCalendar from './MoodCalendar';
import MoodHeatmap from './MoodHeatmap';
import { Sparkles, TrendingUp, MessageSquare, Heart } from 'lucide-react';

const MoodDashboard = () => {
    const { token } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const fetchSummary = useCallback(async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/mood/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSummary(data);
            }
        } catch (error) {
            console.error('Failed to fetch mood summary:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const getMoodLabel = (mood) => {
        const labels = {
            very_positive: 'Very Positive',
            positive: 'Positive',
            neutral: 'Neutral',
            negative: 'Negative',
            very_negative: 'Very Negative'
        };
        return labels[mood] || mood;
    };

    const getMoodEmoji = (mood) => {
        const emojis = {
            very_positive: '😊',
            positive: '🙂',
            neutral: '😐',
            negative: '😔',
            very_negative: '😢'
        };
        return emojis[mood] || '😐';
    };

    return (
        <div className="h-full overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-6 pb-10">

                {/* Header */}
                <div className="animate-fade-in">
                    <h1 className="font-serif text-3xl text-text-primary-light dark:text-text-primary-dark mb-2">Mood Journal</h1>
                    <p className="text-text-muted-light dark:text-text-muted-dark text-sm">Track your emotional journey over time</p>
                </div>

                {/* Summary Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 h-32 animate-pulse" />
                        ))}
                    </div>
                ) : summary ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up">

                        {/* Total Messages */}
                        <div className="bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-xl p-6 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <MessageSquare className="w-5 h-5 text-soul-violet" />
                            </div>
                            <p className="text-2xl font-serif text-slate-800 dark:text-white">{summary.totalMessages}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Messages</p>
                        </div>

                        {/* Dominant Mood */}
                        <div className="bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-xl p-6 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <Heart className="w-5 h-5 text-soul-rain" />
                            </div>
                            <p className="text-2xl">{getMoodEmoji(summary.dominantMood)}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
                                {getMoodLabel(summary.dominantMood)}
                            </p>
                        </div>

                        {/* Average Score -> Emotional Resonance */}
                        <div className="bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-xl p-6 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <TrendingUp className="w-5 h-5 text-soul-sage" />
                            </div>
                            <p className={`text-xl font-serif ${summary.averageComparative >= 0 ? 'text-emerald-500' : 'text-amber-500'
                                }`}>
                                {summary.averageComparative > 0.2 ? 'Uplifting' :
                                    summary.averageComparative < -0.2 ? 'Reflective' : 'Balanced'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Emotional Resonance</p>
                        </div>

                        {/* Mood Insight */}
                        <div className="bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-xl p-6 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <Sparkles className="w-5 h-5 text-soul-gold" />
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                {summary.averageComparative > 0.2 ? "You're on a positive streak!" :
                                    summary.averageComparative < -0.2 ? "Reflective moments lately" :
                                        "Balanced and introspective"}
                            </p>
                        </div>
                    </div>
                ) : null}

                {/* Heatmap (Replacing Trend Graph) */}
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <MoodHeatmap />
                </div>

                {/* Calendar */}
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <MoodCalendar />
                </div>

                {/* Mood Distribution */}
                {summary && summary.moodDistribution && Object.keys(summary.moodDistribution).length > 0 && (
                    <div className="bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-2xl p-6 animate-fade-in shadow-sm" style={{ animationDelay: '0.3s' }}>
                        <h3 className="font-serif text-lg text-slate-800 dark:text-white mb-4">Mood Distribution</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(summary.moodDistribution).map(([mood, count]) => {
                                const percentage = ((count / summary.totalMessages) * 100).toFixed(1);
                                return (
                                    <div key={mood} className="text-center">
                                        <div className="text-3xl mb-2">{getMoodEmoji(mood)}</div>
                                        <p className="text-sm text-slate-700 dark:text-slate-200 capitalize mb-1">
                                            {getMoodLabel(mood)}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {count} ({percentage}%)
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && (!summary || summary.totalMessages === 0) && (
                    <div className="bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-2xl p-12 text-center animate-fade-in shadow-sm">
                        <span className="text-6xl mb-4 block filter drop-shadow-md">✨</span>
                        <h3 className="font-serif text-xl text-slate-800 dark:text-white mb-2">Start Your Journey</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                            Your mood journal will appear here as you chat with SoulSync.
                            Each conversation helps build your emotional timeline.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoodDashboard;
