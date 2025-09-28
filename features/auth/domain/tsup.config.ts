import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2023',
    noExternal: [],
    bundle: true,
    splitting: false,
    skipNodeModulesBundle: true
});
