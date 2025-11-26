import { memo } from 'react';
import { FaCog } from 'react-icons/fa';
import type { Theme } from '../types';
import { ThemeToggleButton } from './ThemeToggleButton'; // Import ThemeToggleButton
import { WesAILogo } from './WesAILogo'; // Import WesAILogo

interface HeaderProps {
  toggleTheme: () => void;
  currentTheme: Theme;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = memo(
  ({ onSettingsClick, toggleTheme, currentTheme }) => {
    return (
      <header className="flex items-center justify-between px-4 py-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="flex items-center">
          {' '}
          {/* Group logo to the left */}
          <div className="relative">
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-lg animate-pulse" />

            {/* Logo with enhanced styling */}
            <div className="relative">
              <WesAILogo size="large" className="drop-shadow-2xl" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {' '}
          {/* Group buttons to the right with some space */}
          <div className="flex items-center space-x-2 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-full backdrop-blur-sm">
            <ThemeToggleButton currentTheme={currentTheme} toggleTheme={toggleTheme} />
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
            <button
              onClick={onSettingsClick}
              className="p-2 text-purple-500 rounded-full hover:bg-gray-200/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:text-purple-400 dark:hover:bg-gray-700/50 dark:focus-visible:ring-purple-400 dark:focus-visible:ring-offset-2 transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Open settings"
              title="Open settings"
            >
              <FaCog className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
    );
  },
);
