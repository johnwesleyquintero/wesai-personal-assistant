import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

import type { Theme } from '../types';

interface ThemeToggleButtonProps {
  currentTheme: Theme;
  toggleTheme: () => void;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  currentTheme,
  toggleTheme,
}) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-purple-500 dark:text-purple-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors duration-150"
      aria-label={currentTheme === 'light' ? 'Toggle dark mode' : 'Toggle light mode'}
      title={currentTheme === 'light' ? 'Toggle dark mode' : 'Toggle light mode'}
    >
      {currentTheme === 'light' ? <FaMoon className="w-6 h-6" /> : <FaSun className="w-6 h-6" />}
    </button>
  );
};
