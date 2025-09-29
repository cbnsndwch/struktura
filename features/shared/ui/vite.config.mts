/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import { glob } from 'glob';

import viteTsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            viteTsconfigPaths(),
            react(),
            dts({
                outDir: 'dist',
                include: ['src/**/*'],
                exclude: [
                    'src/**/*.stories.*',
                    'src/**/*.test.*',
                    'src/**/*.spec.*'
                ]
            })
        ],
        build: {
            outDir: 'dist',
            emptyOutDir: true,
            sourcemap: mode === 'development' || env.BUILD_MINIFY !== '0',
            minify: env.BUILD_MINIFY !== '0',
            rollupOptions: {
                input: Object.fromEntries(
                    glob
                        .sync('src/**/*.{ts,tsx}', {
                            ignore: [
                                'src/**/*.{test,spec,stories}.{ts,tsx}',
                                'src/**/*.d.ts'
                            ]
                        })
                        .map(file => [
                            // Use relative path from src as the key to avoid node_modules structure
                            file
                                .slice(4)
                                .replace(/\\/g, '/')
                                .replace(/\.(ts|tsx)$/, ''),
                            file
                        ])
                ),
                external: id => {
                    // Externalize all node_modules dependencies
                    if (id.includes('node_modules')) return true;

                    // Externalize specific packages and their sub-paths
                    const externalPackages = [
                        '@hookform/resolvers',
                        'class-variance-authority',
                        'clsx',
                        'cookie',
                        'framer-motion',
                        'katex',
                        'lodash-es',
                        'lodash',
                        'lucide-react',
                        'nanoid',
                        'prismjs',
                        'react-dom',
                        'react-hook-form',
                        'react-hotkeys-hook',
                        'react-i18next',
                        'react-popper',
                        'react-router',
                        'react-virtualized',
                        'react',
                        'tailwind-merge',
                        'tailwindcss',
                        'zod'
                    ];

                    // Check if id matches any external package or their sub-paths
                    for (const pkg of externalPackages) {
                        if (id === pkg || id.startsWith(pkg + '/')) {
                            return true;
                        }
                    }

                    // Externalize packages that start with certain prefixes
                    const externalPrefixes = [
                        '@cbnsndwch/',
                        '@lexical/',
                        'lexical',
                        '@hookform/'
                    ];

                    for (const prefix of externalPrefixes) {
                        if (id.startsWith(prefix)) {
                            return true;
                        }
                    }

                    // Don't externalize relative imports (our own source files)
                    return false;
                },
                output: {
                    format: 'es',
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].js'
                },
                preserveEntrySignatures: 'allow-extension'
            }
        },

        test: {
            environment: 'jsdom',
            setupFiles: ['./src/test-setup.ts'],
            globals: true,
            coverage: {
                reporter: ['text', 'json', 'html']
            }
        }
    };
});
