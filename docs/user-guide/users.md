# Users — Manajemen Akun Pengguna

**URL:** `/users`
**Fitur:** CRUD akun pengguna, atur role
**Akses:** Admin only

## Field Data User

| Field | Tipe | Validasi |
|-------|------|----------|
| Nama | Teks | Wajib |
| Email | Email | Wajib, unik |
| Password | Password | Wajib (saat buat), min 7 |
| Konfirmasi Password | Password | Harus sama |
| Role | Multi-select | Wajib |
| Status | Aktif/Nonaktif | Opsional |

## Langkah

**Tambah:** Users → **Tambah User** → isi nama, email, password, role → **Simpan**
**Edit:** Klik ikon ✏️ pada baris user
**Nonaktifkan:** Edit → status Nonaktif → Simpan
**Hapus:** Ikon 🗑️ → konfirmasi

## Tabel Users

| No | Nama | Email | Role | Status | Terdaftar | Aksi |

## Notifikasi & Error
- `Email sudah digunakan`
- `Password tidak cocok` (konfirmasi beda)
- `Tidak dapat menghapus user sendiri`

## Perilaku Khusus Role
**Admin:** Kelola semua user
**Non-admin:** Tidak punya akses
