# Auth — Login, Logout, dan Keamanan Akun

**URL:** `/sign-in`
**Fitur:** Autentikasi pengguna, manajemen sesi, keamanan akun

## Tujuan

Modul Auth mengelola akses masuk ke aplikasi ARUMANIS. Setiap pengguna harus login dengan email dan password atau melalui Google OAuth.

## Halaman Sign In

![Placeholder: Screenshot halaman login](docs/assets/screenshots/auth-sign-in.png)

**Elemen Halaman:**
- Logo/title "ARUMANIS"
- Form email
- Form password dengan toggle visibility
- Link "Lupa?" (reset password — hubungi admin)
- Tombol **Sign In**
- Pemisah "Atau"
- Tombol **Google Login**
- Link "Panduan Penggunaan"

## Langkah Login

1. Buka URL aplikasi → otomatis diarahkan ke `/sign-in`
2. Masukkan **email** (contoh: `user@example.com`)
3. Masukkan **password** (minimal 7 karakter)
4. Klik **Sign In**
5. Berhasil → diarahkan ke halaman Dashboard

**Login dengan Google:**
1. Klik tombol **Google Login**
2. Pilih akun Google Anda
3. Izinkan akses jika diminta
4. Otomatis login dan diarahkan ke Dashboard

## Form Field Login

| Field | Tipe | Validasi |
|-------|------|----------|
| Email | Email | Wajib, format email valid |
| Password | Password | Wajib, min 7 karakter |

## Notifikasi & Error

**Sukses:**
- Toast: `Welcome back, [Nama]!`

**Error:**
- `Invalid email or password` — Email atau password salah
- `Please enter your email` — Field email kosong
- `Invalid email address` — Format email tidak valid
- `Please enter your password` — Field password kosong
- `Password must be at least 7 characters long` — Password terlalu pendek

## Session & Logout

Session berlaku selama token valid. Keluar aplikasi:
1. Klik avatar/nama user di pojok kanan atas header
2. Pilih **Logout** dari dropdown
3. Otomatis dikembalikan ke halaman Sign In

**Session timeout:** Jika tidak ada aktivitas dalam waktu tertentu, session akan berakhir dan Anda akan diarahkan ke halaman login.

## Perilaku Khusus Role

- **Admin:** Dapat login dan mengakses seluruh menu
- **Operator:** Terbatas pada menu yang diizinkan oleh role
- **Viewer:** Hanya dapat melihat data, tidak bisa mengubah
- **Pengawas / Konsultan Pengawas:** Setelah login, diarahkan otomatis ke Panel Pengawasan via SSO (lihat di bawah)

## SSO ke Panel Pengawasan

Panel Pengawasan (`/pengawasan/`) **tidak memiliki form login email/password**. Alurnya:

1. User login di `/sign-in` Arumanis utama
2. `shouldRedirectToPengawasApp(roles)` bernilai true jika role pengawas/konsultan_pengawas **tanpa** role admin atau manager
3. Browser diarahkan ke `/pengawasan/login?token=...` (`getPengawasAppUrl`)
4. Panel pengawasan sinkron token via BFF → cookie `pengawas_session`
5. Token dihapus dari URL; user masuk dashboard pengawasan

### Impersonate pengawas (admin)

Admin dapat impersonate user pengawas dari halaman Users. Arumanis membuka `/pengawasan/login?token=...` dengan token impersonate. **Stop Impersonate** mengembalikan sesi admin ke `/dashboard`.

### Tanpa sesi di panel pengawasan

- Route protected → redirect `/sign-in?redirect=/pengawasan/...`
- Logout panel → `/sign-in`
- Error 401 → **Masuk ulang** → `/sign-in`

Detail lengkap: [Panel Pengawasan](pengawas-panel.md) · [Panduan publik](/docs/pengawas.md)

## Keamanan

- Password disimpan dengan enkripsi (server-side)
- Token akses disimpan di browser
- Session expiry otomatis
- Impersonasi oleh admin (lihat banner kuning saat aktif)
