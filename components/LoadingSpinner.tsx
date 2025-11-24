import React from 'react';
import { LoadingIcon } from './icons/LoadingIcon';

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
  return (
    <div className="flex items-center justify-center">
      <LoadingIcon
        className={className || 'animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700 dark:text-white'}
      />
    </div>
  );
};
