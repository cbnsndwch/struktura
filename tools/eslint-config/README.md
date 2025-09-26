# @cbnsndwch/struktura-eslint-config

A collection of ESLint configurations for TypeScript, React, and Turbo monorepo projects.

## Installation

```bash
npm install --save-dev @cbnsndwch/struktura-eslint-config eslint
```

```bash
yarn add --dev @cbnsndwch/struktura-eslint-config eslint
```

```bash
pnpm add --save-dev @cbnsndwch/struktura-eslint-config eslint
```

## Available Configurations

### Base Configuration

A foundational ESLint configuration for TypeScript projects with Turbo support.

**Features:**

- JavaScript recommended rules
- TypeScript ESLint recommended rules
- Prettier integration (conflict resolution)
- Turbo monorepo environment variable checking
- Converts all errors to warnings for better development experience

**Usage:**

```javascript
// eslint.config.js
import { config } from '@cbnsndwch/struktura-eslint-config/base';

export default config;
```

### React Internal Configuration

An ESLint configuration specifically designed for React libraries and applications.

**Features:**

- Extends base configuration
- React recommended rules
- React Hooks rules
- Browser globals support
- React version detection
- JSX runtime configuration

**Usage:**

```javascript
// eslint.config.js
import { config } from '@cbnsndwch/struktura-eslint-config/react-internal';

export default config;
```

## Custom Configuration

You can extend any of the provided configurations:

```javascript
// eslint.config.js
import { config as baseConfig } from '@cbnsndwch/struktura-eslint-config/base';

export default [
    ...baseConfig,
    {
        // Your custom rules
        rules: {
            'no-console': 'warn',
            '@typescript-eslint/no-unused-vars': 'error'
        }
    }
];
```

## Included Plugins and Rules

### Base Configuration Includes:

- **@eslint/js** - JavaScript recommended rules
- **typescript-eslint** - TypeScript linting rules
- **eslint-config-prettier** - Disables conflicting Prettier rules
- **eslint-plugin-turbo** - Turbo monorepo specific rules
- **eslint-plugin-only-warn** - Converts errors to warnings

### React Configuration Adds:

- **eslint-plugin-react** - React specific linting rules
- **eslint-plugin-react-hooks** - React Hooks linting rules

## Turbo Integration

The base configuration includes Turbo-specific rules:

- `turbo/no-undeclared-env-vars`: Warns about undeclared environment variables in Turbo projects

## TypeScript Support

Both configurations are optimized for TypeScript projects and include:

- Proper TypeScript parsing
- TypeScript-specific linting rules
- Module resolution support
- Declaration file support

## Development Experience

- **Warning-first approach**: Most issues are reported as warnings rather than errors to improve development flow
- **Prettier integration**: Automatically resolves conflicts with Prettier formatting
- **Modern JavaScript**: Supports ES2023+ syntax and features

## Requirements

- **Node.js**: 22+
- **ESLint**: 9+
- **TypeScript**: 5.8+ (if using TypeScript)

## License

MIT © [cbnsndwch LLC](https://github.com/cbnsndwch)
