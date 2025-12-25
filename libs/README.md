# Libs

This directory contains shared libraries and packages for the Struktura monorepo.

## Structure

- **`utils/`** - Common utility functions and shared logic used across the monorepo.

## Guidelines

### Naming Convention

- Use kebab-case for directory names
- Keep names descriptive but concise

### Package Structure

Each lib should follow this structure:

```
lib-name/
├── src/
│   ├── index.ts          # Main exports
│   ├── types.ts          # Type definitions
│   └── ...               # Implementation files
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Package documentation
```

### Dependencies

- Keep dependencies minimal and well-justified
- Use peerDependencies for shared dependencies (React, etc.)
- Avoid circular dependencies between libs
