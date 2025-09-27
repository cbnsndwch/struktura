# Multi-stage Dockerfile for Struktura main application
# Optimized for ARM64 Linux with efficient layer caching and pnpm store caching

ARG BASE_IMAGE=node:22-alpine
ARG BUILDPLATFORM
ARG TARGETPLATFORM

# ================================
# Base stage - pnpm setup and cache
# ================================
FROM --platform=$TARGETPLATFORM ${BASE_IMAGE} AS base

# Install pnpm globally and configure store
RUN npm install -g pnpm@10.17.1

# Set environment variables for cross-compilation
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV STORE_DIR="/app/.pnpm-store"
ENV npm_config_target_platform="linux"
ENV npm_config_target_arch="arm64"
ENV npm_config_disturl="https://nodejs.org/dist"
ENV npm_config_runtime="node"
ENV npm_config_cache_lock_stale="60000"
ENV npm_config_cache_lock_wait="10000"

# Configure pnpm to use the cache directory and cross-compilation settings
RUN pnpm config set store-dir $STORE_DIR && \
    pnpm config set target_arch arm64 && \
    pnpm config set target_platform linux

WORKDIR /app

# ================================
# Dependencies stage
# ================================
FROM base AS dependencies

# Copy package management files first (these change less frequently)
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY turbo.json ./
COPY .dvmrc.json ./

# Copy all package.json files for workspace dependency resolution
COPY apps/main/package.json ./apps/main/
COPY features/shared/contracts/package.json ./features/shared/contracts/
COPY features/shared/domain/package.json ./features/shared/domain/
COPY features/shared/ui/package.json ./features/shared/ui/
COPY libs/auth/package.json ./libs/auth/
COPY libs/utils/package.json ./libs/utils/

# Install dependencies using pnpm store for caching
# Optimize for cross-compilation (ARM64) to avoid QEMU issues
RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store \
    --mount=type=cache,id=node-gyp,target=/root/.cache/node-gyp \
    set -e && \
    pnpm config set target_arch arm64 && \
    pnpm config set target_platform linux && \
    pnpm config set cache-dir /app/.pnpm-store && \
    pnpm install --frozen-lockfile --prefer-offline

# ================================
# Development stage (for hot reload)
# ================================
FROM dependencies AS development

# Install curl for health checks
RUN if command -v apk &> /dev/null; then \
        apk add --no-cache curl || echo "Could not install curl via apk"; \
    fi

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start development server with hot reload
CMD ["pnpm", "dev"]

# ================================
# Build stage
# ================================
FROM dependencies AS builder

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# ================================
# Production stage
# ================================
FROM base AS production

# Install curl for health check
RUN if command -v apk &> /dev/null; then \
        apk add --no-cache curl || echo "Could not install curl via apk"; \
    fi

# Copy package files for production dependencies
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy all package.json files (needed for workspace resolution)
COPY apps/main/package.json ./apps/main/
COPY features/shared/contracts/package.json ./features/shared/contracts/
COPY features/shared/domain/package.json ./features/shared/domain/
COPY features/shared/ui/package.json ./features/shared/ui/
COPY libs/auth/package.json ./libs/auth/
COPY libs/utils/package.json ./libs/utils/

# Install production dependencies only using cached store
# Optimize for cross-compilation (ARM64) to avoid QEMU issues
RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store \
    --mount=type=cache,id=node-gyp,target=/root/.cache/node-gyp \
    set -e && \
    pnpm config set target_arch arm64 && \
    pnpm config set target_platform linux && \
    pnpm config set cache-dir /app/.pnpm-store && \
    pnpm install --prod --frozen-lockfile --prefer-offline

# Copy built applications and libraries from builder stage
COPY --from=builder /app/apps/main/dist ./apps/main/dist
COPY --from=builder /app/features/shared/contracts/dist ./features/shared/contracts/dist
COPY --from=builder /app/features/shared/domain/dist ./features/shared/domain/dist
COPY --from=builder /app/features/shared/ui/dist ./features/shared/ui/dist
COPY --from=builder /app/libs/auth/dist ./libs/auth/dist
COPY --from=builder /app/libs/utils/dist ./libs/utils/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check (fallback to simple node check if curl not available)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || (echo "Health check via curl failed, checking process" && pgrep node) || exit 1

# Start the application
CMD ["node", "apps/main/dist/main.js"]