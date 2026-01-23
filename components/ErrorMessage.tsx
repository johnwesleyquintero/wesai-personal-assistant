import React, { memo } from 'react';
import { FaTriangleExclamation } from 'react-icons/fa6';

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

    const getActionableAdvice = (errorMsg: string): string => {
      const e = errorMsg.toLowerCase();
      if (e.includes('rate') || e.includes('429') || e.includes('busy') || e.includes('503'))
        return 'Rate limit exceeded or service is busy. Please try again in a moment.';
      if (
        e.includes('auth') ||
        e.includes('key') ||
        e.includes('invalid') ||
        e.includes('credentials')
      )
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

    const getDetailedErrorMessage = (errorMsg: string): string => {
      const e = errorMsg.toLowerCase();
      if (e.includes('safety') || e.includes('blocked'))
        return 'Safety settings prevented the response from being generated. This usually happens with sensitive content.';
      if (e.includes('rate') || e.includes('429') || e.includes('busy') || e.includes('503'))
        return 'The service is experiencing high demand or a temporary outage. Please wait a few moments before trying again.';
      if (
        e.includes('auth') ||
        e.includes('key') ||
        e.includes('invalid') ||
        e.includes('credentials')
      )
        return 'The provided API key is either missing, invalid, or has expired. Access to the service requires a valid API key.';
      if (
        e.includes('model') ||
        e.includes('unsupported') ||
        e.includes('deprecated') ||
        e.includes('404')
      )
        return 'The requested model is currently unavailable or not supported for your region/account. Please ensure your model selection is correct.';
      return errorMsg; // Fallback to original message if no specific detail is found
    };

    const actionableAdvice = getActionableAdvice(message);
    const detailedError = getDetailedErrorMessage(message);

    return (
      <div
        className={`mt-4 p-4 border border-red-200 dark:border-red-900/30 ${
          isChatError ? 'bg-red-50 dark:bg-red-900/20' : 'bg-red-50 dark:bg-red-900/10'
        } text-red-700 dark:text-red-300 text-sm flex items-center justify-between rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
            <FaTriangleExclamation className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          </div>
          <span className="relative group">
            <strong className="mr-1 font-bold">Error:</strong>
            {actionableAdvice}
            {actionableAdvice !== detailedError && (
              <span className="absolute left-0 top-full mt-2 hidden group-hover:block bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-[11px] px-3 py-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 min-w-[200px] leading-relaxed">
                {detailedError}
              </span>
            )}
          </span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            Retry
          </button>
        )}
      </div>
    );
  },
);
