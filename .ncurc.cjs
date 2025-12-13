/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
    reject: [
        // we'll move to Node 24 manually when it's time
        '@types/node'
    ],

    packageManager: 'pnpm',

    // Use workspaces instead of deep to support pnpm catalogs
    // deep: true is incompatible with --workspaces
    workspaces: true
};
