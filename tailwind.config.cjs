/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: {
          950: 'var(--main-950)',
          900: 'var(--main-900)',
          800: 'var(--main-800)',
          700: 'var(--main-700)',
          600: 'var(--main-600)',
          500: 'var(--main-500)',
          400: 'var(--main-400)',
          300: 'var(--main-300)',
          200: 'var(--main-200)',
          100: 'var(--main-100)',
          50: 'var(--main-50)',
          gold: {
            DEFAULT: 'var(--main-gold)',
            dim: 'var(--main-gold-dim)',
            glow: 'var(--main-gold-glow)'
          },
          accent: 'var(--main-accent)',
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', 'serif'], // I'll need to import a google font maybe, or just fallback
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

