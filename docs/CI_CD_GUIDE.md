# CI/CD Guide - Struktura

This guide explains the CI/CD pipeline setup for the Struktura project, including GitHub Actions workflows, Docker containerization, and deployment strategies.

## Overview

The Struktura CI/CD pipeline is designed with the following principles:

- **ARM64 Linux only** - All containers target ARM64 architecture
- **GHCR only** - All container images are published to GitHub Container Registry
- **Branch-based deployments** - Different environments triggered by branch/tag patterns
- **Security-first** - Comprehensive security scanning and dependency audits
- **Cache optimization** - Aggressive caching for faster builds

## Workflow Structure

### 1. Base Image Workflow (`.github/workflows/base-image.yml`)

**Triggers:**
- Weekly schedule (Sundays at 2AM UTC)
- Manual dispatch
- Changes to `.docker/base.dockerfile`

**Purpose:**
- Builds and publishes the base image with OS-level dependencies
- Ensures consistent environment across all deployments
- Provides pnpm and Node.js 22 pre-installed

**Outputs:**
- `ghcr.io/cbnsndwch/struktura-base:latest`
- `ghcr.io/cbnsndwch/struktura-base:YYYY-MM-DD`

### 2. PR Validation Workflow (`.github/workflows/pr-validation.yml`)

**Triggers:**
- Pull requests to `main` or `develop` branches
- Skips draft PRs automatically

**Validation Steps:**
1. **Lint and Format** - ESLint and Prettier checks
2. **Test Validation** - Unit and integration tests
3. **Build Validation** - Ensures all packages build successfully
4. **Docker Build Test** - Verifies Docker image builds (without push)
5. **Security Check** - Dependency audit

**Status Reporting:**
- Comprehensive summary in GitHub Step Summary
- Clear pass/fail indicators for each check

### 3. Main CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Version tags (`v*`, `*-pre.*`, `*-rc.*`)

**Pipeline Stages:**

#### Quality Checks
- Linting (ESLint)
- Formatting (Prettier)  
- Testing (Vitest)
- Building (Turborepo)

#### Security Scanning
- Dependency audit (`pnpm audit`)
- CodeQL static analysis
- Container vulnerability scanning

#### Docker Build & Push
- Multi-stage Docker build optimized for ARM64
- Push to GHCR with appropriate tags
- Layer caching via GitHub Actions cache

#### Environment Deployments

**Development (`develop` branch):**
```bash
# Pushes to develop branch trigger DEV deployment
git push origin develop
```

**Staging (pre-release tags on `main`):**
```bash
# Create and push pre-release tag
git tag v1.0.0-pre.1
git push origin main v1.0.0-pre.1

# Or release candidate
git tag v1.0.0-rc.1
git push origin main v1.0.0-rc.1
```

**Production (version tags on `main`):**
```bash
# Create and push version tag
git tag v1.0.0
git push origin main v1.0.0
```

### 4. Cleanup Workflow (`.github/workflows/cleanup.yml`)

**Purpose:**
- Removes old container images (keeps 10 most recent)
- Cleans up old workflow runs (keeps 20 per workflow)
- Runs weekly to manage storage costs

## Docker Strategy

### Base Image (`.docker/base.dockerfile`)

**Features:**
- Node.js 22 Alpine base
- pnpm 10.17.1 pre-installed
- Non-root user (`struktura`)
- Health checks included

### Main Application (`.docker/main.dockerfile`)

**Multi-stage build:**

1. **Dependencies Stage** - Install all dependencies
2. **Build Stage** - Build TypeScript applications and libraries
3. **Production Stage** - Production-ready image with only runtime dependencies

**Optimizations:**
- Layer caching for package.json changes
- Multi-stage builds reduce final image size
- ARM64 architecture targeting
- Fallback health checks

## Environment Configuration

### Repository Secrets

Required secrets for full functionality:

```bash
# GitHub Container Registry (automatically available)
GITHUB_TOKEN  # Auto-provided by GitHub Actions

# Optional: Additional deployment secrets
DEPLOY_KEY_DEV      # SSH key for dev environment
DEPLOY_KEY_STAGING  # SSH key for staging environment  
DEPLOY_KEY_PROD     # SSH key for production environment
```

### Environment Variables

**Build-time variables:**
- `NODE_ENV` - Environment (development/production)
- `CI` - CI environment flag
- `GITHUB_ACTIONS` - GitHub Actions flag

**Runtime variables:**
- `PORT` - Application port (default: 3000)
- `DATABASE_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string (if needed)

## Branch Strategy

### Main Branches

**`main`** - Production-ready code
- Protected branch requiring PR reviews
- Triggers staging deployment with pre-release tags
- Triggers production deployment with version tags

**`develop`** - Integration branch
- Latest development changes
- Triggers development environment deployment
- Source branch for feature PRs

### Tag Patterns

**Version Tags:** `v{major}.{minor}.{patch}`
- Example: `v1.0.0`, `v1.2.3`
- Triggers production deployment

**Pre-release Tags:** `v{version}-pre.{number}` or `v{version}-rc.{number}`
- Example: `v1.0.0-pre.1`, `v1.0.0-rc.1`
- Triggers staging deployment

## Caching Strategy

### Turborepo Caching

Enhanced `turbo.json` configuration:
- Input-specific caching for better cache hits
- Environment variable awareness
- Proper output definitions

### GitHub Actions Caching

**Node.js Dependencies:**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
    cache-dependency-path: pnpm-lock.yaml
```

**Docker Layer Caching:**
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

## Monitoring and Maintenance

### Health Checks

All containers include health checks:
- Base image: Node.js version check
- Main application: HTTP health endpoint (`/health`)

### Dependency Management

**Dependabot Configuration:**
- Weekly updates for npm dependencies
- Weekly updates for GitHub Actions
- Weekly updates for Docker base images
- Automated PR creation with proper labels

### Container Registry Management

**Image Lifecycle:**
- Main images: Keep 10 most recent versions
- Base images: Keep 5 most recent versions
- Automatic cleanup via weekly scheduled workflow

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check build locally
pnpm build

# Check Docker build locally  
docker build -f .docker/main.dockerfile -t test .
```

**Test Failures:**
```bash
# Run tests with verbose output
pnpm test --reporter=verbose

# Run specific test suite
pnpm --filter @cbnsndwch/struktura-main test
```

**Docker Issues:**
```bash
# Build with no cache
docker build --no-cache -f .docker/main.dockerfile .

# Check image contents
docker run -it --rm <image> sh
```

### Debugging Workflows

**Enable Debug Logging:**
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

**View Logs:**
- GitHub Actions tab in repository
- Workflow run details
- Step-by-step logs with timestamps

## Security Considerations

### Container Security

- Non-root user in production images
- Minimal base images (Alpine Linux)
- Regular security updates via Dependabot
- Vulnerability scanning in CI pipeline

### Secret Management

- GitHub Secrets for sensitive data
- Environment-specific secret scoping
- No secrets in container images or logs
- Principle of least privilege for tokens

### Network Security

- ARM64-only builds reduce attack surface
- Health check endpoints properly secured
- Internal service communication patterns
- Container registry access controls

## Performance Optimization

### Build Performance

- Parallel job execution where possible
- Aggressive caching at multiple levels
- Optimized Docker layer ordering
- Minimal dependency installation

### Runtime Performance

- Multi-stage builds for smaller images
- Production-only dependencies in final stage
- Optimized Node.js startup
- Health check endpoint efficiency

## Future Enhancements

### Planned Improvements

1. **Infrastructure as Code** - Terraform/Pulumi for deployment
2. **Advanced Monitoring** - OTEL-LGTM stack integration
3. **Progressive Deployment** - Blue/green or canary deployments
4. **Performance Testing** - Automated load testing in pipeline
5. **Security Hardening** - Additional security scanning tools

### Integration Opportunities

- **Slack/Discord Notifications** - Build status updates
- **Jira Integration** - Automatic issue updates
- **Monitoring Alerts** - Integration with deployment pipeline
- **Automated Rollbacks** - Failure detection and rollback

---

For questions or issues with the CI/CD pipeline, please:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review workflow logs in GitHub Actions
3. Create an issue with the `ci/cd` label