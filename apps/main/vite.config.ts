import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [reactRouter(), tailwindcss(), tsconfigPaths()],
    build: {
        outDir: 'dist/client'
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './app'),
            app: resolve(__dirname, './app')
        }
    }
});
