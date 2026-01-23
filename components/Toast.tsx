import React, { memo } from 'react';
import { useAppStore, type Toast as ToastType } from '../store';
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
  FaXmark,
} from 'react-icons/fa6';

interface ToastProps {
  toast: ToastType;
}

const ToastItem: React.FC<ToastProps> = ({ toast }) => {
  const removeToast = useAppStore((state) => state.removeToast);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FaCircleCheck className="w-5 h-5 text-green-500" />;
      case 'error':
        return <FaCircleExclamation className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <FaTriangleExclamation className="w-5 h-5 text-amber-500" />;
      default:
        return <FaCircleInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-100 dark:border-green-900/30 bg-green-50/90 dark:bg-green-900/20';
      case 'error':
        return 'border-red-100 dark:border-red-900/30 bg-red-50/90 dark:bg-red-900/20';
      case 'warning':
        return 'border-amber-100 dark:border-amber-900/30 bg-amber-50/90 dark:bg-amber-900/20';
      default:
        return 'border-blue-100 dark:border-blue-900/30 bg-blue-50/90 dark:bg-blue-900/20';
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 pr-10 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto relative ${getStyles()}`}
      role="alert"
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="absolute top-1/2 -translate-y-1/2 right-3 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        aria-label="Close notification"
      >
        <FaXmark className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = memo(() => {
  const toasts = useAppStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
});
