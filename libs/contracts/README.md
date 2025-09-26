# @cbnsndwch/struktura-contracts

Shared TypeScript types, utilities, and data contracts for full-stack applications.

## Installation

```bash
npm install @cbnsndwch/struktura-contracts
```

```bash
yarn add @cbnsndwch/struktura-contracts
```

```bash
pnpm add @cbnsndwch/struktura-contracts
```

## Usage

### Dict Type

A generic dictionary type that maps string keys to values of type T.

```typescript
import type { Dict } from '@cbnsndwch/struktura-contracts';

// Type-safe dictionary with string values
const userRoles: Dict<string> = {
    admin: 'administrator',
    user: 'regular user',
    guest: 'guest user'
};

// Generic dictionary (values can be any type)
const config: Dict = {
    timeout: 5000,
    retries: 3,
    debug: true,
    endpoints: ['api.example.com', 'backup.example.com']
};
```

### Invariant Function

A utility function for runtime assertions that throws an error if a condition is not met. Particularly useful for NestJS applications with optional logger integration.

```typescript
import { invariant } from '@cbnsndwch/struktura-contracts';

// Basic usage
function divide(a: number, b: number): number {
    invariant(b !== 0, 'Division by zero is not allowed');
    return a / b;
}

// With custom error class
class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

function validateUser(user: unknown) {
    invariant(
        typeof user === 'object' && user !== null,
        'User must be an object',
        ValidationError
    );
}

// With NestJS logger (requires @nestjs/common)
import { Logger } from '@nestjs/common';

function processData(data: unknown[], logger: Logger) {
    invariant(
        Array.isArray(data) && data.length > 0,
        () => `Expected non-empty array, got ${typeof data}`,
        Error,
        logger
    );

    // Process data...
}
```

#### Function Signatures

```typescript
function invariant<TError extends Error = Error>(
    condition: boolean | (() => boolean),
    message: string | (() => string),
    errorClass?: Type<TError>,
    logger?: LoggerService
): asserts condition;
```

**Parameters:**

- `condition` - The condition to check, or a function that returns the condition
- `message` - The error message to throw if condition is false, or a function that returns the message
- `errorClass` - Optional custom error class to throw (defaults to `Error`)
- `logger` - Optional NestJS logger service to log the error message

## Features

- 🎯 **Type Safety** - Full TypeScript support with proper type definitions
- 🔧 **Framework Agnostic** - Works with any TypeScript/JavaScript project
- 🪶 **Lightweight** - Minimal dependencies and small bundle size
- 🧪 **Well Tested** - Comprehensive test coverage
- 📚 **NestJS Integration** - Optional integration with NestJS logger service

## TypeScript Support

This package includes full TypeScript definitions and supports:

- ES2023+ syntax
- ESM and CommonJS modules
- Node.js 22+

## License

MIT © [cbnsndwch LLC](https://github.com/cbnsndwch)
