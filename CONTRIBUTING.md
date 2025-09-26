# Contributing to Struktura

Thank you for your interest in contributing to Struktura! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >=v22.13.1
- **pnpm**: v10.17.1+
- **Git**: Latest version

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/cbnsndwch/struktura.git
   cd struktura
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development environment**:
   ```bash
   pnpm dev
   ```

## 📋 Development Workflow

### Branch Strategy

- `main` - Production ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `hotfix/*` - Critical bug fixes

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Build process, dependency updates

**Examples:**
```
feat(api): add user authentication endpoint
fix(ui): resolve table pagination issue
docs: update API documentation for schemas
```

### Pull Request Process

1. **Create a feature branch** from `develop`
2. **Make your changes** following our coding standards
3. **Add tests** for new functionality
4. **Run the test suite**: `pnpm test`
5. **Run linting**: `pnpm lint`
6. **Create a changeset**: `pnpm changeset` (for version changes)
7. **Submit a pull request** with:
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes

## 🏗 Project Structure

Our monorepo is organized as follows:

```
├── apps/                    # Applications
├── features/                # Feature modules
├── libs/                    # Shared libraries
├── tools/                   # Development tools
├── docs/                    # Documentation
└── scripts/                 # Build and deployment scripts
```

## 🧪 Testing

- **Unit Tests**: `pnpm test`
- **Linting**: `pnpm lint`
- **Type Checking**: `pnpm build`
- **Format Code**: `pnpm format`

## 📝 Code Style

We use:
- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** for type safety

Configuration is shared across the monorepo in `tools/eslint-config` and `tools/tsconfig`.

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior** 
4. **Environment details** (OS, Node version, etc.)
5. **Screenshots** (if applicable)

Use our [issue template](https://github.com/cbnsndwch/struktura/issues/new) for bug reports.

## 💡 Feature Requests

For feature requests:

1. **Check existing issues** to avoid duplicates
2. **Provide clear use case** and benefits
3. **Include mockups** or examples if applicable
4. **Consider implementation complexity**

## 🎯 Areas for Contribution

We welcome contributions in:

- **Core Platform Features**
- **API Improvements**
- **Documentation**
- **Testing Coverage**
- **Performance Optimizations**
- **Developer Experience**

## ❓ Questions?

- **GitHub Issues**: [Create an issue](https://github.com/cbnsndwch/struktura/issues)
- **Documentation**: Check our [docs](./docs/) directory
- **Architecture**: See [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 📄 License

By contributing to Struktura, you agree that your contributions will be licensed under the [MIT License](./LICENSE).