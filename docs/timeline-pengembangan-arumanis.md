# Timeline Pengembangan Arumanis

**Periode:** Januari – April 2024 (bulan ke-1 sampai ke-4)  
**Instansi:** Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur  
**Produk:** Arumanis (lini: SandB pilot → AMS Pro prototipe → platform final)

Empat bulan pertama adalah **satu kesatuan tahap pembuatan**: analisis, pengembangan pilot, prototipe, dan **uji coba berulang** berjalan berlapis sepanjang Januari–April. **Penetapan dan implementasi awal** resmi di lingkungan Dinas ditetapkan pada **April 2024**, setelah verifikasi hasil uji coba.

> Catatan sumber: timeline direkonstruksi dari `LINEAGE.md`, `docs/rancang_bangun_inovasi.md`, dan `platform-changelog.ts`.

---

## Tabel Tahapan Kegiatan (format Gantt)

Legenda: `■` = kegiatan berjalan pada minggu tersebut | `·` = tidak aktif

| Tahapan Kegiatan | Jan 1 | 2 | 3 | 4 | Feb 1 | 2 | 3 | 4 | Mar 1 | 2 | 3 | 4 | Apr 1 | 2 | 3 | 4 |
|------------------|:-----:|:-:|:-:|:-:|:-----:|:-:|:-:|:-:|:-----:|:-:|:-:|:-:|:-----:|:-:|:-:|:-:|
| Analisis kebutuhan dan inventarisasi data manual | ■ | ■ | ■ | ■ | ■ | · | · | · | · | · | · | · | · | · | · | · |
| Pembuatan sistem (SandB, AMS Pro, modul inti) **termasuk uji coba berulang** | · | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | · |
| Uji coba internal operator & pengawas (bagian siklus pembuatan) | · | · | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | · |
| Verifikasi dan evaluasi hasil uji coba | · | · | · | · | · | · | · | · | · | ■ | ■ | ■ | ■ | ■ | · | · |
| **Penetapan dan implementasi awal di Dinas** | · | · | · | · | · | · | · | · | · | · | · | · | ■ | ■ | ■ | ■ |

---

## Ringkasan Empat Bulan Pertama

| Bulan | Fokus utama | Output kunci |
|-------|-------------|--------------|
| **1 · Januari 2024** | Analisis kebutuhan & inventarisasi data | Dokumen kebutuhan v0.1, awal uji coba konsep |
| **2 · Februari 2024** | Pembuatan pilot SandB + uji coba impor | Skema wilayah, capaian sanitasi percobaan |
| **3 · Maret 2024** | Pembuatan AMS Pro + uji coba modul | ERD awal, prototipe monolith, CRUD pekerjaan |
| **4 · April 2024** | **Penetapan & implementasi awal** | BA penetapan, prototipe dipakai operator, roadmap API/SPA |

---

## Bulan 1 · Januari 2024

**Tema:** Persiapan dan penciptaan fondasi konsep

### Kegiatan

1. Rapat koordinasi bidang air minum dan sanitasi DISPERKIM: pemetaan alur pelaporan manual (Excel, berkas fisik, WhatsApp).
2. Inventarisasi data yang sudah ada: unit SPAM, capaian SR/KK, paket pekerjaan pembangunan, dokumentasi foto lapangan.
3. Penyusunan daftar kebutuhan fungsional prioritas: master wilayah, pekerjaan, kontrak, foto ber-GPS, laporan progres.
4. Studi referensi SIMSPAM Kementerian PUPR dan pilot database sanitasi (fork SandB).
5. Penunjukan tim pengembang dan operator pendamping (belum penetapan implementasi sistem).

### Deliverable

- Dokumen analisis kebutuhan (versi 0.1)
- Daftar modul target fase pilot
- Keputusan awal: bangun sistem web berbasis database terpusat

---

## Bulan 2 · Februari 2024

**Tema:** Pembuatan pilot database sanitasi (era SandB) + uji coba awal

### Kegiatan

1. Setup lingkungan pengembangan lokal (Laravel, MySQL, Laragon).
2. Implementasi tabel master kecamatan dan desa Kabupaten Cianjur (365 desa).
3. Form input capaian sanitasi per desa (percobaan dengan data sampel).
4. Validasi pola data wilayah bersama operator bidang sanitasi.
5. Uji impor data dari file Excel existing ke struktur database (masih bagian pembuatan, bukan go-live).

### Deliverable

- Repo pilot SandB (fork) dengan CRUD wilayah dan capaian sanitasi dasar
- Template impor CSV/Excel wilayah
- Catatan kendala: data historis tidak konsisten antar sumber

---

## Bulan 3 · Maret 2024

**Tema:** Pembuatan prototipe AMS Pro + uji coba modul

### Kegiatan

1. Perluasan cakupan dari sanitasi saja ke program air minum dan sanitasi terpadu.
2. Perancangan ERD: kegiatan → pekerjaan → kontrak → penyedia → penerima.
3. Prototipe aplikasi monolith Laravel + Inertia.js + React (nama kerja: AMS Pro).
4. Login email/password dan pembagian role awal (admin, operator, viewer).
5. Halaman daftar pekerjaan dan form tambah pekerjaan (field pagu, lokasi, tahun anggaran).
6. Uji coba modul bersama operator: input data nyata dan catatan perbaikan.

### Deliverable

- Repo AMS Pro (prototipe monolith) versi 0.1
- Modul auth dan RBAC dasar
- Modul pekerjaan (CRUD) + hasil uji coba internal tahap pertama

---

## Bulan 4 · April 2024

**Tema:** Verifikasi uji coba, **penetapan**, dan **implementasi awal**

April 2024 bukan hanya evaluasi teknis. Bulan ini menjadi titik **penetapan keputusan implementasi awal**, pemberlakuan prototipe AMS Pro untuk operator terpilih, dan persetujuan roadmap pemisahan API (apiamis) dan frontend (arumanis).

### Kegiatan

1. Uji coba lanjutan dengan 2–3 operator kantor: input paket pekerjaan nyata dari satu bidang.
2. Percobaan unggah foto dokumentasi ke pekerjaan (tanpa validasi GPS ketat).
3. Sesi feedback pengawas lapangan: kebutuhan laporan mingguan dan akses mobile-friendly.
4. Verifikasi hasil uji coba dan evaluasi performa monolith.
5. **Penetapan keputusan implementasi awal** prototipe AMS Pro di lingkungan Dinas.
6. Penyusunan rekomendasi arsitektur Mei 2024+: pisahkan API Laravel (apiamis) dan SPA React (arumanis).

### Deliverable

- **Berita acara penetapan / implementasi awal (April 2024)**
- Laporan evaluasi pilot internal
- Daftar perbaikan UX dari umpan balik operator
- Roadmap kuartal II 2024: modul kontrak, foto, progress spreadsheet, panel pengawasan terpisah

---

## Pencapaian Kumulatif (akhir April 2024)

| Aspek | Status |
|-------|--------|
| Master data wilayah | Teruji di pilot |
| Modul pekerjaan | Prototipe jalan di AMS Pro |
| Uji coba internal | Selesai (Jan–Apr, bagian pembuatan) |
| **Penetapan implementasi awal** | **April 2024** |
| Modul kontrak | Belum, direncanakan Q2 2024 |
| Panel pengawasan SSO | Belum, konsep disetujui |
| Landing publik SPM | Belum, fase platform final |
| Produksi `arumanis.cianjur.space` | Belum go-live (2025–2026) |

---

## Lanjutan Setelah April 2024

| Periode | Era | Perkembangan utama |
|---------|-----|-------------------|
| Mei–Des 2024 | AMS Pro | Modul kontrak, foto, berkas, progress Handsontable, chat |
| 2025 | Migrasi platform | Pemisahan arumanis (SPA+BFF) + apiamis (API) |
| Des 2025 | v0.4.0 | Dashboard, peta, modul inti stabil |
| 2026 | v0.5.0 | Landing publik, Drive, ONLYOFFICE, SSO pengawas matang |

---

**Versi dokumen:** 1.1  
**Dibuat:** Juli 2026  
**Regenerasi DOCX:** `bun scripts/generate-timeline-docx.mjs`