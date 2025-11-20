// babel-worker.ts

// Import Babel standalone library into the worker's global scope
declare function importScripts(...urls: string[]): void;
importScripts('https://unpkg.com/@babel/standalone/babel.min.js');

// This is the main message handler for the Web Worker
self.onmessage = (event: MessageEvent) => {
  // Babel should now be available globally after importScripts
  const Babel = (self as any).Babel;
  // The check for Babel's presence might still be good for robustness,
  // though importScripts should ensure it's loaded.
  if (!Babel) {
    self.postMessage({
      id: event.data.id,
      type: 'TRANSPILE_ERROR',
      error: {
        message: 'Babel is not loaded in the Web Worker context after importScripts.',
        name: 'RuntimeError',
      },
    });
    return;
  }

  const { id, code, filename, babelOptions } = event.data;

  try {
    const transformed = Babel.transform(code, {
      ...babelOptions,
      filename: filename,
    });

    if (!transformed.code) {
      throw new Error('Babel transpilation failed: No output code generated.');
    }

    // Post the successful result back to the main thread
    self.postMessage({ id, type: 'TRANSPILE_SUCCESS', transpiledCode: transformed.code });
  } catch (e: unknown) {
    // Post any errors back to the main thread
    self.postMessage({
      id,
      type: 'TRANSPILE_ERROR',
      error: {
        message: (e as Error).message,
        stack: (e as Error).stack,
        name: (e as Error as { name?: string }).name,
      },
    });
  }
};
