import { config as baseConfig } from './tools/eslint-config/base.js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * ESLint 9 Flat Config for Struktura Monorepo
 *
 * This configuration replaces the legacy .eslintrc.js file and provides
 * a modern flat config setup compatible with ESLint 9.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
    // Use the shared base configuration
    ...baseConfig,

    // Override/extend configuration for the monorepo root
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest
            }
        },
        rules: {
            // Base JavaScript rules from legacy config
            semi: ['error', 'always'],
            strict: 'error',
            'no-console': 'warn',
            'comma-dangle': 'off',
            'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
            'no-use-before-define': 'off',
            'array-callback-return': 'off',

            // Comment formatting - preserving existing configuration
            'spaced-comment': [
                'error',
                'always',
                {
                    markers: [
                        '!',
                        '?',
                        '*',
                        '//',
                        'todo',
                        'TODO',
                        'bug',
                        'BUG',
                        'hack',
                        'HACK',
                        'fixme',
                        'FIXME',
                        'xxx',
                        'XXX',
                        'fix',
                        'FIX',
                        'fixit',
                        'FIXIT',
                        '#region',
                        '#endregion'
                    ],
                    exceptions: ['-', '+']
                }
            ],

            // TypeScript rules from legacy config
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: false
                }
            ],
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',

            // Prettier integration (config loaded from .prettierrc.js)
            'prettier/prettier': 'error'
        }
    },

    // Ignore patterns (replaces .eslintignore)
    {
        ignores: [
            'dist/**',
            'build/**',
            'coverage/**',
            'node_modules/**',
            '.turbo/**',
            '**/*.d.ts',
            '**/dist/**',
            '**/build/**',
            '**/coverage/**',
            'eslint.config.js', // Ignore this config file itself
            '.eslintrc.js' // Ignore legacy config during transition
        ]
    },

    // TypeScript specific configuration
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: [
                    './tsconfig.json',
                    './libs/*/tsconfig.json',
                    './apps/*/tsconfig.json',
                    './tools/*/tsconfig.json'
                ],
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            // Enable stricter TypeScript rules for .ts/.tsx files
            '@typescript-eslint/no-unused-vars': 'error',
            'prefer-const': 'error',
            '@typescript-eslint/no-var-requires': 'error'
        }
    },

    // JavaScript specific configuration
    {
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: {
            globals: {
                ...globals.node
            }
        },
        rules: {
            // Disable TypeScript-only rules for plain JS
            '@typescript-eslint/no-var-requires': 'off'
        }
    },

        // Configuration files and scripts
    {
        files: [
            '*.config.js',
            '*.config.mjs',
            '*.config.ts',
            'scripts/**',
            'tools/**/*.mjs',
            'tools/**/*.js',
        ],
        rules: {
            'no-console': 'off', // Allow console in config files and scripts
        }
    },

    // JSON files
    {
        files: ['**/*.json'],
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off',
            semi: 'off',
            strict: 'off'
        }
    },

    // Test files
    {
        files: [
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/test/**',
            '**/__tests__/**'
        ],
        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.node
            }
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off'
        }
    }
];
