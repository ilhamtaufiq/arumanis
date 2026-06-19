# Stage 1: Build with Bun
FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

# Build tools for native deps (sharp, canvas, node-gyp, etc.)
RUN apk add --no-cache python3 make g++ git

# Copy package files — before source to cache install layer
COPY package.json bun.lock* ./

# Install dependencies.
# BuildKit --mount=type=cache persists bun cache across local/CI builds.
# BUN_INSTALL_CACHE_DIR overrides to /tmp so Coolify's persistent volume
# can't serve a corrupted tarball cache.
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-install-cache
RUN --mount=type=cache,target=/root/.bun/install-cache \
    bun install --frozen-lockfile

# Build args — declared BEFORE copying source so ARG changes don't
# invalidate the install layer (only the build layer below).
ARG VITE_API_BASE_URL=http://localhost:8000/api
ARG VITE_PENGAWAS_APP_BASE_URL=https://arumanis.cianjur.space/pengawasan
ARG VITE_OPENROUTER_API_KEY=
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PENGAWAS_APP_BASE_URL=$VITE_PENGAWAS_APP_BASE_URL
ENV VITE_OPENROUTER_API_KEY=$VITE_OPENROUTER_API_KEY

# Source code
COPY . .

# Build
RUN bun run build

# Stage 2: Production runtime (alpine, minimal)
FROM oven/bun:1.2-alpine

WORKDIR /app

# Only artifacts — no dev tooling, no source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts/serve-og.ts ./scripts/serve-og.ts
COPY --from=builder /app/scripts/health.ts ./scripts/health.ts

ARG VITE_API_BASE_URL=https://apiamis.cianjur.space/api
ARG VITE_PENGAWAS_APP_BASE_URL=https://arumanis.cianjur.space/pengawasan
ARG PUBLIC_SITE_URL=https://arumanis.cianjur.space
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PENGAWAS_APP_BASE_URL=$VITE_PENGAWAS_APP_BASE_URL
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health/live || exit 1

CMD ["bun", "run", "scripts/serve-og.ts"]
