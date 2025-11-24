import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || 'https://vendibook.vercel.app';

const clerkPublishableKey =
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  '';

const clerkFrontendApi =
  process.env.VITE_CLERK_FRONTEND_API ||
  process.env.CLERK_FRONTEND_API ||
  process.env.NEXT_PUBLIC_CLERK_FRONTEND_API ||
  '';

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
  define: {
    'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkPublishableKey),
    'import.meta.env.VITE_CLERK_FRONTEND_API': JSON.stringify(clerkFrontendApi),
  },
});