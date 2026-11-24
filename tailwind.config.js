/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        medieval: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          gold: '#d29922',
          vermilion: '#e63946',
          indigo: '#3d5a80',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', '"IM Fell English SC"', 'serif'],
        serif: ['"MedievalSharp"', '"IM Fell English"', 'serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
};
