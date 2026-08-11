/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pacu: {
          red: '#C8102E',
          'red-dark': '#a30d24',
          gold: '#F5B041',
          'gold-dark': '#e09b30',
          green: '#1B7340',
          'green-dark': '#155730',
          black: '#1A1A1A',
          white: '#FFFFFF',
          river: '#1A5276',
          'river-dark': '#0e3a54',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'wave-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='20' viewBox='0 0 80 20'%3E%3Cpath d='M0 10 Q10 2 20 10 T40 10 T60 10 T80 10' stroke='%231A5276' stroke-width='1' fill='none' opacity='0.08'/%3E%3C/svg%3E\")",
        'hero-gradient': 'linear-gradient(135deg, #C8102E 0%, #a30d24 40%, #1A1A1A 100%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translate(-50%, 12px)' },
          to: { opacity: '1', transform: 'translate(-50%, 0)' },
        },
        'wave-flow': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-80px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'wave-flow': 'wave-flow 6s linear infinite',
        'float-slow': 'float-slow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
