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
- Multi-stage build optimization
- ARM64 Linux targeting
- Production-ready with minimal dependencies
- Health check endpoint integration

**Build:**
```bash
docker build -f .docker/main.dockerfile -t struktura-main .
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

- Multi-stage builds minimize final image size
- Layer caching optimizes build times
- Production dependencies only in final stage
- Efficient file copying patterns