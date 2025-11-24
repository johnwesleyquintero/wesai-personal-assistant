// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  // Base public path when served in production.
  // Useful if your app is not served from the root.
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      // Set up an alias for the 'src' directory to simplify imports
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    // Customize rollup options for chunking
    rollupOptions: {
      output: {
        manualChunks: {
          // Example: Group react and react-dom into a separate vendor chunk
          react: ["react", "react-dom"],
          // You can add more specific chunks for large libraries
          "google-genai": ["@google/generative-ai"],
          "react-icons": ["react-icons"]
        }
      }
    },
    minify: "esbuild"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIC8vIEJhc2UgcHVibGljIHBhdGggd2hlbiBzZXJ2ZWQgaW4gcHJvZHVjdGlvbi5cbiAgLy8gVXNlZnVsIGlmIHlvdXIgYXBwIGlzIG5vdCBzZXJ2ZWQgZnJvbSB0aGUgcm9vdC5cbiAgYmFzZTogJy4vJyxcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIC8vIFNldCB1cCBhbiBhbGlhcyBmb3IgdGhlICdzcmMnIGRpcmVjdG9yeSB0byBzaW1wbGlmeSBpbXBvcnRzXG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gQ3VzdG9taXplIHJvbGx1cCBvcHRpb25zIGZvciBjaHVua2luZ1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAvLyBFeGFtcGxlOiBHcm91cCByZWFjdCBhbmQgcmVhY3QtZG9tIGludG8gYSBzZXBhcmF0ZSB2ZW5kb3IgY2h1bmtcbiAgICAgICAgICByZWFjdDogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICAvLyBZb3UgY2FuIGFkZCBtb3JlIHNwZWNpZmljIGNodW5rcyBmb3IgbGFyZ2UgbGlicmFyaWVzXG4gICAgICAgICAgJ2dvb2dsZS1nZW5haSc6IFsnQGdvb2dsZS9nZW5lcmF0aXZlLWFpJ10sXG4gICAgICAgICAgJ3JlYWN0LWljb25zJzogWydyZWFjdC1pY29ucyddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUE7QUFBQTtBQUFBLEVBRzFCLE1BQU07QUFBQSxFQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQSxNQUVMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixPQUFPLENBQUMsU0FBUyxXQUFXO0FBQUE7QUFBQSxVQUU1QixnQkFBZ0IsQ0FBQyx1QkFBdUI7QUFBQSxVQUN4QyxlQUFlLENBQUMsYUFBYTtBQUFBLFFBQy9CO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUNWO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
