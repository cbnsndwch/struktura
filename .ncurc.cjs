/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
    reject: [
        // we'll move to Node 24 manually when it's time
        '@types/node'
    ],

    packageManager: 'pnpm',
    deep: true
};
