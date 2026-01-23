import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FaTriangleExclamation, FaArrowsRotate } from 'react-icons/fa6';
import { WesAILogo } from './WesAILogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F1A] p-4 font-sans transition-colors duration-300">
          <div className="max-w-md w-full bg-white dark:bg-[#151B28] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                <WesAILogo className="w-16 h-16 relative z-10" />
              </div>
            </div>

            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-6">
              <FaTriangleExclamation className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
              Something went wrong
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              We encountered an unexpected error. Don&apos;t worry, your data is safe. Try
              refreshing the application.
            </p>

            {import.meta.env.DEV && error && (
              <div className="mb-8 p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800 text-left overflow-hidden">
                <p className="text-xs font-mono text-red-500 dark:text-red-400 break-words">
                  {error.toString()}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              <FaArrowsRotate className="w-4 h-4" />
              <span>Reload Application</span>
            </button>

            <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}
