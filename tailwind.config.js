import typography from '@tailwindcss/typography';
import scrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Ensure class-based dark mode is enabled
  theme: {
    extend: {
      colors: {
        app: {
          main: 'var(--bg-main)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          border: 'var(--border-main)',
          accent: 'var(--accent-main)',
          'accent-soft': 'var(--accent-soft)',
        },
        syntax: {
          keyword: 'var(--syntax-keyword)',
          string: 'var(--syntax-string)',
          function: 'var(--syntax-function)',
          comment: 'var(--syntax-comment)',
        },
      },
    },
  },
  plugins: [typography, scrollbar],
};
