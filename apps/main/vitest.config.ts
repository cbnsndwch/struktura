import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            reporter: ['text', 'json', 'html']
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './app'),
            '~': resolve(__dirname, './app')
        }
    }
});
