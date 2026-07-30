import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@console': new URL('./src', import.meta.url).pathname,
      '@shared': new URL('../../packages/shared-utils/src', import.meta.url).pathname,
      '@shared-types': new URL('../../packages/shared-types/src', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    css: true,
  },
});
