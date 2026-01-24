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
        return <FaCircleInfo className="w-5 h-5 text-app-accent" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400';
      case 'error':
        return 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400';
      default:
        return 'border-app-accent/20 bg-app-accent-soft text-app-accent';
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 pr-10 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto relative ${getStyles()}`}
      role="alert"
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className="text-sm font-bold tracking-tight">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="absolute top-1/2 -translate-y-1/2 right-3 p-1 opacity-60 hover:opacity-100 transition-all active:scale-95"
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
