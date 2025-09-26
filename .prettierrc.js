/**
 * Prettier Configuration for Struktura
 *
 * This centralized configuration ensures consistent formatting
 * across the entire monorepo.
 *
 * @type {import("prettier").Config}
 */
module.exports = {
    semi: true,
    singleQuote: true,
    bracketSpacing: true,
    arrowParens: 'avoid',
    trailingComma: 'none',
    printWidth: 80,
    tabWidth: 4,
    useTabs: false,
    endOfLine: 'lf',

    // File-specific overrides
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2
            }
        },
        {
            files: '*.md',
            options: {
                proseWrap: 'preserve',
                tabWidth: 2
            }
        }
    ]
};
