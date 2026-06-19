# Settings — Konfigurasi Aplikasi

**URL:** `/settings`, `/audit-logs`, `/error-logs`, `/user-pekerjaan`, `/notifications/broadcast`, `/whatsapp`
**Fitur:** Pengaturan, log, penugasan, notifikasi
**Akses:** Admin only

## Pengaturan Aplikasi (`/settings`)
Nama aplikasi, logo, tema (terang/gelap), bahasa, fiscal year, pagination size.

## Audit Trail (`/audit-logs`)
Log aktivitas semua user. **Field:** Waktu, User, Aksi (GET/POST/PUT/DELETE), Route, Detail, IP.
Filter by user, aksi, tanggal.

## Debug Reporting (`/error-logs`)
Log error untuk debugging. Filter level, tanggal, pesan.

## Assign Pekerjaan (`/user-pekerjaan`)
Tugaskan user ke pekerjaan tertentu. Pilih user → pilih pekerjaan → simpan.

## Broadcast Notifikasi (`/notifications/broadcast`)
Kirim notifikasi massal. **Field:** Judul, Pesan, Target (semua/role/user), Prioritas.

## WhatsApp (`/whatsapp`)
Integrasi WA untuk notifikasi. Kirim pesan, broadcast, log, template.

## Role Access
**Admin:** Akses penuh. **Operator/Viewer:** Tidak ada akses.
