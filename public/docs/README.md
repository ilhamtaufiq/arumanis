# Selamat Datang di Panduan Arumanis

**Arumanis** (Aplikasi Satu Data Air Minum dan Sanitasi) adalah platform digital terintegrasi untuk manajemen proyek infrastruktur, pemantauan kegiatan, dan dokumentasi lapangan di Kabupaten Cianjur.

Pusat bantuan ini membantu Anda memahami fitur utama, alur kerja harian, dan cara mengatasi masalah umum.

---

## Dua Aplikasi, Satu Akun

| Aplikasi | Alamat | Untuk siapa |
|----------|--------|-------------|
| **Arumanis Utama** | `/` | Admin, manager, TFL, pusat pen, dan peran operasional lain |
| **Panel Pengawasan** | `/pengawasan/` | Pengawas & konsultan pengawas di lapangan |

Keduanya memakai akun **apiamis** yang sama. Panel pengawasan **tidak memiliki form login sendiri** — masuk lewat Arumanis (`/sign-in`), lalu sistem mengalihkan otomatis via SSO.

---

## Fitur Utama

### Arumanis Utama

- **Dashboard & statistik** — ringkasan realisasi fisik dan keuangan
- **Manajemen pekerjaan** — paket air minum & sanitasi per tahun anggaran
- **Pusat pen & progress fisik** — input dan monitoring progress estimasi
- **Manajemen pengguna & akses** — role, permission, impersonate
- **Broadcast notifikasi** — kirim pengumuman ke pengguna terkait
- **Ami AI** — asisten analisa data

### Panel Pengawasan

- **Dashboard ringkasan** — KPI paket, deviasi, status foto
- **Detail pekerjaan** — output, penerima, foto, progress, tiket
- **Buat laporan mingguan** — isi RAB rencana & realisasi per minggu
- **Dokumentasi foto** — slot 0%–100% dengan koordinat GPS
- **Tiket isu lapangan** — lapor kendala dan pantau status
- **Notifikasi** — lonceng di header + halaman `/notifikasi`

---

## Mulai Cepat

### Pengawas / lapangan

1. Buka [Masuk Aplikasi](/sign-in) di Arumanis
2. Login dengan email & password apiamis
3. Sistem otomatis mengalihkan ke [Panel Pengawasan](/pengawasan/)
4. Mulai dari **Dashboard** → buka paket pekerjaan → isi progress & foto

### Admin / kantor

1. Login di Arumanis utama
2. Gunakan sidebar untuk navigasi modul (pekerjaan, kegiatan, puspen, users, dll.)
3. Untuk melihat tampilan pengawas, gunakan fitur impersonate dari daftar pengguna

---

## Panduan per Topik

| Topik | Isi |
|-------|-----|
| [Panel Pengawasan](pengawas.md) | SSO, navigasi, foto, progress, buat laporan, notifikasi |
| [Detail Pekerjaan](pekerjaan.md) | Tab-tab informasi paket di Arumanis utama |
| [Tiket & Kendala](tiket.md) | Cara melaporkan masalah lapangan maupun aplikasi |
| [Notifikasi](notifications.md) | Lonceng, badge, tandai dibaca |
| [Ami AI](ami.md) | Berinteraksi dengan asisten cerdas |

> Dokumentasi teknis per modul (untuk tim pengembang/operator kantor) tersedia di `docs/user-guide/` pada repositori proyek.

---

> [!TIP]
> Saat upload foto di lapangan, pastikan koneksi internet stabil dan izinkan akses lokasi GPS di browser.

> [!IMPORTANT]
> Jika sesi habis (error 401), gunakan **Masuk ulang** — Anda akan diarahkan kembali ke login Arumanis, bukan form login terpisah di panel pengawasan.