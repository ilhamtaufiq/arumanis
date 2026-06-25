# Panel Pengawasan (`/pengawasan/`)

**URL:** `/pengawasan/`
**Repo terpisah:** `pengawas` (frontend) + BFF di `server/index.ts`
**Target pengguna:** Role `pengawas`, `konsultan_pengawas`

## Ringkasan

Panel Pengawasan adalah aplikasi lapangan untuk personil pengawas. Fitur utama: dashboard ringkasan, detail pekerjaan, upload foto per slot progress, input progress estimasi, buat laporan mingguan, tiket kendala, dan notifikasi.

**Tidak ada form login lokal** — autentikasi sepenuhnya via SSO dari Arumanis utama.

---

## Masuk & SSO

### Alur login pengawas

1. User buka `/sign-in` di Arumanis
2. Setelah login sukses, jika role termasuk pengawas (bukan admin/manager), frontend memanggil `getPengawasAppUrl(token)`
3. Browser diarahkan ke `/pengawasan/login?token=...`
4. `LoginPage` (SSO bootstrap) memanggil BFF `POST /bff/auth/sync-token`
5. Cookie `pengawas_session` (httpOnly) diset
6. User diarahkan ke dashboard; `SsoTokenCleaner` menghapus `?token=` dari URL

### Tanpa sesi

| Kondisi | Perilaku |
|---------|----------|
| Akses route protected tanpa cookie | Redirect ke `/sign-in?redirect=/pengawasan/...` |
| `/login` atau `/sign-in` tanpa token | Redirect ke Arumanis `/sign-in` |
| `?token=` di route selain bootstrap | `SsoEntryGate` paksa ke `/login?token=...` |
| Root `/` atau `/pengawasan?token=` | Redirect ke `/pengawasan/login?token=...` |

### Logout & 401

- **Logout sidebar** → clear session → redirect `/sign-in`
- **401 di halaman data** → tombol **Masuk ulang** → `/sign-in?redirect=...`
- **Stop impersonate** → restore token admin → kembali ke `/dashboard` Arumanis

### Impersonate (admin)

Admin di Arumanis utama dapat impersonate user pengawas → dibuka `/pengawasan/login?token=...` dengan token impersonate. Banner kuning tampil di kedua aplikasi.

---

## Navigasi

| Route | Halaman | Fungsi |
|-------|---------|--------|
| `/pengawasan/` | Dashboard | KPI, filter, paket perlu perhatian |
| `/pengawasan/pekerjaan` | Daftar Pekerjaan | Tabel + paginasi |
| `/pengawasan/pekerjaan/:id` | Detail Pekerjaan | 6 tab |
| `/pengawasan/buat-laporan` | Buat Laporan (list) | Pilih paket untuk laporan mingguan |
| `/pengawasan/buat-laporan/:id` | Buat Laporan (form) | Input RAB rencana & realisasi |
| `/pengawasan/tiket` | Tiket | Buat + daftar + komentar |
| `/pengawasan/notifikasi` | Notifikasi | Riwayat lengkap |
| `/pengawasan/panduan` | Panduan in-app | Ringkasan interaktif |
| `/pengawasan/profile` | Profil | User + kecocokan master pengawas |

---

## Detail Pekerjaan — Tab

| Tab | Isi |
|-----|-----|
| Ringkasan | Kegiatan, lokasi, pengawas, pagu, status foto |
| Output | CRUD komponen (dasar matriks foto) |
| Penerima | Individu/komunal, jiwa, NIK |
| Foto | Matriks output × slot 0–100% |
| Progress | Estimasi fisik & keuangan mingguan |
| Tiket | Tiket terkait paket |

---

## Dokumentasi Foto

### Slot wajib per output

0%, 25%, 50%, 75%, 100%

### Status agregat paket

| Status | Kondisi |
|--------|---------|
| Belum ada foto | Tidak ada unggahan |
| Belum Selesai | Slot belum memenuhi minimal |
| Selesai | Semua slot terpenuhi |

### Upload

1. Tab Foto → klik slot kosong
2. GPS otomatis atau koordinat manual
3. Pilih file → unggah
4. **Cetak Foto** → PDF (perlu izin popup)

### Penerima

- **Individu** — wajib jiwa + NIK; foto per penerima
- **Komunal** — centang Komunal; minimal 5 foto per komponen

---

## Progress & Buat Laporan

### Tab Progress

Menampilkan estimasi fisik/keuangan. Data tersinkron dua arah dengan modul Puspen di Arumanis (`PekerjaanProgressEstimasiSyncService`).

### Menu Buat Laporan

API: `GET/POST /progress/pekerjaan/{id}`

1. Pilih minggu aktif
2. Isi Rencana & Realisasi per item
3. Simpan (aktif jika ada perubahan)

---

## Notifikasi

- Ikon lonceng di header + `BannerNotification`
- Halaman `/notifikasi`
- API: `GET /notifications`, mark read
- Broadcast dari Arumanis (`POST /notifications/broadcast`) — URL action dipetakan ke route pengawasan

---

## Tiket

- Buat dari halaman Tiket atau shortcut **Lapor Tiket** di daftar pekerjaan
- Kategori umum lapangan: **Permasalahan Lapangan**
- Status: Menunggu / Diproses / Selesai
- Komentar dua kolom

Lihat juga: [Panduan Tiket publik](/docs/tiket.md)

---

## Troubleshooting Panel Pengawasan

| Masalah | Solusi |
|---------|--------|
| Loop redirect `?token=` | Pastikan build terbaru; token hanya di `/login` |
| Blank setelah deploy | Auto hard-reload; clear cache browser |
| 401 | Masuk ulang via Arumanis |
| GPS gagal | Izinkan lokasi atau input manual |
| Progress tidak simpan | Pastikan ada perubahan field |
| Popup cetak diblokir | Izinkan popup browser |

---

## Referensi Teknis

| Komponen | Lokasi |
|----------|--------|
| SSO helpers | `pengawas/src/lib/sso-token.ts` |
| Entry gate | `pengawas/src/components/SsoEntryGate.tsx` |
| Redirect dari Arumanis | `bun/src/lib/pengawas-app.ts` |
| Panduan publik | `/docs/pengawas.md` |
| Panduan in-app | `pengawas/src/pages/GuidePage.tsx` |