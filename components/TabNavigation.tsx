import { forwardRef } from 'react';
import type { ActiveTab } from '../types.ts';
import { FaMessage, FaCode, FaRobot } from 'react-icons/fa6';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  tabs: { id: ActiveTab; label: string }[];
}

const getTabIcon = (id: ActiveTab) => {
  switch (id) {
    case 'chat':
      return <FaMessage className="w-4 h-4" />;
    case 'content':
      return <FaCode className="w-4 h-4" />;
    case 'ai-agents':
      return <FaRobot className="w-4 h-4" />;
    default:
      return null;
  }
};

export const TabNavigation = forwardRef<HTMLDivElement, TabNavigationProps>(
  ({ activeTab, onTabChange, tabs }, ref) => {
    return (
      <div
        ref={ref}
        className="mb-8 border-b border-gray-100 dark:border-gray-800 flex overflow-x-auto whitespace-nowrap scrollbar-hide"
      >
        <div className="flex gap-2 p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`group flex items-center gap-2.5 py-3 px-6 font-bold text-sm transition-all duration-300 rounded-xl relative
                          ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                >
                  {getTabIcon(tab.id)}
                </span>
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-in fade-in zoom-in-x-0 duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
