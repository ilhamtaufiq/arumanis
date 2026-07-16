# syntax=docker/dockerfile:1.7
# WhatsApp Baileys bridge — proses terpisah dari BFF frontend.

FROM oven/bun:1.2.17-alpine

WORKDIR /app

COPY package.json bun.lock* ./

ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-install-cache
RUN rm -rf /tmp/bun-install-cache && mkdir -p /tmp/bun-install-cache \
    && bun install --frozen-lockfile

COPY scripts/whatsapp-bridge.mjs ./scripts/

ENV NODE_ENV=production
ENV WHATSAPP_BRIDGE_HOST=0.0.0.0
ENV WHATSAPP_BRIDGE_PORT=4000
ENV WHATSAPP_AUTH_DIR=/app/data/whatsapp-auth
ENV WHATSAPP_LOG_LEVEL=silent

VOLUME ["/app/data"]

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/status').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "scripts/whatsapp-bridge.mjs"]