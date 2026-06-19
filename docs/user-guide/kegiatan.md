# Kegiatan — Program dan Aktivitas

**URL:** `/kegiatan`
**Fitur:** CRUD program kegiatan, filter, pencarian

## Tujuan

Modul Kegiatan mengelola data program/kegiatan air minum dan sanitasi. Setiap kegiatan memiliki pagu anggaran, sumber dana, dan bisa memiliki banyak pekerjaan terkait.

## Tampilan Halaman

\![Placeholder: Screenshot Daftar Kegiatan](docs/assets/screenshots/kegiatan-list.png)

## Field Data Kegiatan

| Field | Tipe | Validasi |
|-------|------|----------|
| Nama Kegiatan | Teks | Wajib |
| Kode Kegiatan | Teks | Wajib, unik |
| Sumber Dana | Pilihan (APBD/APBN/Lainnya) | Wajib |
| Pagu | Angka (Rupiah) | Wajib, > 0 |
| Tahun Anggaran | Tahun | Wajib |
| Keterangan | Textarea | Opsional |

## Langkah Penggunaan

**Tambah:** Klik **Tambah Kegiatan** → isi form → **Simpan**
**Lihat:** Klik ikon 👁️
**Edit:** Klik ikon ✏️ → ubah → **Simpan**
**Hapus:** Klik ikon 🗑️ → konfirmasi

## Notifikasi & Error

**Sukses:** Kegiatan berhasil ditambahkan/diupdate/dihapus
**Error:** Kode kegiatan sudah digunakan, Pagu harus > 0, Tidak dapat menghapus

## Perilaku Khusus Role

- **Admin:** CRUD penuh
- **Operator:** Tambah/edit di wilayah tugas
- **Viewer:** Lihat saja
