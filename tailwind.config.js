/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0a0f1d',
          card: '#111827',
          cardHover: '#172033',
          border: '#1f293d',
          accent: '#10b981', // Emerald
          accentPurple: '#6366f1', // Indigo
          accentCyan: '#06b6d4',
          warning: '#f59e0b',
          danger: '#ef4444',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.3)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'card-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-down': 'slideDown 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      }
    },
  },
  plugins: [],
}
