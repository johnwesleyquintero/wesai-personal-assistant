import React, { memo } from 'react';

interface ErrorMessageProps {
  message: string | null;
  onRetry?: () => void; // Optional retry function for certain errors (e.g., chat)
  isChatError?: boolean; // Specific styling/logic for chat-related errors
}

export const ErrorMessage: React.FC<ErrorMessageProps> = memo(
  ({ message, onRetry, isChatError = false }) => {
    if (!message) {
      return null;
    }

    const getTooltipContent = (errorMsg: string): string => {
      const e = errorMsg.toLowerCase();
      if (e.includes('rate') || e.includes('429') || e.includes('busy') || e.includes('503'))
        return 'Rate limited or service busy. Please try again in a moment.';
      if (e.includes('auth') || e.includes('key') || e.includes('invalid'))
        return 'Authentication issue. Please check your API key in settings.';
      if (
        e.includes('model') ||
        e.includes('unsupported') ||
        e.includes('deprecated') ||
        e.includes('404')
      )
        return 'Model unavailable or unsupported. Please try updating your model in settings or contact support.';
      if (e.includes('safety') || e.includes('blocked'))
        return 'The response was blocked due to safety settings. Please try rephrasing your prompt.';
      return 'An unexpected error occurred. Please try again.';
    };

    return (
      <div
        className={`mt-4 p-3 border-b border-red-300 dark:border-red-600 ${
          isChatError ? 'bg-red-100 dark:bg-red-900/50' : 'bg-red-100 dark:bg-red-700/30'
        } text-red-700 dark:text-red-200 text-sm flex items-center justify-between rounded-md shadow`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center space-x-2">
          {(message.toLowerCase().includes('safety') ||
            message.toLowerCase().includes('blocked') ||
            message.toLowerCase().includes('rate')) && (
            <span className="relative group px-2 py-0.5 text-xs font-semibold rounded-full bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200">
              {message.toLowerCase().includes('safety') || message.toLowerCase().includes('blocked')
                ? 'Safety Blocked'
                : 'Service Issue'}
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-[10px] px-3 py-1.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10 whitespace-nowrap">
                {getTooltipContent(message)}
              </span>
            </span>
          )}
          <span className={`${isChatError ? 'ml-2' : ''}`}>
            <strong>Error:</strong> {message}
          </span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Retry
          </button>
        )}
      </div>
    );
  },
);
