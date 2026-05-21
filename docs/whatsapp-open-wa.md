# WhatsApp Open-WA Integration

Arumanis uses a small local Node bridge for WhatsApp automation through `@open-wa/wa-automate`.

## Runtime

Start the bridge on the server that runs Arumanis:

```bash
bun run whatsapp:bridge
```

The bridge listens on `http://127.0.0.1:4000` by default. Laravel proxies authenticated admin requests from:

- `GET /api/whatsapp/status`
- `POST /api/whatsapp/start`
- `POST /api/whatsapp/stop`
- `POST /api/whatsapp/send`
- `POST /api/whatsapp/send-bulk`

## Environment

Frontend repo / bridge process:

```env
WHATSAPP_BRIDGE_PORT=4000
WHATSAPP_BRIDGE_KEY=
WHATSAPP_SESSION_ID=arumanis
WHATSAPP_HEADLESS=true
WHATSAPP_USE_CHROME=false
WHATSAPP_CHROME_PATH=
```

Backend repo:

```env
WHATSAPP_BRIDGE_URL=http://127.0.0.1:4000
WHATSAPP_BRIDGE_KEY=
```

If `WHATSAPP_BRIDGE_KEY` is set, both the bridge process and Laravel backend must use the same value.

## Notes

- Use the `/whatsapp` admin page to start the session and scan the QR code.
- Keep the bridge bound to localhost or behind a private network.
- Do not expose the bridge port directly to the public internet.
- This integration uses the stable `@open-wa/wa-automate@4.76.0` line.
