# Base image for Struktura with OS-level dependencies
# Built weekly and on-demand for consistency across environments
FROM node:22-alpine

LABEL maintainer="cbnsndwch LLC <support@cbnsndwch.io>"
LABEL description="Struktura base image with OS-level dependencies"

# Configure non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S struktura -u 1001 -G nodejs

# Install global dependencies
RUN npm install -g pnpm@10.17.1

# Set up work directory with proper permissions
WORKDIR /app
RUN chown -R struktura:nodejs /app

USER struktura

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --version || exit 1

# Default entrypoint
CMD ["node", "--version"]