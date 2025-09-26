# Features

This directory contains feature modules organized by business domain.

## Structure

Each feature follows a consistent structure:

```
feature-name/
├── contracts/     # A dedicated workspace with TypeScript interfaces and types
├── domain/        # A dedicated workspace with Business logic and services
├── ui/            # A dedicated workspace with React components and UI elements
└── docs/          # A folder containing documentation for the feature
```

## Core Features

- **`shared/`** - Foundation layer with common code, contracts, and base UI components
- **`content-management/`** - Core CMS functionality
- **`users/`** - User accounts and permissions
- **`workspaces/`** - Multi-tenant workspace administration
- **`schemas/`** - Dynamic schema creation and validation
- **`data/`** - CRUD operations and data transformations
- **`dashboard/`** - Analytics and reporting
- **`api/`** - GraphQL/REST API exposure
- **`realtime/`** - Live collaboration features (Zero Sync-based)
- **`file/`** - File uploads and asset management

## Getting Started

Each feature is folder containing nested workspace packages that can be developed independently while sharing common functionality through the `shared/` feature.

### Development

```bash
# Work on all features
pnpm build:feat

# Work on specific feature
pnpm --filter @cbnsndwch/struktura-*-contracts build
pnpm --filter @cbnsndwch/struktura-*-domain build
pnpm --filter @cbnsndwch/struktura-*-ui build
```