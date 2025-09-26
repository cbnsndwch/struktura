# Features

This directory contains feature modules organized by business domain.

## Structure

Each feature follows a consistent structure:

```
feature-name/
├── contracts/     # TypeScript interfaces and types
├── domain/        # Business logic and services
├── ui/           # React components and UI elements
└── docs/         # Feature documentation
```

## Core Features

- **`shared/`** - Foundation layer with common code, contracts, and base UI components
- **`content-management/`** - Core CMS functionality
- **`user-management/`** - User accounts and permissions
- **`workspace-management/`** - Multi-tenant workspace administration
- **`schema-management/`** - Dynamic schema creation and validation
- **`data-management/`** - CRUD operations and data transformations
- **`dashboard/`** - Analytics and reporting
- **`api-management/`** - GraphQL/REST API exposure
- **`real-time-sync/`** - Live collaboration features
- **`file-management/`** - File uploads and asset management

## Getting Started

Each feature is a workspace package that can be developed independently while sharing common functionality through the `shared/` feature.

### Development

```bash
# Work on all features
pnpm dev

# Work on specific feature
pnpm --filter @cbnsndwch/struktura-feature-* dev
```