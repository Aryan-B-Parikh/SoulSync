/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./frontend/src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        // Semantic names allow for easy theming
        background: {
          light: '#fafaf9', // Stone-50
          dark: '#020617',  // Slate-950
        },
        surface: {
          light: 'rgba(255, 255, 255, 0.6)',
          dark: 'rgba(255, 255, 255, 0.05)',
        },
        text: {
          primary: {
            light: '#1e1b4b', // Indigo-950
            dark: '#f1f5f9',  // Slate-100
          },
          muted: {
            light: '#64748b', // Slate-500
            dark: '#94a3b8',  // Slate-400
          }
        },
        // The "Fun" Accents
        soul: {
          violet: '#8b5cf6',
          gold: '#fbbf24',
          rain: '#7dd3fc',
          sage: '#86efac',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} 