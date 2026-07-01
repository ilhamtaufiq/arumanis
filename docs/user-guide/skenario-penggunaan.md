# Skenario Penggunaan Umum

## 1. Input Kegiatan Baru + Pekerjaan + Dokumentasi
1. Login → Dashboard
2. Kegiatan → Tambah (nama, kode, sumber dana, pagu)
3. Pekerjaan → Tambah (pilih kegiatan, kecamatan, desa)
4. Output → Tambah (pilih pekerjaan, volume, satuan)
5. Berkas → Upload dokumen (pilih pekerjaan, tipe, file)
6. Foto → Upload foto (pilih pekerjaan, gambar, keterangan)
7. Dashboard → verifikasi

## 2. Kontrak Baru + Addendum
1. Pastikan pekerjaan & penyedia terdaftar
2. Kontrak → Tambah (pilih pekerjaan, penyedia, isi nomor/nilai/tanggal)
3. Addendum → Tambah (pilih kontrak, isi perubahan)
4. Dashboard → cek status

## 3. Cari Data Penerima
1. Penerima → filter kecamatan/desa
2. Atau cari via NIK/nama
3. Klik baris → detail lengkap

## 4. Review Progress
1. Dashboard → widget ringkasan + grafik
2. Pilih tahun di fiscal year selector
3. Rekap Progress / Peta Progress / Foto

## 5. Manajemen User + Hak Akses
1. Roles → pastikan role ada
2. Route Permissions → atur akses route
3. Users → Tambah (nama, email, password, role)
4. Assign Pekerjaan (opsional)
5. User login → menu sesuai role

## 6. Troubleshooting Data
1. Dashboard → Data Quality Stats
2. Perbaiki: tambah koordinat, upload foto, buat kontrak
3. Verifikasi di Dashboard

## 7. Pengawas Lapangan (Panel Pengawasan)
1. Login di `/sign-in` → otomatis SSO ke `/pengawasan/`
2. Dashboard → pantau KPI & paket perlu perhatian
3. Pekerjaan → buka detail paket
4. Tab Penerima → kelola penerima manfaat
5. Tab Foto → upload slot 0–100%
6. Tab Progress / Buat Laporan → isi rencana & realisasi mingguan
7. Tiket → lapor kendala lapangan bila perlu

## 8. Admin Impersonate Pengawas
1. Users → pilih user pengawas → Impersonate
2. Arumanis buka Panel Pengawasan atas nama user
3. Selesai review → Stop Impersonate → kembali ke Dashboard admin

## Diagram Alur
```
Sign In → Dashboard → Master Data (Kegiatan → Pekerjaan → Kontrak → Penerima)
                    → Dokumentasi (Berkas → Foto → Peta)
                    → Laporan/Output

Sign In (role pengawas) → SSO → Panel Pengawasan → Foto / Progress / Tiket
```
