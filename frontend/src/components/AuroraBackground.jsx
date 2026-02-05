/**
 * AuroraBackground Component
 * Creates an animated ambient aurora effect with floating blurred orbs
 */

import React from 'react';

const AuroraBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Purple Orb - Top Left */}
            <div
                className="aurora-orb absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 dark:opacity-40"
                style={{
                    background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
                    top: '-10%',
                    left: '-10%',
                    animation: 'aurora-float-1 25s ease-in-out infinite',
                }}
            />

            {/* Deep Blue Orb - Bottom Right */}
            <div
                className="aurora-orb absolute w-[700px] h-[700px] rounded-full blur-[120px] opacity-25 dark:opacity-35"
                style={{
                    background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                    bottom: '-15%',
                    right: '-10%',
                    animation: 'aurora-float-2 30s ease-in-out infinite',
                }}
            />

            {/* Gold Orb - Center */}
            <div
                className="aurora-orb absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 dark:opacity-25"
                style={{
                    background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
                    top: '30%',
                    left: '40%',
                    animation: 'aurora-float-3 20s ease-in-out infinite',
                }}
            />

            {/* Subtle Teal Accent */}
            <div
                className="aurora-orb absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-15 dark:opacity-20"
                style={{
                    background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)',
                    bottom: '20%',
                    left: '10%',
                    animation: 'aurora-float-4 35s ease-in-out infinite',
                }}
            />
        </div>
    );
};

export default AuroraBackground;
