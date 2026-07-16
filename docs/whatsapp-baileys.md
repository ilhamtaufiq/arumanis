# WhatsApp Baileys Integration

Arumanis memakai bridge lokal berbasis [Baileys](https://github.com/whiskeysockets/Baileys) (`@whiskeysockets/baileys`).

## Runtime

```bash
bun run whatsapp:bridge
```

Bridge listen di `http://127.0.0.1:4000`. Laravel mem-proxy request admin:

| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/api/whatsapp/status` | Status + QR data URL |
| POST | `/api/whatsapp/start` | Mulai sesi / tampilkan QR |
| POST | `/api/whatsapp/stop` | Logout + hentikan sesi |
| POST | `/api/whatsapp/send` | Kirim pesan teks |
| POST | `/api/whatsapp/send-bulk` | Kirim bulk |

## Environment

Frontend / bridge:

```env
WHATSAPP_BRIDGE_PORT=4000
WHATSAPP_BRIDGE_KEY=
WHATSAPP_AUTH_DIR=./data/whatsapp-auth
WHATSAPP_LOG_LEVEL=silent
```

Backend APIAMIS:

```env
WHATSAPP_BRIDGE_URL=http://127.0.0.1:4000
WHATSAPP_BRIDGE_KEY=
```

## UI

Halaman admin: `/whatsapp` (role admin).

## Catatan

- Jangan expose port bridge ke internet
- Sesi multi-device disimpan di `WHATSAPP_AUTH_DIR` (diabaikan git via `data/`)
- Dependency: `@whiskeysockets/baileys`, `qrcode`, `express`, `cors`, `pino`
