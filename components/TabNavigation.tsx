import React from 'react';
import { ActiveTab } from '../types.ts';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  tabs: { id: ActiveTab; label: string }[];
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="mb-6 border-b border-gray-300 dark:border-gray-700 flex overflow-x-auto whitespace-nowrap no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-shrink-0 py-3 px-4 font-medium text-sm sm:text-base border-b-2 transition-colors duration-150 ease-in-out
                      ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
