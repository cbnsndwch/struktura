import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2023',
    external: [
        '@nestjs/common',
        '@nestjs/core',
        '@nestjs/mongoose',
        '@nestjs/graphql',
        '@nestjs/mapped-types',
        '@cbnsndwch/struktura-auth-domain',
        '@cbnsndwch/struktura-workspace-contracts',
        'mongoose',
        'class-validator',
        'class-transformer',
        'graphql',
        '@apollo/subgraph',
        '@nestjs/websockets',
        '@nestjs/microservices',
        'ts-morph'
    ],
    noExternal: [],
    bundle: true,
    splitting: false,
    skipNodeModulesBundle: true
});
