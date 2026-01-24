import React from 'react';
import { FaSpinner } from 'react-icons/fa6';

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
  return (
    <div className="flex items-center justify-center">
      <FaSpinner className={className || 'animate-spin -ml-1 mr-3 h-5 w-5 text-app-accent'} />
    </div>
  );
};
