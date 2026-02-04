/**
 * Personality Selector Component
 * Allows users to choose their AI companion's personality mode
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/constants';

const PERSONALITIES = [
    {
        id: 'reflective',
        icon: '🌙',
        name: 'Deep & Reflective',
        description: 'Introspective, philosophical, and contemplative',
        color: 'from-indigo-500 to-purple-600',
    },
    {
        id: 'supportive',
        icon: '🌤',
        name: 'Supportive Friend',
        description: 'Warm, encouraging, and validating',
        color: 'from-amber-500 to-orange-600',
    },
    {
        id: 'creative',
        icon: '✨',
        name: 'Creative & Poetic',
        description: 'Imaginative, metaphorical, and artistic',
        color: 'from-pink-500 to-rose-600',
    },
];

export default function PersonalitySelector({ onClose }) {
    const { token } = useAuth();
    const [currentPersonality, setCurrentPersonality] = useState('reflective');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPersonality();
    }, []);

    const fetchPersonality = async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/user/personality`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentPersonality(data.personality);
            }
        } catch (error) {
            console.error('Failed to fetch personality:', error);
        }
    };

    const updatePersonality = async (personality) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/user/personality`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ personality }),
            });

            if (response.ok) {
                setCurrentPersonality(personality);
                setTimeout(() => {
                    if (onClose) onClose();
                }, 500);
            }
        } catch (error) {
            console.error('Failed to update personality:', error);
            alert('Failed to update personality. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1c] border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-white">Choose Your AI Companion's Personality</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid gap-4">
                    {PERSONALITIES.map((personality) => (
                        <button
                            key={personality.id}
                            onClick={() => updatePersonality(personality.id)}
                            disabled={loading}
                            className={`
                relative p-6 rounded-xl border-2 transition-all text-left
                ${currentPersonality === personality.id
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
              `}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`text-4xl bg-gradient-to-br ${personality.color} p-3 rounded-lg`}>
                                    {personality.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-white mb-1">
                                        {personality.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-3">
                                        {personality.description}
                                    </p>
                                    {currentPersonality === personality.id && (
                                        <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Currently Active
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <p className="text-gray-500 text-sm mt-6 text-center">
                    Your personality choice affects how SoulSync responds to you. You can change this anytime.
                </p>
            </div>
        </div>
    );
}
