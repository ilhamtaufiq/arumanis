# Panduan Pengguna Aplikasi ARUMANIS

**ARUMANIS (Air Minum & Sanitasi Cianjur)** — Sistem informasi manajemen program air minum dan sanitasi untuk Kabupaten Cianjur.

## Dua Aplikasi

| Aplikasi | URL | Dokumentasi |
|----------|-----|-------------|
| **Arumanis Utama** | `/` | Panduan modul di folder ini |
| **Panel Pengawasan** | `/pengawasan/` | [pengawas-panel.md](pengawas-panel.md) · [Panduan publik `/docs`](/docs/index.html) |

Keduanya memakai akun apiamis yang sama. Panel pengawasan masuk via **SSO** — tidak ada form login terpisah.

---

## Cara Menggunakan Panduan Ini

Panduan internal (`docs/user-guide/`) untuk dokumentasi teknis per modul. Untuk panduan pengguna yang lebih ringkas dan visual, buka **[Pusat Bantuan `/docs`](/docs/index.html)**.

Mulai dari [Navigasi Global](navigasi-global.md), lalu modul sesuai tugas Anda.

---

## Daftar Isi

### 1. Pendahuluan & Navigasi
- [Pendahuluan & Cara Akses](navigasi-global.md#pendahuluan)
- [Navigasi Global (Sidebar, Header)](navigasi-global.md)
- [Komponen UI Dasar](komponen-ui-dasar.md)

### 2. Autentikasi & Akses
- [Auth — Login & SSO](auth.md)
- [Panel Pengawasan](pengawas-panel.md) — aplikasi lapangan `/pengawasan/`
- [Manajemen Akses berbasis Role](manajemen-akses.md)
- [Users](users.md) · [Roles & Permissions](roles-permissions.md)

### 3. Panduan per Modul (Arumanis Utama)

| Modul | Deskripsi | Halaman |
|-------|-----------|---------|
| [Dashboard](dashboard.md) | Widget ringkasan, metrik utama | `/dashboard` |
| [Kegiatan](kegiatan.md) | Program/aktivitas, alur input | `/kegiatan` |
| [Desa & Kecamatan](desa-kecamatan.md) | Data wilayah | `/desa`, `/kecamatan` |
| [Pekerjaan & Output](pekerjaan-output.md) | Proyek, output kegiatan | `/pekerjaan`, `/output` |
| [Kontrak](kontrak.md) | Pengelolaan kontrak | `/kontrak` |
| [Penerima & Penyedia](penerima-penyedia.md) | Penerima manfaat & vendor | `/penerima`, `/penyedia` |
| [Berkas & Foto](berkas-foto.md) | Unggah, galeri dokumen | `/berkas`, `/foto` |
| [Settings](settings.md) | Konfigurasi aplikasi | `/settings` |
| [SPAM Unit](spam-unit.md) | Data unit SPAM, capaian SPM | `/spam-unit` |

### 4. Panduan Lintas Modul
- [SOP Penggunaan (Tabel & Flow)](../SOP-PENGGUNAAN-ARUMANIS.md) — Arumanis + Panel Pengawasan
- [Skenario Penggunaan Umum](skenario-penggunaan.md)
- [Pemecahan Masalah](pemecahan-masalah.md)
- [Glosarium](glosarium.md)

### 5. Panduan Publik (Docsify)

Tersedia di `/docs/` untuk end-user:

- [Beranda](/docs/README.md)
- [Panel Pengawasan](/docs/pengawas.md)
- [Tiket](/docs/tiket.md)
- [Notifikasi](/docs/notifications.md)
- [Ami AI](/docs/ami.md)

---

## Tentang Aplikasi

**Akses:** URL aplikasi (hubungi admin untuk alamat lengkap)
**Browser didukung:** Google Chrome, Mozilla Firefox, Microsoft Edge (versi terbaru)
**Target pengguna:** Admin, operator, pengawas/konsultan pengawas, viewer

Aplikasi digunakan untuk mengelola data program air minum dan sanitasi — perencanaan kegiatan, pelaksanaan pekerjaan, pengelolaan kontrak, dokumentasi, pelaporan, dan pemantauan lapangan.