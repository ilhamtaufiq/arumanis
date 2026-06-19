# Kontrak — Pengelolaan Kontrak Pekerjaan

**URL:** `/kontrak`, `/kontrak-addendums`
**Fitur:** CRUD kontrak, addendum, status kontrak

## Tujuan

Mengelola kontrak pekerjaan dan perubahannya (addendum). Terkait dengan pekerjaan dan penyedia.

## Field Data Kontrak

| Field | Tipe | Validasi |
|-------|------|----------|
| Nomor Kontrak | Teks | Wajib, unik |
| Pekerjaan | Dropdown | Wajib |
| Penyedia | Dropdown | Wajib |
| Nilai Kontrak | Rupiah | Wajib |
| Tanggal Mulai | Date | Wajib |
| Tanggal Selesai | Date | Wajib |
| Status | Pilihan | Draft/Aktif/Selesai/Dihentikan |

## Langkah
1. **Kontrak** → **Tambah Kontrak**
2. Pilih pekerjaan + penyedia
3. Isi nomor, nilai, tanggal
4. **Simpan**

## Addendum Kontrak (`/kontrak-addendums`)
Perubahan kontrak: nilai, waktu, atau scope.

**Field:** Kontrak (dropdown), Nomor Addendum, Perubahan Nilai, Perubahan Waktu (hari), Alasan

## Notifikasi & Error
- `Kontrak berhasil ditambahkan`
- `Nomor kontrak sudah digunakan`
- `Tanggal selesai harus setelah tanggal mulai`
- `Tidak dapat menghapus kontrak dengan addendum`

## Perilaku Khusus Role
- **Admin:** CRUD penuh
- **Operator:** Lihat saja
- **Viewer:** Lihat saja
