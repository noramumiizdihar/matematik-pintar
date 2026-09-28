/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        math: {
          blue: '#3b82f6',
          green: '#10b981',
          yellow: '#f59e0b',
          purple: '#8b5cf6',
          pink: '#ec4899',
          orange: '#f97316',
          teal: '#14b8a6',
          red: '#ef4444'
        }
      },
      fontFamily: {
        kids: ['"Nunito"', 'system-ui', 'sans-serif']
      },
      // `border-3` is used throughout the UI but is not a stock Tailwind width,
      // so without this every one of those borders silently rendered as 0px.
      borderWidth: {
        3: '3px'
      },
      animation: {
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'pop': {
          '0%': { transform: 'scale(0.85)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-4deg)' },
          '75%': { transform: 'rotate(4deg)' }
        },
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      }
    },
  },
  plugins: [],
}
