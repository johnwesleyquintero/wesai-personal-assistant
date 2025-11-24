import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Base public path when served in production.
  // Useful if your app is not served from the root.
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      // Set up an alias for the 'src' directory to simplify imports
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Customize rollup options for chunking
    rollupOptions: {
      output: {
        manualChunks: {
          // Example: Group react and react-dom into a separate vendor chunk
          react: ['react', 'react-dom'],
          // You can add more specific chunks for large libraries
          // 'gemini-sdk': ['@google/generative-ai'],
        },
      },
    },
    minify: 'esbuild',
  },
});
