# Struktura Main Application

## Overview

The main Struktura application is a unified NestJS backend with integrated React Router 7 admin UI, GraphQL API, and MongoDB database connectivity.

## Quick Start

1. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Development**:
   ```bash
   pnpm dev
   ```

3. **Production**:
   ```bash
   pnpm build
   pnpm start:prod
   ```

## Features

### GraphQL API
- **Endpoint**: `http://localhost:3000/graphql`
- **Playground**: Available in development mode at the same URL
- **Schema**: Auto-generated using code-first approach

#### Basic Queries
```graphql
query {
  hello
  health
}
```

### REST Endpoints
- **Health Check**: `GET /health` - Returns application and database status
- **Root**: `GET /` - Returns welcome message with generated ID

### Database Integration
- **MongoDB**: Configured with Mongoose ODM
- **Connection Pooling**: Optimized for production with retry logic
- **Schemas**: User schema with proper indexing (extendable)

## Configuration

### Environment Variables
- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: MongoDB connection string
- `GRAPHQL_PLAYGROUND`: Enable/disable GraphQL playground
- `GRAPHQL_INTROSPECTION`: Enable/disable GraphQL introspection

### Database Configuration
- **Connection Pool**: Max 10 connections
- **Timeouts**: Server selection (2s), Socket (45s)
- **Retry Logic**: 2 attempts with 1s delay
- **Lazy Connection**: Allows app to start without immediate DB connection

## Architecture

```
src/
├── app.controller.ts     # REST endpoints and health checks
├── app.module.ts         # Main application module
├── app.service.ts        # Application services
├── database/             # Database configuration
│   └── database.module.ts
├── graphql/              # GraphQL resolvers
│   └── app.resolver.ts
├── schemas/              # MongoDB schemas
│   └── user.schema.ts
└── main.ts              # Application bootstrap
```

## Development Notes

- Uses TypeScript with strict mode
- GraphQL schema auto-generation
- MongoDB connection with graceful error handling
- Health checks include database status
- Follows NestJS best practices for module organization