# Deck Paparan Inovasi — Arumanis

---

## SLIDE 1 — Pembuka

# Arumanis
### Aplikasi Satu Data Air Minum dan Sanitasi

**Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur**

> 33 kecamatan · 365 desa/kelurahan · 364 unit SPAM terdata

---

## SLIDE 2 — Hook

### Bayangkan 365 desa. 364 unit SPAM. Satu pertanyaan:

**"Berapa persen sebenarnya capaian air minum layak di Cianjur?"**

Sebelum Arumanis, jawaban atas pertanyaan ini memakan waktu **5–10 hari kerja** — rekap dari Excel, WhatsApp, PDF, dan berkas fisik yang tersebar di berbagai pihak.

Hari ini? **2,3 detik.**

---

## SLIDE 3 — Latar Belakang: Permasalahan

### Masalah yang Tidak Bisa Diabaikan Lagi

**Fragmentasi data.** Operator harus input ulang data yang sama ke 4–6 format berbeda: Excel, PDF, WhatsApp, dan berkas fisik. Tidak ada *single source of truth*.

**Monitoring buta.** Pengawasan proyek infrastruktur air minum bergantung pada laporan berkala berbasis dokumen. Deviasi fisik dan keuangan baru teridentifikasi setelah keterlambatan signifikan.

**Kesenjangan capaian mencolok.** Target layanan: **534.952 KK**. Capaian terintegrasi baru **13,2%** — tanpa sistem terpadu, perencanaan intervensi prioritas desa mustahil dilakukan secara proporsional.

**Tuntutan transparansi.** Masyarakat menuntut akses informasi capaian layanan air minum yang dapat dipertanggungjawabkan. Publikasi data masih bersifat ad hoc.

**Transformasi digital tertunda.** Reformasi birokrasi menuntut integrasi layanan digital lintas unit kerja, namun belum tersedia platform khusus yang menggabungkan data aset SPAM, pelaksanaan pekerjaan, dan pengawasan lapangan.

---

## SLIDE 4 — Latar Belakang: Isu Strategis

### Arumanis Menjawab Isu yang Lebih Besar

| Level | Isu | Keterkaitan |
|-------|-----|-------------|
| **Global** | SDGs 6: Air Bersih dan Sanitasi Layak | Monitoring SR/KK/jiwa terlayani per desa |
| **Global** | SDGs 9: Industri, Inovasi, Infrastruktur | Platform digital tata kelola proyek |
| **Nasional** | Asta Cita: Pembangunan Merata | Pemetaan capaian SPM per desa |
| **Nasional** | Penurunan Stunting | Air minum layak = prasyarat sanitasi rumah tangga |
| **Lokal** | RPJMD Cianjur 2025–2029 | Peningkatan akses air minum layak |
| **Lokal** | RAD PAMSIMAS 2019–2023 | Peningkatan layanan air minum perdesaan |

**Isu strategis utama:** SDGs 6 — Air Bersih dan Sanitasi Layak, diperkuat RPJMD 2025–2029 dan RISPAM.

---

## SLIDE 5 — Kondisi Sebelum

### Era Pra-Arumanis: Fragmentasi dan Manual

| Proses | Kondisi | Waktu |
|--------|---------|-------|
| **Sumber data SPAM & proyek** | 4–6 format terpisah (Excel, PDF, WA, berkas fisik, sandb, amspro) | — |
| **Rekapitulasi capaian SPM 365 desa** | Input manual lintas spreadsheet, validasi silang, rapikan | **5–10 hari kerja** |
| **Unit SPAM terdigitalisasi** | Estimasi <50% desa, tersebar di berkas/Excel per kecamatan | — |
| **Monitoring paket pekerjaan** | Tidak terstandar, per berkas masing-masing | — |
| **Interval update progres ke kantor** | Laporan dokumen via WhatsApp/fisik | **2–4 minggu** |
| **Dokumentasi foto progres** | Tersebar di perangkat pengawas, tanpa koordinat GPS | — |
| **Identifikasi deviasi fisik/keuangan** | Setelah laporan bulanan | **> 30 hari terlambat** |
| **Impor data SPAM massal** | Input manual per baris | **3–5 hari** |
| **Ekspor laporan PDF/Excel** | Rekapitulasi manual | **1–2 hari per periode** |
| **Koordinasi pengawas–kantor** | Telepon/WA tanpa jejak audit | Tidak terlacak |

**Bukti fragmentasi:** Repo legacy `sandb` (Database Sanitasi, 2022) dan `amspro` (AMS Pro, 2024–2025) membuktikan dua aplikasi terpisah — belum terpadu SPM unit.

---

## SLIDE 6 — Kondisi Sesudah

### Era Arumanis: Terintegrasi, Real-Time, Terukur

| Proses | Kondisi | Waktu | Perubahan |
|--------|---------|-------|-----------|
| **Sumber data SPAM & proyek** | **1 platform terintegrasi** — Arumanis + apiamis | — | 4→1 sumber |
| **Rekapitulasi capaian SPM 365 desa** | Agregasi otomatis via API | **< 1 hari** (median **2,3 detik**) | **98,7% lebih cepat** |
| **Unit SPAM terdigitalisasi** | **364 unit** dalam satu basis data terstruktur | — | <50% → **99,7%** cakupan desa |
| **Monitoring paket pekerjaan** | **426 paket** dalam modul pekerjaan | — | 0 → 426 paket |
| **Interval update progres ke kantor** | Panel Pengawasan + sinkronisasi Puspen | **Mingguan** (median **12 hari**) | **42,9% lebih cepat** |
| **Dokumentasi foto progres** | **3.866 foto** terindeks GPS (slot 0%–100%) | — | Tersebar → terpusat + GPS |
| **Identifikasi deviasi fisik/keuangan** | Dashboard KPI & deviasi real-time | **Real-time** | >30 hari → real-time |
| **Impor data SPAM massal** | Fitur impor CSV (`spam:import-data`) | **< 2 jam** | 3–5 hari → <2 jam |
| **Ekspor laporan PDF/Excel** | Generate otomatis dari modul laporan | **< 30 menit** | 1–2 hari → <30 menit |
| **Koordinasi pengawas–kantor** | SSO, notifikasi broadcast, sistem tiket | Terlacak | Tidak terlacak → terdokumentasi |

---

## SLIDE 7 — Data Kuantitatif: Sebelum vs Sesudah

### Efisiensi Terukur

```
┌──────────────────────────────────────────────────────────┐
│  WAKTU REKAPITULASI SPM                                  │
│  Sebelum: ████████████████████████████████████  7,5 hari │
│  Sesudah:  █                                      2,3 detik│
│  Efisiensi:                                         98,7%│
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  INTERVAL LAPORAN PROGRES                                │
│  Sebelum: ████████████████████████████████  21 hari      │
│  Sesudah: ████████████████  12 hari                      │
│  Efisiensi:                                     42,9%   │
└──────────────────────────────────────────────────────────┘
```

**Sumber:** Live API measurement (median 5 trial rantai API) + audit log Progress. Metodologi: hibrida rekonstruksi proses × pengukuran live.

---

## SLIDE 8 — Keunggulan dan Kebaruan

### Apa yang Membuat Arumanis Berbeda?

| Aspek | Sistem Konvensional / Sejenis | **Arumanis** |
|-------|-------------------------------|--------------|
| **Cakupan fungsi** | Fokus tunggal (hanya SPAM atau hanya monitoring) | **Satu data** air minum, sanitasi, aset, proyek, pengawasan |
| **Arsitektur** | Monolith atau spreadsheet terpusat | **React SPA + Laravel API** — skalabel, terpisah |
| **Pengawasan lapangan** | Aplikasi terpisah tanpa SSO | **Panel Pengawasan terintegrasi** SSO token handoff |
| **Visualisasi publik** | Laporan statis | **Peta choropleth interaktif** 365 desa, publik, tanpa login |
| **Dokumentasi progres** | Upload foto tanpa metadata | **Slot foto 0%–100% + koordinat GPS** + sinkronisasi dua arah |
| **Manajemen kendala** | Komunikasi informal | **Sistem tiket berstatus** dengan notifikasi broadcast |
| **Keamanan akses** | Password bersama / tanpa role | **Role & permission granular** (admin, operator, viewer, pengawas) |
| **Analisis data** | Manual pivot tabel | **Ami AI** — asisten analisis berbasis data operasional |

### Unsur Pembaruan (8 Inovasi Teknis)

1. Modul SPAM Unit terdigitalisasi — CRUD + validasi server-side
2. Impor data massal — migrasi Excel/CSV ke database terstruktur
3. API publik capaian SPM — endpoint tanpa autentikasi untuk landing page
4. Peta choropleth Leaflet — visualisasi persentase capaian SR per desa
5. Sinkronisasi progres estimasi — dua arah antara Panel Pengawasan dan Puspen
6. SSO Panel Pengawasan — satu akun untuk dua aplikasi
7. Pelaporan error terkontrol — graceful degradation di halaman publik
8. Role-based wilayah — operator hanya mengelola wilayah kerjanya

---

## SLIDE 9 — Hasil yang Dicapai

### Produk dan Output Inovasi

| # | Hasil | Data |
|---|-------|------|
| **H1** | Platform Arumanis Utama | Produksi: `arumanis.cianjur.space` |
| **H2** | Panel Pengawasan Terintegrasi | Route `/pengawasan` — SSO dari Arumanis |
| **H3** | Backend API (apiamis) | Produksi: `apiamis.cianjur.space` |
| **H4** | Basis Data Terintegrasi SPAM–SPM | **364 unit** · **505 achievement** · **365 desa** |
| **H5** | Halaman Publik Capaian SPM | Peta choropleth 365 desa, akses 24/7 tanpa login |
| **H6** | Modul SPAM Unit | CRUD unit, capaian SPM, POKMAS, anggaran, impor CSV |
| **H7** | Modul Monitoring Pekerjaan & Puspen | **426 paket** pekerjaan terdata |
| **H8** | Repositori Dokumentasi Lapangan | **3.866 berkas** foto terindeks GPS |
| **H9** | Sistem Notifikasi & Tiket | Broadcast pengumuman + tiket berstatus |
| **H10** | Dokumentasi Pengguna | Panduan operator, pengawas, publik |

---

## SLIDE 10 — Dampak dan Manfaat Terukur

### Bagi Pemerintah Daerah (DPKP Cianjur)

| Manfaat | Data Pendukung |
|---------|----------------|
| **Pengambilan keputusan lebih cepat** | Rekapitulasi SPM dari 5–10 hari → <1 hari; **365 desa** terpetakan |
| **Efisiensi administrasi** | Impor massal dari 3–5 hari → <2 jam; **364 unit** tidak perlu rekap manual |
| **Akuntabilitas anggaran** | **Rp 90,5 Miliar** nilai kontrak SPAM terkonsolidasi; **426 paket** terpantau deviasinya |
| **Penguatan SPBE** | Satu akun SSO untuk 2 aplikasi; koordinasi terdokumentasi |
| **Perencanaan berbasis data** | Gap SPM per kecamatan/desa dihitung otomatis untuk Renja/RKPD |

### Bagi Masyarakat

| Manfaat | Data Pendukung |
|---------|----------------|
| **Transparansi 24/7** | Akses capaian SPM desa tanpa login ke `arumanis.cianjur.space` |
| **Partisipasi POKMAS** | **364 unit** memiliki repositori data pengelola dan capaian multi-tahun |
| **Kredibilitas pembangunan** | **3.866 foto** progres ber-GPS memperkuat verifikabilitas lapangan |

### Bagi Pelaksana Teknis (Operator, Pengawas, TFL)

| Manfaat | Data Pendukung |
|---------|----------------|
| **Beban administratif berkurang** | Satu platform menggantikan beberapa Excel dan chat |
| **Pengawasan terstruktur** | Slot foto 0%–100%, laporan mingguan RAB, tiket kendala |
| **Analisis data tanpa query manual** | Ami AI — respons pertanyaan standar <1 menit |

---

## SLIDE 11 — Data Capaian Terkini

### Angka yang Bicara (snapshot live data, Juli 2026)

| Indikator | Nilai |
|-----------|-------|
| **Unit SPAM terdata** | 364 unit (33 SIMSPAM · 331 non-SIMSPAM) |
| **Desa terpetakan capaian SPM** | 365 desa (≈ 99,7% cakupan) |
| **Target KK (master desa)** | 534.952 KK |
| **Capaian SR / KK** | 53.265 |
| **Capaian jiwa terlayani** | 266.229 jiwa |
| **Capaian BJP (KK)** | 17.682 KK |
| **Persentase capaian SPM** | **13,26%** |
| **Record capaian tahunan** | 512 entri |
| **Nilai kontrak SPAM** | **Rp 92,3 Miliar** |
| **Paket pekerjaan terpantau** | 426 paket (total 558 pekerjaan) |
| **Dokumentasi foto progres** | 6.787 berkas |
| **Total pagu pekerjaan** | **Rp 95,3 Miliar** |
| **Pengawas aktif** | 29 pengawas (11 pengawas + 6 konsultan) |
| **Infrastruktur sanitasi** | 167 unit (56 SPALDT · 107 SPALDS · 1 IPLT) |
| **Cakupan sanitasi** | 1,92% (gap 497.281 KK) |

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

## SLIDE 12 — Arsitektur Sistem

### Satu Ekosistem, Tiga Lapisan

```
  👤 Operator / Pengawas / Masyarakat
            │
            ▼
  ┌────────────────────┐     /bff/*      ┌─────────────────┐     REST      ┌──────────────┐
  │  React SPA         │ ──────────────► │  BFF (Hono/Bun) │ ────────────► │  APIAMIS     │
  │  arumanis.cianjur  │ ◄────────────── │  :8787          │ ◄──────────── │  Laravel     │
  └────────────────────┘  httpOnly cookie└─────────────────┘   Sanctum     └──────┬───────┘
                                                                                    │
                                                                              ┌─────▼──────┐
                                                                              │  MySQL ·   │
                                                                              │  Redis     │
                                                                              └────────────┘
```

**Platform tiga repo, satu versi:**
- **Arumanis** (frontend + BFF) — v0.8.0
- **APIAMIS** (backend Laravel) — v0.6.0
- **Panel Pengawasan** (lapangan, SSO) — v0.6.0

---

## SLIDE 13 — Timeline Pengembangan

### Dari Konsep ke Platform: Januari 2024 – Sekarang

| Periode | Era | Perkembangan |
|---------|-----|-------------|
| **Jan–Apr 2024** | SandB → AMS Pro | Analisis kebutuhan, pilot sanitasi, prototipe monolith, penetapan implementasi awal |
| **Mei–Des 2024** | AMS Pro | Modul kontrak, foto, berkas, progress Handsontable |
| **2025** | Migrasi platform | Pemisahan arumanis (SPA+BFF) + apiamis (API) |
| **Des 2025** | v0.4.0 | Dashboard, peta, modul inti stabil |
| **2026** | v0.5.0–v0.8.0 | Landing publik, Drive, ONLYOFFICE, SSO pengawas matang |

---

## SLIDE 14 — Studi Kasus

### Dua Paket Nyata yang Termonitor via Arumanis

**Paket Sanitasi — Desa Bojong, Kec. Karangtengah**
- **Pagu:** Rp 350 Juta (DAK 2025)
- **Foto dokumentasi:** 400 berkas
- **Output:** Tangki septik individual untuk 36 KK
- **Sumber dana:** DAK

**Paket Air Minum — Desa Wargaasih, Kec. Kadupandak**
- **Pagu:** Rp 300 Juta (PAD 2026)
- **Foto dokumentasi:** 38 berkas
- **Output:** SPAM jaringan perpipaan
- **Penyedia:** CV. Citarum Raya

Kedua paket termonitor secara real-time: progres fisik, foto ber-GPS, deviasi keuangan, dan status dokumentasi — semua dalam satu dashboard.

---

## SLIDE 15 — Penutup

### Arumanis: Satu Data. Satu Platform. Satu Cianjur.

> **Dari 5–10 hari menjadi 2,3 detik.**

Inovasi ini menjawab tiga kebutuhan mendasar:

1. **Integrasi** — 364 unit SPAM, 426 paket pekerjaan, 3.866 foto progres dalam satu platform
2. **Transparansi** — Peta capaian SPM 365 desa terbuka untuk masyarakat, 24/7, tanpa login
3. **Akuntabilitas** — Monitoring real-time Rp 95,3 Miliar pagu pekerjaan dengan deviasi terdeteksi langsung

**URL Produksi:** [arumanis.cianjur.space](https://arumanis.cianjur.space)  
**API:** [apiamis.cianjur.space](https://apiamis.cianjur.space)

**Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur**

---

> **Catatan:** Deck ini disusun dari data live API (snapshot Juli 2026) dan dokumen `docs/rancang_bangun_inovasi.md`, `docs/tujuan_manfaat_hasil.md`, `docs/efficiency-baseline-live.json`, `docs/kemanfaatan-live-data.json`.
