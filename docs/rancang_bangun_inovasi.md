# Rancang Bangun Inovasi — Arumanis

**Nama Inovasi:** Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi)  
**Instansi:** Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur  
**Wilayah Kerja:** 33 kecamatan, 365 desa/kelurahan (Kode Wilayah BPS: 32.03)  
**Bidang:** Infrastruktur air minum, sanitasi, dan pemantauan proyek pembangunan  
**Tahun:** 2026  
**URL Produksi:** [arumanis.cianjur.space](https://arumanis.cianjur.space) · API: [apiamis.cianjur.space](https://apiamis.cianjur.space)

---

## A. Dasar Hukum

Inovasi Arumanis disusun dan dioperasikan berlandaskan regulasi yang sah, sebagai berikut:

### Undang-Undang

| No. | Regulasi | Keterkaitan |
|-----|----------|-------------|
| 1 | Undang-Undang Nomor 17 Tahun 2019 tentang Sumber Daya Air | Dasar pengelolaan sumber daya air dan penyediaan air minum |
| 2 | Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah (sebagaimana telah diubah) | Kewenangan daerah dalam pembangunan dan pelayanan publik |
| 3 | Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (sebagaimana telah diubah) | Legalitas data dan transaksi elektronik dalam sistem aplikasi |
| 4 | Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik | Keterbukaan capaian layanan air minum kepada masyarakat |

### Peraturan Pemerintah dan Peraturan Menteri

| No. | Regulasi | Keterkaitan |
|-----|----------|-------------|
| 1 | Peraturan Pemerintah Nomor 16 Tahun 2005 tentang Pengembangan Sistem Penyediaan Air Minum | Standar pengembangan SPAM di tingkat daerah |
| 2 | Peraturan Menteri PUPR Nomor 18/PRT/M/2007 tentang Pedoman Pengembangan Sistem Penyediaan Air Minum | Pedoman teknis unit SPAM dan capaian layanan |
| 3 | Peraturan Menteri Dalam Negeri Nomor 59 Tahun 2016 tentang Penerapan SPBE di Lingkungan Pemerintah Daerah | Arsitektur dan tata kelola sistem elektronik daerah |
| 4 | Peraturan Menteri Dalam Negeri Nomor 108 Tahun 2016 tentang Pedoman Evaluasi SPBE | Evaluasi kualitas layanan sistem elektronik |
| 5 | Peraturan Menteri PUPR terkait Standar Pelayanan Minimum (SPM) bidang air minum | Acuan capaian SR, KK, dan jiwa terlayani |

### NSPK Kementerian/Lembaga

| No. | Regulasi | Keterkaitan |
|-----|----------|-------------|
| 1 | Permen PU Nomor 20 Tahun 2006 tentang Persyaratan Teknis Pengembangan SPAM | Standar teknis data aset SPAM |
| 2 | Pedoman SIMSPAM (Sistem Informasi Manajemen SPAM) Kementerian PUPR | Integrasi status registrasi unit SPAM |
| 3 | Surat Edaran Mendagri terkait Reformasi Birokrasi dan transformasi digital daerah | Penguatan layanan digital terintegrasi |

### Peraturan Daerah dan Peraturan Kepala Daerah

| No. | Regulasi | Keterkaitan |
|-----|----------|-------------|
| 1 | Peraturan Daerah Kabupaten Cianjur Nomor 14 Tahun 2021 tentang Perusahaan Umum Daerah Air Minum Tirta Mukti | Penyelenggaraan air minum melalui Perumdam daerah |
| 2 | Peraturan Daerah Kabupaten Cianjur Nomor 1 Tahun 2021 tentang Penyertaan Modal Daerah kepada Perumdam Air Minum Kabupaten Cianjur | Pengawasan dan penanaman modal penyediaan air minum |
| 3 | Peraturan Daerah Kabupaten Cianjur Nomor 18 Tahun 2021 tentang Pembentukan dan Susunan Perangkat Daerah | Kedudukan Dinas Perumahan dan Kawasan Permukiman sebagai pemilik program |
| 4 | Peraturan Bupati Kabupaten Cianjur Nomor 102 Tahun 2021 tentang Tugas dan Fungsi serta Tata Kerja Unit Organisasi di Lingkungan Dinas Perumahan dan Kawasan Permukiman | Unit pelaksana teknis pengelola data SPAM/SPM dan monitoring proyek |
| 5 | Peraturan Bupati Kabupaten Cianjur Nomor 23 Tahun 2020 tentang Rencana Aksi Daerah Penyediaan Air Minum dan Penyehatan Lingkungan Tahun 2019–2023 | Peta aksi peningkatan akses air minum dan sanitasi perdesaan |
| 6 | Rencana Pembangunan Jangka Menengah Daerah (RPJMD) Kabupaten Cianjur Tahun 2025–2029 | Arah strategis peningkatan akses air minum layak dan pembangunan infrastruktur permukiman |
| 7 | Kajian Rencana Induk Sistem Penyediaan Air Minum (RISPAM) Kabupaten Cianjur (BAPPERIDA) | Acuan perencanaan jaringan dan prioritas intervensi SPAM |

---

## B. Permasalahan

### 1. Permasalahan Makro (Kondisi Umum/Struktural)

| Aspek | Uraian Permasalahan |
|-------|---------------------|
| **Fragmentasi data** | Data unit SPAM, capaian SPM (SR/KK/jiwa), progres fisik pekerjaan, dan dokumentasi lapangan tersebar di berbagai format (Excel, berkas fisik, WhatsApp, dan laporan manual) sehingga sulit dihimpun sebagai satu sumber kebenaran (*single source of truth*). |
| **Keterbatasan monitoring real-time** | Pengawasan proyek infrastruktur air minum dan sanitasi masih bergantung pada laporan berkala berbasis dokumen, sehingga deviasi fisik maupun keuangan baru teridentifikasi setelah keterlambatan signifikan. |
| **Kesenjangan capaian SPM** | Kabupaten Cianjur memiliki **365 desa/kelurahan** di **33 kecamatan** dengan **364 unit SPAM** yang bervariasi kapasitas dan tingkat pengelolaannya. Target layanan tercatat **534.952 KK**, sementara capaian terintegrasi baru mencapai **13,2%** — tanpa sistem terpadu, perencanaan intervensi prioritas desa sulit dilakukan secara proporsional. |
| **Tuntutan transparansi publik** | Masyarakat dan pemangku kepentingan menuntut akses informasi capaian layanan air minum yang dapat dipertanggungjawabkan, sementara publikasi data masih bersifat ad hoc. |
| **Transformasi digital birokrasi** | Reformasi birokrasi menuntut integrasi layanan digital lintas unit kerja, namun belum tersedia platform khusus yang menggabungkan data aset SPAM, pelaksanaan pekerjaan, dan pengawasan lapangan dalam satu ekosistem. |

### 2. Permasalahan Mikro (Kondisi Spesifik di Tingkat Unit Layanan/Masyarakat Sasaran)

| Pelaku | Permasalahan Spesifik |
|--------|----------------------|
| **Operator data di kantor** | Input ulang data yang sama ke beberapa lembar kerja; risiko inkonsistensi angka SR/KK antar laporan tahunan; proses impor data capaian memakan waktu berhari-hari. |
| **Pengawas/konsultan lapangan** | Dokumentasi foto progres harus dikirim terpisah; koordinat lokasi tidak selalu tercatat; laporan mingguan RAB fisik dan keuangan diisi manual dan sulit diverifikasi pusat. |
| **Manajer proyek / TFL** | Tidak memiliki dashboard terpadu untuk membandingkan rencana vs realisasi lintas paket pekerjaan; kendala lapangan (tiket) tidak terlacak status penyelesaiannya secara terstruktur. |
| **Masyarakat sasaran** | Informasi capaian layanan air minum di desa masing-masing tidak mudah diakses; partisipasi pengawasan layanan (POKMAS) terbatas karena kurangnya data terbuka yang mudah dipahami. |
| **Unit SPAM desa** | Data pengelola (POKMAS), kapasitas layanan, dan capaian tahunan tidak terdokumentasi secara digital sehingga evaluasi kinerja unit sulit dilakukan secara berkala. |

---

## C. Isu Strategis

Inovasi Arumanis dikaitkan dengan isu strategis berikut:

### Isu Global — SDGs

| SDGs | Keterkaitan Arumanis |
|------|----------------------|
| **SDGs 6: Air Bersih dan Sanitasi Layak** | Arumanis memonitor capaian sambungan rumah (SR), rumah tangga (KK), dan jiwa terlayani (SPM) per desa, mendukung Target 6.1 (akses air minum aman) dan 6.2 (sanitasi layak). |
| **SDGs 9: Industri, Inovasi, dan Infrastruktur** | Platform digital memperkuat infrastruktur data pembangunan dan inovasi tata kelola proyek. |
| **SDGs 16: Kelembagaan yang Kuat** | Transparansi capaian melalui halaman publik dan audit trail data mendukung akuntabilitas pemerintahan. |

### Isu Nasional — RPJMN & Asta Cita

| Isu | Keterkaitan |
|-----|-------------|
| **Asta Cita: Pembangunan dari Sabang sampai Merauke yang Merata** | Pemetaan capaian SPM per desa memungkinkan intervensi yang merata di seluruh wilayah Kabupaten Cianjur. |
| **Reformasi Birokrasi** | Integrasi Arumanis Utama dan Panel Pengawasan dengan SSO, role-based access, dan alur kerja digital mengurangi duplikasi dan mempercepat koordinasi. |
| **Penurunan Stunting** | Akses air minum layak merupakan prasyarat sanitasi rumah tangga yang berkontribusi pada penurunan stunting. |
| **Inflasi & efisiensi anggaran** | Monitoring progres fisik dan keuangan real-time membantu deteksi dini deviasi anggaran proyek. |

### Isu Lokal — RPJMD Kabupaten Cianjur Tahun 2025–2029

| Isu | Keterkaitan |
|-----|-------------|
| **Peningkatan akses air minum layak** | Modul SPAM Unit dan peta capaian SPM menjadi instrumen perencanaan dan evaluasi program pembangunan SPAM, selaras RISPAM Kabupaten Cianjur. |
| **Optimalisasi pengawasan proyek pembangunan** | **426 paket pekerjaan** terpantau melalui Panel Pengawasan dengan **3.866** dokumentasi foto ber-GPS dan laporan mingguan terstruktur. |
| **Digitalisasi layanan pemerintahan daerah** | Implementasi SPBE melalui platform web terintegrasi Dinas Perumahan dan Kawasan Permukiman. |
| **RAD PAMSIMAS 2019–2023** | Perbup Nomor 23 Tahun 2020 menjadi landasan operasional peningkatan layanan air minum perdesaan yang dicatat dalam Arumanis. |

### Isu Strategis Utama yang Paling Berkaitan

**SDGs 6 — Air Bersih dan Sanitasi Layak**, diperkuat dengan program peningkatan capaian **Standar Pelayanan Minimum (SPM)** air minum di Kabupaten Cianjur sebagaimana tertuang dalam **RPJMD 2025–2029** dan **RISPAM**. Arumanis secara langsung mengukur, memvisualisasikan, dan mempublikasikan indikator SR/KK/jiwa terlayani sebagai dasar pengambilan kebijakan intervensi per desa.

### Ringkasan Data Capaian Terkini (Sistem Arumanis, per 26 Juni 2026)

| Indikator | Nilai |
|-----------|-------|
| Unit SPAM terdata | **364** unit (18 terdaftar SIMSPAM, 346 non-SIMSPAM) |
| Desa dengan data peta SPM | **365** desa |
| Target KK (master desa) | **534.952** KK |
| Capaian SR / KK (s.d. 2025) | **52.911** |
| Capaian jiwa terlayani | **264.557** jiwa |
| Capaian BJP (KK) | **17.681** KK |
| Persentase capaian SPM | **13,2%** |
| Record capaian tahunan (achievement) | **505** entri |
| Nilai kontrak SPAM terdata | **Rp 90.479.525.404** |
| Paket pekerjaan terpantau | **426** paket |
| Dokumentasi foto progres | **3.866** berkas |

---

## D. Metode Pembaharuan

Inovasi Arumanis menghadirkan perubahan nyata dengan membandingkan kondisi **sebelum** (praktik manual/pra-sistem) dan **sesudah** (data operasional Arumanis per **26 Juni 2026**), sebagai berikut:

### 1. Integrasi Data Satu Platform

| Indikator | Sebelum Inovasi | Sesudah Inovasi |
|-----------|-----------------|-----------------|
| Jumlah sumber data terpisah untuk SPAM & proyek | 4–6 format (Excel, PDF, WA, berkas fisik) | **1 platform terintegrasi** — Arumanis (frontend) + api amis (backend) |
| Unit SPAM terdigitalisasi | Tersebar di berkas/Excel per kecamatan | **364 unit** dalam satu basis data terstruktur |
| Waktu rekapitulasi capaian SPM lintas 365 desa | 5–10 hari kerja / triwulan | **< 1 hari** — agregasi otomatis (52.911 SR/KK, 264.557 jiwa, coverage **13,2%**) |
| Risiko duplikasi/inkonsistensi data | Tinggi (input manual berulang) | **Rendah** — validasi server, relasi desa–unit–achievement |

### 2. Monitoring Proyek dan Pengawasan Lapangan

| Indikator | Sebelum Inovasi | Sesudah Inovasi |
|-----------|-----------------|-----------------|
| Paket pekerjaan terpantau terpusat | Tidak terstandar / per berkas | **426 paket** dalam modul pekerjaan |
| Interval update progres fisik ke kantor pusat | 2–4 minggu (laporan dokumen) | **Mingguan** melalui Panel Pengawasan + sinkronisasi Puspen |
| Dokumentasi foto progres terpusat | Tersebar di perangkat pengawas | **3.866** foto terindeks dengan slot 0%–100% dan koordinat GPS |
| Waktu identifikasi deviasi fisik/keuangan | Setelah laporan bulanan | **Real-time** melalui dashboard KPI & deviasi |

### 3. Capaian SPM dan Visualisasi Geospasial

| Indikator | Sebelum Inovasi | Sesudah Inovasi |
|-----------|-----------------|-----------------|
| Unit SPAM terdata digital per desa | Estimasi < 50% desa | **364 unit** pada **365** entri wilayah (≈ **99,7%** cakupan desa) |
| Record capaian SPM per tahun | Berkas/Excel per unit | **505** record achievement terstruktur (multi-tahun) |
| Visualisasi capaian per desa | Peta statis / tabel Excel | **Peta choropleth interaktif** 365 desa (Leaflet + API `map-stats`) |
| Akses publik informasi capaian SPM | Tidak tersedia / berkas fisik | **Tersedia 24/7** di landing [arumanis.cianjur.space](https://arumanis.cianjur.space) |

### 4. Efisiensi Administrasi dan Pelaporan

| Indikator | Sebelum Inovasi | Sesudah Inovasi |
|-----------|-----------------|-----------------|
| Waktu impor data SPAM massal | 3–5 hari (input manual per baris) | **< 2 jam** — fitur impor CSV (`spam:import-data`) |
| Nilai kontrak/anggaran SPAM terkonsolidasi | Rekapitulasi manual | **Rp 90.479.525.404** terdata lintas unit |
| Waktu pembuatan laporan ekspor PDF/Excel | 1–2 hari per periode | **< 30 menit** — generate otomatis dari modul laporan |
| Koordinasi pengawas–kantor pusat | Telepon/WA tanpa jejak audit | **Terlacak** — SSO, notifikasi broadcast, sistem tiket |

### 5. Kualitas Layanan Keputusan (Decision Support)

| Indikator | Sebelum Inovasi | Sesudah Inovasi |
|-----------|-----------------|-----------------|
| Ringkasan KPI dashboard SPAM | Tidak ada / manual | **Real-time**: 364 unit · 52.911 KK · 264.557 jiwa · goal **13,2%** |
| Analisis data berbasis pertanyaan natural | Tidak tersedia | **Tersedia** melalui asisten **Ami AI** |
| Filter data per kecamatan/desa/tahun | Manual pivot tabel | **Instant** — 33 kecamatan, 365 desa, filter tahun capaian |
| Status registrasi SIMSPAM | Tidak terpantau terpusat | **18** unit SIMSPAM · **346** non-SIMSPAM |

> **Catatan:** Kolom *Sebelum Inovasi* mengacu pada kondisi estimasi pra-digitalisasi. Kolom *Sesudah Inovasi* bersumber dari basis data operasional api amis (`UnitSpam`, `SpamAchievement`, `Desa`, `Pekerjaan`, `Foto`) dan diperbarui berkala melalui modul SPAM Unit serta integrasi pengawasan.

---

## E. Keunggulan dan Kebaharuan

### Keunggulan Dibandingkan Inovasi/Sistem Sejenis

| Aspek | Sistem Konvensional / Sejenis | Arumanis |
|-------|-------------------------------|----------|
| **Cakupan fungsi** | Fokus tunggal (hanya SPAM atau hanya monitoring proyek) | **Satu data** air minum, sanitasi, aset SPAM, proyek, dan pengawasan lapangan |
| **Arsitektur aplikasi** | Monolith atau spreadsheet terpusat | **Frontend modern (React)** + **API terpisah (Laravel)** — skalabel dan mudah dikembangkan |
| **Pengawasan lapangan** | Aplikasi terpisah tanpa SSO | **Panel Pengawasan terintegrasi** dengan SSO token handoff dari Arumanis utama |
| **Visualisasi publik** | Laporan statis | **Peta capaian SPM interaktif** di halaman landing untuk transparansi masyarakat |
| **Dokumentasi progres** | Upload foto tanpa metadata | **Slot foto 0%–100%** dengan **koordinat GPS** dan sinkronisasi dua arah ke modul pusat |
| **Manajemen kendala** | Komunikasi informal | **Sistem tiket** berstatus dengan notifikasi broadcast |
| **Keamanan akses** | Password bersama / tanpa role | **Role & permission granular** (admin, operator, viewer, pengawas) |
| **Analisis data** | Manual | **Ami AI** — asisten analisis berbasis data operasional |

### Unsur Pembaruan (Update/Upgrade)

Arumanis merupakan **pengembangan dan integrasi** dari praktik pelaporan manual yang telah berjalan, dengan pembaruan berikut:

1. **Modul SPAM Unit terdigitalisasi** — CRUD unit SPAM, capaian SPM per tahun, data POKMAS, dan rencana anggaran dengan validasi server-side.
2. **Impor data massal** — Migrasi data historis dari Excel/CSV ke database terstruktur.
3. **API publik capaian SPM** — Endpoint `/api/public/spam-units/stats` dan `/api/public/spam-units/map-stats` untuk halaman landing tanpa autentikasi.
4. **Peta choropleth Leaflet** — Visualisasi persentase capaian SR per desa di Kabupaten Cianjur dengan animasi dan popup informatif.
5. **Sinkronisasi progres estimasi** — Data Panel Pengawasan dan modul Puspen Arumanis tersinkron dua arah (`PekerjaanProgressEstimasiSyncService`).
6. **SSO Panel Pengawasan** — Satu akun api amis untuk dua aplikasi; pengawas tidak perlu login ganda.
7. **Pelaporan error terkontrol** — Halaman publik tidak membebani sistem pelaporan error internal (graceful degradation).
8. **Role-based wilayah** — Operator hanya dapat mengelola data di wilayah kerjanya.

---

## F. Tahapan Inovasi

### 1. Tahap Persiapan dan Penciptaan Produk

| Tahap | Kegiatan |
|-------|----------|
| **Analisis kebutuhan** | Identifikasi permasalahan data SPAM, proyek, dan pengawasan lapangan bersama unit teknis dan bidang terkait. |
| **Perancangan sistem** | Desain arsitektur frontend (Arumanis) + backend API (apiamis), skema database, dan alur SSO Panel Pengawasan. |
| **Pengembangan modul** | Iterasi fitur: pekerjaan, SPAM unit, dashboard, panel pengawasan, notifikasi, peta, landing publik. |
| **Migrasi data** | Impor data unit SPAM dan capaian historis melalui template CSV/Excel. |
| **Uji coba terbatas** | Pilot dengan operator kantor dan pengawas terpilih; perbaikan berdasarkan umpan balik. |
| **Go-live** | Deploy ke `arumanis.cianjur.space` dan `apiamis.cianjur.space`; sosialisasi pengguna. |

### 2. Tahap Pemanfaatan — Arumanis Utama (Admin/Operator/Kantor)

```
Login (/sign-in)
    ↓
Dashboard — lihat ringkasan KPI fisik, keuangan, dan SPAM
    ↓
Modul sesuai peran:
    • Pekerjaan & Kegiatan — kelola paket pembangunan
    • SPAM Unit (/spam-unit) — kelola unit, capaian SPM, anggaran
    • Users & Akses — kelola pengguna, role, impersonate pengawas
    • Notifikasi — broadcast pengumuman ke pengguna terkait
    ↓
Ekspor laporan PDF/Excel sesuai kebutuhan
```

**Langkah singkat modul SPAM Unit:**

1. Buka menu **Aset & Capaian SPAM** (`/spam-unit`).
2. Gunakan filter kecamatan/desa/tahun untuk menemukan unit.
3. **Tambah/Edit unit** — isi data desa, kapasitas, POKMAS, status SIMSPAM.
4. Buka **detail unit** → tab **Achievements** → catat capaian SR, KK, jiwa per tahun.
5. Tab **Budgets** → catat rencana anggaran dan sumber dana.
6. Alternatif: **Import** data massal dari file CSV/Excel.

### 3. Tahap Pemanfaatan — Panel Pengawasan (Pengawas Lapangan)

```
Login via Arumanis (/sign-in) — SSO otomatis
    ↓
Redirect ke Panel Pengawasan (/pengawasan/)
    ↓
Dashboard — KPI paket, deviasi, status foto
    ↓
Buka detail pekerjaan:
    • Tab Output & Penerima — verifikasi target
    • Tab Foto — unggah dokumentasi slot 0%–100% + GPS
    • Tab Progress — isi estimasi fisik/keuangan
    • Tab Tiket — laporkan kendala lapangan
    ↓
Buat Laporan Mingguan — RAB rencana & realisasi
    ↓
Notifikasi — pantau update status via lonceng
```

> Pengawas **tidak memiliki form login terpisah**. Jika sesi habis (401), gunakan **Masuk ulang** yang mengarahkan kembali ke Arumanis.

### 4. Tahap Pemanfaatan — Masyarakat/Publik

```
Akses halaman landing Arumanis (tanpa login)
    ↓
Scroll ke bagian Capaian SPM
    ↓
Lihat peta choropleth Kabupaten Cianjur
    ↓
Klik desa pada peta → popup menampilkan persentase capaian
    ↓
Akses panduan publik di /publikasi atau pusat bantuan
```

### 5. Tahap Pemeliharaan dan Pengembangan Berkelanjutan

| Kegiatan | Frekuensi |
|----------|-----------|
| Pembaruan data capaian SPM periode berjalan | Triwulan / tahunan |
| Evaluasi KPI sistem (uptime, akurasi data, adopsi pengguna) | Triwulan |
| Penambahan fitur berdasarkan kebutuhan operasional | Sesuai roadmap |
| Pelatihan pengguna baru (operator & pengawas) | Setiap ada perubahan signifikan |
| Backup database dan audit keamanan | Berkala |

---

## Lampiran

| Dokumen | Lokasi |
|---------|--------|
| Panduan pengguna modul SPAM Unit | `docs/user-guide/spam-unit.md` |
| Panduan Panel Pengawasan | `docs/user-guide/pengawas-panel.md` |
| Glosarium istilah | `docs/user-guide/glosarium.md` |
| Panduan publik (Docsify) | `public/docs/README.md` |

---

> **Versi Dokumen:** 1.1  
> **Terakhir diperbarui:** 26 Juni 2026  
> **Sumber data kuantitatif:** Basis data operasional api amis (snapshot 26/06/2026)  
> **Penanggung jawab:** Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur