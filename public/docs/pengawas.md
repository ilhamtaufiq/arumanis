# Panduan Pengawas Lapangan

Halaman ini berisi petunjuk lengkap bagi Pengawas Lapangan untuk mengelola data progres fisik di lapangan menggunakan aplikasi ARUMANIS.

---

## 1. Cara Mengakses Aplikasi

Anda dapat masuk ke aplikasi menggunakan akun Google yang sudah terdaftar. 

### Langkah-langkah Login:
1. Buka halaman **Login**.
2. Klik tombol:
   <div class="google-btn">
     <svg width="18" height="18" viewBox="0 0 24 24">
       <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
       <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
       <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
       <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
     </svg>
     Continue with Google
   </div>
3. Pilih akun Google Anda.

> [!IMPORTANT]
> Jika email Anda belum didaftarkan oleh Admin, Anda tidak akan melihat daftar pekerjaan di dashboard. Silakan hubungi Admin jika hal ini terjadi melalui fitur [**Membuat Tiket**](tiket.md).

---

## 2. Dashboard Pekerjaan

Setelah login, Anda akan disuguhkan halaman Dashboard yang berisi:
- **Daftar Pekerjaan**: Semua proyek yang ditugaskan kepada Anda.
- **Lokasi**: Informasi Kecamatan dan Desa terkait.
- **Progress Saat Ini**: Persentase realisasi fisik yang sudah terinput.

---

## 3. Melaporkan Progres Mingguan

Pelaporan progres adalah tugas utama Pengawas Lapangan. Anda harus menginput realisasi fisik secara berkala setiap minggu.

---

### 3.1 Memahami Tabel Progres

Tabel progres menampilkan data dalam format kolom mingguan:

| Kolom | Keterangan |
|-------|------------|
| **Item Pekerjaan** | Nama item/komponen pekerjaan |
| **Satuan** | Unit pengukuran (m, m², unit, dll) |
| **Volume** | Target volume yang harus dicapai |
| **Bobot (%)** | Kontribusi item terhadap total progres |
| **Week 1, 2, 3...** | Kolom input per minggu |

### 3.2 Langkah-langkah Input Progres

1. **Masuk ke Detail Pekerjaan**
   - Dari Dashboard, klik nama pekerjaan yang ingin Anda laporkan.

2. **Buka Tab Progres**
   - Pilih tab **Progres** di bagian atas halaman.

3. **Temukan Kolom Minggu Aktif**
   - Scroll ke kanan untuk menemukan kolom minggu yang sedang berjalan.
   - Kolom minggu aktif biasanya ditandai dengan warna berbeda.

4. **Input Nilai Realisasi**
   - Klik sel pada kolom minggu yang ingin diisi.
   - Masukkan **angka persentase realisasi** (contoh: `45.5`).
   - Tekan **Enter** atau klik di luar sel untuk menyimpan.

5. **Periksa Total Progres**
   - Nilai total progres akan otomatis terhitung di bagian bawah tabel.

### 3.3 Aturan Input Progres

> [!IMPORTANT]
> Perhatikan aturan berikut saat menginput progres:

| Aturan | Ketentuan |
|--------|-----------|
| **Rentang Nilai** | 0 sampai 100 (dalam persen) |
| **Format Angka** | Bisa menggunakan desimal (contoh: `25.5`) |
| **Nilai Kosong** | Kosongkan jika belum ada progres |
| **Akumulasi** | Nilai harus kumulatif (minggu 3 >= minggu 2) |

### 3.4 Memahami Perhitungan Bobot

Setiap item pekerjaan memiliki **bobot** yang menunjukkan kontribusinya terhadap total progres:

```
Total Progres = Σ (Bobot Item × Realisasi Item) / 100
```

**Contoh:**
| Item | Bobot | Realisasi | Kontribusi |
|------|-------|-----------|------------|
| Galian | 30% | 100% | 30% |
| Pemasangan Pipa | 40% | 50% | 20% |
| Finishing | 30% | 0% | 0% |
| **Total** | **100%** | - | **50%** |

### 3.5 Tips Input Progres

> [!TIP]
> - Input progres secara rutin setiap minggu
> - Pastikan nilai realisasi sesuai dengan kondisi lapangan
> - Jika ada kesalahan input, Anda bisa langsung mengedit selama belum dikunci
> - Gunakan fitur **Export PDF** untuk mencetak laporan progres

---


## 4. Dokumentasi Foto & Berkas

Setiap progres fisik wajib didukung dengan bukti dokumentasi berupa foto lapangan dan berkas pendukung.

---

### 4.1 Upload Foto Lapangan

Foto lapangan adalah bukti visual progres pekerjaan di lokasi. Berikut panduan lengkap untuk mengupload foto:

#### Langkah-langkah Upload Foto:

1. **Masuk ke Detail Pekerjaan**
   - Dari Dashboard, klik nama pekerjaan yang ingin Anda dokumentasikan.

2. **Buka Tab Foto**
   - Pilih tab **Foto** di bagian atas halaman detail.

3. **Klik Tambah Foto**
   - Klik tombol **+ Tambah Foto** untuk membuka form upload.

4. **Isi Form Upload**

   | Field | Keterangan |
   |-------|------------|
   | **Pekerjaan** | Otomatis terisi sesuai pekerjaan yang dipilih |
   | **Komponen** | Pilih komponen pekerjaan (contoh: Saluran Air, Tangki, dll) |
   | **Penerima** *(opsional)* | Pilih penerima manfaat jika ada |
   | **Keterangan Progres** | Pilih persentase progres saat foto diambil |
   | **Koordinat** | Klik tombol **Ambil Lokasi** untuk GPS otomatis |
   | **File Foto** | Pilih file foto dari perangkat Anda |

5. **Simpan Foto**
   - Klik tombol **Simpan** untuk mengupload foto.

#### Pilihan Keterangan Progres:

Anda dapat memilih salah satu dari 5 kategori progres berikut:

| Kategori | Kapan Digunakan |
|----------|-----------------|
| **0%** | Foto kondisi awal sebelum pekerjaan dimulai |
| **25%** | Foto saat pekerjaan baru dimulai |
| **50%** | Foto saat pekerjaan setengah selesai |
| **75%** | Foto saat pekerjaan hampir selesai |
| **100%** | Foto saat pekerjaan sudah selesai |

#### Spesifikasi File Foto:

> [!IMPORTANT]
> Pastikan foto yang Anda upload memenuhi kriteria berikut:

| Kriteria | Ketentuan |
|----------|-----------|
| **Format File** | JPEG, PNG, atau WebP |
| **Ukuran Maksimal** | 10 MB per file |
| **Rekomendasi Resolusi** | Minimal 1280 x 720 pixel |

#### Format Koordinat:

Koordinat GPS menggunakan format **latitude,longitude**. Contoh:
```
-6.123456,106.789012
```

> [!TIP]
> Gunakan tombol **Ambil Lokasi** di form untuk mendapatkan koordinat GPS secara otomatis dari perangkat Anda.

---

### 4.2 Upload Berkas Pendukung

Berkas pendukung adalah dokumen administratif seperti laporan harian atau mingguan.

#### Langkah-langkah Upload Berkas:

1. Masuk ke tab **Berkas** di halaman detail pekerjaan.
2. Klik tombol **+ Tambah Berkas**.
3. Pilih jenis berkas (Laporan Harian, Laporan Mingguan, dll).
4. Upload file dalam format **PDF** atau **Gambar**.
5. Klik **Simpan**.

#### Spesifikasi File Berkas:

| Kriteria | Ketentuan |
|----------|-----------|
| **Format File** | PDF, JPEG, PNG |
| **Ukuran Maksimal** | 10 MB per file |


---

## 5. Kendala & Troubleshooting

Jika menemui masalah teknis, silakan periksa hal berikut:

| Masalah | Solusi |
|---------|--------|
| Pekerjaan Kosong | Pastikan Admin sudah melakukan *assignment* ke akun Anda. |
| Gagal Upload | Pastikan ukuran file di bawah 10MB. |
| Salah Input | Anda dapat mengubah angka progres kapan saja selama periode laporan belum dikunci. |

Jika masalah berlanjut, gunakan fitur [Membuat Tiket](tiket.md) pada aplikasi.
