# Multi-stage Dockerfile for Struktura main application
# Optimized for ARM64 Linux with efficient layer caching

ARG BASE_IMAGE=node:22-alpine

# ================================
# Dependencies stage
# ================================
FROM ${BASE_IMAGE} as dependencies

# Install pnpm if not in base image
RUN if ! command -v pnpm &> /dev/null; then npm install -g pnpm@10.17.1; fi

WORKDIR /app

# Copy package management files
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

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ================================
# Build stage
# ================================
FROM dependencies as builder

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# ================================
# Production stage
# ================================
FROM ${BASE_IMAGE} as production

# Install pnpm if not in base image
RUN if ! command -v pnpm &> /dev/null; then npm install -g pnpm@10.17.1; fi

# Install curl for health check
RUN if command -v apk &> /dev/null; then \
        apk add --no-cache curl || echo "Could not install curl via apk"; \
    fi

WORKDIR /app

# Copy package files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy built applications and libraries
COPY --from=builder /app/apps/main/dist ./apps/main/dist
COPY --from=builder /app/apps/main/package.json ./apps/main/
COPY --from=builder /app/features/shared/contracts/dist ./features/shared/contracts/dist
COPY --from=builder /app/features/shared/contracts/package.json ./features/shared/contracts/
COPY --from=builder /app/features/shared/domain/dist ./features/shared/domain/dist
COPY --from=builder /app/features/shared/domain/package.json ./features/shared/domain/
COPY --from=builder /app/features/shared/ui/dist ./features/shared/ui/dist
COPY --from=builder /app/features/shared/ui/package.json ./features/shared/ui/
COPY --from=builder /app/libs/auth/dist ./libs/auth/dist
COPY --from=builder /app/libs/auth/package.json ./libs/auth/
COPY --from=builder /app/libs/utils/dist ./libs/utils/dist
COPY --from=builder /app/libs/utils/package.json ./libs/utils/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

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