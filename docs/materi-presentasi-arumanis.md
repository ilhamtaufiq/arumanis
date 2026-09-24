# Materi Presentasi Inovasi — Arumanis

**Aplikasi Satu Data Air Minum dan Sanitasi (Air Limbah) Kabupaten Cianjur**

Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur
Wilayah: 33 kecamatan · 365 desa/kelurahan
Data live: snapshot 8 Juli 2026 (API apiamis.cianjur.space)

---

## 1. Latar Belakang

### 1.1 Permasalahan

**Fragmentasi data.** Data unit SPAM air minum, infrastruktur sanitasi air limbah (SPALDT/SPALDS/IPLT), capaian SPM (SR/KK/jiwa), progres fisik pekerjaan, dan dokumentasi lapangan tersebar di **4–6 format berbeda** — Excel, PDF, WhatsApp, dan berkas fisik. Tidak ada *single source of truth*. Bukti nyata: dua aplikasi legacy terpisah — `sandb` (Database Sanitasi, 2022) dan `amspro` (AMS Pro, 2024–2025) — keduanya belum terpadu dengan data capaian SPM unit.

**Monitoring buta.** Pengawasan proyek infrastruktur air minum bergantung pada laporan berkala berbasis dokumen. Deviasi fisik dan keuangan baru teridentifikasi setelah keterlambatan signifikan.

**Kesenjangan capaian mencolok.** Target layanan air minum **534.952 KK**, capaian terintegrasi baru **13,26%**; di sisi sanitasi air limbah, dari target **507.000 KK** baru tercapai **1,92%** (gap **497.281 KK**). Tanpa sistem terpadu, perencanaan intervensi prioritas desa mustahil dilakukan secara proporsional.

**Tuntutan transparansi.** Masyarakat menuntut akses capaian layanan air minum yang dapat dipertanggungjawabkan; publikasi data masih ad hoc.

**Transformasi digital tertunda.** Reformasi birokrasi menuntut integrasi layanan digital lintas unit kerja, namun belum ada platform khusus yang menggabungkan data aset SPAM, pelaksanaan pekerjaan, dan pengawasan lapangan.

### 1.2 Tujuan Inovasi

| Kode | Tujuan (SMART) | Indikator | Target Waktu |
|------|----------------|-----------|--------------|
| T1 | Menyatukan data unit SPAM, infrastruktur sanitasi, capaian SPM, dan proyek dalam satu basis data terintegrasi | Jumlah unit SPAM & infrastruktur sanitasi terdigitalisasi | ≥ 360 unit (Des 2026) — **tercapai 364 unit + 167 infra sanitasi** |
| T2 | Meningkatkan akurasi & kecepatan rekapitulasi SPM air minum per desa | Waktu rekapitulasi lintas desa | < 1 hari kerja (Jun 2026) — **tercapai 2,3 detik** |
| T3 | Mempercepat monitoring 426+ paket pekerjaan infrastruktur | Interval update progres; foto ber-GPS | Mingguan; ≥ 90% foto ber-GPS |
| T4 | Menyediakan akses informasi capaian SPM terbuka kepada masyarakat | Peta publik 365 desa, 24/7 tanpa login | Jun 2026 — **tercapai** |
| T5 | Mendukung transformasi digital SPBE program air minum & sanitasi | Adopsi pengguna; modul SSO | ≥ 80% pengguna target |
| T6 | Menguatkan evaluasi kinerja unit SPAM desa (POKMAS, kapasitas, anggaran) | Profil unit lengkap; record achievement | ≥ 95% unit + ≥ 1 record/tahun |

**Narasi tujuan:** Arumanis menjadi **satu sumber data (single source of truth)** penyelenggaraan air minum **dan** sanitasi air limbah Cianjur — dari aset unit SPAM/infrastruktur sanitasi dan capaian SPM hingga pelaksanaan dan pengawasan proyek — sejalan **SDGs 6**, **RPJMD 2025–2029**, dan **RISPAM**.

---

## 2. Kondisi Sebelum dan Sesudah (didukung data)

### 2.1 Sebelum Arumanis (Era Manual/Fragmentasi)

| Proses | Kondisi | Waktu |
|--------|---------|-------|
| Sumber data SPAM & proyek | 4–6 format terpisah (Excel, PDF, WA, fisik, sandb, amspro) | — |
| Rekapitulasi capaian SPM 365 desa | Input manual lintas spreadsheet | **5–10 hari kerja** |
| Unit SPAM terdigitalisasi | Estimasi < 50% desa | — |
| Monitoring paket pekerjaan | Tidak terstandar, per berkas | — |
| Interval update progres ke kantor | Laporan dokumen via WA/fisik | **2–4 minggu** |
| Dokumentasi foto progres | Tersebar di perangkat pengawas, tanpa GPS | — |
| Identifikasi deviasi fisik/keuangan | Setelah laporan bulanan | **> 30 hari terlambat** |
| Impor data SPAM massal | Input manual per baris | **3–5 hari** |
| Ekspor laporan PDF/Excel | Rekapitulasi manual | **1–2 hari per periode** |
| Koordinasi pengawas–kantor | Telepon/WA tanpa jejak audit | Tidak terlacak |

### 2.2 Sesudah Arumanis (Terintegrasi, Real-Time, Terukur)

| Proses | Kondisi | Waktu | Perubahan |
|--------|---------|-------|-----------|
| Sumber data SPAM & proyek | **1 platform terintegrasi** (Arumanis + apiamis) | — | 4→1 sumber |
| Rekapitulasi capaian SPM 365 desa | Agregasi otomatis via API | **< 1 hari** (median **2,3 detik**) | **98,7% lebih cepat** |
| Unit SPAM terdigitalisasi | **364 unit** satu basis data | — | < 50% → **99,7%** cakupan desa |
| Infrastruktur sanitasi (SPALDT/SPALDS/IPLT) | **167 unit** terdata + pemanfaat | — | Tersebar → terpusat |
| Monitoring paket pekerjaan | **558 pekerjaan / 426 paket** | — | 0 → 558 |
| Interval update progres ke kantor | Panel Pengawasan + sinkronisasi Puspen | **Mingguan** (median **12 hari**) | **42,9% lebih cepat** |
| Dokumentasi foto progres | **6.787 foto** terindeks GPS (slot 0–100%) | — | Tersebar → terpusat + GPS |
| Identifikasi deviasi fisik/keuangan | Dashboard KPI & deviasi real-time | **Real-time** | > 30 hari → real-time |
| Impor data SPAM massal | Impor CSV (`spam:import-data`) | **< 2 jam** | 3–5 hari → < 2 jam |
| Ekspor laporan PDF/Excel | Generate otomatis dari modul laporan | **< 30 menit** | 1–2 hari → < 30 menit |
| Koordinasi pengawas–kantor | SSO, notifikasi broadcast, sistem tiket | Terlacak | Tidak terlacak → terdokumentasi |

### 2.3 Efisiensi Terukur (data live)

```
WAKTU REKAPITULASI SPM
Sebelum: ████████████████████████  7,5 hari kerja
Sesudah:  █                       2,3 detik
Efisiensi:                      98,7%

INTERVAL LAPORAN PROGRES
Sebelum: ████████████████████████████  21 hari
Sesudah: ████████████████  12 hari
Efisiensi:                      42,9%
```

**Sumber:** Pengukuran live API (median 5 trial rantai `GET /spam-units/stats` + `/spm-sanitasi/stats` + `/dashboard/stats` = 2.297 ms) + audit log Progress. Baseline "sebelum" direkonstruksi dari artefak repo legacy publik (`sandb`, `amspro`).

---

## 3. Keunggulan dan Kebaruan Inovasi

### 3.1 Perbandingan dengan Inovasi Sejenis

| Aspek | Sistem Konvensional / Sejenis | **Arumanis** |
|-------|-------------------------------|--------------|
| Cakupan fungsi | Fokus tunggal (hanya SPAM air minum, atau hanya sanitasi, atau hanya monitoring) | **Satu data**: air minum, sanitasi air limbah, aset, proyek, pengawasan |
| Arsitektur | Monolith atau spreadsheet terpusat | **React SPA + Laravel API** — skalabel, terpisah |
| Pengawasan lapangan | Aplikasi terpisah tanpa SSO | **Panel Pengawasan terintegrasi** SSO token handoff |
| Visualisasi publik | Laporan statis | **Peta choropleth interaktif** 365 desa, publik, tanpa login |
| Dokumentasi progres | Upload foto tanpa metadata | **Slot foto 0–100% + koordinat GPS** + sinkronisasi dua arah |
| Manajemen kendala | Komunikasi informal | **Sistem tiket berstatus** + notifikasi broadcast |
| Keamanan akses | Password bersama / tanpa role | **Role & permission granular** (admin, operator, viewer, pengawas) |
| Analisis data | Manual pivot tabel | **Ami AI** — asisten analisis berbasis data operasional |

### 3.2 Unsur Pembaruan (8 Inovasi Teknis)

1. Modul SPAM Unit terdigitalisasi — CRUD + validasi server-side
2. Impor data massal — migrasi Excel/CSV ke database terstruktur
3. API publik capaian SPM — endpoint tanpa autentikasi untuk landing page
4. Peta choropleth Leaflet — visualisasi capaian SR per desa
5. Sinkronisasi progres estimasi — dua arah Panel Pengawasan ↔ Puspen
6. SSO Panel Pengawasan — satu akun untuk dua aplikasi
7. Pelaporan error terkontrol — graceful degradation halaman publik
8. Role-based wilayah — operator hanya mengelola wilayah kerjanya

---

## 4. Hasil yang Dicapai (Output)

| # | Hasil | Data |
|---|-------|------|
| H1 | Platform Arumanis Utama | Produksi: `arumanis.cianjur.space` |
| H2 | Panel Pengawasan Terintegrasi | Route `/pengawasan` — SSO dari Arumanis |
| H3 | Backend API (apiamis) | Produksi: `apiamis.cianjur.space` |
| H4 | Basis Data Terintegrasi SPAM–SPM & Sanitasi | **364 unit** · **167 infra sanitasi** · **512 achievement** · **365 desa** |
| H5 | Halaman Publik Capaian SPM | Peta choropleth 365 desa, akses 24/7 tanpa login |
| H6 | Modul SPAM Unit | CRUD unit, capaian SPM, POKMAS, anggaran, impor CSV |
| H7 | Modul Monitoring Pekerjaan & Puspen | **558 pekerjaan / 426 paket** terdata |
| H8 | Repositori Dokumentasi Lapangan | **6.787 berkas** foto terindeks GPS |
| H9 | Sistem Notifikasi & Tiket | Broadcast pengumuman + tiket berstatus |
| H10 | Dokumentasi Pengguna | Panduan operator, pengawas, publik |

### Data Capaian Terkini (snapshot live, 8 Juli 2026)

| Indikator | Nilai |
|-----------|-------|
| Unit SPAM terdata | **364 unit** (33 SIMSPAM · 331 non-SIMSPAM) |
| Desa terpetakan capaian SPM | **365 desa** (≈ 99,7% cakupan) |
| Target KK (master desa) | **534.952 KK** |
| Capaian SR / KK | **53.265** |
| Capaian jiwa terlayani | **266.229 jiwa** |
| Capaian BJP (KK) | **17.682 KK** |
| Persentase capaian SPM | **13,26%** |
| Record capaian tahunan | **512 entri** |
| Nilai kontrak SPAM | **Rp 92,3 Miliar** |
| Paket pekerjaan terpantau | **426 paket** (total 558 pekerjaan) |
| Dokumentasi foto progres | **6.787 berkas** |
| Total pagu pekerjaan | **Rp 95,3 Miliar** |
| Pengawas aktif | **29 pengawas** (11 pengawas + 6 konsultan) |
| Infrastruktur sanitasi | **167 unit** (56 SPALDT · 107 SPALDS · 1 IPLT) |
| Pemanfaat sanitasi | **9.719 KK / 48.595 jiwa** |
| Cakupan sanitasi | **1,92%** (gap 497.281 KK) |

### Trend Capaian Tahunan

| Tahun | Records | KK Terlayani | Jiwa Terlayani | SR |
|-------|---------|-------------|---------------|-----|
| 2020 | 63 | 13.125 | 65.607 | 13.125 |
| 2021 | 59 | 10.696 | 53.433 | 10.696 |
| 2022 | 61 | 10.312 | 51.546 | 10.312 |
| 2023 | 55 | 5.920 | 29.601 | 5.920 |
| 2024 | 192 | 5.093 | 25.479 | 5.093 |
| 2025 | 71 | 7.552 | 37.828 | 7.552 |
| 2026 | 9 | 118 | 572 | 134 |

---

## 5. Manfaat yang Dirasakan (didukung data)

### Bagi Pemerintah Daerah (DPKP Cianjur)

| Manfaat | Data Pendukung |
|---------|----------------|
| Pengambilan keputusan lebih cepat | Rekapitulasi SPM dari 5–10 hari → **< 1 hari**; **365 desa** terpetakan |
| Efisiensi administrasi | Impor massal dari 3–5 hari → **< 2 jam**; **364 unit** tanpa rekap manual |
| Akuntabilitas anggaran | **Rp 92,3 Miliar** nilai kontrak SPAM terkonsolidasi; **426 paket** terpantau deviasinya |
| Penguatan SPBE | Satu akun SSO untuk 2 aplikasi; koordinasi terdokumentasi |
| Perencanaan berbasis data | Gap SPM per kecamatan/desa dihitung otomatis untuk Renja/RKPD |

### Bagi Masyarakat

| Manfaat | Data Pendukung |
|---------|----------------|
| Transparansi 24/7 | Akses capaian SPM desa tanpa login ke `arumanis.cianjur.space` |
| Partisipasi POKMAS | **364 unit** memiliki repositori data pengelola dan capaian multi-tahun |
| Kredibilitas pembangunan | **6.787 foto** progres ber-GPS memperkuat verifikabilitas lapangan |

### Bagi Pelaksana Teknis (Operator, Pengawas, TFL)

| Manfaat | Data Pendukung |
|---------|----------------|
| Beban administratif berkurang | Satu platform menggantikan beberapa Excel dan chat |
| Pengawasan terstruktur | Slot foto 0–100%, laporan mingguan RAB, tiket kendala |
| Analisis data tanpa query manual | Ami AI — respons pertanyaan standar **< 1 menit** |

---

## 6. Studi Kasus (real-time monitoring nyata)

**Paket Sanitasi (Air Limbah) — Desa Bojong, Kec. Karangtengah**
- Pagu: **Rp 350 Juta** (DAK 2025) · Output: tangki septik 36 KK
- Dokumentasi: **400 foto**
- Penyedia: TPS KSM Bojong Sauyunan

**Paket Air Minum — Desa Wargaasih, Kec. Kadupandak**
- Pagu: **Rp 300 Juta** (PAD 2026) · Output: SPAM jaringan perpipaan
- Dokumentasi: **38 foto**
- Penyedia: CV. Citarum Raya

Kedua paket termonitor real-time: progres fisik, foto ber-GPS, deviasi keuangan, dan status dokumentasi dalam satu dashboard.

---

## 7. Penutup

> **Dari 5–10 hari menjadi 2,3 detik.**

1. **Integrasi** — 364 unit SPAM, 167 infrastruktur sanitasi, 426 paket pekerjaan, 6.787 foto progres dalam satu platform
2. **Transparansi** — Peta capaian SPM 365 desa terbuka untuk masyarakat, 24/7, tanpa login
3. **Akuntabilitas** — Monitoring real-time **Rp 95,3 Miliar** pagu pekerjaan dengan deviasi terdeteksi langsung

**URL Produksi:** [arumanis.cianjur.space](https://arumanis.cianjur.space) · API: [apiamis.cianjur.space](https://apiamis.cianjur.space)

**Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur**

---

> **Catatan data:** Angka kuantitatif bersumber dari data live API apiamis (snapshot 8 Juli 2026, `docs/kemanfaatan-live-data.json`, `docs/proposal-live-data.json`) dan pengukuran efisiensi live (`docs/efficiency-baseline-live.json`, 13 Juli 2026). Data sanitasi air limbah (SPALDT/SPALDS/IPLT, pemanfaat, coverage) diambil dari blok `sanitasi` pada snapshot yang sama. Untuk demo langsung: login `ilhamtaufiq@gmail.com` ke `arumanis.cianjur.space`, buka Dashboard (KPI live), modul SPAM Unit (364 unit), modul SPM Sanitasi (infrastruktur air limbah), dan Peta Publik (choropleth 365 desa).
