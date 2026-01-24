import { memo } from 'react';
import { FaGear, FaMessage, FaCode, FaRobot } from 'react-icons/fa6';
import type { Theme, ActiveTab } from '../types';
import { ThemeToggleButton } from './ThemeToggleButton';
import { WesAILogo } from './WesAILogo';
import { useIsMobile } from './hooks/useMediaQuery.ts';

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
    const isMobile = useIsMobile();

    return (
      <header className="w-full bg-app-main/80 backdrop-blur-md border-b border-app-border sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <WesAILogo size={isMobile ? 'medium' : 'large'} />

            {/* Navigation Tabs in Header */}
            <nav className="hidden md:flex items-center bg-app-tertiary/50 p-1 rounded-2xl border border-app-border/50">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-app-main text-app-accent shadow-sm'
                        : 'text-app-muted hover:text-app-text'
                    }`}
                  >
                    {getTabIcon(tab.id)}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div
              className={`flex items-center ${isMobile ? 'space-x-1 p-1' : 'space-x-2 p-1.5'} bg-app-tertiary/50 rounded-2xl backdrop-blur-sm border border-app-border/50`}
            >
              <ThemeToggleButton currentTheme={currentTheme} toggleTheme={toggleTheme} />
              <div className="w-px h-5 bg-app-border" />
              <button
                onClick={onSettingsClick}
                className={`${isMobile ? 'p-1.5' : 'p-2.5'} text-app-muted hover:text-app-accent rounded-xl hover:bg-app-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent transition-all duration-200 hover:shadow-sm active:scale-95`}
                aria-label="Open settings"
                title="Open settings"
              >
                <FaGear className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs (below header on small screens) */}
        <div className="md:hidden border-t border-app-border bg-app-secondary/30 overflow-x-auto custom-scrollbar-hide">
          <div className="flex items-center p-1.5 gap-1.5 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-app-accent text-white shadow-lg shadow-app-accent/20'
                      : 'bg-app-tertiary/50 text-app-muted border border-app-border/50'
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
