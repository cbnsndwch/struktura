# Struktura

A no-code data management platform that combines the ease-of-use of Airtable with the document flexibility of MongoDB. Built as a modern TypeScript monorepo using Turborepo.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

## 📁 Monorepo Structure

This repository is organized as a Turborepo monorepo with pnpm workspaces:

```
├── apps/                    # Applications
│   └── main/                # Single unified NestJS app with React Router 7 admin UI
├── features/                # Feature modules
│   ├── shared/              # Common domain code, shared contracts, base UI components
│   ├── content-management/  # Core CMS functionality
│   ├── user-management/     # User accounts and permissions
│   ├── dashboard/           # Analytics and reporting
│   └── [feature]/           # Each feature contains: contracts/, domain/, ui/, docs/
├── libs/                    # Cross-cutting libraries
│   ├── auth/                # Authentication and authorization
│   ├── i18n/                # Internationalization
│   ├── logging/             # Application logging
│   ├── telemetry/           # Performance monitoring
│   ├── organizations/       # Multi-tenancy support
│   ├── database/            # MongoDB utilities and schemas
│   └── utils/               # Common utility functions
├── tools/                   # Development tools
│   ├── eslint-config/       # Shared ESLint configuration
│   ├── tsconfig/            # Shared TypeScript configuration
│   └── dep-version-map/     # Dependency version management
├── scripts/                 # Build and deployment scripts
└── docs/                    # Project documentation
```

## 🛠 Technology Stack

**Core Technologies:**

- **Runtime**: Node.js >=v22.13.1 with pnpm@10.17.1+
- **Framework**: NestJS modular monolith with GraphQL
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React Router 7 integrated admin UI
- **Real-time**: Rocicorp Zero synchronization

> 📋 **For detailed technology specifications, architecture diagrams, and design patterns, see [Architecture Documentation](./docs/ARCHITECTURE.md)**

## 🏗 Development Workflow

### Getting Started

1. **Install dependencies**:

    ```bash
    pnpm install
    ```

2. **Set up environment variables**:

    ```bash
    # Copy environment template files
    cp apps/main/.env.example apps/main/.env
    ```

3. **Start development server**:

    ```bash
    # Start the main application
    pnpm dev

    # Or start the main application specifically
    pnpm --filter @cbnsndwch/struktura-main dev
    ```

### Building

```bash
# Build all packages and applications
pnpm build

# Build specific package
pnpm --filter @cbnsndwch/struktura-main build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests for specific package
pnpm --filter @cbnsndwch/struktura-contracts test
```

### Adding Dependencies

```bash
# Add dependency to specific package
pnpm --filter @cbnsndwch/struktura-web add react-query

# Add dev dependency to root
pnpm add -Dw typescript

# Add dependency to workspace
pnpm --filter @cbnsndwch/struktura-ui add @cbnsndwch/struktura-contracts
```

## 📦 Package Management

### Workspace Dependencies

Packages can depend on each other using the `workspace:*` protocol:

```json
{
    "dependencies": {
        "@cbnsndwch/struktura-contracts": "workspace:*",
        "@cbnsndwch/struktura-ui": "workspace:*"
    }
}
```

### Version Management

We use Changesets for version management:

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm changeset:version

# Publish packages
pnpm changeset:publish
```

## 🔧 Configuration

### TypeScript

Shared TypeScript configurations are in `tools/tsconfig/`:

- `base.json` - Base configuration for all packages
- `nextjs.json` - Configuration for Next.js applications
- `node.json` - Configuration for Node.js applications

### ESLint

Shared ESLint configuration in `tools/eslint-config/` extends:

- TypeScript ESLint recommended rules
- Prettier integration
- Import sorting and validation

### Turborepo

Tasks are configured in `turbo.json`:

- `build` - Build packages and applications
- `dev` - Start development servers
- `lint` - Run ESLint
- `test` - Run tests

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**:
    - `DATABASE_URL` - MongoDB connection string
    - `JWT_SECRET` - JWT signing secret
    - `PORT` - Application server port (default: 3000)
    - `NODE_ENV` - Environment (development/production)

2. **Build for Production**:

    ```bash
    pnpm build
    ```

3. **Start Production Servers**:
    ```bash
    pnpm start
    ```

## 📚 Documentation

- [Product Requirements](./docs/PRD.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Development Action Plan](./docs/DEVELOPMENT_ACTION_PLAN.md)
- [Team Structure](./docs/TEAM_STRUCTURE.md)
- [Technical Standards](./docs/TECHNICAL_STANDARDS.md)

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following the established patterns
3. Add tests for new functionality
4. Run `pnpm lint` and `pnpm test`
5. Create a changeset with `pnpm changeset`
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
