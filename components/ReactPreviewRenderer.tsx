import type { ReactNode } from 'react';
import React, { useState, useEffect, useId, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Declare `Worker` for TypeScript without needing a separate .d.ts file if targeting older TS versions
// Declare `Worker` for TypeScript without needing a separate .d.ts file if targeting older TS versions
// If you are targeting ES6/ES2015 lib in tsconfig, Worker might already be declared.
// Otherwise, you might need to declare it explicitly for the global scope if not using 'webworker' lib.
// declare global {
//   interface Window {
//     Worker: typeof Worker;
//   }
// }

// Simple Error Boundary component to catch rendering errors within the preview
class PreviewErrorBoundary extends React.Component<
  { children: ReactNode; onErrorRender?: (error: unknown) => ReactNode },
  { hasError: boolean; error: unknown }
> {
  constructor(props: { children: ReactNode; onErrorRender?: (error: unknown) => ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Preview Error Boundary caught a rendering error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { onErrorRender, children } = this.props;

    if (hasError) {
      if (onErrorRender) {
        return onErrorRender(error);
      }
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'An unknown rendering error occurred.';

      return (
        <div className="p-2 text-red-500 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-700">
          <p className="font-semibold text-sm">Preview Error:</p>
          <pre className="text-xs whitespace-pre-wrap mt-1">{errorMessage}</pre>
        </div>
      );
    }
    return children;
  }
}

interface ReactPreviewRendererProps {
  /** The TypeScript/TSX/JavaScript code string to transpile and render. */
  code: string;
  /** Whether the parent application is in dark mode, to pass to the iframe. */
  darkTheme?: boolean;
  /** Optional function to render a custom error state (transpilation, evaluation, or rendering). */
  onErrorRender?: (error: unknown) => ReactNode;
  /** Optional function to render a loading state. */
  onLoadingRender?: () => ReactNode;
  /** Optional prop to always show the transpiled code for debugging purposes. */
  showTranspiledCode?: boolean;
}

// Babel options for transpilation
const babelOptions = {
  presets: [
    // Transpile modern JavaScript/TypeScript down to a compatible version
    [
      'env',
      {
        // Using 'commonjs' modules is necessary for evaluation with `new Function` and a mock `require`
        modules: 'commonjs',
        targets: 'defaults',
      },
    ],
    // Transpile React JSX/TSX
    [
      'react', // Use 'react' as the preset name for babel-standalone
      {
        // Use 'automatic' runtime for React 17+ for better ergonomics (no need to import React explicitly for JSX)
        runtime: 'automatic',
        // 'automatic' runtime injects `import { jsx } from 'react/jsx-runtime'` or `react/jsx-dev-runtime`.
        // We need to ensure these modules are resolvable by our `mockRequire`.
      },
    ],
    // Transpile TypeScript, enabling TSX parsing
    ['typescript', { allExtensions: true, isTSX: true }],
  ],
  // Set source type to 'module' to correctly parse import/export syntax (though we intercept require)
  sourceType: 'module' as const,
};

interface IframeError {
  message: string;
  stack?: string;
  transpiledCode?: string;
}

interface BabelWorkerResponse {
  type: 'TRANSPILE_SUCCESS' | 'TRANSPILE_ERROR';
  transpiledCode?: string;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

/**
 * Renders a live preview of React/TSX code by transpiling and evaluating it in the browser.
 * WARNING: EVALUATING ARBITRARY CODE WITH `new Function` IS A SEVERE SECURITY RISK
 * IF THE `code` PROP COMES FROM UNTRUSTED SOURCES. FOR PRODUCTION WITH UNTRUSTED INPUT,
 * USE A SANDBOXED IFRAME OR WEB WORKER.
 */
export const ReactPreviewRenderer: React.FC<ReactPreviewRendererProps> = ({
  code,
  onErrorRender,
  onLoadingRender,
  darkTheme,
  showTranspiledCode = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState<IframeError | null>(null);
  const [iframeContent, setIframeContent] = useState<string | null>(null); // To store rendered HTML from iframe

  const uniqueId = useId();
  const [transpiledCodeForDebug, setTranspiledCodeForDebug] = useState<string | null>(null);
  const [transpilationError, setTranspilationError] = useState<unknown | null>(() =>
    !code || code.trim() === '' ? 'No code provided for preview.' : null,
  );

  // Effect to handle Babel transpilation
  useEffect(() => {
    if (!code || code.trim() === '') {
      return;
    }

    // Create a new Web Worker instance
    // It's important to use a bundler-friendly way to reference the worker file,
    // or ensure 'babel-worker.ts' is directly accessible as 'babel-worker.js' at runtime.
    const worker = new Worker('babel-worker.ts');

    worker.onmessage = (event: MessageEvent<BabelWorkerResponse>) => {
      const { type, transpiledCode, error } = event.data;
      if (type === 'TRANSPILE_SUCCESS' && transpiledCode) {
        setTranspiledCodeForDebug(transpiledCode);
        setTranspilationError(null); // Clear any previous error on successful transpilation
      } else if (type === 'TRANSPILE_ERROR' && error) {
        console.error('Error from Babel Web Worker:', error);
        setTranspilationError(error); // Set error on transpilation failure
      }
    };

    worker.onerror = (errorEvent: ErrorEvent) => {
      console.error('Web Worker error:', errorEvent);
      setTranspilationError(new Error(`Web Worker error: ${errorEvent.message}`));
    };

    // Send the code to the worker for transpilation
    worker.postMessage({
      id: uniqueId, // Use uniqueId to identify messages if multiple workers were managed
      code: code,
      filename: `preview-${uniqueId}.tsx`,
      babelOptions: babelOptions,
    });

    // Cleanup worker on component unmount or code change
    return () => {
      worker.terminate();
    };
  }, [code, uniqueId]); // Depend on 'code' to re-run when the previewed code changes. uniqueId is stable.

  // Effect to manage iframe communication
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeMessage = (event: MessageEvent) => {
      // Ensure messages are from the expected iframe source
      if (iframe.contentWindow && event.source !== iframe.contentWindow) {
        return;
      }

      const { type, error, stack, transpiledCode, html } = event.data;

      switch (type) {
        case 'IFRAME_READY':
          setIframeLoaded(true);
          break;
        case 'PREVIEW_RENDER_SUCCESS':
          setIframeContent(html);
          setIframeError(null);
          break;
        case 'PREVIEW_ERROR':
          setIframeError({ message: error, stack, transpiledCode });
          setIframeContent(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleIframeMessage);

    // If iframe is loaded and we have transpiled code (and no transpilation error)
    // send it to the iframe for evaluation and rendering
    if (iframeLoaded && transpiledCodeForDebug && !transpilationError) {
      iframe.contentWindow?.postMessage(
        {
          type: 'PREVIEW_CODE',
          code: transpiledCodeForDebug,
          originalCode: code,
          darkTheme: darkTheme,
        },
        '*',
      );
    } else if (iframeLoaded && transpilationError) {
      // If there's a transpilation error, clear iframe content and report error
      iframe.contentWindow?.postMessage(
        { type: 'PREVIEW_CODE', code: null, originalCode: code, darkTheme: darkTheme },
        '*',
      );
    }

    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [iframeLoaded, transpiledCodeForDebug, code, darkTheme, transpilationError]);

  const renderErrorState = (caughtError: unknown): ReactNode => {
    const isIframeError = (e: unknown): e is IframeError => {
      return !!e && typeof e === 'object' && 'message' in e && 'transpiledCode' in e;
    };
    // Use the custom onErrorRender prop if provided by the user
    // This allows the consumer of ReactPreviewRenderer to control the error UI
    if (onErrorRender) {
      // Pass the original caught error value to the custom renderer
      return onErrorRender(caughtError);
    }

    // Default error rendering UI
    let message = 'An unknown error occurred.';
    let stack = null;
    let debugCode = null;

    // Check if it's an iframe error object
    if (isIframeError(caughtError)) {
      message = caughtError.message;
      stack = caughtError.stack ?? null;
      debugCode = caughtError.transpiledCode ?? null;
      message = `Sandbox Error: ${message}`;
    } else if (caughtError instanceof Error) {
      message = caughtError.message;
      stack = caughtError.stack;
      debugCode = transpiledCodeForDebug; // Use parent's transpiled code for main thread errors
      // Check if it's likely a transpilation error based on message
      if (message.includes('Babel') || message.includes('Worker')) {
        message = `Transpilation Error: ${message}`;
      } else {
        message = `Runtime Error: ${message}`;
      }
    } else if (typeof caughtError === 'string') {
      message = caughtError;
    } else {
      // Attempt to stringify other types of errors
      try {
        message = `Unknown Error Type: ${JSON.stringify(caughtError)}`;
      } catch (_err) {
        message = 'An unstringifiable unknown error occurred.';
      }
    }

    return (
      <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-red-700 dark:text-red-300 mb-1">Preview Error</h4>
            <p className="font-mono text-[11px] leading-relaxed break-words opacity-90">
              {message}
            </p>
          </div>
        </div>

        {stack && (
          <details className="mt-3 group">
            <summary className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500/70 hover:text-red-500 cursor-pointer select-none transition-colors">
              <span className="group-open:rotate-90 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
              View Stack Trace
            </summary>
            <div className="mt-2 p-2 bg-red-100/30 dark:bg-black/30 rounded-lg border border-red-200/50 dark:border-red-800/30">
              <pre className="text-[10px] font-mono leading-tight whitespace-pre-wrap break-all opacity-80 max-h-40 overflow-auto custom-scrollbar">
                {stack}
              </pre>
            </div>
          </details>
        )}

        {(debugCode || transpiledCodeForDebug) && (
          <details className="mt-2 group">
            <summary className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500/70 hover:text-red-500 cursor-pointer select-none transition-colors">
              <span className="group-open:rotate-90 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
              View Debug Code
            </summary>
            <div className="mt-2 p-2 bg-red-100/30 dark:bg-black/30 rounded-lg border border-red-200/50 dark:border-red-800/30">
              <pre className="text-[10px] font-mono leading-tight whitespace-pre-wrap break-all opacity-80 max-h-60 overflow-auto custom-scrollbar">
                {debugCode || transpiledCodeForDebug}
              </pre>
            </div>
          </details>
        )}
      </div>
    );
  };

  // --- Render Logic ---

  // --- Render Logic ---
  const displayDebugCode = showTranspiledCode && transpiledCodeForDebug;

  if (transpilationError) {
    return renderErrorState(transpilationError);
  }

  if (iframeError) {
    return renderErrorState(iframeError);
  }

  // If iframe has reported an error
  // If iframe is not loaded or no content has been rendered yet
  if (!iframeLoaded || !iframeContent) {
    if (onLoadingRender) {
      return onLoadingRender();
    }
    return (
      <>
        <div className="p-3 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
          Loading preview...
        </div>
        {displayDebugCode && (
          <details className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
            <summary className="font-semibold text-sm">Transpiled Code (for debug)</summary>
            <pre className="mt-1 text-xs whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-700/20 p-2 rounded">
              {transpiledCodeForDebug}
            </pre>
          </details>
        )}
      </>
    );
  }

  // If iframe content is ready, render it directly within an Error Boundary to catch React errors
  return (
    <>
      <PreviewErrorBoundary onErrorRender={renderErrorState}>
        {/* We can directly inject the HTML received from the iframe */}
        <div
          className={twMerge(
            clsx(
              'p-4 border border-dashed rounded-xl bg-app-main text-app-text min-h-[50px] overflow-auto border-app-border transition-all duration-300',
            ),
          )}
          dangerouslySetInnerHTML={{ __html: iframeContent }}
        />
        <iframe
          ref={iframeRef}
          src="./preview-iframe.html"
          title="React Code Preview Sandbox"
          className="w-full h-full border-none hidden"
          sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
          onLoad={() => setIframeLoaded(true)}
        />
      </PreviewErrorBoundary>
      {displayDebugCode && (
        <details className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
          <summary className="font-semibold text-sm">Transpiled Code (for debug)</summary>
          <pre className="mt-1 text-xs whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-700/20 p-2 rounded">
            {transpiledCodeForDebug}
          </pre>
        </details>
      )}
    </>
  );
};
