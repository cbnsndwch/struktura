# Libs

This directory contains shared libraries and packages for the Struktura monorepo.

## Structure

- **`contracts/`** - TypeScript interfaces and types shared across applications
- **`ui/`** - Shared React UI components and design system
- **`database/`** - MongoDB utilities, schemas, and data access layer
- **`auth/`** - Authentication and authorization utilities
- **`validation/`** - Data validation schemas and utilities
- **`utils/`** - Common utility functions

## Guidelines

### Naming Convention

- Use kebab-case for directory names
- Prefix with purpose: `ui-*`, `database-*`, `auth-*`, etc.
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
