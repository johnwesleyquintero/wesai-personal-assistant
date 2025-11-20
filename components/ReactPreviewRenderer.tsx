import React, { useState, useEffect, useId, ReactNode, ComponentType, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Declare `Worker` for TypeScript without needing a separate .d.ts file if targeting older TS versions
declare global {
  interface Window {
    // If you are targeting ES6/ES2015 lib in tsconfig, Worker might already be declared.
    // Otherwise, you might need to declare it explicitly for the global scope if not using 'webworker' lib.
    // Worker: typeof Worker;
  }
}

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
    if (this.state.hasError) {
      if (this.props.onErrorRender) {
        return this.props.onErrorRender(this.state.error);
      }
      const errorMessage =
        this.state.error instanceof Error
          ? this.state.error.message
          : typeof this.state.error === 'string'
            ? this.state.error
            : 'An unknown rendering error occurred.';

      return (
        <div className="p-2 text-red-500 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-700">
          <p className="font-semibold text-sm">Preview Error:</p>
          <pre className="text-xs whitespace-pre-wrap mt-1">{errorMessage}</pre>
        </div>
      );
    }
    return this.props.children;
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
  showTranspiledCode = false, // Default to false
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState<unknown | null>(null);
  const [iframeContent, setIframeContent] = useState<string | null>(null); // To store rendered HTML from iframe

  const uniqueId = useId();
  const [transpiledCodeForDebug, setTranspiledCodeForDebug] = useState<string | null>(null);
  const [transpilationError, setTranspilationError] = useState<unknown | null>(null);

  // Effect to handle Babel transpilation
  useEffect(() => {
    setTranspilationError(null);
    setTranspiledCodeForDebug(null);

    if (!code || code.trim() === '') {
      setTranspilationError('No code provided for preview.');
      return;
    }

    // Create a new Web Worker instance
    // It's important to use a bundler-friendly way to reference the worker file,
    // or ensure 'babel-worker.ts' is directly accessible as 'babel-worker.js' at runtime.
    const worker = new Worker('babel-worker.ts');

    worker.onmessage = (event: MessageEvent) => {
      const { type, transpiledCode, error } = event.data;
      if (type === 'TRANSPILE_SUCCESS') {
        setTranspiledCodeForDebug(transpiledCode);
        setTranspilationError(null);
      } else if (type === 'TRANSPILE_ERROR') {
        console.error('Error from Babel Web Worker:', error);
        setTranspilationError(error);
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
    setIframeError(null);
    setIframeContent(null);

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
            '*'
        );
    }

    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [iframeLoaded, transpiledCodeForDebug, code, darkTheme, transpilationError]);

  const renderErrorState = (caughtError: unknown): ReactNode => {
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
    if (
      caughtError &&
      typeof caughtError === 'object' &&
      'message' in caughtError &&
      'transpiledCode' in caughtError
    ) {
      message = (caughtError as any).message;
      stack = (caughtError as any).stack;
      debugCode = (caughtError as any).transpiledCode;
      message = `Execution Error in Sandbox: ${message}`;
    } else if (caughtError instanceof Error) {
      message = caughtError.message;
      stack = caughtError.stack;
      debugCode = transpiledCodeForDebug; // Use parent's transpiled code for main thread errors
      // Check if it's likely a transpilation error based on message
      if (message.includes('Babel')) {
        message = `Transpilation Error: ${message}`;
      } else {
        message = `Execution Error: ${message}`;
      }
    } else if (typeof caughtError === 'string') {
      message = caughtError;
    } else {
      // Attempt to stringify other types of errors
      try {
        message = `Unknown Error Type: ${JSON.stringify(caughtError)}`;
      } catch (err) {
        message = 'An unstringifiable unknown error occurred.';
      }
    }

    return (
      <div className="p-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/40 rounded border border-red-300 dark:border-red-600">
        <strong className="font-semibold">Component Preview Error:</strong>
        <pre className="mt-1 text-xs whitespace-pre-wrap">{message}</pre>
        {stack && (
          <details className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <summary>Stack Trace</summary>
            <pre className="mt-1 whitespace-pre-wrap break-all">{stack}</pre>
          </details>
        )}
        {(debugCode || transpiledCodeForDebug) && (
          <details className="mt-3 pt-3 border-t border-red-300 dark:border-red-600">
            <summary className="font-semibold">Transpiled Code (for debug)</summary>
            <pre className="mt-1 text-xs whitespace-pre-wrap break-all bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {debugCode || transpiledCodeForDebug}
            </pre>
          </details>
        )}
        {!(stack) && !(debugCode || transpiledCodeForDebug) && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Check the browser console for more details.
          </p>
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

  // If iframe has reported an error
  if (iframeError) {
    return renderErrorState(iframeError);
  }

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
              'p-2 border border-dashed rounded bg-white text-black min-h-[50px] overflow-auto',
              darkTheme ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300',
            ),
          )}
          dangerouslySetInnerHTML={{ __html: iframeContent }}
        />
        <iframe
          ref={iframeRef}
          src="./preview-iframe.html"
          title="React Code Preview Sandbox"
          sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'none', // Initially hide the iframe, we render its content directly
          }}
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
