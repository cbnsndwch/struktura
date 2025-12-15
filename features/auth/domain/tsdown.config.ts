import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/**/*'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2023',
    noExternal: [],
    unbundle: true,
    skipNodeModulesBundle: true,
    fixedExtension: false
});
