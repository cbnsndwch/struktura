import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
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
        'class-validator',
        'class-transformer',
        'mongoose',
        'graphql',
        'reflect-metadata',
        'rxjs'
    ]
});
