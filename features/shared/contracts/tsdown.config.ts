import { defineConfig } from 'tsdown';

export default defineConfig({
    target: 'es2023',
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    entry: {
        index: './src/index.ts'
    },
    fixedExtension: false
});
