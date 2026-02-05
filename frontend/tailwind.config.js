/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#0f172a',
          950: '#020617',
        },
        indigo: {
          950: '#1e1b4b',
        },
        violet: {
          950: '#2e1065',
        },
        primary: '#14b8a6',
        // Semantic Theme Colors
        background: {
          light: '#fafaf9', // Stone-50
          dark: '#020617',  // Slate-950
        },
        surface: {
          light: 'rgba(255, 255, 255, 0.6)',
          dark: 'rgba(255, 255, 255, 0.05)',
        },
        'text-primary': {
          light: '#1e1b4b', // Indigo-950
          dark: '#f1f5f9',  // Slate-100
        },
        'text-muted': {
          light: '#64748b', // Slate-500
          dark: '#94a3b8',  // Slate-400
        },
        // The "Soul" Accents
        soul: {
          violet: '#8b5cf6',
          gold: '#fbbf24',
          rain: '#7dd3fc',
          sage: '#86efac',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 1.5s ease-out forwards',
        'slide-up': 'slide-up 0.8s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}
