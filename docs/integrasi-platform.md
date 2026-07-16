# Dokumen Integrasi Platform Arumanis

**Versi:** 1.0 (8 Juli 2026)  
**Lingkup:** Portal operasional `www/bun`, layanan SIPD, SPSE, panel pengawasan web, dan aplikasi mobile pengawas.

---

## 1. Apa yang sudah terhubung

Arumanis di `C:\laragon\www\bun` bukan aplikasi tunggal. Portal ini jadi pintu masuk operator Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur, lalu data mengalir ke beberapa sistem lain:

| Sistem | Peran | Cara sambung |
|--------|--------|--------------|
| **APIAMIS** (Laravel) | Sumber data bisnis, auth, RBAC | BFF `/bff/api/*` |
| **SPSE** (LPSE Kab. Cianjur) | Paket pengadaan, dokumen, push kontrak | APIAMIS + UI Sync SPSE |
| **SIPD** (`sipd-lite.cianjur.space`) | Cache Renja & rincian anggaran | Proxy BFF `/bff/sipd/*` |
| **Panel Pengawasan** (`www/pengawas`) | Dashboard pengawas di `/pengawasan` | SSO handoff satu kali pakai |
| **Mobile Pengawasan** (`apps/mobile`) | Foto GPS, progress, tiket di lapangan | Langsung ke APIAMIS |

Backend tetap di `C:\laragon\www\apiamis`. Frontend Arumanis dan panel pengawasan hanya menampilkan dan memproksi; aturan bisnis tidak diduplikasi di sisi UI.

---

## 2. Gambaran alur data

```text
                    ┌─────────────────────────────────────┐
                    │   Arumanis (www/bun)                │
                    │   React SPA + BFF Bun (Hono)        │
                    └──────────┬────────────┬─────────────┘
                               │            │
              /bff/api/*       │            │  /bff/sipd/*
                               ▼            ▼
                    ┌──────────────┐   ┌─────────────┐
                    │   APIAMIS    │   │ SIPD Lite   │
                    │   Laravel    │   │ (FastAPI)   │
                    └──────┬───────┘   └─────────────┘
                           │
         procurement/spse  │  auth/handoff
                           │
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
 SPSE inaproc      www/pengawas (BFF)     apps/mobile
 (session cookie)   /pengawasan            Bearer token
```

Operator kantor biasanya hanya membuka domain Arumanis. Pengawas bisa masuk lewat portal yang sama (lalu dialihkan), lewat `/pengawasan` langsung, atau lewat APK mobile.

---

## 3. Arumanis utama (`www/bun`)

### 3.1 BFF sebagai satu pintu API

Browser tidak memanggil APIAMIS secara langsung. Semua request authenticated lewat cookie `arumanis_session` (httpOnly) ke BFF, lalu diteruskan dengan header `Authorization: Bearer <token>`.

Endpoint auth penting:

- `POST /bff/auth/login` — login operator
- `GET /bff/auth/me` — profil & role
- `POST /bff/auth/handoff` — kode sekali pakai untuk SSO ke panel pengawasan atau aplikasi eksternal lain

Proxy APIAMIS: `app.all('/bff/api/*', ...)` di `server/index.ts`. Operasi SPSE yang berat (sync paket, push kontrak) memakai timeout hingga 180 detik.

### 3.2 Realtime

Portal memakai Laravel Reverb untuk notifikasi dan presence. Mobile dan panel pengawasan juga berlangganan channel yang sama lewat `apiamis.cianjur.space` (konfigurasi `VITE_REVERB_*` / `EXPO_PUBLIC_REVERB_*`).

Di dashboard Arumanis, panel **Pengguna Online** membedakan app `portal` dan `pengawasan`, termasuk koordinat terakhir dari mobile.

---

## 4. Integrasi SPSE

SPSE dipakai untuk menarik data paket LPSE dan, pada paket tertentu, mengirim balik data kontrak dari Arumanis ke formulir SPSE.

### 4.1 Lokasi di UI

- Menu **Sync SPSE** → route `/procurement-sync`
- Tombol **Push ke SPSE** di detail kontrak (`KontrakDetail.tsx`), aktif bila session SPSE terhubung dan kontrak belum pernah di-push

### 4.2 API (melalui BFF → APIAMIS)

Prefix: `/bff/api/procurement/spse` (client memanggil `/procurement/spse` via `api-client`).

| Endpoint (relatif) | Fungsi |
|--------------------|--------|
| `GET /status` | Cek session SPSE aktif |
| `POST /session` | Simpan cookie header setelah login manual di browser SPSE |
| `DELETE /session` | Cabut session |
| `POST /sync` | Tarik paket dari SPSE ke staging |
| `GET /staging` | Daftar hasil sync, filter match status |
| `POST /staging/apply` | Terapkan staging ke master pekerjaan |
| `POST /staging/map` | Petakan manual staging ↔ pekerjaan |
| `GET /packages/{kode}/documents` | Daftar dokumen paket SPSE |
| `POST /packages/import-documents` | Import dokumen ke pekerjaan Arumanis |
| `POST /kontrak/push` | Push kontrak Arumanis → form SPSE |

LPSE target: `https://spse.inaproc.id/cianjurkab`.

### 4.3 Cara kerja session SPSE

SPSE tidak punya OAuth terbuka untuk integrasi pihak ketiga. Operator login manual di SPSE (termasuk CAPTCHA), lalu menyalin `document.cookie` dari DevTools ke form **Sync SPSE** di Arumanis. Cookie disimpan di server APIAMIS dan dipakai ulang untuk sync serta push.

Field kontrak yang sudah dilacak di kode (contoh): `kode_paket`, `sppbj`, `tgl_sppbj`, `spk`, `nilai_kontrak`, `penyedia`, `tgl_selesai`. Setelah push berhasil, kontrak menyimpan `spse_pushed_at`, `spse_sppbj_id`, `spse_spk_id`, dan nama paket SPSE.

### 4.4 Alur operator (ringkas)

1. Buka SPSE, login, salin cookie.
2. Di Arumanis: Sync SPSE → tempel cookie → **Sync sekarang**.
3. Review staging, apply atau map ke pekerjaan yang sudah ada.
4. Lengkapi kontrak di Arumanis, lalu **Push ke SPSE** dari halaman detail kontrak.

Skrip bantu rekaman jaringan SPSE ada di `scripts/spse-network-recorder.mjs` untuk dokumentasi endpoint tulis baru.

---

## 5. Integrasi SIPD

SIPD dipakai untuk membaca **Penganggaran** (`is_anggaran=1`) dan **rincian belanja** yang sudah di-cache di layanan Python terpisah. Arumanis tidak menulis balik ke SIPD; sinkronisasi sumber dilakukan manual di UI SIPD Web (mode Penganggaran).

### 5.1 Lokasi di UI

- **Penganggaran SIPD** → `/sipd-renja`
- Detail rincian sub BL → `/sipd-renja/$idSubBl`
- Tombol **Sync di SIPD Web** mengarah ke `VITE_SIPD_WEB_URL/renja?is_anggaran=1` (produksi: `https://sipd-lite.cianjur.space`)

### 5.2 Proxy BFF

Frontend memanggil `sipdClient` dengan prefix `/bff/sipd`. BFF memetakan path:

| BFF | Upstream SIPD |
|-----|----------------|
| `/bff/sipd/status` | `/api/status` |
| `/bff/sipd/renja?tahun=&is_anggaran=1` | `/api/cache/renja` (Penganggaran) |
| `/bff/sipd/rincian/{id}?is_anggaran=1` | `/api/cache/rincian/{id}` |

Sebelum proxy, BFF memverifikasi sesi Arumanis. Ke upstream SIPD, BFF mengirim `SIPD_SERVICE_TOKEN` (production wajib sama di kedua service). Tanpa token layanan, SIPD memvalidasi token user ke APIAMIS.

### 5.3 Variabel lingkungan

| Variabel | Lokasi | Keterangan |
|----------|--------|------------|
| `SIPD_BASE_URL` | BFF server | URL layanan Python |
| `SIPD_SERVICE_TOKEN` | BFF + service SIPD | Token shared secret |
| `VITE_SIPD_WEB_URL` | Build frontend | Link UI sync manual |
| `SIPD_PROXY_TIMEOUT_MS` | BFF | Default 30 detik |

---

## 6. Panel Pengawasan web (`www/pengawas`)

Repositori terpisah di `C:\laragon\www\pengawas`. Di produksi di-mount sebagai subpath **`/pengawasan`** pada domain yang sama dengan Arumanis (`arumanis.cianjur.space/pengawasan`).

### 6.1 Arsitektur

Sama seperti Arumanis: React + Vite di browser, BFF Bun (Hono) di `server/index.ts`, upstream `APIAMIS_BASE_URL`. Token user disimpan httpOnly; frontend tidak menyimpan bearer token di `localStorage`.

### 6.2 SSO dari Arumanis

Alur handoff:

```text
1. User sudah login di Arumanis (cookie sesi aktif)
2. Frontend Arumanis: POST /bff/auth/handoff
3. APIAMIS mengeluarkan kode sekali pakai
4. Browser redirect ke {VITE_PENGAWAS_APP_BASE_URL}/login?code=...
5. BFF pengawasan menukar kode → sesi cookie panel pengawasan
```

Implementasi: `src/lib/auth-handoff.ts`, `src/lib/pengawas-app.ts`.

Role yang otomatis diarahkan ke panel setelah login (bila bukan admin/manager): `pengawas`, `pengawasan`, `konsultan_pengawas`.

Admin bisa impersonate pengawas dari daftar user Arumanis; redirect impersonate juga memakai handoff ke `/pengawasan`.

### 6.3 Fitur yang bergantung pada APIAMIS

- Daftar pekerjaan sesuai assignment `user-pekerjaan`
- Upload foto, progress fisik/keuangan, tiket
- Statistik KPI pengawas
- Echo/Reverb untuk notifikasi realtime

Service worker Arumanis sengaja **tidak** mengintercept path `/pengawasan` agar Apache/nginx bisa melayani SPA pengawasan secara native.

### 6.4 Konfigurasi produksi

| Variabel Arumanis | Contoh produksi |
|-------------------|-----------------|
| `VITE_PENGAWAS_APP_BASE_URL` | `https://arumanis.cianjur.space/pengawasan` |

| Variabel pengawasan | Contoh produksi |
|---------------------|-----------------|
| `APIAMIS_BASE_URL` | `https://apiamis.cianjur.space/api` |
| `PUBLIC_BASE` | `/pengawasan` |

---

## 7. Aplikasi mobile (`www/pengawas/apps/mobile`)

Aplikasi **Arumanis Pengawasan** (Expo/React Native, package `space.cianjur.pengawas`) ditujukan untuk pengawas di lapangan. Beda dengan panel web: mobile **langsung** ke APIAMIS, tanpa BFF `www/pengawas`.

### 7.1 Koneksi API

- Dev: `http://apiamis.test/api` (HP fisik: ganti hostname dengan IP LAN)
- Prod: `https://apiamis.cianjur.space/api`
- Env: `EXPO_PUBLIC_APIAMIS_BASE_URL`

Auth: Bearer token disimpan aman di perangkat (SecureStore), bukan cookie browser.

### 7.2 OAuth & login

- Login email/password sama dengan akun APIAMIS
- Google SSO opsional
- Callback native: `pengawas://oauth-callback`
- Callback web build: `{origin}/oauth-callback`

### 7.3 Fitur lapangan yang terhubung ke Arumanis

| Fitur mobile | Endpoint / mekanisme | Tampil di portal Arumanis |
|--------------|----------------------|---------------------------|
| Upload foto + GPS | API foto pekerjaan | Indeks foto, peta, executive dashboard |
| Progress estimasi | API progress | Deviasi di dashboard & panel pengawasan |
| Tiket | API tiket | Modul tiket operator |
| Presence heartbeat | `POST /presence/heartbeat` app=`pengawasan` | Panel Pengguna Online, halaman lokasi pengawas |
| Notifikasi broadcast | Reverb + local notification | Notifikasi di mobile & web |
| Antrean upload offline | Queue lokal, retry otomatis | Data masuk setelah online |

GPS background (Android) mengirim koordinat berkala untuk presence; portal Arumanis menampilkan titik terakhir di fitur **Lokasi Pengawas**.

### 7.4 OTA & build

Pembaruan JavaScript lewat EAS Update (`scripts/publish-eas-update.ts`). Build native: `scripts/build-android.sh`. Reverb production mengarah ke `apiamis.cianjur.space`.

---

## 8. Matriks autentikasi

| Klien | Sesi | Menuju APIAMIS |
|-------|------|----------------|
| Arumanis web | Cookie via BFF Arumanis | Bearer dari cookie BFF |
| Panel pengawasan web | Cookie via BFF pengawasan | Bearer dari cookie BFF |
| Mobile pengawas | Token di SecureStore | Bearer langsung |
| SIPD proxy | Sesi Arumanis + service token | Tidak langsung (ke SIPD Python) |
| SPSE sync | Session cookie SPSE di server | Via modul procurement APIAMIS |

Satu akun APIAMIS bisa dipakai di ketiga klien (portal, panel web, mobile) selama role dan assignment mengizinkan.

---

## 9. Checklist deploy & troubleshooting

**SPSE:** Session kedaluwarsa setelah logout SPSE atau perubahan password LPSE. Gejala: sync gagal atau push kontrak ditolak. Ulangi simpan cookie di Sync SPSE.

**SIPD:** Error `SIPD_SERVICE_TOKEN_MISSING` di production berarti token belum diset di Coolify BFF Arumanis. Pastikan nilai sama di container SIPD Python.

**Pengawasan:** Jika redirect SSO gagal, cek `VITE_PENGAWAS_APP_BASE_URL` saat build Arumanis dan `PUBLIC_BASE` di container pengawasan. Handoff code hanya valid sekali dan singkat.

**Mobile:** Jika foto tidak naik, cek assignment pekerjaan di modul `user-pekerjaan` Arumanis. Tanpa assignment, daftar pekerjaan di mobile kosong meski akun role pengawas.

**CORS & path:** `/pengawasan` harus di-exclude dari rewrite SPA utama dan dari service worker PWA Arumanis.

---

## 10. Referensi kode

| Topik | Berkas utama |
|-------|----------------|
| BFF Arumanis | `server/index.ts`, `server/sipd-proxy.ts` |
| Client SPSE | `src/features/procurement-sync/` |
| Client SIPD | `src/features/sipd-renja/`, `src/lib/sipd-client.ts` |
| SSO pengawasan | `src/lib/auth-handoff.ts`, `src/lib/pengawas-app.ts` |
| BFF pengawasan | `C:\laragon\www\pengawas\server\index.ts` |
| Mobile API | `C:\laragon\www\pengawas\apps\mobile\lib\api-endpoints.ts` |
| Presence mobile | `C:\laragon\www\pengawas\apps\mobile\lib\presence.ts` |
| Env contoh | `.env.example` |

---

*Dokumen ini disusun dari kode aktual di repositori per Juli 2026. Jika endpoint APIAMIS berubah, verifikasi di `C:\laragon\www\apiamis\routes\api.php` sebelum mengandalkan daftar endpoint di atas.*