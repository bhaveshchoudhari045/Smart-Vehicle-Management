import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The React dev server forwards /api calls to the Java backend, so no CORS setup is needed.
const backend = 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/api': { target: backend, changeOrigin: true } },
  },
  preview: {
    port: 4173,
    proxy: { '/api': { target: backend, changeOrigin: true } },
  },
});
