import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
    resolve: {
        alias: [
            {
                find: /^@console\//,
                replacement: `${fileURLToPath(new URL('./src', import.meta.url))}/`,
            },
            {
                find: /^@shared\//,
                replacement: `${fileURLToPath(new URL('../../packages/shared-utils/src', import.meta.url))}/`,
            },
            {
                find: /^@shared-types\//,
                replacement: `${fileURLToPath(new URL('../../packages/shared-types/src', import.meta.url))}/`,
            },
        ],
    },
    test: {
        environment: 'jsdom',
        globals: false,
        css: true,
    },
});
