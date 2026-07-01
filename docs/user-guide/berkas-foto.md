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

## Foto di Panel Pengawasan

Pengawas mengunggah foto lewat **Panel Pengawasan** (`/pengawasan/pekerjaan/:id` → tab Foto), bukan modul `/foto` Arumanis utama.

| Aspek | Panel Pengawasan | Arumanis `/foto` |
|-------|------------------|------------------|
| Slot progress | 5 slot: 0%, 25%, 50%, 75%, 100% per output | Galeri umum per pekerjaan |
| Koordinat | GPS wajib (auto/manual) | Opsional |
| Matriks | Per output × penerima | Grid galeri |
| Status paket | Belum ada foto / Belum Selesai / Selesai | — |

Panduan lengkap: [pengawas-panel.md](pengawas-panel.md) · [/docs/pengawas.md](/docs/pengawas.md#dokumentasi-foto)

## Perilaku Khusus Role
- **Admin:** Unggah/lihat/hapus semua
- **Operator:** Unggah untuk pekerjaan di wilayahnya
- **Viewer:** Lihat & unduh saja
- **Pengawas:** Upload via Panel Pengawasan untuk paket yang ditugaskan
