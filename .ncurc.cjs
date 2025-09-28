/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
    reject: [
        // we'll move to Node 24 manually when it's time
        '@types/node',

        // Nest does not yet support Apollo Server v5
        '@apollo/server'
    ],

    packageManager: 'pnpm',
    deep: true
};
