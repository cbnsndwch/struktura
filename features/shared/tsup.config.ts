import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: './contracts/index.ts',
        contracts: './contracts/index.ts',
        domain: './domain/index.ts',
        ui: './ui/index.ts'
    },
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'es2023',
    splitting: false,
    minify: false
});
