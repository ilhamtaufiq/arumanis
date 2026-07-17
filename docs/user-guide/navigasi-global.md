# Navigasi Global & Tata Letak

## Pendahuluan

ARUMANIS adalah aplikasi web berbasis browser. Untuk mengakses:
1. Buka browser (Chrome/Firefox/Edge versi terbaru)
2. Masukkan URL yang diberikan admin
3. Halaman **Sign In** akan tampil — masukkan email dan password

### Panel Pengawasan (aplikasi terpisah)

Personil lapangan (role pengawas/konsultan pengawas) setelah login diarahkan otomatis ke **`/pengawasan/`** via SSO. Panel ini punya sidebar sendiri (Dashboard, Pekerjaan, Buat Laporan, Tiket, Notifikasi, Panduan, Profil) dan **tidak memiliki halaman login terpisah**.

- Panduan internal: [pengawas-panel.md](pengawas-panel.md)
- Panduan pengguna: [/docs](/docs/)

## Tata Letak Halaman

Setelah login, tampilan utama terdiri dari:

```
+------------------------------------------+
| HEADER                    [User] [Theme] |
+----------+-------------------------------+
|          |                               |
| SIDEBAR  |   MAIN CONTENT AREA          |
|          |                               |
| - Dashboard  |  [Breadcrumb]            |
| - Master     |                           |
|   Data       |  [Page Title]             |
| - Dokumentasi|                           |
| - Akses &    |  [Content / Tables /     |
|   Keamanan   |   Forms / etc]            |
| - Pengaturan |                           |
|          |                               |
+----------+-------------------------------+
```

## Sidebar

Sidebar adalah menu navigasi utama di sebelah kiri. Terbagi dalam grup:

### Dashboard
- **Dashboard** (`/dashboard`) — Ringkasan data dan metrik
- **Rekap Progress** (`/progress_rekap`) — Progress pekerjaan
- **Tiket & Laporan** (`/tiket`) — Pelaporan masalah
- **Pusat Notifikasi** (`/notifications`) — Notifikasi sistem
- **Asisten AI** (`/chat`) — Chat dengan asisten AI

### Master Data
- **Program Kegiatan** (`/kegiatan`) — Data program

- **Master Fase** (`/master-fase`) — Fase pekerjaan
- **Kecamatan** (`/kecamatan`) — Data kecamatan
- **Desa** (`/desa`) — Data desa
- **Pekerjaan** (`/pekerjaan`) — Data pekerjaan/proyek
- **Aset & Capaian SPAM** (`/spam-unit`) — Data aset
- **Draft Pekerjaan** (`/draft-pekerjaan`) — Draft pekerjaan
- **Penyedia** (`/penyedia`) — Data vendor/penyedia
- **Kontrak** (`/kontrak`) — Data kontrak
- **Addendum Kontrak** (`/kontrak-addendums`) — Addendum kontrak
- **Register Dokumen** (`/pekerjaan/register`) — Register dokumen pekerjaan
- **Checklist Pekerjaan** (`/checklist`) — Checklist
- **Output** (`/output`) — Output kegiatan
- **Penerima** (`/penerima`) — Data penerima manfaat
- **Pengawas** (`/pengawas`) — Data pengawas

### Dokumentasi
- **Foto** (`/foto`) — Galeri foto
- **Peta Progress** (`/map`) — Peta sebaran
- **Simulasi Jaringan** (`/simulation`) — Simulasi jaringan pipa
- **Berkas** (`/berkas`) — Manajemen dokumen


### Publikasi
- **Manajemen Publikasi** (`/manajemen-publikasi`) — Publikasi

### Akses & Keamanan
- **Users** (`/users`) — Manajemen akun
- **Roles** (`/roles`) — Peran pengguna
- **Permissions** (`/permissions`) — Izin akses
- **Route Permissions** (`/route-permissions`) — Izin route
- **Kegiatan Role** (`/kegiatan-role`) — Peran kegiatan
- **Menu Permissions** (`/menu-permissions`) — Izin menu

### Pengaturan
- **Audit Trail** (`/audit-logs`) — Log aktivitas
- **Debug Reporting** (`/error-logs`) — Log error
- **Pengaturan Aplikasi** (`/settings`) — Konfigurasi
- **Assign Pekerjaan** (`/user-pekerjaan`) — Penugasan
- **Broadcast Notifikasi** (`/notifications/broadcast`) — Notifikasi massal

**Catatan:** Menu yang tampil tergantung role/hak akses user.

## Header

Header di bagian atas halaman berisi:
- **Logo/title aplikasi** — Nama "ARUMANIS"
- **Fiscal Year Selector** — Pilih tahun anggaran
- **Theme Toggle** — Mode terang/gelap
- **User menu** — Nama user, avatar, dropdown (profil, logout)

## Breadcrumb

Breadcrumb navigation menunjukkan posisi halaman saat ini, misal:
`Master Data > Kecamatan > Detail`

## Komponen Lain

- **Impersonate Banner** — Banner kuning saat admin login sebagai user lain
- **Search** — Pencarian global (Ctrl+K atau Cmd+K)
- **Team Switcher** — Beralih antar tim/instansi (jika tersedia)

## Notifikasi & Indikator

- **Toast Notification** — Notifikasi pop-up di pojok kanan atas (sukses/error/info)
- **Loading Skeleton** — Animasi kerangka saat data dimuat
- **Empty State** — Tampilan saat tidak ada data
- **Error State** — Tampilan saat terjadi error
