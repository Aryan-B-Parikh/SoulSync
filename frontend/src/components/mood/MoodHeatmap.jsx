import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/constants';

const MoodHeatmap = () => {
    const { token } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
    const cardRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/mood/trends?days=365`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const result = await response.json();
                    setData(result.trends || []);
                }
            } catch (error) {
                console.error('Failed to fetch heatmap data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    // 3D Tilt effect handlers
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -5;
        const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 5;
        setTilt({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
        setTilt({ rotateX: 0, rotateY: 0 });
    };

    // Helper to get color for sentiment score (-1 to 1)
    const getColor = (score) => {
        if (score === null || score === undefined) return 'bg-slate-200 dark:bg-slate-800';
        if (score >= 0.5) return 'bg-soul-gold';
        if (score >= 0.1) return 'bg-soul-sage';
        if (score >= -0.1) return 'bg-gray-400 dark:bg-gray-600';
        return 'bg-soul-rain';
    };

    return (
        <motion.div
            ref={cardRef}
            className="bg-white dark:bg-slate-800/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-lg cursor-pointer"
            style={{ perspective: 1000 }}
            animate={{
                rotateX: tilt.rotateX,
                rotateY: tilt.rotateY,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="mb-4">
                <h3 className="font-serif text-lg text-slate-800 dark:text-white">Emotional Resonance Map</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your emotional journey over time — each square is one day, colored by mood</p>
            </div>

            {loading ? (
                <div className="animate-pulse flex gap-1 h-32">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-1">
                    {data.slice(0, 365).map((day, i) => (
                        <motion.div
                            key={i}
                            className={`w-3 h-3 rounded-sm ${getColor(day.avgComparative)} cursor-pointer`}
                            title={`${new Date(day.date).toLocaleDateString()}: ${day.avgComparative?.toFixed(2)}`}
                            whileHover={{ scale: 1.5, zIndex: 10 }}
                            transition={{ duration: 0.15 }}
                        />
                    ))}
                    {data.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm italic">No mood data recorded yet.</p>}
                </div>
            )}

            <div className="flex items-center gap-4 mt-4 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-soul-rain"></span> Reflection</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-400 dark:bg-gray-500"></span> Neutral</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-soul-sage"></span> Growth</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-soul-gold"></span> Joy</div>
            </div>
        </motion.div>
    );
};

export default MoodHeatmap;

