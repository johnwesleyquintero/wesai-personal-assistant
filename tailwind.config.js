import typography from '@tailwindcss/typography';
import scrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Ensure class-based dark mode is enabled
  theme: {
    extend: {},
  },
  plugins: [typography, scrollbar],
};
