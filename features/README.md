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

**Current Implementation:**

- **`shared/`** - Foundation layer with common domain code, shared contracts, and base UI component system

**Planned Features:**

- **`content/`** - Core CMS functionality for creating, editing, and organizing content
- **`user/`** - User accounts, authentication, profiles, and role-based permissions
- **`workspace/`** - Multi-tenant workspace creation and administration
- **`schema/`** - Dynamic schema creation, field definitions, and data validation
- **`data/`** - CRUD operations, bulk imports/exports, and data transformations
- **`dashboard/`** - Analytics, reporting, and data visualization
- **`api/`** - GraphQL/REST API exposure and rate limiting
- **`real-time-sync/`** - Live collaboration and real-time data synchronization
- **`file/`** - File uploads, storage, and asset management

## Workspace Architecture

Each feature contains multiple **separate pnpm workspaces** that can be developed and versioned independently:

- **`contracts/`** - TypeScript interfaces, types, and API contracts (separate workspace)
- **`domain/`** - Business logic, services, and domain models (separate workspace)
- **`ui/`** - React components and user interface elements (separate workspace)
- **`docs/`** - Feature-specific documentation (folder, not workspace)

This modular approach enables:
- Independent development and testing of feature layers
- Precise dependency management between domain boundaries
- Clear separation of concerns (contracts → domain → ui)
- Granular version control and publishing

## Getting Started

### Development Commands

```bash
# Build all feature workspaces
pnpm build:feat

# Work with specific feature workspaces
pnpm --filter @cbnsndwch/struktura-shared-contracts build
pnpm --filter @cbnsndwch/struktura-shared-domain dev
pnpm --filter @cbnsndwch/struktura-shared-ui test

# Add dependencies between feature workspaces
pnpm --filter @cbnsndwch/struktura-shared-ui add @cbnsndwch/struktura-shared-contracts
```

### Creating New Features

When creating new features, follow the established pattern:

```bash
mkdir features/new-feature
cd features/new-feature

# Create workspace packages
mkdir contracts domain ui docs

# Each contracts/, domain/, ui/ should have its own package.json
# docs/ is documentation only (not a workspace)
```