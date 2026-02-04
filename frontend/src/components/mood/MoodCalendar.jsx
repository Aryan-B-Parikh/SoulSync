import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/constants';

const MoodCalendar = () => {
    const { token } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [moodData, setMoodData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    // Mood color mapping
    const moodColors = {
        very_positive: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', emoji: '😊' },
        positive: { bg: 'bg-lime-500/20', border: 'border-lime-500/40', text: 'text-lime-400', emoji: '🙂' },
        neutral: { bg: 'bg-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-400', emoji: '😐' },
        negative: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', emoji: '😔' },
        very_negative: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', emoji: '😢' }
    };

    useEffect(() => {
        fetchMoodData();
    }, [currentDate]);

    const fetchMoodData = async () => {
        setLoading(true);
        const month = format(currentDate, 'yyyy-MM');

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/mood/calendar/${month}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Convert array to object keyed by date
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
    };

    const goToPreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get first day offset
    const firstDayOfWeek = monthStart.getDay();

    return (
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={goToPreviousMonth}
                    className="px-3 py-1 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-slate-200"
                >
                    ←
                </button>
                <h3 className="font-serif text-lg text-slate-200">
                    {format(currentDate, 'MMMM yyyy')}
                </h3>
                <button
                    onClick={goToNextMonth}
                    className="px-3 py-1 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-slate-200"
                >
                    →
                </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs text-slate-500 font-medium">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {daysInMonth.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayMood = moodData[dateKey];
                    const mood = dayMood?.mood || null;
                    const moodStyle = mood ? moodColors[mood] : null;

                    return (
                        <button
                            key={dateKey}
                            onClick={() => setSelectedDay(dayMood ? day : null)}
                            className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-center text-sm transition-all duration-200 border ${mood
                                ? `${moodStyle.bg} ${moodStyle.border} hover:scale-105`
                                : 'border-transparent hover:bg-white/5'
                                } ${selectedDay && isSameDay(day, selectedDay)
                                    ? 'ring-2 ring-violet-500/50'
                                    : ''
                                }`}
                        >
                            <span className={mood ? moodStyle.text : 'text-slate-600'}>
                                {day.getDate()}
                            </span>
                            {mood && (
                                <span className="text-lg leading-none mt-0.5">
                                    {moodColors[mood].emoji}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Day Details */}
            {selectedDay && moodData[format(selectedDay, 'yyyy-MM-dd')] && (
                <div className="mt-6 pt-6 border-t border-white/5 animate-slide-up">
                    <h4 className="text-sm font-medium text-slate-300 mb-3">
                        {format(selectedDay, 'MMMM d, yyyy')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <p className="text-slate-500">Mood</p>
                            <p className="text-slate-300 capitalize mt-1">
                                {moodData[format(selectedDay, 'yyyy-MM-dd')].mood.replace('_', ' ')}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">Messages</p>
                            <p className="text-slate-300 mt-1">
                                {moodData[format(selectedDay, 'yyyy-MM-dd')].messageCount}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="absolute inset-0 bg-midnight-950/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};

export default MoodCalendar;
