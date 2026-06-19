# Manajemen Akses Berbasis Role

Sistem **RBAC** (Role-Based Access Control) + **Route Permissions** dari database.

## Level Akses

### Admin
- CRUD semua data
- Kelola user, role, permission
- Konfigurasi aplikasi
- Audit trail
- Impersonasi (login sbg user lain)
- Bypass semua route permission

### Operator
- Tambah/edit data di wilayah tugas
- Upload foto/berkas
- Tidak bisa kelola user/role/permission
- Tidak bisa akses Settings

### Viewer
- Lihat data saja
- Tidak bisa tambah/edit/hapus/upload

### Pengawas
- Login → redirect ke app pengawasan (SSO handoff)

## Route Permission — Cara Kerja

```
Akses route →
 ├ Admin? → IZINKAN (bypass)
 ├ Ada aturan route?
 │  ├ Tidak → IZINKAN (default allow)
 │  └ Ya → Role sesuai?
 │         ├ Ya → IZINKAN
 │         └ Tidak → 403
 └ Selesai
```

## Route Permission — Atur oleh Admin
1. Buka **Route Permissions**
2. Tambah: Path + Method + Allowed Roles
3. Simpan → akses terbatas otomatis

## Impersonasi
Admin → Users → Impersonate → banner kuning → lihat sbg user tsb
Stop: klik Stop Impersonating pd banner
