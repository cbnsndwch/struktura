# @cbnsndwch/struktura-tsconfig

Shared TypeScript configurations for consistent compiler settings across projects.

## Installation

```bash
npm install --save-dev @cbnsndwch/struktura-tsconfig typescript
```

```bash
yarn add --dev @cbnsndwch/struktura-tsconfig typescript
```

```bash
pnpm add --save-dev @cbnsndwch/struktura-tsconfig typescript
```

## Available Configurations

### Base Configuration

The foundational TypeScript configuration with modern defaults and strict type checking.

**Features:**

- ES2023 target with NodeNext modules
- Strict type checking enabled
- Declaration files generation
- JSON module resolution
- Optimized for Node.js and Vitest

**Usage:**

```json
{
    "extends": "@cbnsndwch/struktura-tsconfig/base.json"
}
```

### NestJS Library Configuration

Specialized configuration for NestJS libraries and applications.

**Features:**

- Extends base configuration
- Decorator metadata emission enabled
- Experimental decorators support
- Source maps generation
- Optimized for NestJS development

**Usage:**

```json
{
    "extends": "@cbnsndwch/struktura-tsconfig/nest-library.json"
}
```

### React Library Configuration

Configuration tailored for React libraries and components.

**Features:**

- Extends base configuration
- DOM and DOM.Iterable lib support
- React JSX transformation
- Vite and Vitest types included
- Optimized for React development

**Usage:**

```json
{
    "extends": "@cbnsndwch/struktura-tsconfig/react-library.json"
}
```

## Project Setup Examples

### Basic Node.js Library

```json
{
    "extends": "@cbnsndwch/struktura-tsconfig/base.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}
```

### NestJS Application

```json
{
    "extends": "@cbnsndwch/struktura-tsconfig/nest-library.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

### React Component Library

```json
{
    "extends": "@cbnsndwch/struktura-tsconfig/react-library.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src",
        "declaration": true,
        "declarationDir": "./dist/types"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "**/*.test.*", "**/*.spec.*"]
}
```

## Configuration Details

### Base Configuration Features

- **Target**: ES2023 for modern JavaScript features
- **Module**: NodeNext for full ESM/CJS compatibility
- **Module Resolution**: NodeNext for Node.js compatibility
- **Strict Mode**: Full TypeScript strict checking enabled
- **Declaration Maps**: Generated for better debugging experience
- **Isolated Modules**: Ensures each file can be transpiled independently

### Type Checking Features

- `strict: true` - Enables all strict type checking options
- `noUncheckedIndexedAccess: true` - Prevents unsafe array/object access
- `skipLibCheck: true` - Improves build performance
- `forceConsistentCasingInFileNames: true` - Ensures case-sensitive imports

## License

MIT

## Author

cbnsndwch LLC
