import React, { memo } from 'react';
import { FaTriangleExclamation } from 'react-icons/fa6';
import { classifyError } from '../utils/errorUtils';

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

    const { actionableAdvice, detailedMessage } = classifyError(message);

    return (
      <div
        className={`mt-4 p-4 border ${
          isChatError ? 'border-red-500/20 bg-red-500/10' : 'border-red-500/20 bg-red-500/5'
        } text-red-600 dark:text-red-400 text-sm flex items-center justify-between rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <FaTriangleExclamation className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          </div>
          <span className="relative group">
            <strong className="mr-1 font-bold uppercase tracking-tight">Error:</strong>
            {actionableAdvice}
            {actionableAdvice !== detailedMessage && (
              <span className="absolute left-0 top-full mt-2 hidden group-hover:block bg-app-main text-app-text text-[11px] px-3 py-2 rounded-xl shadow-xl border border-app-border z-50 min-w-[200px] leading-relaxed">
                {detailedMessage}
              </span>
            )}
          </span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all active:scale-95 shadow-sm"
          >
            Retry
          </button>
        )}
      </div>
    );
  },
);
