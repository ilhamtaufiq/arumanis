# syntax=docker/dockerfile:1.7

# Node 22+ required by @react-router/dev (apk "nodejs" on Alpine is often 20.x).
FROM node:22-alpine AS node22

# Stage 1: Build with Bun (pin version — lockfile integrity is Bun-version sensitive)
FROM oven/bun:1.2.17-alpine AS builder

WORKDIR /app

# Build tools for native deps (sharp, canvas, node-gyp, etc.)
RUN apk add --no-cache python3 make g++ git

# Official Node 22 (musl) for vite + docs-site react-router build
COPY --from=node22 /usr/local/bin/node /usr/local/bin/node
COPY --from=node22 /usr/local/bin/npm /usr/local/bin/npm
COPY --from=node22 /usr/local/lib/node_modules /usr/local/lib/node_modules
ENV PATH="/usr/local/bin:${PATH}"

# Copy package files — before source to cache install layer
COPY package.json bun.lock* ./
COPY docs-site/package.json docs-site/bun.lock* ./docs-site/

# Do not mount /root/.bun/install-cache — Coolify BuildKit cache often serves
# corrupted tarballs (IntegrityCheckFailed on tinybench, psl, etc.).
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-install-cache
RUN rm -rf /tmp/bun-install-cache && mkdir -p /tmp/bun-install-cache \
    && bun install --frozen-lockfile \
    && cd docs-site && bun install --frozen-lockfile && cd ..

# Non-secret build args (declared before COPY source)
ARG VITE_API_BASE_URL=https://apiamis.cianjur.space/api
ARG VITE_PENGAWAS_APP_BASE_URL=https://arumanis.cianjur.space/pengawasan
ARG VITE_SIPD_WEB_URL=https://sipd-lite.cianjur.space
ARG VITE_UMAMI_SCRIPT_URL=https://umami-cvkpzrlvpd23hquu71dt6s05.cianjur.space/script.js
ARG VITE_UMAMI_WEBSITE_ID=cb0064bf-1fd5-4b32-811b-14d8694d135c
ARG VITE_UMAMI_DOMAINS=arumanis.cianjur.space
ARG VITE_REVERB_HOST=apiamis.cianjur.space
ARG VITE_REVERB_PORT=443
ARG VITE_REVERB_SCHEME=https
# VITE_REVERB_APP_KEY is a public Pusher-style key (embedded in client bundle by design).
# check=skip=SecretsUsedInArgOrEnv
ARG VITE_REVERB_APP_KEY=
# check=skip=SecretsUsedInArgOrEnv
ARG VITE_OPENROUTER_API_KEY=

COPY . .

# Memory + docs:
# - max-old-space-size: SPA vite (three, imgly) needs >2GB on Coolify
# - full prerender: required so route `loader`s stay valid under ssr:false
# - split SPA vs docs RUN so peak RSS is not additive
# Build context must include docs-site/content + docs/user-guide (see .dockerignore).
ENV NODE_OPTIONS="--max-old-space-size=4096 --dns-result-order=ipv4first"
ENV DOCS_BUILD_WITH=node
# full | minimal (minimal = only / and /docs — last resort for RAM)
ENV DOCS_PRERENDER=full

# 1) Main SPA via Node so --max-old-space-size applies
RUN VITE_API_BASE_URL="$VITE_API_BASE_URL" \
    VITE_PENGAWAS_APP_BASE_URL="$VITE_PENGAWAS_APP_BASE_URL" \
    VITE_SIPD_WEB_URL="$VITE_SIPD_WEB_URL" \
    VITE_UMAMI_SCRIPT_URL="$VITE_UMAMI_SCRIPT_URL" \
    VITE_UMAMI_WEBSITE_ID="$VITE_UMAMI_WEBSITE_ID" \
    VITE_UMAMI_DOMAINS="$VITE_UMAMI_DOMAINS" \
    VITE_REVERB_APP_KEY="$VITE_REVERB_APP_KEY" \
    VITE_REVERB_HOST="$VITE_REVERB_HOST" \
    VITE_REVERB_PORT="$VITE_REVERB_PORT" \
    VITE_REVERB_SCHEME="$VITE_REVERB_SCHEME" \
    VITE_OPENROUTER_API_KEY="$VITE_OPENROUTER_API_KEY" \
    NODE_ENV=production \
    node ./node_modules/vite/bin/vite.js build

# 2) Fumadocs → dist/docs (Node 22 + full prerender)
RUN node -v \
    && NODE_ENV=production node scripts/build-docs.mjs

# Stage 2: Production runtime (BFF + static)
# Do NOT copy builder node_modules — frontend deps are huge (onnx, wasm, wa-automate)
# and can OOM Coolify during layer export. BFF only needs Hono at runtime.
FROM oven/bun:1.2.17-alpine

WORKDIR /app

# Runtime secrets (UMAMI_*, API keys) — set only via Coolify runtime env, not Dockerfile.
ENV NODE_ENV=production
ENV BUN_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
ENV APIAMIS_BASE_URL=https://apiamis.cianjur.space/api
ENV SIPD_BASE_URL=https://sipd-lite.cianjur.space
ENV SESSION_COOKIE_SECURE=true
ENV SESSION_COOKIE_NAME=arumanis_session
ENV PUBLIC_SITE_URL=https://arumanis.cianjur.space
ENV ONLYOFFICE_DOCUMENT_SERVER_URL=https://office.cianjur.space

RUN bun add hono@4.5.10

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/scripts/health.ts ./scripts/health.ts

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:80/health/live').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "server/index.ts"]
