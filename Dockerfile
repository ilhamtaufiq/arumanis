# Stage 1: Build with Bun (pin version — lockfile integrity is Bun-version sensitive)
FROM oven/bun:1.2.17-alpine AS builder

WORKDIR /app

# Build tools for native deps (sharp, canvas, node-gyp, etc.)
RUN apk add --no-cache python3 make g++ git

# Copy package files — before source to cache install layer
COPY package.json bun.lock* ./

# Install dependencies.
# Do not mount /root/.bun/install-cache — Coolify BuildKit cache often serves
# corrupted tarballs (IntegrityCheckFailed on tinybench, psl, etc.).
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-install-cache
RUN rm -rf /tmp/bun-install-cache && mkdir -p /tmp/bun-install-cache \
    && bun install --frozen-lockfile

# Build args — declared BEFORE copying source so ARG changes don't
# invalidate the install layer (only the build layer below).
ARG VITE_API_BASE_URL=https://apiamis.cianjur.space/api
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

# Stage 2: Production runtime (BFF + static)
FROM oven/bun:1.2.17-alpine

WORKDIR /app

ARG VITE_API_BASE_URL=https://apiamis.cianjur.space/api
ARG VITE_PENGAWAS_APP_BASE_URL=https://arumanis.cianjur.space/pengawasan
ARG PUBLIC_SITE_URL=https://arumanis.cianjur.space

ENV NODE_ENV=production
ENV BUN_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
ENV APIAMIS_BASE_URL=$VITE_API_BASE_URL
ENV SESSION_COOKIE_SECURE=true
ENV SESSION_COOKIE_NAME=arumanis_session
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PENGAWAS_APP_BASE_URL=$VITE_PENGAWAS_APP_BASE_URL
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/scripts/health.ts ./scripts/health.ts
COPY --from=builder /app/package.json ./package.json

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:80/health/live').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "start"]