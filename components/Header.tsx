import React from 'react';
import { FaCog } from 'react-icons/fa';
import { Theme } from '../types';

interface HeaderProps {
  title: string;
  toggleTheme: () => void;
  currentTheme: Theme;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onSettingsClick }) => {
  return (
    <header className="relative py-4 text-center">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 py-2 sm:text-5xl">
        {title}
      </h1>
      <div className="absolute top-0 right-0 p-4">
        <button
          onClick={onSettingsClick}
          className="p-2 text-gray-500 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-purple-400"
          aria-label="Open settings"
          title="Open settings"
        >
          <FaCog className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
