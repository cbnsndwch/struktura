import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/**/*'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2023',
    noExternal: [],
    bundle: false,
    splitting: false,
    skipNodeModulesBundle: true
});
