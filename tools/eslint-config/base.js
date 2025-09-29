import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import onlyWarn from 'eslint-plugin-only-warn';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        plugins: {
            turbo: turboPlugin,
            import: importPlugin,
            prettier: prettierPlugin
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: [
                        './tsconfig.json',
                        './libs/*/tsconfig.json',
                        './apps/*/tsconfig.json',
                        './tools/*/tsconfig.json'
                    ],
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.mts']
                },
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.mts']
                }
            }
        },
        rules: {
            'turbo/no-undeclared-env-vars': 'warn',
            'no-implicit-any': 'off',

            // Import rules
            'import/order': [
                'error',
                {
                    'newlines-between': 'always-and-inside-groups',
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                        'object'
                    ]
                }
            ],
            'import/no-unresolved': 'error',
            'import/no-named-as-default': 'off',

            // Prettier integration (config loaded from project root)
            'prettier/prettier': 'error'
        }
    },
    {
        plugins: {
            onlyWarn
        }
    },
    {
        ignores: [
            'dist/**',
            'build/**',
            'coverage/**',
            'node_modules/**',
            '.turbo/**',
            '**/*.d.ts'
        ]
    }
];
