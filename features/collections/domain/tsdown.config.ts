import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/**/*'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2023',
    unbundle: true,
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
    ],
    fixedExtension: false
});
