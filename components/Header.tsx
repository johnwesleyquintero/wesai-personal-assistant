import { memo } from 'react';
import { FaGear, FaMessage, FaCode, FaRobot } from 'react-icons/fa6';
import type { Theme, ActiveTab } from '../types';
import { ThemeToggleButton } from './ThemeToggleButton';
import { WesAILogo } from './WesAILogo';

interface HeaderProps {
  toggleTheme: () => void;
  currentTheme: Theme;
  onSettingsClick: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  tabs: { id: ActiveTab; label: string }[];
}

const getTabIcon = (id: ActiveTab) => {
  switch (id) {
    case 'chat':
      return <FaMessage className="w-3.5 h-3.5" />;
    case 'content':
      return <FaCode className="w-3.5 h-3.5" />;
    case 'ai-agents':
      return <FaRobot className="w-3.5 h-3.5" />;
    default:
      return null;
  }
};

export const Header: React.FC<HeaderProps> = memo(
  ({ onSettingsClick, toggleTheme, currentTheme, activeTab, onTabChange, tabs }) => {
    return (
      <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <WesAILogo size="large" />

            {/* Navigation Tabs in Header */}
            <nav className="hidden md:flex items-center bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                    }`}
                  >
                    {getTabIcon(tab.id)}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <ThemeToggleButton currentTheme={currentTheme} toggleTheme={toggleTheme} />
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-600/50" />
              <button
                onClick={onSettingsClick}
                className="p-2.5 text-gray-500 hover:text-purple-600 rounded-xl hover:bg-white dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-all duration-200 hover:shadow-sm active:scale-95"
                aria-label="Open settings"
                title="Open settings"
              >
                <FaGear className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs (below header on small screens) */}
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 p-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {getTabIcon(tab.id)}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>
    );
  },
);
