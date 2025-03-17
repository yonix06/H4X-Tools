/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    'dark',
    'bg-dark-gray-900',
    'text-gray-100',
    'bg-gray-100',
    'text-gray-900',
    {
      pattern: /(bg|text|border)-(dark-gray|hacker-green|gray|red|blue|yellow|orange)-(100|200|300|400|500|600|700|800|900)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        'hacker-green': '#00ff00',
        'dark-gray': {
          700: '#2d2d2d',
          800: '#1f1f1f',
          900: '#141414',
        },
        'cyber-purple': {
          500: '#9333ea',
          600: '#7928ca',
          700: '#6b21a8',
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['Fira Code', 'ui-monospace', 'monospace'],
      },
      spacing: {
        '400': '400px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),
  ],
  important: true,
}

