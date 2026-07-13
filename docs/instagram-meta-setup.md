# Integrasi Instagram / Meta — Penyiapan Arumanis

Dokumen ini merinci penyiapan **Meta Developer App**, permission (**Business Asset User Profile Access**, **Human Agent**), webhook, dan env BFF.

## Endpoint BFF (sudah disiapkan)

| Method | Path | Fungsi |
|---|---|---|
| `GET` | `/bff/webhooks/meta` | Verifikasi subscribe webhook Meta |
| `POST` | `/bff/webhooks/meta` | Terima event → inbox/komentar/event log |
| `GET` | `/bff/instagram/status` | Status env + cache counts |
| `GET` | `/bff/instagram/gallery` | **Publik** — feed gallery (cache, auto-sync 30 mnt) |
| `GET` | `/bff/instagram/probe` | Admin: uji token + sample media/profile |
| `POST` | `/bff/instagram/sync` | Admin: tarik media + profil ke cache |
| `GET` | `/bff/instagram/media` | Admin: media cache |
| `GET` | `/bff/instagram/inbox` | Admin: daftar thread DM |
| `GET` | `/bff/instagram/inbox/:id` | Admin: detail thread |
| `POST` | `/bff/instagram/inbox/:id/reply` | Admin: balas (+ `humanAgent: true`) |
| `GET` | `/bff/instagram/comments` | Admin: komentar dari webhook |
| `GET` | `/bff/instagram/events` | Admin: log webhook |

Kode: `server/instagram/*`, di-wire di `server/index.ts`.  
UI admin: `/instagram` · Landing: section `#instagram`.  
Cache file: `data/instagram/store.json` (gitignored).

---

## Prasyarat akun

1. **Akun Facebook** untuk admin developer (wajib untuk Meta for Developers).
2. Instagram **Professional** (Business atau Creator) — contoh `@bidang_ams`.
3. Ideal: **Facebook Page** dinas, di-link ke Instagram (jalur Facebook Login).
4. Domain publik **HTTPS** untuk webhook (production: `https://arumanis.cianjur.space`).

---

## 1. Daftar Meta Developer

1. Login Facebook → [developers.facebook.com](https://developers.facebook.com/)
2. **Get Started** / [Register](https://developers.facebook.com/async/registration)
3. Verifikasi email/HP → pilih occupation
4. **My Apps → Create App** → use case **Business** / Other sesuai wizard

Catat:

- **App ID** → `META_APP_ID`
- **App Secret** → `META_APP_SECRET`

---

## 2. Tambah product Instagram

Di App Dashboard:

1. **Add Product** → **Instagram**
2. Pilih jalur:
   - **Instagram API with Instagram Login** (tanpa Page, IG Professional), atau
   - **Instagram API with Facebook Login** (IG + Facebook Page)

### Permission yang direncanakan Arumanis

| Permission / fitur Meta | Kegunaan di Arumanis |
|---|---|
| **Business Asset User Profile Access** / `instagram_business_basic` (atau setara) | Profil bisnis, foto profil, username, media count |
| Media read (basic) | Gallery landing + admin preview |
| `instagram_business_manage_messages` | Inbox DM |
| **Human Agent** (`human_agent` + tag `HUMAN_AGENT`) | Balas di luar window messaging standar (agen manusia) |
| `instagram_business_manage_comments` | Moderasi komentar + webhook comments |
| `pages_*` + `business_management` | Hanya jika jalur Facebook Page |

> Nama permission di dashboard Meta bisa berubah antar versi Graph. Ikuti label di **App Review → Permissions and Features**.

### Human Agent

- Aktifkan fitur/permission **Human Agent** di app.
- Saat mengirim pesan di luar 24 jam (aturan Meta berlaku), body API memakai:
  - `messaging_type: MESSAGE_TAG`
  - `tag: HUMAN_AGENT`
- Implementasi client: `sendInstagramTextMessage({ tag: 'HUMAN_AGENT', ... })` di `server/instagram/client.ts`.

### Business Asset User Profile Access

- Digunakan untuk membaca **profil aset bisnis** IG (bukan scrape).
- Endpoint probe: `GET /{ig-user-id}?fields=id,username,name,biography,...`
- Helper: `fetchInstagramBusinessProfile()`.

---

## 3. Token & IG User ID

### Cara disarankan: UI admin (tanpa salin URL oauth manual)

1. Coolify: set **`META_APP_ID`** + **`META_APP_SECRET`** (wajib untuk exchange)
2. Login admin Arumanis → **`/instagram`** → tab **Token**
3. Graph Explorer → Generate Access Token (short-lived) → copy
4. Tempel di UI → **Tukar & simpan long-lived**
5. Server menukar ke long-lived, prefer **Page token**, simpan ke  
   `data/instagram/credentials.json` (mengalahkan env `META_ACCESS_TOKEN`)
6. **Sync media**

Tombol **Perbarui token** mencoba refresh token yang tersimpan (bila masih valid).

### Long-lived manual (opsional)

1. Graph API Explorer atau OAuth app flow
2. Minta permission yang relevan
3. Tukar short-lived → **long-lived** token via  
   `GET /oauth/access_token?grant_type=fb_exchange_token&...`
4. Simpan di Coolify: `META_ACCESS_TOKEN`  
   (alias: `INSTAGRAM_ACCESS_TOKEN`) — **fallback** jika file credentials kosong

### Instagram Business Account ID

1. Via Page: `GET /{page-id}?fields=instagram_business_account`
2. Atau otomatis dari UI Token saat exchange (Page ber-IG)
3. Env: `META_IG_USER_ID`  
   (alias: `INSTAGRAM_BUSINESS_ACCOUNT_ID`)

---

## 4. Konfigurasi webhook

### Callback URL (production)

```text
https://arumanis.cianjur.space/bff/webhooks/meta
```

Lokal (tunnel, contoh ngrok):

```text
https://<subdomain>.ngrok-free.app/bff/webhooks/meta
```

### Verify Token

Buat string rahasia sendiri, contoh:

```text
arumanis_meta_verify_change_me
```

Isi sama di:

- Meta App Dashboard → Webhooks → **Verify Token**
- Env: `META_WEBHOOK_VERIFY_TOKEN`

### Langkah dashboard

1. App → **Webhooks** (atau Instagram → Webhooks)
2. Object: **Instagram** (dan/atau **Page** jika jalur FB)
3. **Callback URL** + **Verify Token** → **Verify and save**
4. Subscribe field yang dibutuhkan, mis.:
   - `messages`
   - `messaging_postbacks`
   - `comments`
   - `mentions`
   - `message_reactions`
5. Jika Page path: subscribe app ke Page (`/{page-id}/subscribed_apps`)

### Verifikasi sukses

- Dashboard tidak error
- Log BFF: tidak ada `[meta-webhook] verify failed`
- Event test dari dashboard → log `[meta-webhook] object=...`

### Signature

- Header: `X-Hub-Signature-256: sha256=...`
- Production: `META_WEBHOOK_ENFORCE_SIGNATURE=true` (default on di production)
- Dev: boleh `false` jika perlu, tapi tetap disarankan on

---

## 5. Environment

Tambahkan ke `.env` / Coolify (jangan commit secret):

```env
META_APP_ID=
META_APP_SECRET=
META_WEBHOOK_VERIFY_TOKEN=
META_ACCESS_TOKEN=
META_IG_USER_ID=
META_GRAPH_VERSION=v22.0
# META_GRAPH_BASE_URL=https://graph.facebook.com
# META_WEBHOOK_ENFORCE_SIGNATURE=true
```

Alias opsional:

```env
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
```

---

## 6. Uji cepat

```bash
# Status env (public)
curl -sS https://arumanis.cianjur.space/bff/instagram/status | jq

# Admin probe (butuh cookie sesi admin)
# atau dari browser setelah login admin
```

Webhook verify manual:

```bash
curl -sS "http://127.0.0.1:8787/bff/webhooks/meta?hub.mode=subscribe&hub.verify_token=TOKEN_ANDA&hub.challenge=12345"
# expect body: 12345
```

Unit test:

```bash
bunx vitest run server/instagram/webhook.test.ts
```

---

## 7. Fitur di Arumanis (implementasi)

| Area | Status |
|---|---|
| Env + webhook verify/signature | ✅ |
| Gallery landing `#instagram` | ✅ (butuh token + sync) |
| Admin hub `/instagram` | ✅ overview, media, inbox, komentar, events |
| Human Agent reply | ✅ checkbox di inbox |
| Business profile read | ✅ sync + probe |
| Publish konten | ⏳ belum (App Review content_publish) |

### Alur operasional

1. Isi env `META_*` di Coolify / `.env`
2. Verify webhook di Meta Dashboard
3. Login admin → **Pengaturan → Instagram** → **Sync media**
4. Landing menampilkan grid otomatis
5. DM/komentar masuk via webhook → tab Inbox / Komentar

---

## 8. Keamanan

- Jangan expose `META_APP_SECRET` / access token ke Vite (`VITE_*`).
- Webhook hanya di BFF; validasi signature.
- Token long-lived: rotasi manual / simpan di secret manager.
- Mode Development: hanya user dengan role di app yang bisa authorize.

---

## Referensi

- [Register as Meta Developer](https://developers.facebook.com/documentation/development/register)
- [Webhooks getting started](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/)
- [Webhooks for Instagram](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-instagram/)
- [Instagram Platform](https://developers.facebook.com/documentation/instagram-platform)
