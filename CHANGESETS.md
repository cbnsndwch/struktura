# Changesets Workflow

This monorepo uses [Changesets](https://github.com/changesets/changesets) for version management and publishing. This guide explains how to use it.

## What are Changesets?

Changesets is a tool that helps manage versioning and changelogs in monorepos by:

- Tracking what has changed in each package
- Automatically determining version bumps based on semantic versioning
- Generating meaningful changelogs
- Handling inter-package dependencies
- Coordinating releases across multiple packages

## Developer Workflow

### 1. Making Changes

When you make changes to any package, you need to create a changeset to describe what changed:

```bash
# After making your changes, run:
pnpm changeset
```

This will:

1. Ask which packages have changed
2. Ask what type of change it is (major, minor, patch)
3. Ask for a summary of the changes
4. Create a markdown file in `.changeset/` describing the change

### 2. Types of Changes

- **Major (breaking)**: API changes that break backward compatibility
- **Minor (feature)**: New features that don't break existing functionality
- **Patch (fix)**: Bug fixes and small improvements

### 3. Example Changeset Creation

```bash
$ pnpm changeset
🦋  Which packages would you like to include?
◯ @cbnsndwch/contracts
◯ @cbnsndwch/eslint-config
◯ @cbnsndwch/tsconfig

🦋  Which packages should have a major bump?
◯ @cbnsndwch/contracts

🦋  Which packages should have a minor bump?
◉ @cbnsndwch/contracts

🦋  Which packages should have a patch bump?
◯ @cbnsndwch/contracts

🦋  Please enter a summary for this change
🦋  (This will be written to the changelog)
Add new validation utilities for user input

🦋  Is this your desired changeset?
🦋  Summary: Add new validation utilities for user input
🦋  Releases:
🦋    @cbnsndwch/contracts@minor
🦋
🦋  ✔ Changeset added!
```

## Release Process

### Automatic Releases (Recommended)

The repository is configured for automatic releases:

1. **Make changes** and create changesets as described above
2. **Push to main branch** - This triggers the release workflow
3. **Release PR created** - Changesets will create/update a "Release: Version Packages" PR
4. **Review and merge** - When you merge this PR, packages are automatically published

### Manual Release

If you want to release manually:

```bash
# 1. Version packages (updates package.json and generates changelogs)
pnpm changeset:version

# 2. Commit the changes
git add .
git commit -m "chore: version packages"

# 3. Build and publish
pnpm release
```

## Useful Commands

```bash
# Create a new changeset
pnpm changeset

# Check what will be released
pnpm changeset:status

# Version packages (usually done by CI)
pnpm changeset:version

# Publish packages (usually done by CI)
pnpm changeset:publish

# Manual release (build + test + publish)
pnpm release
```

## Package Dependencies

Changesets automatically handles dependencies between your packages:

- If `@cbnsndwch/contracts` depends on `@cbnsndwch/tsconfig`
- And you bump `@cbnsndwch/tsconfig`
- Changesets will automatically bump `@cbnsndwch/contracts` as well

## Configuration

Changesets configuration is in `.changeset/config.json`:

```json
{
    "access": "public", // Publish packages as public
    "baseBranch": "main", // Main branch name
    "updateInternalDependencies": "patch", // How to bump internal deps
    "privatePackages": {
        // Don't version private packages
        "version": false,
        "tag": false
    }
}
```

## Changeset Files

Changeset files are stored in `.changeset/` and look like this:

```markdown
---
'@cbnsndwch/contracts': minor
---

Add new validation utilities for user input

This adds several new validation functions:

- validateEmail()
- validatePhoneNumber()
- validateRequired()
```

## GitHub Actions

The release workflow (`.github/workflows/release.yml`):

1. **Triggers on**: Push to main branch
2. **Installs dependencies** and runs tests
3. **Creates/updates Release PR** with version bumps and changelogs
4. **Publishes packages** when Release PR is merged
5. **Creates GitHub releases** with release notes

**Note for Private Repositories**: npm provenance is disabled for private repositories since it only works with public repositories. See `PRIVATE-REPO-FIX.md` for details. 5. **Creates GitHub releases** with release notes

## Migration from Manual Versioning

If you were previously using manual version scripts (`vmajor`, `vminor`, `vpatch`):

1. **Stop using** the old version scripts
2. **Start creating changesets** for your changes
3. **Let Changesets manage** versioning automatically
4. **Use the Release PR workflow** instead of manual tagging

## Tips

- **Create changesets early** - Don't wait until release time
- **Write good summaries** - They become your changelog entries
- **One changeset per logical change** - Makes reviews easier
- **Include breaking changes** - Clearly document what breaks
- **Review Release PRs** - Check the generated changelogs before merging
