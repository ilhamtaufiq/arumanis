# Dashboard — Ringkasan dan Metrik Utama

**URL:** `/dashboard`
**Fitur:** Widget ringkasan, grafik, filter tahun

## Tujuan

Dashboard menyajikan ringkasan visual data program air minum dan sanitasi. Menampilkan metrik utama, grafik, dan statistik untuk memantau perkembangan program.

## Tampilan Halaman

![Placeholder: Screenshot Dashboard](docs/assets/screenshots/dashboard-main.png)

**Elemen Halaman:**
- **Filter Tahun** — Dropdown pemilihan tahun anggaran
- **Filter Kecamatan** — Filter berdasarkan kecamatan (pada grafik analytics)
- **Card Statistik** — Kartu ringkasan angka
- **Grafik/Chart** — Visualisasi data interaktif

## Widget & Metrik

### Statistik Utama (KegiatanStats)
| Metrik | Deskripsi |
|--------|-----------|
| Total Kegiatan | Jumlah seluruh program kegiatan |
| Total Pagu | Total anggaran |
| Total Pekerjaan | Jumlah seluruh pekerjaan |
| Total Pagu Pekerjaan | Total anggaran pekerjaan |
| Total Kontrak | Jumlah kontrak |
| Total Nilai Kontrak | Total nilai kontrak |
| Total Output | Jumlah output |
| Total Penerima | Jumlah penerima manfaat |
| Total Jiwa | Total jiwa penerima manfaat |

### Grafik
- **Kegiatan per Tahun** — Diagram batang kegiatan per tahun
- **Kegiatan per Sumber Dana** — Pie chart sumber pendanaan
- **Pagu per Tahun** — Tren anggaran per tahun
- **Pekerjaan per Kecamatan** — Sebaran pekerjaan
- **Pekerjaan per Desa** — Sebaran per desa
- **Pagu per Kecamatan** — Anggaran per wilayah
- **Kontrak per Penyedia** — Jumlah kontrak per vendor
- **Nilai Kontrak per Penyedia** — Nilai kontrak per vendor
- **Output per Komponen** — Output per komponen kegiatan
- **Penerima Komunal vs Individu** — Perbandingan penerima

### Data Quality Stats
- Pekerjaan tanpa koordinat
- Pekerjaan tanpa foto
- Pekerjaan mulai tanpa foto
- Pekerjaan tanpa kontrak

### Analytics
- **Trend Mingguan** — Grafik garis realisasi vs rencana per minggu
- **Regional** — Data per wilayah
- **Kategori** — Data per kategori

## Filter Data

1. Pilih **Tahun** dari dropdown fiscal year (mempengaruhi semua data)
2. Pilih **Kecamatan** untuk filter data geografis (pada analytics)
3. Data dan grafik akan menyesuaikan secara otomatis

## Aksi

- **Klik pada grafik** — Beberapa grafik dapat diperluas atau menampilkan detail
- **Hover** — Menampilkan nilai pada titik data
- **Export** — Beberapa tampilan mendukung export data (jika tersedia)

## Notifikasi & Error

- **Loading state:** Skeleton loader saat data dimuat
- **Error state:** Pesan error jika gagal memuat data
- **Empty state:** Pesan jika tidak ada data untuk tahun yang dipilih

## Perilaku Khusus Role

- **Admin:** Melihat semua data dan metrik
- **Operator:** Melihat data sesuai wilayah tugasnya
- **Viewer:** Melihat ringkasan tanpa bisa mengekspor
