# Runbook: OnlyOffice Document Server

## Komponen

| Bagian | Lokasi |
|---|---|
| FE viewer | `/documents/onlyoffice/$mediaId` |
| FE modal | `DocumentPreviewModal` → `OnlyOfficePreviewModal` |
| BFF proxy | `server/onlyoffice-proxy.ts` → path `/office/*` |
| BE config | `GET /api/onlyoffice/media/{id}/config` |
| BE download | `GET /api/onlyoffice/media/{id}/download` |
| BE callback | `POST /api/onlyoffice/callback` |
| BE health | `GET /api/onlyoffice/health` |

## Env kritis

**APIAMIS**

```env
ONLYOFFICE_DOCUMENT_SERVER_URL=https://office.example.com
ONLYOFFICE_JWT_SECRET=...
APP_URL=https://apiamis.example.com   # harus dijangkau container OnlyOffice
```

**Arumanis BFF**

```env
ONLYOFFICE_DOCUMENT_SERVER_URL=...   # upstream untuk proxy /office
```

Browser selalu memuat editor dari **same-origin** `/office/` (bukan URL DS langsung).

## Cek kesehatan

```bash
curl -sS https://<arumanis>/bff/api/onlyoffice/health
# atau langsung API
curl -sS https://<apiamis>/api/onlyoffice/health
```

- `enabled: true` + `reachable: true` → OK
- 503 → DS mati atau env kosong

## Alur buka dokumen

1. User preview berkas → modal OnlyOffice (mode view default)
2. Config JWT (jika secret set) + download URL ber-token
3. DS fetch file dari API download URL
4. Edit (jika `can_edit`) → forcesave/callback → **overwrite in-place** (media_id tetap)

## Izin

- **View:** akses media (admin / scope pekerjaan / owner drive)
- **Edit:** admin, operator, pengawas (scope), owner drive; PDF selalu view

## Troubleshooting

| Gejala | Cek |
|---|---|
| Editor blank / load error -2 | DS & proxy `/office`, JWT secret selaras |
| Download failed | `APP_URL` dari dalam container DS, firewall |
| Mixed content | Pastikan FE memakai `/office/` same origin |
| Save tidak nempel | Log callback BE; status 2/6; disk writable media path |
| 403 config | User tidak `canAccess` media |

## Jangan

- Jangan expose Document Server tanpa JWT di production
- Jangan hardcode URL DS di client (selalu lewat BFF proxy)
