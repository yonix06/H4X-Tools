/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hacker-green': '#10b981',
        'terminal-black': '#282c34',
        'dark-gray': {
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        '400': '400px',
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
}

