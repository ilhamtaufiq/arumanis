# Runbook: WhatsApp (Baileys)

## Komponen

| Bagian | Lokasi |
|---|---|
| Bridge | `scripts/whatsapp-bridge.mjs` |
| UI | `/whatsapp` (admin) |
| BE proxy | `WhatsAppController` → bridge localhost |
| Docs detail | [docs/whatsapp-baileys.md](../whatsapp-baileys.md) |

## Start (lokal / dev)

```bash
# Di repo bun
bun run whatsapp:bridge
```

Default: `http://127.0.0.1:4000`  
Auth session: `./data/whatsapp-auth` (gitignore `data/`)

## Deploy production

Bridge **tidak** ikut auto-deploy frontend/API — harus dijalankan sebagai **proses/service terpisah**.

### Coolify (Docker) — simpel: bridge sudah di dalam container APIAMIS

Sama seperti **Reverb**, bridge Baileys otomatis distart oleh `docker-entrypoint.sh` di image **apiamis**. Tidak perlu app Coolify ke-3.

#### Env di app **apiamis** saja (opsional — default sudah cukup)

```env
WHATSAPP_BRIDGE_URL=http://127.0.0.1:4000
WHATSAPP_BRIDGE_KEY=
# DISABLE_WHATSAPP_BRIDGE=true   # matikan jika perlu
```

Sesi WhatsApp disimpan di `storage/app/whatsapp-auth` (ikut volume `storage` APIAMIS — jangan hilangkan saat redeploy).

#### App **arumanis** (frontend)

Tidak perlu env `WHATSAPP_*`.

#### Verifikasi

- Log container apiamis: `[entrypoint] WhatsApp bridge started`
- `/api/whatsapp/status` tidak 503
- UI `/whatsapp` → Hubungkan → scan QR

#### Container terpisah (opsional, tidak disarankan)

Hanya jika ingin memisahkan bridge: app `whatsapp-bridge` + `docker/whatsapp-bridge.Dockerfile` di repo arumanis.

### PM2 / systemd (hanya VPS tanpa Docker)

Jika APIAMIS **tidak** di container (deploy langsung di VPS):

```bash
bun run whatsapp:bridge:pm2
# apiamis .env: WHATSAPP_BRIDGE_URL=http://127.0.0.1:4000
```

Lihat `deploy/whatsapp-bridge.ecosystem.config.cjs` dan `deploy/whatsapp-bridge.service`.

### Docker Compose (stack lokal / staging)

Service `whatsapp-bridge` sudah ada di `docker-compose.yml` (tanpa publish port ke host).

```bash
docker compose up -d whatsapp-bridge backend
```

APIAMIS di compose memakai `WHATSAPP_BRIDGE_URL=http://whatsapp-bridge:4000`.

## Env

**Bridge / host**

```env
WHATSAPP_BRIDGE_HOST=127.0.0.1
WHATSAPP_BRIDGE_PORT=4000
WHATSAPP_BRIDGE_KEY=
WHATSAPP_AUTH_DIR=./data/whatsapp-auth
```

`WHATSAPP_BRIDGE_HOST=0.0.0.0` hanya untuk jaringan Docker internal (lihat `docker/whatsapp-bridge.Dockerfile`).

**APIAMIS**

```env
WHATSAPP_BRIDGE_URL=http://127.0.0.1:4000
WHATSAPP_BRIDGE_KEY=   # sama jika di-set
```

## Operasi

1. Jalankan bridge di server yang sama dengan API (atau reachable private)
2. Login admin → `/whatsapp` → Hubungkan → scan QR
3. Kirim pesan / template dari tab Template

## API (admin only)

- `GET /api/whatsapp/status`
- `POST /api/whatsapp/start|stop|send|send-bulk`

## Troubleshooting

| Gejala | Cek |
|---|---|
| 503 bridge belum jalan | Process bridge, port 4000 |
| 401 | `WHATSAPP_BRIDGE_KEY` mismatch |
| QR tidak muncul | Log bridge, reconnect start |
| Pesan gagal | Status connected, format nomor 62… |

## Keamanan

- Bridge **hanya** bind localhost / private network
- Jangan publish port 4000 ke internet
- Hanya role admin di API
