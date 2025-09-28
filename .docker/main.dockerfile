# Multi-stage Dockerfile for Struktura main application
# Optimized for efficient layer caching and pnpm store caching (Alpine base)

ARG BASE_IMAGE=node:22-alpine
ARG BUILDPLATFORM
ARG TARGETPLATFORM

# ================================
# Base stage - pnpm setup and cache
# ================================
FROM --platform=$TARGETPLATFORM ${BASE_IMAGE} AS base

WORKDIR /app

# Set environment variables for pnpm path and cache
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"

# Install/activate pnpm via corepack and set store dir once here
RUN corepack enable && \
    corepack prepare pnpm@10.17.1 --activate && \
    pnpm config set store-dir /app/.pnpm-store

# ================================
# Dependencies stage
# ================================
FROM base AS dependencies

WORKDIR /app

# Copy package management files first (these change less frequently)
COPY pnpm-workspace.yaml \
     package.json \
     pnpm-lock.yaml \
     turbo.json \
     .dvmrc.json \
     ./

# Copy all package.json files for workspace dependency resolution
COPY apps/main/package.json                                 ./apps/main/
COPY features/shared/contracts/package.json                 ./features/shared/contracts/
COPY features/shared/domain/package.json                    ./features/shared/domain/
COPY features/shared/ui/package.json                        ./features/shared/ui/
COPY features/auth/contracts/package.json                   ./features/auth/contracts/
COPY features/auth/domain/package.json                      ./features/auth/domain/
COPY features/collections/contracts/package.json            ./features/collections/contracts/
COPY features/collections/domain/package.json               ./features/collections/domain/
COPY features/schema/contracts/package.json                 ./features/schema/contracts/
COPY features/schema/domain/package.json                    ./features/schema/domain/
COPY features/workspace/contracts/package.json              ./features/workspace/contracts/
COPY features/workspace/domain/package.json                 ./features/workspace/domain/
COPY libs/auth/package.json                                 ./libs/auth/
COPY libs/utils/package.json                                ./libs/utils/
COPY tools/tsconfig/package.json                            ./tools/tsconfig/
COPY tools/eslint-config/package.json                       ./tools/eslint-config/

# Copy the tool configurations needed for builds (tsconfig/eslint)
COPY tools/tsconfig/                                        ./tools/tsconfig/
COPY tools/eslint-config/                                   ./tools/eslint-config/

# Prefetch store purely from lockfile (network)
RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store,sharing=locked \
    --mount=type=cache,id=node-gyp,target=/root/.cache/node-gyp,sharing=locked \
    pnpm fetch

# Offline install (reuses the store)
RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store,sharing=locked \
    --mount=type=cache,id=node-gyp,target=/root/.cache/node-gyp,sharing=locked \
    pnpm install --frozen-lockfile --offline

# ================================
# Build stage
# ================================
FROM dependencies AS builder

WORKDIR /app

# Copy source code
COPY . .

# Build the application (cache mounts help native builds if any)
RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store,sharing=locked \
    --mount=type=cache,id=node-gyp,target=/root/.cache/node-gyp,sharing=locked \
    pnpm build

# ================================
# Production stage
# ================================
FROM base AS production

WORKDIR /app

# tini for PID 1 signal handling
RUN apk add --no-cache tini

# Set production env BEFORE installing to influence postinstalls/tools
ENV NODE_ENV=production \
    PORT=3000

# Copy only what’s needed to resolve runtime deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml        ./
COPY apps/main/package.json                                 ./apps/main/
COPY features/shared/contracts/package.json                 ./features/shared/contracts/
COPY features/shared/domain/package.json                    ./features/shared/domain/
COPY features/shared/ui/package.json                        ./features/shared/ui/
COPY features/auth/contracts/package.json                   ./features/auth/contracts/
COPY features/auth/domain/package.json                      ./features/auth/domain/
COPY features/collections/contracts/package.json            ./features/collections/contracts/
COPY features/collections/domain/package.json               ./features/collections/domain/
COPY features/schema/contracts/package.json                 ./features/schema/contracts/
COPY features/schema/domain/package.json                    ./features/schema/domain/
COPY features/workspace/contracts/package.json              ./features/workspace/contracts/
COPY features/workspace/domain/package.json                 ./features/workspace/domain/
COPY libs/auth/package.json                                 ./libs/auth/
COPY libs/utils/package.json                                ./libs/utils/

# Fetch prod deps into store, then offline install
RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store,sharing=locked \
    --mount=type=cache,id=node-gyp,target=/root/.cache/node-gyp,sharing=locked \
    pnpm fetch

RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store,sharing=locked \
    --mount=type=cache,id=node-gyp,target=/root/.cache/node-gyp,sharing=locked \
    pnpm install --prod --frozen-lockfile --offline && \
    rm -rf /app/.pnpm-store

# Copy built artifacts from builder (keep this AFTER installs for better caching)
COPY --from=builder /app/apps/main/dist                         ./apps/main/dist
COPY --from=builder /app/features/shared/contracts/dist         ./features/shared/contracts/dist
COPY --from=builder /app/features/shared/domain/dist            ./features/shared/domain/dist
COPY --from=builder /app/features/shared/ui/dist                ./features/shared/ui/dist
COPY --from=builder /app/features/auth/contracts/dist           ./features/auth/contracts/dist
COPY --from=builder /app/features/auth/domain/dist              ./features/auth/domain/dist
COPY --from=builder /app/features/collections/contracts/dist    ./features/collections/contracts/dist
COPY --from=builder /app/features/collections/domain/dist       ./features/collections/domain/dist
COPY --from=builder /app/features/schema/contracts/dist         ./features/schema/contracts/dist
COPY --from=builder /app/features/schema/domain/dist            ./features/schema/domain/dist
COPY --from=builder /app/features/workspace/contracts/dist      ./features/workspace/contracts/dist
COPY --from=builder /app/features/workspace/domain/dist         ./features/workspace/domain/dist
COPY --from=builder /app/libs/auth/dist                         ./libs/auth/dist
COPY --from=builder /app/libs/utils/dist                        ./libs/utils/dist

# Expose port
EXPOSE 3000

# Health check (BusyBox wget is available on Alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

# Drop privileges for runtime
USER node

# Start the application
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/main/dist/main.js"]
