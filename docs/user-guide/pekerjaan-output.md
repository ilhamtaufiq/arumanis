# Pekerjaan & Output

**URL:** `/pekerjaan`, `/output`, `/draft-pekerjaan`
**Fitur:** CRUD pekerjaan/proyek, output kegiatan, draft

## Tujuan

Modul Pekerjaan mengelola proyek turunan dari kegiatan. Modul Output mencatat hasil kerja tiap pekerjaan.

## Pekerjaan

### Field Data Pekerjaan
| Field | Tipe | Validasi |
|-------|------|----------|
| Nama Pekerjaan | Teks | Wajib |
| Kode Pekerjaan | Teks | Wajib, unik |
| Kegiatan | Dropdown | Wajib |
| Kecamatan | Dropdown | Wajib |
| Desa | Dropdown | Wajib |
| Pagu | Rupiah | Wajib |
| Tahun Anggaran | Tahun | Wajib |
| Tanggal Mulai/Selesai | Date | Opsional |
| Status | Pilihan | Opsional |

### Langkah
1. Buka **Pekerjaan** → **Tambah Pekerjaan**
2. Isi form (kegiatan, lokasi, pagu)
3. **Simpan**
4. Lihat/Edit/Hapus via ikon per baris

## Draft Pekerjaan (`/draft-pekerjaan`)
Pekerjaan belum final. Edit → Publikasikan jadi aktif.

## Output (`/output`)

### Field Output: Nama (wajib), Pekerjaan (wajib), Tipe, Volume, Satuan, Realisasi

## Notifikasi & Error
- `Pekerjaan berhasil disimpan`
- `Kode pekerjaan sudah digunakan`
- `Tidak dapat menghapus: memiliki kontrak/output terkait`

## Perilaku Khusus Role
- **Admin:** CRUD penuh
- **Operator:** Terbatas wilayah tugas
- **Viewer:** Lihat saja
