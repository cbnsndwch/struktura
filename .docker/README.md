# Docker Configuration

This directory contains Docker configurations for the Struktura monorepo.

## Files

- `base.dockerfile` - Base image with OS-level dependencies (Node.js 22, pnpm)
- `main.dockerfile` - Main application image with multi-stage build
- `README.md` - This documentation file

## Base Image

The base image (`base.dockerfile`) provides:
- Node.js 22 Alpine Linux
- pnpm 10.17.1 pre-installed
- Non-root user setup
- Health checks

**Build:**
```bash
docker build -f .docker/base.dockerfile -t struktura-base .
```

**Schedule:**
- Built weekly via GitHub Actions
- Published to `ghcr.io/cbnsndwch/struktura-base`

## Main Application Image

The main application image (`main.dockerfile`) features:
- **Multi-stage build optimization** with pnpm store caching
- **ARM64 Linux targeting** with cross-platform support
- **Production-ready** with minimal dependencies
- **Health check endpoint integration**
- **Advanced caching** using Docker BuildKit cache mounts

### Key Optimizations

#### pnpm Store Caching
- Persistent package cache using `--mount=type=cache,id=pnpm-store`
- Shared cache across dependency and production stages
- Eliminates redundant package downloads between builds

#### Layer Caching Strategy
- Package files copied before source code for optimal layer reuse
- Dependencies installed separately from build process
- Multi-stage inheritance minimizes duplicate operations

#### Build Stages
- **`base`**: pnpm configuration and shared setup
- **`dependencies`**: All development and production dependencies
- **`builder`**: Source compilation and artifact generation
- **`production`**: Runtime-only dependencies and built artifacts

**Build (requires BuildKit):**
```bash
# Using Docker BuildKit (recommended)
DOCKER_BUILDKIT=1 docker build -f .docker/main.dockerfile -t struktura-main .

# Or using buildx
docker buildx build -f .docker/main.dockerfile -t struktura-main .
```

**Build Arguments:**
- `BASE_IMAGE` - Base image to use (default: `node:22-alpine`)

## Usage

### Local Development

```bash
# Build and run locally
docker build -f .docker/main.dockerfile -t struktura:local .
docker run -p 3000:3000 -e NODE_ENV=development struktura:local
```

### CI/CD Integration

Images are automatically built and pushed via GitHub Actions:

**Development:**
- Triggered on push to `develop` branch
- Tagged with branch name and commit SHA

**Staging:**
- Triggered on pre-release tags (`*-pre.*`, `*-rc.*`)
- Tagged with pre-release version

**Production:**
- Triggered on version tags (`v*`)
- Tagged with version number

## Security

- Non-root user execution
- Minimal base images
- Regular security updates via Dependabot
- ARM64-only builds reduce attack surface

## Performance

- **Multi-stage builds** minimize final image size
- **Advanced layer caching** with pnpm store optimization
- **Production dependencies only** in final stage
- **Efficient file copying patterns** for monorepo structure
- **BuildKit cache mounts** for persistent package caching
- **Optimized build context** via comprehensive `.dockerignore`

### Build Performance Benefits

1. **Faster Rebuilds**: Package layers cached when only source changes
2. **Bandwidth Efficiency**: pnpm store eliminates redundant downloads  
3. **Layer Reuse**: Docker caching prevents re-installing packages
4. **Smaller Images**: Production excludes development dependencies