# Runbook: WhatsApp (Baileys)

## Komponen

| Bagian | Lokasi |
|---|---|
| Bridge (prod) | Bundled di container **apiamis** (`docker-entrypoint.sh`) |
| Bridge (dev) | `scripts/whatsapp-bridge.mjs` |
| UI | `/whatsapp` (admin) |
| BE proxy | `WhatsAppController` → `http://127.0.0.1:4000` |
| Docs detail | [docs/whatsapp-baileys.md](../whatsapp-baileys.md) |

## Dev lokal (Laragon)

```bash
# Terminal 1 — APIAMIS sudah jalan
# Terminal 2 — di repo bun
bun run whatsapp:bridge
```

Default: `http://127.0.0.1:4000`  
Auth session: `./data/whatsapp-auth` (gitignore `data/`)

## Production (Coolify / Docker)

Bridge otomatis distart di dalam container **apiamis** (sama pola dengan Reverb). Tidak perlu app atau service terpisah di repo bun.

### Env di app **apiamis** (opsional — default sudah cukup)

```env
WHATSAPP_BRIDGE_URL=http://127.0.0.1:4000
WHATSAPP_BRIDGE_KEY=
# DISABLE_WHATSAPP_BRIDGE=true
```

Sesi disimpan di `storage/app/whatsapp-auth` (volume `storage` APIAMIS).

### App **arumanis** (frontend)

Tidak perlu env `WHATSAPP_*`.

### Verifikasi

- Log container apiamis: `[entrypoint] WhatsApp bridge started`
- `/api/whatsapp/status` tidak 503
- UI `/whatsapp` → Hubungkan → scan QR

### Docker Compose lokal

Service `backend` memakai image apiamis yang sudah membawa bridge internal — tidak ada service `whatsapp-bridge` terpisah.

```bash
docker compose up -d backend
```

## Env dev (bridge manual)

```env
WHATSAPP_BRIDGE_HOST=127.0.0.1
WHATSAPP_BRIDGE_PORT=4000
WHATSAPP_BRIDGE_KEY=
WHATSAPP_AUTH_DIR=./data/whatsapp-auth
```

## Operasi

1. Production: redeploy apiamis; dev: jalankan `bun run whatsapp:bridge`
2. Login admin → `/whatsapp` → Hubungkan → scan QR
3. Kirim pesan / template dari tab Template

## API (admin only)

- `GET /api/whatsapp/status`
- `GET /api/whatsapp/chats` — daftar chat tersinkron
- `GET /api/whatsapp/chats/{jid}/messages` — pesan per chat
- `POST /api/whatsapp/start|stop|send|send-bulk`

## Troubleshooting

| Gejala | Cek |
|---|---|
| 503 bridge belum jalan | Log apiamis entrypoint; dev: `bun run whatsapp:bridge` |
| 401 | `WHATSAPP_BRIDGE_KEY` mismatch |
| QR tidak muncul | Log bridge, reconnect start |
| Pesan gagal | Status connected, format nomor 62… |

## Keamanan

- Bridge bind `127.0.0.1` di dalam container
- Jangan publish port 4000 ke internet
- Hanya role admin di API