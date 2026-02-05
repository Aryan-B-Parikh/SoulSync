import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MoodCalendar = () => {
    const { token } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [moodData, setMoodData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    // Mood color mapping - Better dark mode colors
    const moodColors = {
        very_positive: { bg: 'bg-emerald-500/30', border: 'border-emerald-400', text: 'text-emerald-300', emoji: '😊' },
        positive: { bg: 'bg-lime-500/30', border: 'border-lime-400', text: 'text-lime-300', emoji: '🙂' },
        neutral: { bg: 'bg-slate-400/30', border: 'border-slate-400', text: 'text-slate-300', emoji: '😐' },
        negative: { bg: 'bg-amber-500/30', border: 'border-amber-400', text: 'text-amber-300', emoji: '😔' },
        very_negative: { bg: 'bg-red-500/30', border: 'border-red-400', text: 'text-red-300', emoji: '😢' }
    };

    // Get current week's days
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    useEffect(() => {
        fetchMoodData();
    }, [fetchMoodData]);

    const fetchMoodData = useCallback(async () => {
        setLoading(true);
        const month = format(currentDate, 'yyyy-MM');

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/mood/calendar/${month}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const dataMap = (data.days || []).reduce((acc, day) => {
                    acc[day.date] = day;
                    return acc;
                }, {});
                setMoodData(dataMap);
            }
        } catch (error) {
            console.error('Failed to fetch mood data:', error);
        } finally {
            setLoading(false);
        }
    }, [currentDate, token]);

    const goToPreviousWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
    const goToNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
    const goToToday = () => setCurrentDate(new Date());

    const isToday = (day) => isSameDay(day, new Date());

    return (
        <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-lg relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <button
                    onClick={goToPreviousWeek}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-white"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                    <h3 className="font-serif text-lg text-text-primary-light dark:text-white">
                        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                    </h3>
                    <button
                        onClick={goToToday}
                        className="text-xs px-2 py-1 rounded-md bg-soul-violet/20 text-soul-violet hover:bg-soul-violet/30 transition-colors"
                    >
                        Today
                    </button>
                </div>

                <button
                    onClick={goToNextWeek}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-white"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-3">
                {daysInWeek.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayMood = moodData[dateKey];
                    const mood = dayMood?.mood || null;
                    const moodStyle = mood ? moodColors[mood] : null;
                    const today = isToday(day);

                    return (
                        <button
                            key={dateKey}
                            onClick={() => setSelectedDay(dayMood ? day : null)}
                            className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-200 border-2 ${mood
                                ? `${moodStyle.bg} ${moodStyle.border} hover:scale-105`
                                : 'border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                                } ${selectedDay && isSameDay(day, selectedDay) ? 'ring-2 ring-soul-violet ring-offset-2 ring-offset-transparent' : ''
                                } ${today ? 'ring-2 ring-soul-gold/50' : ''
                                }`}
                        >
                            {/* Day name */}
                            <span className="text-xs font-medium text-text-muted-light dark:text-slate-400 mb-1">
                                {format(day, 'EEE')}
                            </span>

                            {/* Date */}
                            <span className={`text-lg font-medium ${mood
                                ? moodStyle.text
                                : today
                                    ? 'text-soul-gold'
                                    : 'text-text-primary-light dark:text-white'
                                }`}>
                                {day.getDate()}
                            </span>

                            {/* Mood emoji */}
                            {mood && (
                                <span className="text-xl mt-1">{moodColors[mood].emoji}</span>
                            )}

                            {/* Today indicator */}
                            {today && !mood && (
                                <div className="w-1.5 h-1.5 rounded-full bg-soul-gold mt-1" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Day Details */}
            {selectedDay && moodData[format(selectedDay, 'yyyy-MM-dd')] && (
                <div className="mt-5 pt-5 border-t border-black/5 dark:border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-text-primary-light dark:text-white">
                                {format(selectedDay, 'EEEE, MMMM d')}
                            </h4>
                            <p className="text-xs text-text-muted-light dark:text-slate-400 mt-1 capitalize">
                                {moodData[format(selectedDay, 'yyyy-MM-dd')].mood.replace('_', ' ')} • {moodData[format(selectedDay, 'yyyy-MM-dd')].messageCount} messages
                            </p>
                        </div>
                        <span className="text-3xl">{moodColors[moodData[format(selectedDay, 'yyyy-MM-dd')].mood].emoji}</span>
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-soul-violet/20 border-t-soul-violet rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};

export default MoodCalendar;

