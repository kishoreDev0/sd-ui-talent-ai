import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['192.168.1.153.nip.io', '127.0.0.1.nip.io'],
    https:
      fs.existsSync('./ssl/server.key') && fs.existsSync('./ssl/server.crt')
        ? {
            key: fs.readFileSync('./ssl/server.key'),
            cert: fs.readFileSync('./ssl/server.crt'),
          }
        : undefined,
  },
});
