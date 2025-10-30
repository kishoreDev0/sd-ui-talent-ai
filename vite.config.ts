import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      // Forward API calls to backend to avoid CORS in dev
      '/api': {
        target: 'http://localhost:5010',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1': {
        target: 'http://localhost:5010',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
