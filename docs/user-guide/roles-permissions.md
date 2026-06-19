# Roles & Permissions — Peran dan Hak Akses

**URL:** `/roles`, `/permissions`, `/route-permissions`, `/kegiatan-role`, `/menu-permissions`
**Fitur:** Manajemen peran, izin, akses route
**Akses:** Admin only

## Roles (`/roles`)
Role = peran pengguna. Setiap user punya ≥1 role.

**Field:** Nama Role (wajib, unik), Display Name (wajib), Deskripsi

**Default:** Admin, Operator, Viewer

## Permissions (`/permissions`)
Izin spesifik (contoh: `pekerjaan-create`, `users-read`).

## Route Permissions (`/route-permissions`)
Mengontrol akses ke URL spesifik per method HTTP.

### Field Route Permission
| Field | Tipe |
|-------|------|
| Route Path | Teks (contoh: /settings) |
| Route Method | GET/POST/PUT/DELETE |
| Allowed Roles | Multi-select role |

### Cara Kerja
1. Jika tdk ada aturan → semua bisa akses
2. Jika ada aturan → hanya role tertentu bisa akses
3. Admin bypass semua
4. User tanpa role sesuai → 403

## Kegiatan Role (`/kegiatan-role`)
Batasi akses role ke kegiatan tertentu.

## Menu Permissions (`/menu-permissions`)
Atur visibilitas menu sidebar per role.

## Notifikasi & Error
- `Nama role sudah digunakan`
- `Tidak dapat menghapus role yang masih dipakai`
- `Harus pilih minimal 1 role`
