import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            reporter: ['text', 'json', 'html']
        },
        // Optimized test execution
        testTimeout: 10000,
        hookTimeout: 10000,
        // Reuse environment for faster tests (trade-off: less isolation)
        isolate: false,
        // Run test files sequentially to avoid overwhelming the system
        fileParallelism: false
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './app'),
            '~': resolve(__dirname, './app')
        }
    }
});
