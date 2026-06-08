# Stage 1: Build with Bun
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files for dependency install
COPY package.json bun.lock* ./

# Install dependencies without a persistent BuildKit cache. Coolify can keep a
# corrupted Bun tarball cache between builds, which causes integrity failures.
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-install-cache
RUN bun install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Set environment to production
ARG VITE_API_BASE_URL=http://localhost:8000/api
ARG VITE_PENGAWAS_APP_BASE_URL=https://arumanis.cianjur.space/pengawasan
ARG VITE_OPENROUTER_API_KEY=
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PENGAWAS_APP_BASE_URL=$VITE_PENGAWAS_APP_BASE_URL
ENV VITE_OPENROUTER_API_KEY=$VITE_OPENROUTER_API_KEY

# Build the application
RUN bun run build

# Stage 2: Serve with Bun so publikasi pages can inject Open Graph meta tags
FROM oven/bun:1-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts/serve-og.ts ./scripts/serve-og.ts

ARG VITE_API_BASE_URL=https://apiamis.cianjur.space/api
ARG VITE_PENGAWAS_APP_BASE_URL=https://arumanis.cianjur.space/pengawasan
ARG PUBLIC_SITE_URL=https://arumanis.cianjur.space
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PENGAWAS_APP_BASE_URL=$VITE_PENGAWAS_APP_BASE_URL
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL

# Expose port 80
EXPOSE 80

CMD ["bun", "run", "scripts/serve-og.ts"]
