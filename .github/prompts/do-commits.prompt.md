Great! Now let's commit these changes in thematic groups with short messages that follow the repo's semantic conventions.

## Commit Message Convention

Use the format: `type(scope): message`

**Types:**

- `feat`: New feature or component
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `build`: Changes to build system or dependencies (package.json, tsconfig, etc.)
- `chore`: Maintenance tasks (lockfile updates, etc.)
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `perf`: Performance improvements
- `style`: Code style changes (formatting, semicolons, etc.)

**Scope Examples:**

- Apps: `main`, `main/api`, `main/ui`, `main/routes`
- Features: `auth`, `workspace`, `collections`, `schema`, `onboarding`
- Libs: `auth`, `utils`
- Tools: `eslint-config`, `tsconfig`, `dep-version-map`
- Config: `deps`, `repo`, `ci`

**Message Guidelines:**

- Use imperative mood ("add" not "added", "migrate" not "migrated")
- Keep under 72 characters
- Be specific but concise
- No period at the end

**Grouping Strategy:**

1. **Feature additions** - New components/files created
2. **Refactors/Updates** - Exports, imports, structural changes
3. **Build changes** - Dependencies, package.json, build config
4. **Lockfile** - Always separate commit for pnpm-lock.yaml
5. **Documentation** - README, migration docs, comments

**Examples:**

```
feat(auth): implement authentication utilities and route protection
feat(workspace): add workspace layout and navigation integration
refactor(main/api): organize backend modules into a features folder
refactor(main/routes): move auth routes to dedicated folders
refactor(main/ui): move Toaster component to client entrypoint
fix(tests): wrap WorkspaceNavigation in SidebarProvider
build(tsconfig): enable strict mode
chore(deps): update pnpm lockfile
docs: add protected routes implementation guide
```
