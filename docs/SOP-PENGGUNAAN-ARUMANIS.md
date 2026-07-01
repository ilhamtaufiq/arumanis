# SOP Penggunaan Arumanis & Panel Pengawasan

| Item | Nilai |
|:-----|:------|
| **Versi dokumen** | 1.0 |
| **Tanggal** | 1 Juli 2026 |
| **Platform** | Arumanis v0.5.0 |
| **Repo** | [arumanis](https://github.com/ilhamtaufiq/arumanis) · [pengawas](https://github.com/ilhamtaufiq/arumanis-pengawasan) |
| **Backend** | [apiamis](https://github.com/ilhamtaufiq/apiamis) |
| **Word** | `docs/SOP_PENGGUNAAN_ARUMANIS.docx` |
| **Excel** | `docs/SOP_PENGGUNAAN_ARUMANIS.xlsx` |

---

## Halaman Pengesahan

<table border="1" cellpadding="10" cellspacing="0" width="100%">
  <tr>
    <td colspan="2" align="center" width="55%">
      <strong>DINAS PEKERJAAN UMUM DAN TATA RUANG</strong><br>
      <strong>KABUPATEN CIANJUR</strong><br><br>
      <strong>BIDANG AIR MINUM DAN SANITASI</strong><br>
      SEKSI PERENCANAAN DAN PENGEMBANGAN SISTEM INFORMASI
    </td>
    <td width="45%" valign="top">
      <table border="0" cellpadding="4" width="100%">
        <tr><td align="right" width="42%"><strong>Nama SOP</strong></td><td>: SOP Penggunaan Arumanis &amp; Panel Pengawasan</td></tr>
        <tr><td align="right"><strong>Tgl Pembuatan</strong></td><td>: 1 Juli 2026</td></tr>
        <tr><td align="right"><strong>Tanggal Revisi</strong></td><td>: —</td></tr>
        <tr><td align="right"><strong>Tanggal Efektif</strong></td><td>: 1 Juli 2026</td></tr>
        <tr><td align="right"><strong>Disahkan oleh</strong></td><td>: Kepala Bidang Air Minum dan Sanitasi</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center" height="80">
      <strong>SOP PENGGUNAAN APLIKASI ARUMANIS</strong><br>
      <strong>DAN PANEL PENGAWASAN</strong>
    </td>
    <td align="center" valign="top">
      <strong>Tanda Tangan dan Stempel</strong><br><br><br><br>
    </td>
  </tr>
  <tr>
    <td valign="top" width="50%"><strong>Dasar Hukum</strong></td>
    <td valign="top" width="50%"><strong>Kualifikasi Pelaksana</strong></td>
  </tr>
  <tr>
    <td valign="top">
      1. Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik.<br>
      2. Peraturan Menteri Dalam Negeri Nomor 57 Tahun 2007 tentang Petunjuk Teknis Penataan Organisasi Perangkat Daerah.<br>
      3. Peraturan Bupati Cianjur tentang Standar Pelayanan Minimum Air Minum dan Sanitasi.<br>
      4. Keputusan Kepala Dinas terkait pembentukan SOP operasional sistem informasi ARUMANIS.
    </td>
    <td valign="top">
      1. Memahami tugas dan fungsi Bidang Air Minum dan Sanitasi.<br>
      2. Memahami alur kerja aplikasi ARUMANIS (<code>www/bun</code>) dan Panel Pengawasan (<code>www/pengawas</code>).<br>
      3. Admin/Operator: mampu mengelola master data, kontrak, dan akses.<br>
      4. Pengawas: mampu mengisi foto ber-GPS, progress, dan tiket lapangan.
    </td>
  </tr>
  <tr>
    <td valign="top"><strong>Keterangan</strong></td>
    <td valign="top"><strong>Peralatan / Perlengkapan</strong></td>
  </tr>
  <tr>
    <td valign="top">
      1. SOP-01 Login &amp; SSO<br>
      2. SOP-02 Input Program (Arumanis Utama)<br>
      3. SOP-03 Kontrak &amp; Penyedia<br>
      4. SOP-04 Pengawasan Lapangan<br>
      5. SOP-05 Penugasan Pengawas<br>
      6. SOP-06 Manajemen Akses<br>
      7. Petunjuk Teknis Aplikasi Arumanis (docx)<br>
      8. Panduan pengguna <code>/docs</code> dan <code>/pengawasan/panduan</code>
    </td>
    <td valign="top">
      1. Perangkat komputer / laptop / tablet.<br>
      2. Browser Chrome, Firefox, atau Edge versi terbaru.<br>
      3. Koneksi internet stabil.<br>
      4. Akun APIAMIS aktif (email &amp; password).<br>
      5. GPS perangkat (untuk upload foto lapangan).<br>
      6. ATK (bila mencetak dokumentasi foto PDF).
    </td>
  </tr>
  <tr>
    <td valign="top"><strong>Peringatan</strong></td>
    <td valign="top"><strong>Pencatatan dan Pendataan</strong></td>
  </tr>
  <tr>
    <td valign="top">
      1. Setiap pengguna wajib menjaga kerahasiaan akun dan password.<br>
      2. Data yang diinput harus sesuai kondisi di lapangan; kesalahan menjadi tanggung jawab penginput.<br>
      3. Foto dokumentasi wajib memuat koordinat GPS dalam batas desa pekerjaan.<br>
      4. Progress mingguan wajib diisi sebelum batas waktu yang ditetapkan unit.<br>
      5. Dilarang menambahkan trailer <code>Co-authored-by</code> bot/AI pada commit sistem.
    </td>
    <td valign="top">
      1. Database APIAMIS (backend Laravel).<br>
      2. Audit Trail di modul <code>/audit-logs</code> (Arumanis).<br>
      3. Berkas digital di modul Berkas &amp; Drive 3-zona.<br>
      4. Dokumentasi foto slot 0%–100% di Panel Pengawasan.<br>
      5. Tiket dan notifikasi sebagai jejak tindak lanjut.
    </td>
  </tr>
</table>

---

## Daftar Isi

| No | Lembar | Judul Flowchart | Aplikasi |
|:---|:-------|:----------------|:---------|
| — | Halaman Pengesahan | Pengesahan &amp; metadata SOP | — |
| 1 | SOP-01 Login &amp; SSO | Akses &amp; Autentikasi | Keduanya |
| 2 | SOP-02 Input Program | Input Program Baru | www/bun |
| 3 | SOP-03 Kontrak | Kontrak &amp; Penyedia | www/bun |
| 4 | SOP-04 Pengawasan | Pemantauan Lapangan | www/pengawas |
| 5 | SOP-05 Penugasan | Penugasan Pengawas | Keduanya |
| 6 | SOP-06 Manajemen Akses | Role &amp; Permission | www/bun |

**Legenda PIC:** ● = penanggung jawab utama pada langkah tersebut.

---

## SOP-01 Login & SSO

**LAMPIRAN I**

Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur

Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026

### FLOWCHART SOP AKSES & AUTENTIKASI ARUMANIS / PANEL PENGAWASAN

#### Flowchart Garis

```
    ┌─────────┐
    │  User   │
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │  Login  │
    └────┬────┘
         │
         ▼
       ╱     ╲
      ╱Berhasil?╲
      ╲       ╱
       ╲     ╱
    Tidak│   │Ya
         │   │
         └───┼───────────┐
             ▼           ▼
        ┌─────────┐ ┌─────────┐
        │Cek Role │ │  SSO    │
        └────┬────┘ └────┬────┘
             │           │
             ▼           ▼
        ┌─────────┐ ┌──────────────┐
        │Dashboard│ │Dashboard     │
        │Arumanis │ │Pengawasan    │
        └────┬────┘ └──────┬───────┘
             │             │
             └──────┬──────┘
                    ▼
               ┌─────────┐
               │ Selesai │
               └─────────┘
```

#### Tabel Kegiatan

| No | Kegiatan | Admin | Operator | Pengawas | Sistem | Kategori | Waktu | Output | Ket |
|:---|:---------|:-----:|:--------:|:--------:|:------:|:---------|:------|:-------|:----|
| 1 | Pengguna membuka URL Arumanis di browser terbaru. | ● | ● | ● | | Akses | ± 2 menit | Halaman `/sign-in` | |
| 2 | Masukkan email &amp; password APIAMIS → Sign In. | ● | ● | ● | | Autentikasi | ± 1 menit | Sesi cookie terbentuk | |
| 3 | Sistem validasi kredensial via BFF → APIAMIS. Gagal: ulangi login. | | | | ● | Validasi | Real-time | Token valid / error | |
| 4 | Cek role: Admin/Operator/Viewer → Dashboard; Pengawas → SSO panel. | | | | ● | Routing | Real-time | Halaman tujuan | |
| 5 | SSO pengawas: `/pengawasan/login?token` → cookie `pengawas_session`. | | | ● | ● | SSO | ± 30 dtk | Dashboard `/pengawasan/` | Tanpa login terpisah |
| 6 | Operasional sesuai SOP modul. Logout via avatar → Logout. | ● | ● | ● | | Operasional | Sesuai tugas | Sesi berakhir | |

---

## SOP-02 Input Program

**LAMPIRAN II**

### FLOWCHART SOP INPUT PROGRAM BARU (ARUMANIS UTAMA)

#### Flowchart Garis

```
    ┌──────────┐
    │ Kegiatan │
    └────┬─────┘
         ▼
    ┌──────────┐
    │  Tambah  │
    └────┬─────┘
         ▼
    ┌──────────┐
    │ Pekerjaan│
    └────┬─────┘
         ▼
    ┌──────────┐
    │  Output  │
    └────┬─────┘
         ▼
    ┌──────────┐
    │  Berkas  │
    └────┬─────┘
         ▼
       ╱      ╲
      ╱Lengkap?╲
      ╲       ╱
       ╲     ╱
    Tidak│   │Ya
         │   ▼
         │ ┌──────────┐
         └►│ Verifikasi│
           └────┬─────┘
                ▼
           ┌──────────┐
           │  Selesai │
           └──────────┘
```

#### Tabel Kegiatan

| No | Kegiatan | Admin | Operator | Pengawas | Sistem | Kategori | Waktu | Output | Ket |
|:---|:---------|:-----:|:--------:|:--------:|:------:|:---------|:------|:-------|:----|
| 1 | Login → buka `/kegiatan`. | ● | ● | | | Perencanaan | ± 15 mnt | Master kegiatan | |
| 2 | Tambah kegiatan: nama, kode, dana, pagu, TA. | | ● | | | Input | ± 10 mnt | Kegiatan tersimpan | |
| 3 | Tambah pekerjaan: kegiatan, kecamatan, desa, pagu. | | ● | | | Input | ± 15 mnt | Pekerjaan aktif | |
| 4 | Tambah output &amp; penerima per pekerjaan. | | ● | | | Input | ± 20 mnt | Komponen tercatat | |
| 5 | Upload berkas &amp; foto awal (opsional). | | ● | | | Dokumentasi | ± 15 mnt | File terunggah | |
| 6 | Verifikasi dashboard &amp; data quality. Tidak lengkap → perbaiki. | ● | ● | | | Verifikasi | ± 5 mnt | Data siap | |

---

## SOP-03 Kontrak

**LAMPIRAN III**

### FLOWCHART SOP KONTRAK & PENYEDIA

#### Flowchart Garis

```
    ┌───────────┐
    │ Prasyarat │
    └─────┬─────┘
          ▼
    ┌───────────┐
    │  Kontrak  │
    └─────┬─────┘
          ▼
        ╱       ╲
       ╱Addendum?╲
       ╲         ╱
        ╲       ╱
     Ya │       │ Tidak
        ▼       │
   ┌─────────┐  │
   │Addendum │  │
   └────┬────┘  │
        └───┬───┘
            ▼
    ┌───────────┐
    │ Verifikasi│
    └─────┬─────┘
          ▼
    ┌───────────┐
    │  Selesai  │
    └───────────┘
```

#### Tabel Kegiatan

| No | Kegiatan | Admin | Operator | Pengawas | Sistem | Kategori | Waktu | Output | Ket |
|:---|:---------|:-----:|:--------:|:--------:|:------:|:---------|:------|:-------|:----|
| 1 | Pastikan pekerjaan &amp; penyedia terdaftar. | | ● | | | Persiapan | ± 10 mnt | Data induk siap | |
| 2 | Buat kontrak: pekerjaan, penyedia, nilai, tanggal. | | ● | | | Kontrak | ± 20 mnt | Kontrak aktif | |
| 3 | Addendum &amp; register dokumen bila diperlukan. | | ● | | | Addendum | Sesuai kebutuhan | Dokumen sinkron | |
| 4 | Verifikasi status kontrak di dashboard. | ● | ● | | | Monitoring | ± 5 mnt | Siap ditugaskan | |

---

## SOP-04 Pengawasan Lapangan

**LAMPIRAN IV**

### FLOWCHART SOP PEMANTAUAN LAPANGAN (PANEL PENGAWASAN)

#### Flowchart Garis

```
    ┌──────────┐
    │SSO Login │
    └────┬─────┘
         ▼
    ┌──────────┐
    │Dashboard │
    └────┬─────┘
         ▼
    ┌──────────┐
    │  Detail  │
    └────┬─────┘
         ▼
    ┌──────────┐
    │ Penerima │
    └────┬─────┘
         ▼
    ┌──────────┐
    │Foto GPS  │
    └────┬─────┘
         ▼
    ┌──────────┐
    │ Progress │
    └────┬─────┘
         ▼
       ╱      ╲
      ╱Kendala?╲
      ╲       ╱
       ╲     ╱
    Ya │     │ Tidak
       ▼     │
  ┌────────┐ │
  │ Tiket  │ │
  └────┬───┘ │
       └──┬──┘
          ▼
    ┌──────────┐
    │  Sinkron │
    └──────────┘
```

#### Tabel Kegiatan

| No | Kegiatan | Admin | Operator | Pengawas | Sistem | Kategori | Waktu | Output | Ket |
|:---|:---------|:-----:|:--------:|:--------:|:------:|:---------|:------|:-------|:----|
| 1 | Login SSO → Dashboard `/pengawasan/`. | | | ● | ● | Akses | ± 2 mnt | KPI tampil | |
| 2 | Baca KPI &amp; buka paket perlu perhatian. | | | ● | | Pemantauan | Harian | Prioritas paket | |
| 3 | Tab Penerima: kelola penerima individu/komunal. | | | ● | | Data | Per paket | Penerima lengkap | |
| 4 | Tab Foto: upload slot 0–100% + GPS per output. | | | ● | | Dokumentasi | Per kunjungan | Matriks foto terisi | |
| 5 | Tab Progress / Buat Laporan: rencana &amp; realisasi mingguan. | | | ● | | Pelaporan | Mingguan | Deviasi terupdate | |
| 6 | Ada kendala? Buat tiket. Tidak → selesai. | | | ● | | Tiket | Sesuai kejadian | Tiket / selesai | |
| 7 | Data tersinkron ke Arumanis via APIAMIS. | ● | | | ● | Integrasi | Real-time | Data kantor = lapangan | |

---

## SOP-05 Penugasan Pengawas

**LAMPIRAN V**

### FLOWCHART SOP PENUGASAN PENGAWAS (ADMIN → PANEL PENGAWASAN)

#### Flowchart Garis

```
    ┌──────────┐
    │ Pengawas │
    └────┬─────┘
         ▼
    ┌──────────┐
    │   User   │
    └────┬─────┘
         ▼
    ┌──────────┐
    │  Assign  │
    └────┬─────┘
         ▼
       ╱      ╲
      ╱Tampil? ╲
      ╲       ╱
       ╲     ╱
    Tidak│   │Ya
         │   ▼
         │ ┌──────────┐
         └►│Operasional│
           │  SOP-04   │
           └──────────┘
```

#### Tabel Kegiatan

| No | Kegiatan | Admin | Operator | Pengawas | Sistem | Kategori | Waktu | Output | Ket |
|:---|:---------|:-----:|:--------:|:--------:|:------:|:---------|:------|:-------|:----|
| 1 | Admin: master `/pengawas` (NIP benar). | ● | | | | Master | ± 10 mnt | Data valid | |
| 2 | User punya role pengawas di `/users`. | ● | | | | Akses | ± 5 mnt | Role aktif | |
| 3 | Assign pekerjaan di `/user-pekerjaan`. | ● | | | | Penugasan | ± 15 mnt | Paket di dashboard | Wajib |
| 4 | Pengawas login: paket tampil? Tidak → ulangi assign. | ● | | ● | | Verifikasi | ± 5 mnt | Penugasan efektif | |

#### Diagram Integrasi (Garis)

```
 Admin Arumanis          APIAMIS              Panel Pengawasan
      │                     │                        │
      │── master + assign ─►│                        │
      │                     │◄── login /sign-in ─────│
      │── SSO token ────────┼───────────────────────►│
      │                     │◄── GET pekerjaan ──────│
      │                     │── daftar paket ───────►│
      │                     │◄── foto/progress/tiket │
      │◄── data sinkron ────│                        │
```

---

## SOP-06 Manajemen Akses

**LAMPIRAN VI**

### FLOWCHART SOP MANAJEMEN AKSES (ADMIN)

#### Flowchart Garis

```
    ┌──────────┐
    │   Role   │
    └────┬─────┘
         ▼
    ┌──────────┐
    │  Route   │
    └────┬─────┘
         ▼
    ┌──────────┐
    │  Users   │
    └────┬─────┘
         ▼
       ╱      ╲
      ╱Sesuai? ╲
      ╲       ╱
       ╲     ╱
    Tidak│   │Ya
         │   ▼
         │ ┌──────────┐
         └►│  Selesai │
           └──────────┘
```

#### Tabel Kegiatan

| No | Kegiatan | Admin | Operator | Pengawas | Sistem | Kategori | Waktu | Output | Ket |
|:---|:---------|:-----:|:--------:|:--------:|:------:|:---------|:------|:-------|:----|
| 1 | Kelola Roles &amp; Permissions. | ● | | | | RBAC | ± 15 mnt | Role siap | |
| 2 | Atur Route &amp; Menu Permissions. | ● | | | | RBAC | ± 20 mnt | Akses terkontrol | |
| 3 | Tambah user &amp; uji login. | ● | | | | Uji coba | ± 10 mnt | Hak akses benar | |

---

## Matriks Troubleshooting

| No | Gejala | Aplikasi | Penyebab | Solusi | Level |
|:---|:-------|:---------|:---------|:-------|:------|
| 1 | Login gagal | Arumanis | Kredensial salah | Reset via admin | L1 |
| 2 | Loop `?token=` | Pengawasan | Token invalid | Clear cache; login Arumanis | L1 |
| 3 | Pekerjaan kosong | Pengawasan | Belum assign | `/user-pekerjaan` | L2 |
| 4 | 403 ditolak | Keduanya | Role kurang | Route/menu permission | L2 |
| 5 | GPS gagal | Pengawasan | Izin lokasi | Input manual | L1 |
| 6 | Foto ditolak | Keduanya | Koordinat luar desa | Foto di lokasi | L1 |
| 7 | Progress tidak simpan | Pengawasan | Tidak ada perubahan | Edit field dulu | L1 |
| 8 | 502 / error API | Keduanya | Backend down | Hubungi IT | L3 |

#### Flowchart Eskalasi (Garis)

```
    ┌─────────────┐
    │ User lapor  │
    └──────┬──────┘
           ▼
    ┌─────────────┐
    │ L1: Coba    │
    │troubleshoot │
    └──────┬──────┘
      Selesai│  │Belum
           ▼  ▼
      ┌──────┐ ┌─────────────┐
      │ OK   │ │ L2: Operator│
      └──────┘ │ / Admin unit│
               └──────┬──────┘
                      ▼
               ┌─────────────┐
               │ L3: Perlu   │
               │ server/API? │
               └──────┬──────┘
                 Ya │ │ Tidak
                    ▼ ▼
              ┌─────┐ ┌──────────┐
              │ IT  │ │Perbaikan │
              └─────┘ │data      │
                      └──────────┘
```

---

## Checklist Operasional

### Admin — Mingguan

| ☐ | Item |
|:--|:-----|
| ☐ | Cek dashboard &amp; data quality stats |
| ☐ | Review tiket terbuka |
| ☐ | Verifikasi penugasan pengawas (`/user-pekerjaan`) |
| ☐ | Kontrak &amp; register dokumen lengkap |
| ☐ | Broadcast notifikasi deadline laporan |

### Pengawas — Harian / Mingguan

| ☐ | Item | Frekuensi |
|:--|:-----|:----------|
| ☐ | Login &amp; cek dashboard KPI | Harian |
| ☐ | Tindaklanjuti paket perlu perhatian | Harian |
| ☐ | Upload foto slot kosong | Per kunjungan |
| ☐ | Isi progress minggu aktif | Mingguan (sebelum Jumat) |
| ☐ | Buat tiket jika kendala | Sesuai kejadian |
| ☐ | Cek notifikasi kantor | Harian |

### Operator — Input Data

| ☐ | Item |
|:--|:-----|
| ☐ | Kegiatan &amp; pekerjaan baru lengkap |
| ☐ | Output &amp; penerima sinkron RAB |
| ☐ | Berkas kontrak terupload |
| ☐ | Koordinat desa valid untuk geo-fencing |

---

## Arsitektur Platform

```
 ┌─────────────────────────────────────────┐
 │              Browser                    │
 │  ┌──────────────┐  ┌─────────────────┐  │
 │  │Arumanis Utama│  │Panel Pengawasan │  │
 │  └──────┬───────┘  └────────┬────────┘  │
 └─────────┼───────────────────┼──────────┘
           │                   │
           ▼                   ▼
 ┌─────────────────────────────────────────┐
 │                 BFF                     │
 │  ┌──────────────┐  ┌─────────────────┐  │
 │  │ BFF Arumanis │  │ BFF Pengawasan  │  │
 │  └──────┬───────┘  └────────┬────────┘  │
 └─────────┼───────────────────┼──────────┘
           └─────────┬─────────┘
                     ▼
           ┌─────────────────┐
           │ APIAMIS Laravel │
           └─────────────────┘

 Arumanis ── SSO token ──► Panel Pengawasan
```

---

## Lampiran Referensi

| Dokumen | Lokasi |
|:--------|:-------|
| Panduan modul | [docs/user-guide/](user-guide/index.md) |
| Panel pengawasan | [docs/user-guide/pengawas-panel.md](user-guide/pengawas-panel.md) |
| Petunjuk teknis Word | `docs/Petunjuk_Teknis_Aplikasi_Arumanis.docx` |
| Changelog publik | [/changelog](https://arumanis.cianjurkab.go.id/changelog) |
| Lineage platform | [LINEAGE.md](../LINEAGE.md) |

| Regenerasi | Perintah |
|:-----------|:---------|
| Markdown | Edit file ini |
| Word | `bun run docs:sop` |
| Excel | `bun run docs:sop:xlsx` |

---

*Dokumen ini mengikuti format LAMPIRAN flowchart SOP pemerintah: halaman pengesahan berbingkai, tabel kegiatan, flowchart bergaris (ASCII), dan penanda PIC (●). Selaras dengan lembar Excel `SOP_PENGGUNAAN_ARUMANIS.xlsx`.*