# Apps

This directory contains the main applications for the Struktura monorepo.

## Structure

- **`main/`** - Single unified NestJS application with integrated React Router 7 admin UI

## Architecture

The Struktura architecture follows a **modular monolith** approach with a single main application that combines:

- **Backend**: NestJS with GraphQL API and Apollo Server
- **Frontend**: React Router 7 admin UI integrated as Express middleware
- **Real-time**: WebSocket support and Rocicorp Zero synchronization
- **Database**: MongoDB with Mongoose ODM

## Getting Started

### Environment Setup

1. **Copy environment variables**:
   ```bash
   cp apps/main/.env.example apps/main/.env
   ```

2. **Configure your environment variables** in the `.env` file

### Development  

```bash
# Start the main application
pnpm --filter @cbnsndwch/struktura-main dev

# Or start all applications
pnpm dev
```

### Building

```bash
# Build the main application
pnpm --filter @cbnsndwch/struktura-main build

# Or build all applications
pnpm build
```

### Testing

```bash
# Test the main application
pnpm --filter @cbnsndwch/struktura-main test

# Or test all applications  
pnpm test
```

## Dependencies

The main application uses workspace dependencies:

- `@cbnsndwch/struktura-contracts` - Shared type definitions
- `@cbnsndwch/struktura-feature-shared` - Common feature functionality
- `@cbnsndwch/struktura-auth` - Authentication utilities
- `@cbnsndwch/struktura-database` - Database connection and schemas
- `@cbnsndwch/struktura-utils` - Common utility functions
