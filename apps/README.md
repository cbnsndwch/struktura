# Apps

This directory contains the main applications for the Struktura monorepo.

## Structure

- **`web/`** - Frontend application (React with Vite)
- **`api/`** - Backend API server (NestJS with GraphQL)
- **`admin/`** - Admin dashboard application
- **`docs/`** - Documentation site (future)

## Getting Started

Each app has its own README with specific setup instructions.

### Development

```bash
# Start all apps in development mode
pnpm dev

# Start specific app
pnpm --filter @cbnsndwch/struktura-web dev
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @cbnsndwch/struktura-web build
```
