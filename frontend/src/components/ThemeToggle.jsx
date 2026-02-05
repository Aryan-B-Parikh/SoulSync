/**
 * Theme Toggle Component
 * Animated sun/moon switch for Daybreak/Midnight modes
 */

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full transition-all duration-300 hover:bg-surface-light dark:hover:bg-surface-dark group"
            aria-label="Toggle theme"
        >
            <div className="relative w-6 h-6">
                <Sun
                    className={`absolute inset-0 w-full h-full text-soul-gold transition-all duration-500 rotate-0 scale-100 ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                        }`}
                />
                <Moon
                    className={`absolute inset-0 w-full h-full text-soul-violet transition-all duration-500 rotate-90 scale-0 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                        }`}
                />
            </div>

            {/* Tooltip */}
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-text-primary-light dark:text-text-primary-dark bg-surface-light dark:bg-surface-dark backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {theme === 'dark' ? 'Switch to Daybreak' : 'Switch to Midnight'}
            </span>
        </button>
    );
};

export default ThemeToggle;
