# Panel Pengawasan

**Panel Pengawasan** (`/pengawasan/`) adalah aplikasi khusus personil lapangan — pengawas dan konsultan pengawas. Fokusnya: pantau paket yang ditugaskan, isi progress, unggah foto, buat laporan mingguan, dan laporkan kendala.

---

## Masuk & SSO

Panel pengawasan **tidak punya halaman login email/password sendiri**. Semua masuk lewat **Arumanis** (`/sign-in`).

### Alur normal

1. Buka [Masuk Aplikasi](/sign-in)
2. Login dengan akun apiamis
3. Jika role Anda pengawas/konsultan pengawas, sistem otomatis mengalihkan ke `/pengawasan/login?token=...`
4. Layar **"Menyinkronkan sesi SSO..."** muncul sebentar
5. Setelah sukses, Anda masuk ke dashboard — token dihapus dari URL

### Impersonate (admin)

Admin dapat membuka panel pengawasan atas nama pengguna lain melalui fitur impersonate di Arumanis utama. Saat selesai, klik **Stop Impersonate** untuk kembali ke dashboard admin.

### Logout & sesi habis

| Situasi | Perilaku |
|---------|----------|
| Klik **Keluar** di sidebar | Kembali ke `/sign-in` Arumanis |
| Sesi expired (401) | Tombol **Masuk ulang** → redirect ke Arumanis |
| Buka `/pengawasan` tanpa sesi | Redirect otomatis ke `/sign-in` |

> [!NOTE]
> Sesi disimpan di cookie `pengawas_session` (httpOnly). Jangan bagikan link yang masih mengandung `?token=...` ke orang lain.

---

## Navigasi

### Menu sidebar

| Menu | Fungsi |
|------|--------|
| **Dashboard** | Ringkasan KPI & paket perlu perhatian |
| **Pekerjaan** | Daftar lengkap paket + filter |
| **Buat Laporan** | Daftar paket untuk input laporan mingguan |
| **Tiket** | Laporan kendala & komentar |
| **Notifikasi** | Riwayat pemberitahuan |
| **Panduan** | Panduan singkat di dalam aplikasi |
| **Profil** | Data user & kecocokan master pengawas |

### Dashboard — KPI utama

- **Jumlah paket** — sesuai filter tahun & pencarian
- **Belum isi progress** — belum ada realisasi fisik estimasi
- **Paket deviasi** — selisih rencana vs realisasi
- **Foto belum lengkap** — slot dokumentasi belum terpenuhi

Section **Paket perlu perhatian** menampilkan hingga 8 paket dengan isu: belum progress, deviasi, atau foto belum selesai.

---

## Detail Pekerjaan

Buka paket dari dashboard atau daftar pekerjaan. Halaman detail memiliki tab:

| Tab | Isi |
|-----|-----|
| **Ringkasan** | Info kegiatan, lokasi, pengawas, pagu, status foto |
| **Output** | Komponen pekerjaan (dasar matriks foto) |
| **Penerima** | Penerima manfaat — individu atau komunal |
| **Foto** | Matriks upload per slot progress |
| **Progress** | Estimasi fisik & keuangan mingguan |
| **Tiket** | Tiket terkait paket ini |

---

## Dokumentasi Foto

Setiap output memiliki **5 slot wajib**: 0%, 25%, 50%, 75%, 100%.

### Status foto paket

| Status | Arti |
|--------|------|
| **Belum ada foto** | Belum ada unggahan sama sekali |
| **Belum Selesai** | Slot belum memenuhi minimal per output |
| **Selesai** | Semua kebutuhan foto terpenuhi |

### Cara upload

1. Buka tab **Foto** di detail pekerjaan
2. Klik slot **Kosong** pada matriks
3. Izinkan GPS browser atau isi koordinat manual
4. Pilih file foto → **Unggah**
5. Gunakan **Cetak Foto** untuk export PDF (izinkan popup browser)

### Aturan penerima

- **Individu** — wajib isi jumlah jiwa & NIK; foto per penerima
- **Komunal** — centang Komunal; minimal 5 foto per komponen kelompok

---

## Progress & Buat Laporan

### Tab Progress (detail pekerjaan)

Menampilkan estimasi fisik & keuangan per minggu. Data tersinkron dengan modul pusat pen di Arumanis utama.

### Menu Buat Laporan

Akses lewat sidebar **Buat Laporan** (`/pengawasan/buat-laporan`):

1. Pilih paket pekerjaan
2. Pilih minggu aktif
3. Isi kolom **Rencana** dan **Realisasi** per item RAB
4. Klik **Simpan** (aktif jika ada perubahan)
5. Badge **Tersimpan** muncul setelah berhasil

> [!TIP]
> Tombol Simpan hanya aktif jika ada perubahan pada field Rencana atau Realisasi.

---

## Notifikasi

Notifikasi muncul di **ikon lonceng** header dan halaman **Notifikasi**.

- **Badge merah** — jumlah belum dibaca
- **Dropdown** — preview notifikasi terbaru
- **Lihat semua** — buka `/pengawasan/notifikasi`
- **Tandai dibaca** — otomatis saat diklik, atau gunakan tandai semua

Notifikasi dari broadcast admin di Arumanis utama juga muncul di panel pengawasan (rute disesuaikan otomatis).

---

## Tiket Lapangan

### Cara cepat dari daftar pekerjaan

1. Cari paket di **Pekerjaan**
2. Klik **Lapor Tiket**
3. Form tiket terbuka dengan subjek paket terisi
4. Pilih kategori **Permasalahan Lapangan**
5. Isi deskripsi → **Kirim**

### Halaman Tiket penuh

Di `/pengawasan/tiket`:

- Form buat tiket (kiri) + daftar tiket (kanan)
- Status: Menunggu / Diproses / Selesai
- Komentar dua arah untuk follow-up

Panduan lengkap format tiket: [Pelaporan Kendala](tiket.md).

---

## FAQ

### Bagaimana cara login?

Masuk lewat [Arumanis `/sign-in`](/sign-in). Pengguna pengawas otomatis dialihkan ke panel pengawasan via SSO.

### Kenapa daftar pekerjaan kosong?

Pastikan admin sudah memberikan penugasan (assignment) dan Anda login dengan akun yang benar.

### Apa bedanya Komunal dan Individu?

**Komunal** = kelompok (tidak perlu jiwa/NIK). **Individu** = perorangan (wajib jiwa + NIK).

### Kenapa foto status "Belum Selesai"?

Belum semua slot 5% terisi untuk setiap output, atau output komunal belum mencapai minimal.

### GPS tidak muncul?

Izinkan lokasi di browser. Jika gagal, ketik koordinat manual di form upload.

### Error 401 — sesi tidak valid?

Klik **Masuk ulang**. Anda diarahkan ke login Arumanis, bukan form lokal di pengawasan.

### Popup cetak foto diblokir?

Izinkan popup untuk domain aplikasi di pengaturan browser.

---

## Penanganan Masalah

| Situasi | Tindakan |
|---------|----------|
| 401 Sesi tidak valid | Masuk ulang via Arumanis |
| 403 Akses ditolak | Hubungi admin |
| Data kosong | Cek filter/tahun atau master data apiamis |
| Upload gagal | Cek koneksi, izin lokasi, ukuran file |
| Progress tidak tersimpan | Pastikan ada perubahan Rencana/Realisasi |
| Layar blank setelah deploy | Refresh halaman — sistem auto-reload versi baru |

---

> [!TIP]
> Panel pengawasan juga punya halaman **Panduan** internal (`/pengawasan/panduan`) dengan ringkasan interaktif yang sama untuk referensi cepat di lapangan.