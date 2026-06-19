# Desa & Kecamatan — Data Wilayah

**URL:** `/desa`, `/kecamatan`
**Fitur:** CRUD data wilayah, data geospasial

## Tujuan

Mengelola data kecamatan dan desa di Kabupaten Cianjur. Referensi untuk modul lain.

## Kecamatan (`/kecamatan`)

| Field | Tipe | Validasi |
|-------|------|----------|
| Nama Kecamatan | Teks | Wajib, unik |
| Kode Kecamatan | Teks | Wajib, unik |
| Ibu Kota | Teks | Opsional |
| Luas Wilayah | km² | Opsional |

**Langkah:** Kecamatan → Tambah → isi → Simpan. GeoJSON untuk peta.

## Desa (`/desa`)

| Field | Tipe | Validasi |
|-------|------|----------|
| Nama Desa | Teks | Wajib, unik |
| Kode Desa | Teks | Wajib, unik |
| Kecamatan | Dropdown | Wajib |
| Luas Wilayah | km² | Opsional |

**Langkah:** Desa → filter kecamatan → Tambah → Simpan.

## Filter: Pencarian teks (nama/kode), filter kecamatan (desa), paginasi.

## Notifikasi & Error
- `Kode sudah digunakan` / `Nama sudah digunakan`
- `Tidak dapat menghapus: data masih digunakan di modul lain`

## Role
- **Admin:** CRUD penuh
- **Operator/Viewer:** Lihat saja
