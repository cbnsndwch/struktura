# Shared Feature Documentation

This directory contains documentation for the shared foundation layer that all Struktura features build upon.

## Overview

The shared feature provides:

- **Common contracts and interfaces** - Base types used across all features
- **Shared domain logic** - Utility classes and common business logic patterns
- **UI foundation** - Base component interfaces and design system constants
- **Cross-feature communication** - Event bus for inter-feature messaging

## Architecture

### Contracts (`contracts/`)

Provides base interfaces and types that all features can depend on:

- `BaseEntity` - Common entity structure with id, createdAt, updatedAt
- `Result<T>` - Standard result wrapper for operations
- `PaginatedResult<T>` - Standardized pagination response
- `FeatureModule` - Interface for feature module metadata

### Domain (`domain/`)

Contains shared business logic and utilities:

- `BaseService` - Abstract base class for feature services
- `SharedUtils` - Common utility functions for data manipulation
- `EventBus` - Cross-feature communication system
- `DomainEvent` - Standard event interface

### UI (`ui/`)

Foundation for the UI layer:

- `BaseComponentProps` - Common props all React components should support
- `UIUtils` - Formatting and display utilities
- `theme` - Design system constants and tokens

## Usage

Other features can import from specific submodules:

```typescript
// Import contracts
import {
    BaseEntity,
    Result
} from '@cbnsndwch/struktura-shared-contracts';

// Import domain utilities
import {
    BaseService,
    SharedUtils
} from '@cbnsndwch/struktura-shared-domain';

// Import UI utilities
import { theme, UIUtils } from '@cbnsndwch/struktura-shared-ui';
```

## Development Guidelines

1. **Keep it minimal** - Only add truly shared functionality
2. **Avoid feature-specific logic** - This should work for any feature
3. **Maintain backward compatibility** - Changes here affect all features
4. **Document breaking changes** - Use changesets for version management
