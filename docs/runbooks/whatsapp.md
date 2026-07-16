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

Bridge **tidak** ikut auto-deploy frontend/API. Pilih salah satu:

### A. PM2 (VPS, bridge di host yang sama dengan APIAMIS)

```bash
cd /var/www/arumanis
bun install --frozen-lockfile
cp deploy/whatsapp-bridge.env.example /etc/arumanis/whatsapp-bridge.env
# edit WHATSAPP_AUTH_DIR + WHATSAPP_BRIDGE_KEY jika perlu

bun run whatsapp:bridge:pm2
pm2 save
pm2 startup   # ikuti instruksi agar survive reboot
```

Cek: `pm2 status`, `bun run whatsapp:bridge:pm2:logs`

### B. systemd

```bash
sudo mkdir -p /etc/arumanis
sudo cp deploy/whatsapp-bridge.env.example /etc/arumanis/whatsapp-bridge.env
# sesuaikan path repo (default /var/www/arumanis) di unit jika berbeda

sudo cp deploy/whatsapp-bridge.service /etc/systemd/system/
sudo chown -R www-data:www-data /var/www/arumanis/data
sudo systemctl daemon-reload
sudo systemctl enable --now arumanis-whatsapp-bridge
sudo systemctl status arumanis-whatsapp-bridge
```

### C. Docker Compose (stack lokal / staging)

Service `whatsapp-bridge` sudah ada di `docker-compose.yml` (tanpa publish port ke host).

```bash
docker compose up -d whatsapp-bridge backend
```

APIAMIS di compose memakai `WHATSAPP_BRIDGE_URL=http://whatsapp-bridge:4000`.

### Coolify / APIAMIS di container, bridge di host

Jika Laravel jalan di container tapi bridge di VPS:

```env
# di container APIAMIS
WHATSAPP_BRIDGE_URL=http://host.docker.internal:4000
```

Jalankan bridge di host dengan PM2/systemd; bind tetap `127.0.0.1` — jangan buka port 4000 ke publik.

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
