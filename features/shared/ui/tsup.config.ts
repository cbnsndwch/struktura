import { defineConfig } from 'tsup';

export default defineConfig({
    target: 'es2023',
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    minify: false,
    entry: {
        index: './src/index.ts'
    }
});
