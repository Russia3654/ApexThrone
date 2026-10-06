/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0B10',
        surface: { DEFAULT: '#12141C', 2: '#1A1D28' },
        gold: '#E8B84A',
        crimson: '#E63946',
        cyan: '#3DD9EB',
        ink: { DEFAULT: '#F2F2F5', muted: '#8A8FA3' },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(232, 184, 74, 0.35)',
        'glow-red': '0 0 20px rgba(230, 57, 70, 0.35)',
      },
    },
  },
  plugins: [],
}

