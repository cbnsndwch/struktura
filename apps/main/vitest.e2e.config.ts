import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        testTimeout: 60000,
        hookTimeout: 60000,
        include: ['src/**/*.e2e.spec.ts'],
        globals: true,
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true
            }
        },
        environment: 'node',
        setupFiles: []
    }
});
