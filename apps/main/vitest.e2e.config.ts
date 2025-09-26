import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        testTimeout: 30000,
        hookTimeout: 30000,
        include: ['test/**/*.e2e.spec.ts'],
        globals: true,
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true
            }
        }
    }
});
