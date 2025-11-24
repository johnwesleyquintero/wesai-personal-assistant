import { memo } from 'react';
import { FaCog } from 'react-icons/fa';
import type { Theme } from '../types';
import { ThemeToggleButton } from './ThemeToggleButton'; // Import ThemeToggleButton

interface HeaderProps {
  title: string;
  toggleTheme: () => void;
  currentTheme: Theme;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = memo(
  ({ title, onSettingsClick, toggleTheme, currentTheme }) => {
    return (
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          {' '}
          {/* Group title to the left */}
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 sm:text-5xl">
            {title}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {' '}
          {/* Group buttons to the right with some space */}
          <ThemeToggleButton currentTheme={currentTheme} toggleTheme={toggleTheme} />
          <button
            onClick={onSettingsClick}
            className="p-2 text-purple-500 rounded-full hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:text-purple-400 dark:hover:bg-gray-700 dark:focus-visible:ring-purple-400 dark:focus-visible:ring-offset-2 transition-colors duration-150"
            aria-label="Open settings"
            title="Open settings"
          >
            <FaCog className="w-6 h-6" />
          </button>
        </div>
      </header>
    );
  },
);
