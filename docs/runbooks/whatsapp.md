# Runbook: WhatsApp (Baileys)

## Komponen

| Bagian | Lokasi |
|---|---|
| Bridge | `scripts/whatsapp-bridge.mjs` |
| UI | `/whatsapp` (admin) |
| BE proxy | `WhatsAppController` → bridge localhost |
| Docs detail | [docs/whatsapp-baileys.md](../whatsapp-baileys.md) |

## Start

```bash
# Di repo bun
bun run whatsapp:bridge
```

Default: `http://127.0.0.1:4000`  
Auth session: `./data/whatsapp-auth` (gitignore `data/`)

## Env

**Bridge / host**

```env
WHATSAPP_BRIDGE_PORT=4000
WHATSAPP_BRIDGE_KEY=
WHATSAPP_AUTH_DIR=./data/whatsapp-auth
```

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
