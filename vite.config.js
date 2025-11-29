import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || 'https://vendibook.vercel.app';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mapbox-gl') || id.includes('react-map-gl')) {
              return 'mapbox';
            }
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor';
            }
          }
        },
      },
    },
  },
});