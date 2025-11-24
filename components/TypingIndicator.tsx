import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 p-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl shadow fade-in max-w-fit">
      <span className="sr-only">WesAI is typing</span>
      <div className="h-2 w-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce-1"></div>
      <div className="h-2 w-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce-2"></div>
      <div className="h-2 w-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce-3"></div>
    </div>
  );
};
