import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@console': new URL('./src', import.meta.url).pathname,
      '@shared': new URL('../../packages/shared-utils/src', import.meta.url).pathname,
      '@shared-types': new URL('../../packages/shared-types/src', import.meta.url).pathname,
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
