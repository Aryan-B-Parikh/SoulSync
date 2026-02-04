import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/constants';

const MoodTrendGraph = ({ days = 30 }) => {
    const { token } = useAuth();
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('line'); // 'line' or 'area'

    useEffect(() => {
        fetchTrendData();
    }, [days]);

    const fetchTrendData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/mood/trends?days=${days}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Format data for recharts
                const formattedData = (data.trends || []).map(day => ({
                    date: format(parseISO(day.date), 'MMM d'),
                    fullDate: day.date,
                    score: day.avgComparative,
                    messageCount: day.messageCount
                }));
                setTrendData(formattedData);
            }
        } catch (error) {
            console.error('Failed to fetch trend data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="glass-card rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">{data.date}</p>
                    <p className="text-sm text-slate-200">
                        Score: <span className={data.score >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                            {data.score.toFixed(2)}
                        </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{data.messageCount} messages</p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="glass-card rounded-2xl p-6 flex items-center justify-center h-80">
                <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (trendData.length === 0) {
        return (
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center h-80 text-center">
                <span className="text-4xl mb-3 opacity-50">📊</span>
                <p className="text-slate-400 text-sm">Not enough data to show trends yet.</p>
                <p className="text-slate-600 text-xs mt-2">Start chatting to build your mood history!</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-serif text-lg text-slate-200">Mood Trends</h3>
                    <p className="text-xs text-slate-500 mt-1">Last {days} days</p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('line')}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${viewMode === 'line'
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        Line
                    </button>
                    <button
                        onClick={() => setViewMode('area')}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${viewMode === 'area'
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        Area
                    </button>
                </div>
            </div>

            {/* Graph */}
            <ResponsiveContainer width="100%" height={300}>
                {viewMode === 'line' ? (
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            style={{ fontSize: '11px' }}
                            tick={{ fill: '#64748b' }}
                        />
                        <YAxis
                            stroke="#64748b"
                            style={{ fontSize: '11px' }}
                            tick={{ fill: '#64748b' }}
                            domain={[-1, 1]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#a78bfa"
                            strokeWidth={2}
                            dot={{ fill: '#8b5cf6', r: 3 }}
                            activeDot={{ r: 5, fill: '#a78bfa' }}
                        />
                    </LineChart>
                ) : (
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            style={{ fontSize: '11px' }}
                            tick={{ fill: '#64748b' }}
                        />
                        <YAxis
                            stroke="#64748b"
                            style={{ fontSize: '11px' }}
                            tick={{ fill: '#64748b' }}
                            domain={[-1, 1]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#a78bfa"
                            strokeWidth={2}
                            fill="url(#colorScore)"
                        />
                    </AreaChart>
                )}
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    <span className="text-slate-500">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-500/50" />
                    <span className="text-slate-500">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <span className="text-slate-500">Negative</span>
                </div>
            </div>
        </div>
    );
};

export default MoodTrendGraph;
