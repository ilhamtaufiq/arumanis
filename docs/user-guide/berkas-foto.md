# Berkas & Foto — Dokumentasi dan Galeri

**URL:** `/berkas`, `/foto`
**Fitur:** Unggah, unduh, galeri dokumen dan foto

## Berkas / Dokumen (`/berkas`)

### Field Berkas
| Field | Tipe |
|-------|------|
| Nama Dokumen | Teks (wajib) |
| Pekerjaan | Dropdown (wajib) |
| Tipe Dokumen | Kontrak/Laporan/Gambar/RAB/dll |
| File | File upload (PDF, DOC, XLS) |

### Langkah
**Berkas** → **Upload** → pilih pekerjaan, tipe, file → **Upload**

## Foto (`/foto`)

### Field Foto
| Field | Tipe |
|-------|------|
| Judul | Teks (wajib) |
| Pekerjaan | Dropdown (wajib) |
| File | Image (JPG, PNG, WebP) |
| Tanggal | Date |
| Keterangan | Textarea |

### Langkah
**Foto** → **Upload** → pilih pekerjaan, gambar → **Upload**

Galeri grid view, klik untuk lightbox, filter by pekerjaan.

## Tipe Dokumen
Kontrak, Laporan, Gambar Teknis, RAB, Berita Acara, Pendukung

## Batasan
- Ukuran file: 5-10 MB (konfigurasi admin)
- Format gambar: JPG, PNG, WebP
- Format dokumen: PDF, DOC, DOCX, XLS, XLSX

## Notifikasi & Error
- `File terlalu besar` → kompres file
- `Tipe file tidak didukung` → gunakan format diizinkan
- `Gagal mengupload` → cek koneksi

## Perilaku Khusus Role
- **Admin:** Unggah/lihat/hapus semua
- **Operator:** Unggah untuk pekerjaan di wilayahnya
- **Viewer:** Lihat & unduh saja
