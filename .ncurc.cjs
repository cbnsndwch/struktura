/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
    reject: [
        // we'll stay on Node 24 for now
        '@types/node'
    ],

    packageManager: 'pnpm',

    // Use workspaces instead of deep to support pnpm catalogs
    // deep: true is incompatible with --workspaces
    workspaces: true
};
