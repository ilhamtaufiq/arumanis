# Panduan Pengguna Arumanis

**Arumanis** (Aplikasi Satu Data Air Minum dan Sanitasi) adalah platform digital terintegrasi untuk manajemen proyek infrastruktur, pemantauan kegiatan, dan dokumentasi lapangan di Kabupaten Cianjur.

Dokumen ini adalah titik masuk pusat bantuan. Pilih peran Anda di bawah untuk memulai, atau telusuri panduan per topik.

---

## Aplikasi & Peran

Arumanis terdiri dari dua antarmuka yang memakai **satu akun** yang sama:

| Aplikasi | Alamat | Pengguna utama |
|---|---|---|
| **Arumanis Utama** | `/` | Admin, operator kantor, TFL, pusat pen, manajer proyek |
| **Panel Pengawasan** | `/pengawasan/` | Pengawas dan konsultan pengawas di lapangan |

Panel pengawasan **tidak memiliki halaman login terpisah**. Masuk melalui Arumanis (`/sign-in`); sistem mengalihkan otomatis setelah autentikasi berhasil (SSO).

---

## Mulai Cepat

### Pengawas lapangan

1. Buka [Masuk Aplikasi](/sign-in)
2. Login dengan akun yang diberikan administrator
3. Anda akan diarahkan ke [Panel Pengawasan](/pengawasan/)
4. Dari **Dashboard**, buka paket pekerjaan → isi progress, foto, dan laporan mingguan

### Admin & operator kantor

1. Login di Arumanis utama
2. Gunakan sidebar untuk modul: Pekerjaan, Kegiatan, Puspen, Pengguna, Pengaturan, dll.
3. Untuk melihat pengalaman pengawas, gunakan fitur **impersonate** dari daftar pengguna

---

## Fitur per Aplikasi

### Arumanis Utama

| Area | Kemampuan |
|---|---|
| Dashboard | Ringkasan realisasi fisik, keuangan, dan status data |
| Pekerjaan | Manajemen paket, output, kontrak, berkas, foto, progress |
| Puspen | Analisa paket, review foto & koordinat, skor kelengkapan data |
| Pengguna & akses | Role, permission, menu permission, route permission |
| Pengaturan | Konfigurasi aplikasi, tahun anggaran, integrasi AI |
| Notifikasi | Broadcast pengumuman ke pengguna terkait |
| Ami AI | Asisten analisa data |

### Panel Pengawasan

| Area | Kemampuan |
|---|---|
| Dashboard | KPI paket, deviasi, status foto |
| Detail pekerjaan | Output, penerima, foto, progress, tiket |
| Laporan mingguan | Input RAB rencana & realisasi per minggu |
| Dokumentasi foto | Slot 0%–100% dengan koordinat GPS dan validasi desa |
| Tiket | Laporan kendala lapangan dan pelacakan status |
| Notifikasi | Lonceng header + halaman `/notifikasi` |

---

## Panduan per Topik

| Topik | Isi singkat |
|---|---|
| [Panel Pengawasan](pengawas.md) | SSO, navigasi, foto, progress, laporan, notifikasi |
| [Detail Pekerjaan](pekerjaan.md) | Tab informasi paket di Arumanis utama |
| [Tiket & Kendala](tiket.md) | Melaporkan masalah lapangan maupun aplikasi |
| [Notifikasi](notifications.md) | Lonceng, badge, tandai dibaca |
| [Ami AI](ami.md) | Berinteraksi dengan asisten cerdas |

Panduan teknis per modul untuk operator kantor dan tim pengembang tersedia di `docs/user-guide/` pada repositori proyek.

---

## Tips Lapangan

**Upload foto**

- Pastikan koneksi internet stabil sebelum mengunggah
- Izinkan akses lokasi GPS di browser
- Koordinat akan divalidasi terhadap batas desa pekerjaan; lokasi di luar desa ditandai peringatan

**Sesi habis (error 401)**

- Gunakan **Masuk ulang** — Anda diarahkan kembali ke login Arumanis, bukan form terpisah di panel pengawasan

**Data tidak muncul**

- Periksa filter tahun anggaran dan wilayah
- Refresh halaman; jika masalah berlanjut, buat tiket dengan tangkapan layar

---

## Dukungan

Untuk kendala teknis atau permintaan akses, hubungi administrator sistem di instansi Anda atau buat tiket melalui modul **Tiket** di aplikasi.