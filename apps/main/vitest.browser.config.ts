import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Use browser mode for E2E tests
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            headless: true
        },
        globals: true,
        testTimeout: 30000,
        hookTimeout: 30000,
        // Include only E2E test files
        include: ['**/*.e2e.test.{ts,tsx}'],
        setupFiles: ['./src/test/e2e-setup.ts']
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './app'),
            '~': resolve(__dirname, './app')
        }
    }
});
