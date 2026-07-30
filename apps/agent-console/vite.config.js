import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@console': fileURLToPath(new URL('./src', import.meta.url)),
            '@shared': fileURLToPath(new URL('../../packages/shared-utils/src', import.meta.url)),
            '@shared-types': fileURLToPath(new URL('../../packages/shared-types/src', import.meta.url)),
        },
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
    },
});
