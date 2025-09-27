import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2023',
    external: [
        'bcryptjs',
        'jsonwebtoken',
        '@nestjs/common',
        '@nestjs/core',
        '@mapbox/node-pre-gyp',
        'mock-aws-s3',
        'aws-sdk',
        'nock'
    ],
    noExternal: [],
    bundle: true,
    splitting: false,
    skipNodeModulesBundle: true
});
