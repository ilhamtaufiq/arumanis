# Pemecahan Masalah (Troubleshooting)

## Error Login
| Error | Arti | Solusi |
|-------|------|--------|
| Invalid email or password | Email/password salah | Periksa kembali |
| Session expired / 401 | Token habis | Login ulang |
| Account is inactive | Akun dinonaktifkan | Hubungi admin |

## Panel Pengawasan (`/pengawasan/`)

| Masalah | Solusi |
|---------|--------|
| Loop redirect `?token=...` | Update ke build terbaru; token hanya boleh di `/pengawasan/login` |
| Blank / chunk error setelah deploy | Refresh — sistem auto hard-reload; clear cache jika perlu |
| 401 di dashboard/pekerjaan | Klik **Masuk ulang** → login di Arumanis `/sign-in` |
| Tidak bisa login di `/pengawasan/login` | Normal — tidak ada form password; masuk lewat Arumanis |
| Stop impersonate loop | Pastikan build terbaru bun + pengawas; kembali ke `/dashboard` |
| GPS / upload foto gagal | Izinkan lokasi; koordinat manual; cek koneksi |
| Progress tidak tersimpan | Pastikan ada perubahan Rencana/Realisasi |

Lihat: [pengawas-panel.md](pengawas-panel.md)

## Error 403 (Forbidden)
Tidak punya akses → hubungi admin untuk perubahan role.
Halaman tidak muncul di sidebar → route permission membatasi.

## Error 404 (Not Found)
URL salah → periksa alamat. Data dihapus → refresh.

## Error Upload
| Error | Solusi |
|-------|--------|
| File terlalu besar | Kompres file (maks 5-10 MB) |
| Tipe file tidak didukung | Pakai JPG/PNG/PDF/DOC/XLS |
| Gagal mengupload | Cek koneksi, coba lagi |

## Error Form
| Error | Solusi |
|-------|--------|
| Kode sudah digunakan | Pakai kode lain |
| NIK sudah terdaftar | Cek data existing |
| Password tidak cocok | Ketik ulang dengan sama |

## Jaringan
- Halaman loading terus → refresh/tunggu
- Network Error → cek internet
- Data tidak muncul → refresh (F5/Ctrl+R)

## Langkah Awal Error
1. Refresh halaman
2. Cek koneksi internet
3. Logout → login ulang
4. Coba browser lain / incognito
5. Hubungi admin
