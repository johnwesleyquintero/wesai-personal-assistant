import React, { useState } from 'react';
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
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative p-3 rounded-full 
        bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 
        dark:from-blue-600 dark:via-purple-600 dark:to-pink-600
        text-white shadow-lg hover:shadow-xl 
        transform hover:scale-105 active:scale-95
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-purple-400/50 dark:focus:ring-purple-500/50
        ${isAnimating ? 'animate-pulse' : ''}
      `}
      aria-label={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {/* Background glow effect */}
      <div
        className={`
        absolute inset-0 rounded-full 
        bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-red-400/20
        dark:from-blue-400/20 dark:via-purple-400/20 dark:to-pink-400/20
        blur-sm transition-opacity duration-500
        ${currentTheme === 'light' ? 'opacity-100' : 'opacity-0'}
      `}
      />

      {/* Icon container with smooth rotation */}
      <div
        className={`
        relative z-10 transform transition-transform duration-500 ease-in-out
        ${currentTheme === 'light' ? 'rotate-0' : 'rotate-180'}
      `}
      >
        {currentTheme === 'light' ? (
          <FaMoon className="w-5 h-5 drop-shadow-sm" />
        ) : (
          <FaSun className="w-5 h-5 drop-shadow-sm" />
        )}
      </div>

      {/* Subtle particles effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className={`
          absolute w-1 h-1 bg-white/60 rounded-full
          top-1 right-2 animate-ping
          ${currentTheme === 'light' ? 'opacity-60' : 'opacity-0'}
        `}
        />
        <div
          className={`
          absolute w-0.5 h-0.5 bg-white/40 rounded-full
          bottom-2 left-1 animate-ping animation-delay-200
          ${currentTheme === 'light' ? 'opacity-40' : 'opacity-0'}
        `}
        />
        <div
          className={`
          absolute w-1 h-1 bg-white/50 rounded-full
          top-2 left-2 animate-ping animation-delay-400
          ${currentTheme === 'dark' ? 'opacity-50' : 'opacity-0'}
        `}
        />
      </div>

      {/* Ripple effect on click */}
      <div
        className={`
        absolute inset-0 rounded-full
        bg-white/0 hover:bg-white/10 active:bg-white/20
        transition-colors duration-150
      `}
      />
    </button>
  );
};
