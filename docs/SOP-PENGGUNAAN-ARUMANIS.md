# SOP Penggunaan Arumanis & Panel Pengawasan

| Item | Nilai |
|:-----|:------|
| **Versi dokumen** | 1.1 |
| **Tanggal** | 1 Juli 2026 |
| **Platform** | Arumanis v0.5.0 |
| **Total SOP** | 65 lembar |
| **Word** | `docs/SOP_PENGGUNAAN_ARUMANIS.docx` |
| **Excel** | `docs/SOP_PENGGUNAAN_ARUMANIS.xlsx` |
| **Regenerasi** | `bun run docs:sop:md` |

> Format template pemerintah: halaman pengesahan + tabel kegiatan + flowchart SVG (shape & garis penghubung) di kolom **Pelaksana**. Mencakup **semua modul** sidebar Arumanis, Puspen, dan Panel Pengawasan.

---

## Halaman Pengesahan

<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr>
  <td  style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;width:50%">DINAS PEKERJAAN UMUM DAN TATA RUANG<br>KABUPATEN CIANJUR</td>
  <td  style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;width:50%"><table width="100%" border="0" cellpadding="2"><tr><td align="right" width="42%" style="padding:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Nama SOP</b></td><td style="padding:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">: SOP Penggunaan Arumanis &amp; Panel Pengawasan</td></tr></table></td>
</tr>
<tr><td  style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">BIDANG AIR MINUM DAN SANITASI</td><td  style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><table width="100%" border="0" cellpadding="2"><tr><td align="right" width="42%" style="padding:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Tgl Pembuatan</b></td><td style="padding:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">: 1 Juli 2026</td></tr></table></td></tr>
<tr>
  <td rowspan="4" style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">SEKSI PERENCANAAN DAN PENGEMBANGAN SISTEM INFORMASI</td>
  <td  style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><table width="100%" border="0" cellpadding="2"><tr><td align="right" width="42%" style="padding:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Tanggal Revisi</b></td><td style="padding:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">: —</td></tr></table></td>
</tr>
<tr><td  style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><table width="100%" border="0" cellpadding="2"><tr><td align="right" width="42%" style="padding:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Tanggal Aktif</b></td><td style="padding:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">: 1 Juli 2026</td></tr></table></td></tr>
<tr><td  style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><table width="100%" border="0" cellpadding="2"><tr><td align="right" width="42%" style="padding:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Disahkan oleh</b></td><td style="padding:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">: Kepala Bidang Air Minum dan Sanitasi</td></tr></table></td></tr>
<tr><td  style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;text-align:center;height:90px"><b>Tanda Tangan dan Stempel</b><br><br><br><br><br></td></tr>
<tr>
  <td  style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nama SOP</td>
  <td  style="border:1px solid #000;padding:8px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;text-align:center;font-size:12px;font-weight:bold"><b>SOP PENGGUNAAN APLIKASI ARUMANIS<br>DAN PANEL PENGAWASAN</b></td>
</tr>
<tr>
  <td colspan="2" style="border:1px solid #000;padding:0;">
    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
      <tr>
        <td style="border:1px solid #000;width:50%;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Dasar Hukum</b><br>1. Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik.<br>2. Peraturan Menteri Dalam Negeri Nomor 57 Tahun 2007 tentang Petunjuk Teknis Penataan Organisasi Perangkat Daerah.<br>3. Peraturan Bupati Cianjur tentang Standar Pelayanan Minimum Air Minum dan Sanitasi.<br>4. Keputusan Kepala Dinas terkait pembentukan SOP operasional sistem informasi ARUMANIS.</td>
        <td style="border:1px solid #000;width:50%;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Kualifikasi Pelaksana</b><br>1. Memahami tugas dan fungsi Bidang Air Minum dan Sanitasi.<br>2. Memahami alur kerja aplikasi ARUMANIS (www/bun) dan Panel Pengawasan (www/pengawas).<br>3. Admin/Operator: mampu mengelola master data, kontrak, dokumentasi, dan akses.<br>4. Pengawas: mampu mengisi foto ber-GPS, progress, laporan mingguan, dan tiket lapangan.</td>
      </tr>
      <tr>
        <td style="border:1px solid #000;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Keterangan</b><br>1. Bagian A — Integrasi (SOP-01 s/d SOP-06)<br>2. Bagian B — Dashboard &amp; Pelaporan Arumanis (SOP-07 s/d SOP-15)<br>3. Bagian C — Master Data Arumanis (SOP-16 s/d SOP-32)<br>4. Bagian D — Dokumentasi Arumanis (SOP-33 s/d SOP-37)<br>5. Bagian E — Publikasi (SOP-38 s/d SOP-39)<br>6. Bagian F — Akses &amp; Keamanan (SOP-40 s/d SOP-45)<br>7. Bagian G — Pengaturan (SOP-46 s/d SOP-50)<br>8. Bagian H — Puspen (SOP-51 s/d SOP-57)<br>9. Bagian I — Panel Pengawasan (SOP-58 s/d SOP-65)<br>10. Panduan teknis: docs/user-guide/ dan /docs</td>
        <td style="border:1px solid #000;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Peralatan / Perlengkapan</b><br>1. Perangkat komputer / laptop / tablet.<br>2. Browser Chrome, Firefox, atau Edge versi terbaru.<br>3. Koneksi internet stabil.<br>4. Akun APIAMIS aktif (email &amp; password).<br>5. GPS perangkat (untuk upload foto lapangan).<br>6. ATK (bila mencetak dokumentasi foto PDF).</td>
      </tr>
      <tr>
        <td style="border:1px solid #000;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Peringatan</b><br>1. Setiap pengguna wajib menjaga kerahasiaan akun dan password.<br>2. Data yang diinput harus sesuai kondisi di lapangan; kesalahan menjadi tanggung jawab penginput.<br>3. Foto dokumentasi wajib memuat koordinat GPS dalam batas desa pekerjaan.<br>4. Progress mingguan wajib diisi sebelum batas waktu yang ditetapkan unit.<br>5. Dilarang menambahkan trailer Co-authored-by bot/AI pada commit sistem.</td>
        <td style="border:1px solid #000;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><b>Pencatatan dan Pendataan</b><br>1. Database APIAMIS (backend Laravel).<br>2. Audit Trail di modul /audit-logs (Arumanis).<br>3. Berkas digital di modul Berkas &amp; Drive 3-zona.<br>4. Dokumentasi foto slot 0%–100% di Panel Pengawasan.<br>5. Tiket dan notifikasi sebagai jejak tindak lanjut.</td>
      </tr>
    </table>
  </td>
</tr>
</table>

---

## Daftar Isi

| No | Lembar | Judul | Route | Aplikasi |
|:---|:-------|:------|:------|:---------|
| — | Halaman Pengesahan | Metadata & pengesahan SOP | — | — |
| 01 | SOP-01 Login &amp; SSO | AKSES &amp; AUTENTIKASI ARUMANIS / PANEL PENGAWASAN | /sign-in | Keduanya |
| 02 | SOP-02 Alur Input Program | ALUR INPUT PROGRAM (KEGIATAN → PEKERJAAN → OUTPUT) | — | www/bun |
| 03 | SOP-03 Alur Kontrak | ALUR KONTRAK &amp; PENYEDIA | — | www/bun |
| 04 | SOP-04 Alur Pengawasan | ALUR PEMANTAUAN LAPANGAN | — | www/pengawas |
| 05 | SOP-05 Penugasan Pengawas | PENUGASAN PENGAWAS | /user-pekerjaan | Keduanya |
| 06 | SOP-06 Manajemen Akses | MANAJEMEN AKSES (RBAC) | — | www/bun |
| 07 | SOP-07 Dashboard | DASHBOARD ARUMANIS | /dashboard | www/bun |
| 08 | SOP-08 Dashboard Eksekutif | DASHBOARD EKSEKUTIF | /executive-dashboard | www/bun |
| 09 | SOP-09 Rekap Progress | REKAP PROGRESS | /progress_rekap | www/bun |
| 10 | SOP-10 Buat Laporan (Kantor) | BUAT LAPORAN KANTOR | /buat-laporan | www/bun |
| 11 | SOP-11 Analisa RAB | ANALISA RAB | /rab-analyzer | www/bun |
| 12 | SOP-12 Tiket &amp; Laporan | TIKET &amp; LAPORAN KANTOR | /tiket | www/bun |
| 13 | SOP-13 Kanban | KANBAN TUGAS | /kanban | www/bun |
| 14 | SOP-14 Pusat Notifikasi | PUSAT NOTIFIKASI | /notifications | www/bun |
| 15 | SOP-15 Asisten AI | ASISTEN AI (AMI) | /chat | www/bun |
| 16 | SOP-16 Program Kegiatan | PROGRAM KEGIATAN | /kegiatan | www/bun |
| 17 | SOP-17 Master Fase | MASTER FASE | /master-fase | www/bun |
| 18 | SOP-18 Kecamatan | DATA KECAMATAN | /kecamatan | www/bun |
| 19 | SOP-19 Desa | DATA DESA | /desa | www/bun |
| 20 | SOP-20 Pekerjaan | PEKERJAAN | /pekerjaan | www/bun |
| 21 | SOP-21 Aset SPAM Unit | ASET &amp; CAPAIAN SPAM UNIT | /spam-unit | www/bun |
| 22 | SOP-22 SPM Sanitasi | SPM SANITASI | /spm-sanitasi | www/bun |
| 23 | SOP-23 Draft Pekerjaan | DRAFT PEKERJAAN | /draft-pekerjaan | www/bun |
| 24 | SOP-24 Penyedia | PENYEDIA / REKANAN | /penyedia | www/bun |
| 25 | SOP-25 Kontrak | PENGUELOLAAN KONTRAK | /kontrak | www/bun |
| 26 | SOP-26 Addendum Kontrak | ADDENDUM KONTRAK | /kontrak-addendums | www/bun |
| 27 | SOP-27 Register Dokumen | REGISTER DOKUMEN PEKERJAAN | /pekerjaan/register | www/bun |
| 28 | SOP-28 Checklist Pekerjaan | CHECKLIST PEKERJAAN | /checklist | www/bun |
| 29 | SOP-29 Post Pekerjaan | POST PEKERJAAN / SERAH TERIMA | /post-pekerjaan | www/bun |
| 30 | SOP-30 Output | OUTPUT PEKERJAAN | /output | www/bun |
| 31 | SOP-31 Penerima | PENERIMA MANFAAT | /penerima | www/bun |
| 32 | SOP-32 Master Pengawas | MASTER PENGAWAS | /pengawas | www/bun |
| 33 | SOP-33 Panduan Pengguna | PANDUAN PENGGUNA IN-APP | /panduan | www/bun |
| 34 | SOP-34 Foto Dokumentasi | FOTO DOKUMENTASI (KANTOR) | /foto | www/bun |
| 35 | SOP-35 Peta Progress | PETA PROGRESS | /map | www/bun |
| 36 | SOP-36 Simulasi Jaringan | SIMULASI JARINGAN PIPA | /simulation | www/bun |
| 37 | SOP-37 Berkas Digital | BERKAS &amp; DRIVE 3-ZONA | /berkas | www/bun |
| 38 | SOP-38 Manajemen Publikasi | MANAJEMEN PUBLIKASI | /manajemen-publikasi | www/bun |
| 39 | SOP-39 Komentar Publikasi | MODERASI KOMENTAR PUBLIKASI | /manajemen-publikasi/komentar | www/bun |
| 40 | SOP-40 Users | PENGELOLAAN USERS | /users | www/bun |
| 41 | SOP-41 Roles | PENGELOLAAN ROLES | /roles | www/bun |
| 42 | SOP-42 Permissions | PENGELOLAAN PERMISSIONS | /permissions | www/bun |
| 43 | SOP-43 Route Permissions | ROUTE PERMISSIONS | /route-permissions | www/bun |
| 44 | SOP-44 Kegiatan Role | KEGIATAN ROLE | /kegiatan-role | www/bun |
| 45 | SOP-45 Menu Permissions | MENU PERMISSIONS | /menu-permissions | www/bun |
| 46 | SOP-46 Audit Trail | AUDIT TRAIL | /audit-logs | www/bun |
| 47 | SOP-47 Debug Reporting | DEBUG REPORTING | /error-logs | www/bun |
| 48 | SOP-48 Pengaturan Aplikasi | PENGATURAN APLIKASI | /settings | www/bun |
| 49 | SOP-49 Assign Pekerjaan | ASSIGN PEKERJAAN KE PENGAWAS | /user-pekerjaan | www/bun |
| 50 | SOP-50 Broadcast Notifikasi | BROADCAST NOTIFIKASI | /notifications/broadcast | www/bun |
| 51 | SOP-51 Puspen Dashboard | PUSPEN — DASHBOARD KOMANDO | /puspen | Puspen |
| 52 | SOP-52 Puspen Review Pekerjaan | PUSPEN — REVIEW PEKERJAAN | /puspen/review-pekerjaan | Puspen |
| 53 | SOP-53 Puspen Progress Fisik | PUSPEN — PROGRESS FISIK | /puspen/progress-fisik | Puspen |
| 54 | SOP-54 Puspen KPI Pengawas | PUSPEN — KPI PENGAWAS | /puspen/pengawas-kpi | Puspen |
| 55 | SOP-55 Puspen Sign PDF | PUSPEN — TANDA TANGAN PDF | /puspen/sign-pdf | Puspen |
| 56 | SOP-56 Puspen Organize PDF | PUSPEN — ORGANIZE PDF | /puspen/organize-pdf | Puspen |
| 57 | SOP-57 Puspen Media Sharing | PUSPEN — MEDIA SHARING | /puspen/media-sharing | Puspen |
| 58 | SOP-58 PG Dashboard | PANEL PENGAWASAN — DASHBOARD | /pengawasan/ | www/pengawas |
| 59 | SOP-59 PG Daftar Pekerjaan | PANEL PENGAWASAN — DAFTAR PEKERJAAN | /pengawasan/pekerjaan | www/pengawas |
| 60 | SOP-60 PG Detail Pekerjaan | PANEL PENGAWASAN — DETAIL PEKERJAAN (6 TAB) | /pengawasan/pekerjaan/:id | www/pengawas |
| 61 | SOP-61 PG Buat Laporan | PANEL PENGAWASAN — BUAT LAPORAN MINGGUAN | /pengawasan/buat-laporan | www/pengawas |
| 62 | SOP-62 PG Tiket | PANEL PENGAWASAN — TIKET KENDALA | /pengawasan/tiket | www/pengawas |
| 63 | SOP-63 PG Notifikasi | PANEL PENGAWASAN — NOTIFIKASI | /pengawasan/notifikasi | www/pengawas |
| 64 | SOP-64 PG Profil | PANEL PENGAWASAN — PROFIL PENGAWAS | /pengawasan/profile | www/pengawas |
| 65 | SOP-65 PG Panduan | PANEL PENGAWASAN — PANDUAN IN-APP | /pengawasan/panduan | www/pengawas |

**Legenda:** Kotak biru/merah = proses · Belah ketupat hijau = keputusan · Garis biru + panah = alur · Garis putus-putus = loop Tidak

---

## SOP-01 Login & SSO

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/sign-in</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN I</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN AKSES &amp; AUTENTIKASI ARUMANIS / PANEL PENGAWASAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengguna membuka URL Arumanis di browser terbaru.</td>
  <td colspan="4" rowspan="6" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:468px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="468" viewBox="0 0 320 468" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sop01login" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop01login)"/><path d="M120 134 L120 151.5 L280 151.5 L280 169" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop01login)"/><line x1="280" y1="221" x2="280" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop01login)"/><path d="M280 290 L280 312 L200 312 L200 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop01login)"/><path d="M200 368 L200 390 L120 390 L120 412" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop01login)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">User</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Login</text>
  </g><path d="M256 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="188" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sop01login)"/><g>
      <polygon points="280,169 306,195 280,221 254,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="280" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Berhasil?</text>
      <text x="280" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Role</text>
  </g><g>
    <rect x="169" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">SSO</text>
  </g><g>
    <rect x="89" y="412" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="433" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Browser terbaru</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">/sign-in</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Masukkan email &amp; password APIAMIS → Sign In.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Akun aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 1 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesi cookie</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi kredensial via BFF → APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kredensial benar</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Token valid</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ulangi bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Routing role: kantor → dashboard; pengawas → SSO.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Role terdaftar</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman tujuan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">SSO pengawas: /pengawasan/login?token.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Token valid</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 30 dtk</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">/pengawasan/</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">6.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Logout via menu profil.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 1 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesi berakhir</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-01-login.svg">sop-flow/sop-01-login.svg</a></em></p>

---

## SOP-02 Alur Input Program

<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN II</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN ALUR INPUT PROGRAM (KEGIATAN → PEKERJAAN → OUTPUT)</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Input kegiatan di /kegiatan.</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sop02programalur" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop02programalur)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop02programalur)"/><line x1="120" y1="212" x2="120" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop02programalur)"/><path d="M120 290 L120 307.5 L40 307.5 L40 325" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop02programalur)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Kegiatan</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Pekerjaan</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Output</text>
  </g><g>
    <rect x="89" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Dokumen</text>
  </g><path d="M64 351 L120 351" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="346" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 351 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sop02programalur)"/><g>
      <polygon points="40,325 66,351 40,377 14,351" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="355" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Lengkap?</text>
      <text x="40" y="391" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pagu &amp; TA</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Master kegiatan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Input pekerjaan di /pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Wilayah desa</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pekerjaan aktif</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Input output &amp; penerima.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">RAB</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 20 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Komponen lengkap</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Upload berkas/foto awal.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">File digital</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Berkas terunggah</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi data quality dashboard.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Dashboard</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap kontrak</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-02-program-alur.svg">sop-flow/sop-02-program-alur.svg</a></em></p>

---

## SOP-03 Alur Kontrak

<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN III</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN ALUR KONTRAK &amp; PENYEDIA</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pastikan pekerjaan &amp; penyedia ada.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sop03kontrakalur" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop03kontrakalur)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop03kontrakalur)"/><path d="M120 221 L120 238.5 L40 238.5 L40 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop03kontrakalur)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Prasyarat</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Kontrak</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Addendum?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Master data</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Induk siap</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buat kontrak di /kontrak.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nilai &amp; tanggal</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 20 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kontrak aktif</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Addendum bila perlu.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Register</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Dokumen sinkron</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Assign pengawas &amp; verifikasi.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">/user-pekerjaan</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap lapangan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-03-kontrak-alur.svg">sop-flow/sop-03-kontrak-alur.svg</a></em></p>

---

## SOP-04 Alur Pengawasan

<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN IV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN ALUR PEMANTAUAN LAPANGAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">SSO login → dashboard pengawasan.</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sop04pengawasanalur" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="200" y1="56" x2="200" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop04pengawasanalur)"/><line x1="200" y1="134" x2="200" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop04pengawasanalur)"/><line x1="200" y1="212" x2="200" y2="247" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop04pengawasanalur)"/><path d="M200 299 L200 316.5 L280 316.5 L280 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop04pengawasanalur)"/><g>
    <rect x="169" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">SSO</text>
  </g><g>
    <rect x="169" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Lapangan</text>
  </g><g>
    <rect x="169" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Laporan</text>
  </g><path d="M224 273 L280 273" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="252" y="268" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="200,247 226,273 200,299 174,273" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="200" y="277" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Kendala?</text>
      <text x="200" y="313" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Sinkron</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Penugasan aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">KPI tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kelola penerima, foto GPS, progress.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">GPS &amp; slot foto</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Per kunjungan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Matriks terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buat laporan mingguan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form progress</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mingguan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Deviasi update</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tiket kendala bila ada.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Modul tiket</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kejadian</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tiket / selesai</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sinkron ke Arumanis via APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data kantor = lapangan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-04-pengawasan-alur.svg">sop-flow/sop-04-pengawasan-alur.svg</a></em></p>

---

## SOP-05 Penugasan Pengawas

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/user-pekerjaan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN V</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PENUGASAN PENGAWAS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Master /pengawas (NIP benar).</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sop05penugasan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop05penugasan)"/><line x1="40" y1="134" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop05penugasan)"/><path d="M40 212 L40 229.5 L200 229.5 L200 247" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop05penugasan)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Master</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Role</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Assign</text>
  </g><path d="M176 273 L40 273" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="108" y="268" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 273 L40 178" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sop05penugasan)"/><g>
      <polygon points="200,247 226,273 200,299 174,273" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="200" y="277" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Tampil?</text>
      <text x="200" y="313" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data NIP</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas valid</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Role pengawas di /users.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">RBAC</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Role aktif</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Assign /user-pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar paket</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Paket muncul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Wajib</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Uji login pengawas: paket tampil?</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Uji SSO</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Penugasan efektif</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-05-penugasan.svg">sop-flow/sop-05-penugasan.svg</a></em></p>

---

## SOP-06 Manajemen Akses

<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN VI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN MANAJEMEN AKSES (RBAC)</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kelola /roles &amp; /permissions.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sop06aksesalur" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop06aksesalur)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sop06aksesalur)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Role</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Route</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sop06aksesalur)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Sesuai?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Modul RBAC</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Role siap</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur /route-permissions &amp; /menu-permissions.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar route</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 20 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Menu terkontrol</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Uji login per role.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Akun uji</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-06-akses-alur.svg">sop-flow/sop-06-akses-alur.svg</a></em></p>

---


## Bagian: Dashboard

## SOP-07 Dashboard

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/dashboard</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN VII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN DASHBOARD ARUMANIS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /dashboard.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopdashboard" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopdashboard)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopdashboard)"/><line x1="120" y1="212" x2="120" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopdashboard)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="89" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Dashboard</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pilih tahun anggaran &amp; filter kecamatan pada widget.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Baca card statistik, grafik capaian, dan data quality.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-dashboard.svg">sop-flow/sop-dashboard.svg</a></em></p>

---


## Bagian: Dashboard Eksekutif

## SOP-08 Dashboard Eksekutif

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/executive-dashboard</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN VIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN DASHBOARD EKSEKUTIF</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /executive-dashboard.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopexecutivedashboard" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopexecutivedashboard)"/><line x1="40" y1="134" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopexecutivedashboard)"/><line x1="40" y1="212" x2="40" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopexecutivedashboard)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Dashboard Eksekutif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Baca metrik, grafik, atau detail record.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-executive-dashboard.svg">sop-flow/sop-executive-dashboard.svg</a></em></p>

---


## Bagian: Rekap Progress

## SOP-09 Rekap Progress

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/progress_rekap</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN IX</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN REKAP PROGRESS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /progress_rekap.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopprogressrekap" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopprogressrekap)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopprogressrekap)"/><line x1="120" y1="212" x2="120" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopprogressrekap)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="89" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Rekap Progress</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export rekap progress fisik/keuangan per pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-progress-rekap.svg">sop-flow/sop-progress-rekap.svg</a></em></p>

---


## Bagian: Buat Laporan

## SOP-10 Buat Laporan (Kantor)

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/buat-laporan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN X</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN BUAT LAPORAN KANTOR</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /buat-laporan → pilih pekerjaan.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopbuatlaporankantor" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopbuatlaporankantor)"/><path d="M120 134 L120 156 L280 156 L280 178" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopbuatlaporankantor)"/><path d="M280 212 L280 234 L40 234 L40 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopbuatlaporankantor)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Pilih</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><g>
    <rect x="249" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pekerjaan aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form laporan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Isi rencana &amp; realisasi minggu aktif.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">RAB progress</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 20 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Angka terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Simpan → sinkron ke Puspen/pengawas.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">API progress</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan tersimpan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi di /progress_rekap.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Rekap konsisten</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-buat-laporan-kantor.svg">sop-flow/sop-buat-laporan-kantor.svg</a></em></p>

---


## Bagian: Analisa RAB

## SOP-11 Analisa RAB

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/rab-analyzer</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN ANALISA RAB</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /rab-analyzer.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soprabanalyzer" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soprabanalyzer)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soprabanalyzer)"/><line x1="120" y1="212" x2="120" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soprabanalyzer)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="89" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Analisa RAB</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Upload/ pilih RAB → jalankan analisa → review deviasi.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-rab-analyzer.svg">sop-flow/sop-rab-analyzer.svg</a></em></p>

---


## Bagian: Tiket

## SOP-12 Tiket & Laporan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/tiket</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN TIKET &amp; LAPORAN KANTOR</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /tiket → lihat daftar tiket.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soptiketkantor" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soptiketkantor)"/><path d="M120 134 L120 156 L40 156 L40 178" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soptiketkantor)"/><path d="M40 212 L40 229.5 L120 229.5 L120 247" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soptiketkantor)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Daftar</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Tiket</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Tindak</text>
  </g><path d="M96 273 L40 273" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="268" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="120,247 146,273 120,299 94,273" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="277" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Selesai?</text>
      <text x="120" y="313" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses tiket</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar tiket</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buat tiket baru atau buka detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Deskripsi kendala</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tiket terbuka</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tanggapi / ubah status / komentar.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Workflow status</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai SLA</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Status terupdate</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tutup tiket bila selesai.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tiket closed</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-tiket-kantor.svg">sop-flow/sop-tiket-kantor.svg</a></em></p>

---


## Bagian: Kanban

## SOP-13 Kanban

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/kanban</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN KANBAN TUGAS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /kanban.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopkanban" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkanban)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkanban)"/><line x1="120" y1="212" x2="120" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkanban)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="89" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Kanban</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Geser kartu antar kolom status → update progres tugas.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-kanban.svg">sop-flow/sop-kanban.svg</a></em></p>

---


## Bagian: Notifikasi

## SOP-14 Pusat Notifikasi

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/notifications</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XIV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PUSAT NOTIFIKASI</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /notifications.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopnotifications" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopnotifications)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopnotifications)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Baca</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 1 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Riwayat notifikasi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Baca &amp; tandai sudah dibaca.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Harian</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Inbox bersih</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik notifikasi → navigasi ke modul terkait.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Link valid</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tindak lanjut</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-notifications.svg">sop-flow/sop-notifications.svg</a></em></p>

---


## Bagian: Asisten AI

## SOP-15 Asisten AI

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/chat</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN ASISTEN AI (AMI)</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /chat (Asisten AI).</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopchatai" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopchatai)"/><path d="M120 134 L120 151.5 L40 151.5 L40 169" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopchatai)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Chat</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Tanya</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Akurat?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Fitur AI aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 1 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Panel chat</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ajukan pertanyaan terkait data/program.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Konteks jelas</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Jawaban AI</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi jawaban dengan data resmi modul.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Keputusan valid</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Janganandalkan AI untuk data final</td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-chat-ai.svg">sop-flow/sop-chat-ai.svg</a></em></p>

---


## Bagian: Kegiatan

## SOP-16 Program Kegiatan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/kegiatan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XVI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PROGRAM KEGIATAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /kegiatan (Kegiatan).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopkegiatan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkegiatan)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkegiatan)"/><path d="M120 221 L120 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkegiatan)"/><path d="M280 290 L280 312 L120 312 L120 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkegiatan)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopkegiatan)"/><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="89" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Kegiatan</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tambah kegiatan: nama, kode, sumber dana, pagu, TA.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Cek kode unik &amp; pagu &gt; 0.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-kegiatan.svg">sop-flow/sop-kegiatan.svg</a></em></p>

---


## Bagian: Master Fase

## SOP-17 Master Fase

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/master-fase</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XVII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN MASTER FASE</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /master-fase (Master Fase).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopmasterfase" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmasterfase)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmasterfase)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmasterfase)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmasterfase)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopmasterfase)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Master Fase</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tambah/edit fase pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-master-fase.svg">sop-flow/sop-master-fase.svg</a></em></p>

---


## Bagian: Kecamatan

## SOP-18 Kecamatan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/kecamatan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XVIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN DATA KECAMATAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /kecamatan (Kecamatan).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopkecamatan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkecamatan)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkecamatan)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkecamatan)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkecamatan)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopkecamatan)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Kecamatan</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kelola data kecamatan &amp; kode wilayah.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-kecamatan.svg">sop-flow/sop-kecamatan.svg</a></em></p>

---


## Bagian: Desa

## SOP-19 Desa

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/desa</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XIX</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN DATA DESA</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /desa (Desa).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopdesa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopdesa)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopdesa)"/><path d="M120 221 L120 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopdesa)"/><path d="M280 290 L280 312 L120 312 L120 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopdesa)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopdesa)"/><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="89" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Desa</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tambah/edit desa: kecamatan, kode, koordinat geo-fencing.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koordinat desa valid untuk validasi GPS foto.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-desa.svg">sop-flow/sop-desa.svg</a></em></p>

---


## Bagian: Pekerjaan

## SOP-20 Pekerjaan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pekerjaan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XX</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PEKERJAAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /pekerjaan (Pekerjaan).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppekerjaan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppekerjaan)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppekerjaan)"/><path d="M120 221 L120 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppekerjaan)"/><path d="M280 290 L280 312 L120 312 L120 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppekerjaan)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-soppekerjaan)"/><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="89" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Pekerjaan</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tambah pekerjaan: kegiatan, kecamatan, desa, pagu, fase.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-pekerjaan.svg">sop-flow/sop-pekerjaan.svg</a></em></p>

---


## Bagian: SPAM Unit

## SOP-21 Aset SPAM Unit

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/spam-unit</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN ASET &amp; CAPAIAN SPAM UNIT</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /spam-unit (SPAM Unit).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopspamunit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopspamunit)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopspamunit)"/><path d="M120 221 L120 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopspamunit)"/><path d="M280 290 L280 312 L120 312 L120 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopspamunit)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopspamunit)"/><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="89" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu SPAM Unit</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Input unit SPAM, kapasitas, dan capaian SPM air minum.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-spam-unit.svg">sop-flow/sop-spam-unit.svg</a></em></p>

---


## Bagian: SPM Sanitasi

## SOP-22 SPM Sanitasi

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/spm-sanitasi</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN SPM SANITASI</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /spm-sanitasi (SPM Sanitasi).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopspmsanitasi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopspmsanitasi)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopspmsanitasi)"/><path d="M120 221 L120 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopspmsanitasi)"/><path d="M280 290 L280 312 L120 312 L120 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopspmsanitasi)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopspmsanitasi)"/><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="89" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu SPM Sanitasi</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Input capaian indikator sanitasi per wilayah.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-spm-sanitasi.svg">sop-flow/sop-spm-sanitasi.svg</a></em></p>

---


## Bagian: Draft Pekerjaan

## SOP-23 Draft Pekerjaan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/draft-pekerjaan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN DRAFT PEKERJAAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /draft-pekerjaan.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopdraftpekerjaan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopdraftpekerjaan)"/><path d="M120 134 L120 151.5 L40 151.5 L40 169" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopdraftpekerjaan)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Draft</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Lengkapi</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopdraftpekerjaan)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Setuju?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar draft</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Lengkapi draft → submit untuk review.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Field wajib</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 20 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Draft lengkap</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin review &amp; publish ke pekerjaan aktif.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Checklist</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pekerjaan aktif / revisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-draft-pekerjaan.svg">sop-flow/sop-draft-pekerjaan.svg</a></em></p>

---


## Bagian: Penyedia

## SOP-24 Penyedia

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/penyedia</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXIV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PENYEDIA / REKANAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /penyedia (Penyedia).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppenyedia" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppenyedia)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppenyedia)"/><path d="M120 221 L120 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppenyedia)"/><path d="M280 290 L280 312 L120 312 L120 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppenyedia)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-soppenyedia)"/><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="89" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Penyedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tambah penyedia: nama, NPWP, kontak.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-penyedia.svg">sop-flow/sop-penyedia.svg</a></em></p>

---


## Bagian: Kontrak

## SOP-25 Kontrak

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/kontrak</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PENGUELOLAAN KONTRAK</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /kontrak (Kontrak).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopkontrakmodul" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkontrakmodul)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkontrakmodul)"/><path d="M120 221 L120 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkontrakmodul)"/><path d="M280 290 L280 312 L120 312 L120 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkontrakmodul)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopkontrakmodul)"/><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="89" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Kontrak</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buat kontrak: pekerjaan, penyedia, nilai, tanggal.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-kontrak-modul.svg">sop-flow/sop-kontrak-modul.svg</a></em></p>

---


## Bagian: Addendum

## SOP-26 Addendum Kontrak

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/kontrak-addendums</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXVI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN ADDENDUM KONTRAK</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /kontrak-addendums (Addendum).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopkontrakaddendum" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkontrakaddendum)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkontrakaddendum)"/><path d="M120 221 L120 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkontrakaddendum)"/><path d="M280 290 L280 312 L120 312 L120 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkontrakaddendum)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopkontrakaddendum)"/><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="89" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Addendum</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buat addendum terkait kontrak induk.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-kontrak-addendum.svg">sop-flow/sop-kontrak-addendum.svg</a></em></p>

---


## Bagian: Register Dokumen

## SOP-27 Register Dokumen

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pekerjaan/register</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXVII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN REGISTER DOKUMEN PEKERJAAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /pekerjaan/register.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopregisterdokumen" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopregisterdokumen)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopregisterdokumen)"/><path d="M120 212 L120 234 L40 234 L40 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopregisterdokumen)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Register</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Ceklist</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Upload</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pekerjaan aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar register</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Centang kelengkapan dokumen per item.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Template dokumen</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Status kelengkapan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Upload dokumen yang belum ada di /berkas.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">File PDF/image</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Register lengkap</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin verifikasi register final.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap audit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-register-dokumen.svg">sop-flow/sop-register-dokumen.svg</a></em></p>

---


## Bagian: Checklist

## SOP-28 Checklist Pekerjaan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/checklist</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXVIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN CHECKLIST PEKERJAAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /checklist → pilih pekerjaan.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopchecklist" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopchecklist)"/><path d="M120 134 L120 151.5 L40 151.5 L40 169" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopchecklist)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Isi</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Lengkap?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pekerjaan aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form checklist</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Isi item checklist tahap pelaksanaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Template checklist</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Checklist terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Simpan &amp; verifikasi kelengkapan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Checklist final</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-checklist.svg">sop-flow/sop-checklist.svg</a></em></p>

---


## Bagian: Post Pekerjaan

## SOP-29 Post Pekerjaan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/post-pekerjaan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXIX</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN POST PEKERJAAN / SERAH TERIMA</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /post-pekerjaan.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppostpekerjaan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppostpekerjaan)"/><path d="M120 134 L120 156 L40 156 L40 178" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppostpekerjaan)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Post</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pekerjaan selesai</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar post</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Isi data serah terima &amp; dokumentasi akhir.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Foto 100%</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 30 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Post terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin approve post pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Review dokumen</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pekerjaan closed</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-post-pekerjaan.svg">sop-flow/sop-post-pekerjaan.svg</a></em></p>

---


## Bagian: Output

## SOP-30 Output

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/output</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXX</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN OUTPUT PEKERJAAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /output (Output).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopoutput" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopoutput)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopoutput)"/><path d="M120 221 L120 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopoutput)"/><path d="M280 290 L280 312 L120 312 L120 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopoutput)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopoutput)"/><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="89" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Output</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tambah komponen output per pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-output.svg">sop-flow/sop-output.svg</a></em></p>

---


## Bagian: Penerima

## SOP-31 Penerima

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/penerima</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXXI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PENERIMA MANFAAT</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /penerima (Penerima).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppenerima" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppenerima)"/><line x1="120" y1="134" x2="120" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppenerima)"/><path d="M120 221 L120 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppenerima)"/><path d="M280 290 L280 312 L120 312 L120 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppenerima)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M96 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="68" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-soppenerima)"/><g>
      <polygon points="120,169 146,195 120,221 94,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="120" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="120" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="89" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Penerima</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tambah penerima individu/komunal: jiwa, NIK, output.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-penerima.svg">sop-flow/sop-penerima.svg</a></em></p>

---


## Bagian: Pengawas

## SOP-32 Master Pengawas

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pengawas</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXXII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN MASTER PENGAWAS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /pengawas (Pengawas).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppengawasmaster" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppengawasmaster)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppengawasmaster)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppengawasmaster)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppengawasmaster)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-soppengawasmaster)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Pengawas</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tambah pengawas: NIP, nama, kontak.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-pengawas-master.svg">sop-flow/sop-pengawas-master.svg</a></em></p>

---


## Bagian: Panduan

## SOP-33 Panduan Pengguna

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/panduan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXXIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PANDUAN PENGGUNA IN-APP</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /panduan.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppanduan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppanduan)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppanduan)"/><line x1="120" y1="212" x2="120" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppanduan)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="89" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Panduan</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Navigasi topik panduan &amp; buka tautan modul terkait.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-panduan.svg">sop-flow/sop-panduan.svg</a></em></p>

---


## Bagian: Foto

## SOP-34 Foto Dokumentasi

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/foto</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXXIV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN FOTO DOKUMENTASI (KANTOR)</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /foto → filter pekerjaan/output.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopfoto" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopfoto)"/><path d="M120 134 L120 151.5 L280 151.5 L280 169" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopfoto)"/><path d="M280 221 L280 238.5 L120 238.5 L120 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopfoto)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Foto</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Upload</text>
  </g><path d="M256 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="188" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="280,169 306,195 280,221 254,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="280" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">GPS OK?</text>
      <text x="280" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="89" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pekerjaan aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Galeri foto</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Upload foto slot progress (0–100%).</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">GPS dalam desa</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Per slot</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Foto tersimpan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi geo-fencing sistem.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koordinat desa</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Foto diterima / ditolak</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Cetak PDF dokumentasi bila perlu.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Popup diizinkan</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PDF foto</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-foto.svg">sop-flow/sop-foto.svg</a></em></p>

---


## Bagian: Peta

## SOP-35 Peta Progress

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/map</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXXV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PETA PROGRESS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /map.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopmap" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmap)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmap)"/><line x1="120" y1="212" x2="120" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmap)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="89" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Peta</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik marker pekerjaan → lihat progress &amp; navigasi detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-map.svg">sop-flow/sop-map.svg</a></em></p>

---


## Bagian: Simulasi

## SOP-36 Simulasi Jaringan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/simulation</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXXVI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN SIMULASI JARINGAN PIPA</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /simulation.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopsimulation" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopsimulation)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopsimulation)"/><line x1="120" y1="212" x2="120" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopsimulation)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="89" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Simulasi</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur parameter jaringan → jalankan simulasi → analisa hasil.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-simulation.svg">sop-flow/sop-simulation.svg</a></em></p>

---


## Bagian: Berkas

## SOP-37 Berkas Digital

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/berkas</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXXVII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN BERKAS &amp; DRIVE 3-ZONA</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /berkas → pilih pekerjaan/zona.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopberkas" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="120" y1="56" x2="120" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopberkas)"/><line x1="120" y1="134" x2="120" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopberkas)"/><path d="M120 212 L120 234 L40 234 L40 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopberkas)"/><g>
    <rect x="89" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Berkas</text>
  </g><g>
    <rect x="89" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Upload</text>
  </g><g>
    <rect x="89" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="120" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Kelola</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pekerjaan aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Drive berkas</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Upload dokumen ke zona (kontrak/lapangan/arsip).</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Format file</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">File terunggah</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Preview / download / organize dokumen.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Berkas rapi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi kelengkapan register dokumen.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Register</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Lengkap</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-berkas.svg">sop-flow/sop-berkas.svg</a></em></p>

---


## Bagian: Publikasi

## SOP-38 Manajemen Publikasi

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/manajemen-publikasi</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXXVIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN MANAJEMEN PUBLIKASI</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /manajemen-publikasi (Publikasi).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopmanajemenpublikasi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmanajemenpublikasi)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmanajemenpublikasi)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmanajemenpublikasi)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmanajemenpublikasi)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopmanajemenpublikasi)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Publikasi</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buat/edit artikel publikasi program.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-manajemen-publikasi.svg">sop-flow/sop-manajemen-publikasi.svg</a></em></p>

---

## SOP-39 Komentar Publikasi

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/manajemen-publikasi/komentar</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XXXIX</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN MODERASI KOMENTAR PUBLIKASI</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka moderasi komentar.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopkomentarpublikasi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="91" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkomentarpublikasi)"/><line x1="40" y1="143" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkomentarpublikasi)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Moderasi</text>
  </g><path d="M64 117 L120 117" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="112" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="40,91 66,117 40,143 14,117" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="121" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Layak?</text>
      <text x="40" y="157" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak publikasi</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar komentar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Review komentar → approve/hide/delete.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kebijakan moderasi</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Komentar ditangani</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Publikasi tetap sesuai standar.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman publik aman</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-komentar-publikasi.svg">sop-flow/sop-komentar-publikasi.svg</a></em></p>

---


## Bagian: Users

## SOP-40 Users

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/users</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XL</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PENGELOLAAN USERS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /users (Users).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopusers" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopusers)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopusers)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopusers)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopusers)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopusers)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Users</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tambah/edit user &amp; assign role.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-users.svg">sop-flow/sop-users.svg</a></em></p>

---


## Bagian: Roles

## SOP-41 Roles

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/roles</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XLI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PENGELOLAAN ROLES</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /roles (Roles).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soproles" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soproles)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soproles)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soproles)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soproles)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-soproles)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Roles</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buat role &amp; assign permission.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-roles.svg">sop-flow/sop-roles.svg</a></em></p>

---


## Bagian: Permissions

## SOP-42 Permissions

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/permissions</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XLII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PENGELOLAAN PERMISSIONS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /permissions (Permissions).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppermissions" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppermissions)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppermissions)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppermissions)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppermissions)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-soppermissions)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Permissions</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Definisikan permission granular.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-permissions.svg">sop-flow/sop-permissions.svg</a></em></p>

---


## Bagian: Route Permissions

## SOP-43 Route Permissions

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/route-permissions</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XLIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN ROUTE PERMISSIONS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /route-permissions (Route Permissions).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soproutepermissions" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soproutepermissions)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soproutepermissions)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soproutepermissions)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soproutepermissions)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-soproutepermissions)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Route Permissions</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mapping route URL ke permission.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-route-permissions.svg">sop-flow/sop-route-permissions.svg</a></em></p>

---


## Bagian: Kegiatan Role

## SOP-44 Kegiatan Role

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/kegiatan-role</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XLIV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN KEGIATAN ROLE</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /kegiatan-role (Kegiatan Role).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopkegiatanrole" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkegiatanrole)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkegiatanrole)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkegiatanrole)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopkegiatanrole)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopkegiatanrole)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Kegiatan Role</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Batasi akses user per program kegiatan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-kegiatan-role.svg">sop-flow/sop-kegiatan-role.svg</a></em></p>

---


## Bagian: Menu Permissions

## SOP-45 Menu Permissions

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/menu-permissions</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XLV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN MENU PERMISSIONS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /menu-permissions (Menu Permissions).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopmenupermissions" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmenupermissions)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmenupermissions)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmenupermissions)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopmenupermissions)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopmenupermissions)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Menu Permissions</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur visibilitas menu sidebar per role.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-menu-permissions.svg">sop-flow/sop-menu-permissions.svg</a></em></p>

---


## Bagian: Audit Trail

## SOP-46 Audit Trail

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/audit-logs</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XLVI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN AUDIT TRAIL</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /audit-logs.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopauditlogs" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopauditlogs)"/><line x1="40" y1="134" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopauditlogs)"/><line x1="40" y1="212" x2="40" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopauditlogs)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Audit Trail</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Filter log aktivitas user → export untuk audit.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-audit-logs.svg">sop-flow/sop-audit-logs.svg</a></em></p>

---


## Bagian: Error Logs

## SOP-47 Debug Reporting

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/error-logs</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XLVII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN DEBUG REPORTING</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /error-logs.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soperrorlogs" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soperrorlogs)"/><line x1="40" y1="134" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soperrorlogs)"/><line x1="40" y1="212" x2="40" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soperrorlogs)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Error Logs</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Baca metrik, grafik, atau detail record.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-error-logs.svg">sop-flow/sop-error-logs.svg</a></em></p>

---


## Bagian: Settings

## SOP-48 Pengaturan Aplikasi

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/settings</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XLVIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PENGATURAN APLIKASI</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login Arumanis → buka /settings (Settings).</td>
  <td colspan="4" rowspan="5" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:390px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="390" viewBox="0 0 320 390" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopsettings" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopsettings)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopsettings)"/><path d="M40 221 L40 238.5 L280 238.5 L280 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopsettings)"/><path d="M280 290 L280 312 L40 312 L40 334" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopsettings)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><path d="M64 195 L120 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="92" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M120 195 L120 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopsettings)"/><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Valid?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="249" y="256" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="9" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses menu Settings</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar/data tampil</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ubah konfigurasi aplikasi &amp; template email/kontrak.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form lengkap</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Validasi field wajib &amp; format data.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Aturan validasi modul</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap simpan / pesan error</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Perbaiki bila Tidak</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik Simpan → sistem persist ke APIAMIS.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Koneksi API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi sukses</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi record di daftar / detail.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data tersimpan benar</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-settings.svg">sop-flow/sop-settings.svg</a></em></p>

---


## Bagian: Assign

## SOP-49 Assign Pekerjaan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/user-pekerjaan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN XLIX</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN ASSIGN PEKERJAAN KE PENGAWAS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /user-pekerjaan.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopuserpekerjaan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopuserpekerjaan)"/><path d="M40 134 L40 151.5 L200 151.5 L200 169" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopuserpekerjaan)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Assign</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Pilih</text>
  </g><path d="M176 195 L40 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="108" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><path d="M40 195 L40 100" fill="none" stroke="#2F5597" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-sopuserpekerjaan)"/><g>
      <polygon points="200,169 226,195 200,221 174,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="200" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Tampil?</text>
      <text x="200" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">User pengawas ada</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form assign</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pilih pengawas &amp; centang pekerjaan/paket.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar paket</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Assign tersimpan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Uji tampil di dashboard pengawas.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">SSO uji</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Penugasan OK</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-user-pekerjaan.svg">sop-flow/sop-user-pekerjaan.svg</a></em></p>

---


## Bagian: Broadcast

## SOP-50 Broadcast Notifikasi

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/notifications/broadcast</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN L</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN BROADCAST NOTIFIKASI</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /notifications/broadcast.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-sopbroadcast" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopbroadcast)"/><path d="M40 134 L40 156 L280 156 L280 178" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-sopbroadcast)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Broadcast</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Tulis</text>
  </g><g>
    <rect x="249" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Kirim</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak admin</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form broadcast</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tulis pesan &amp; pilih target role/user.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Konten jelas</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Preview</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kirim → notifikasi masuk ke pengguna.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Queue notifikasi</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Notifikasi terkirim</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-broadcast.svg">sop-flow/sop-broadcast.svg</a></em></p>

---


## Bagian: Puspen

## SOP-51 Puspen Dashboard

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/puspen</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PUSPEN — DASHBOARD KOMANDO</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /puspen.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppuspendashboard" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspendashboard)"/><line x1="40" y1="134" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspendashboard)"/><line x1="40" y1="212" x2="40" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspendashboard)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Puspen</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Monitor KPI lintas program &amp; drill-down pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-puspen-dashboard.svg">sop-flow/sop-puspen-dashboard.svg</a></em></p>

---

## SOP-52 Puspen Review Pekerjaan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/puspen/review-pekerjaan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PUSPEN — REVIEW PEKERJAAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /puspen/review-pekerjaan.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppuspenreview" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenreview)"/><line x1="40" y1="134" x2="40" y2="169" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenreview)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Review</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Cek</text>
  </g><path d="M64 195 L200 195" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="132" y="190" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="40,169 66,195 40,221 14,195" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="40" y="199" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Layak?</text>
      <text x="40" y="235" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Akses Puspen</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Antrian review</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka detail pekerjaan → cek foto/progress/RAB.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data lapangan sync</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 20 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Catatan review</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Approve / minta perbaikan ke pengawas.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Checklist review</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Status review</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-puspen-review.svg">sop-flow/sop-puspen-review.svg</a></em></p>

---

## SOP-53 Puspen Progress Fisik

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/puspen/progress-fisik</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PUSPEN — PROGRESS FISIK</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /puspen/progress-fisik.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppuspenprogress" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenprogress)"/><line x1="40" y1="134" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenprogress)"/><line x1="40" y1="212" x2="40" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenprogress)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Progress Fisik</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Analisa deviasi fisik per pekerjaan &amp; export.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-puspen-progress.svg">sop-flow/sop-puspen-progress.svg</a></em></p>

---


## Bagian: KPI Pengawas

## SOP-54 Puspen KPI Pengawas

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/puspen/pengawas-kpi</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LIV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PUSPEN — KPI PENGAWAS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /puspen/pengawas-kpi.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppuspenkpi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenkpi)"/><line x1="40" y1="134" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenkpi)"/><line x1="40" y1="212" x2="40" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenkpi)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses KPI Pengawas</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Baca metrik, grafik, atau detail record.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-puspen-kpi.svg">sop-flow/sop-puspen-kpi.svg</a></em></p>

---


## Bagian: Puspen

## SOP-55 Puspen Sign PDF

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/puspen/sign-pdf</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PUSPEN — TANDA TANGAN PDF</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Upload PDF ke Sign PDF.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppuspensignpdf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspensignpdf)"/><line x1="40" y1="134" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspensignpdf)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">PDF</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Sign</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">File PDF</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PDF loaded</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Letakkan tanda tangan digital.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sertifikat/TTD</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PDF signed</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Download &amp; simpan ke /berkas.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Dokumen arsip</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-puspen-sign-pdf.svg">sop-flow/sop-puspen-sign-pdf.svg</a></em></p>

---

## SOP-56 Puspen Organize PDF

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/puspen/organize-pdf</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LVI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PUSPEN — ORGANIZE PDF</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /puspen/organize-pdf.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppuspenorganize" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenorganize)"/><line x1="40" y1="134" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenorganize)"/><line x1="40" y1="212" x2="40" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenorganize)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Organize PDF</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Susun ulang halaman PDF → download.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-puspen-organize.svg">sop-flow/sop-puspen-organize.svg</a></em></p>

---


## Bagian: Media Sharing

## SOP-57 Puspen Media Sharing

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/puspen/media-sharing</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LVII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PUSPEN — MEDIA SHARING</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login → buka /puspen/media-sharing.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppuspenmedia" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="40" y1="56" x2="40" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenmedia)"/><line x1="40" y1="134" x2="40" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenmedia)"/><line x1="40" y1="212" x2="40" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppuspenmedia)"/><g>
    <rect x="9" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buka</text>
  </g><g>
    <rect x="9" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="9" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Analisis</text>
  </g><g>
    <rect x="9" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="40" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Hak akses Media Sharing</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman modul</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Atur filter tahun / wilayah / pencarian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data induk tersedia</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 menit</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Baca metrik, grafik, atau detail record.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Insight / ringkasan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Export atau tindak lanjut bila diperlukan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kebutuhan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan / keputusan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-puspen-media.svg">sop-flow/sop-puspen-media.svg</a></em></p>

---


## Bagian: Panel Pengawasan

## SOP-58 PG Dashboard

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pengawasan/</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LVIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PANEL PENGAWASAN — DASHBOARD</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">SSO login → dashboard /pengawasan/.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppgdashboard" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="200" y1="56" x2="200" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgdashboard)"/><line x1="200" y1="134" x2="200" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgdashboard)"/><g>
    <rect x="169" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">SSO</text>
  </g><g>
    <rect x="169" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">KPI</text>
  </g><g>
    <rect x="169" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Penugasan aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">KPI &amp; filter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Baca KPI, filter paket, buka perlu perhatian.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Harian</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Prioritas paket</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Navigasi ke pekerjaan / tiket / laporan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Modul tujuan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-pg-dashboard.svg">sop-flow/sop-pg-dashboard.svg</a></em></p>

---

## SOP-59 PG Daftar Pekerjaan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pengawasan/pekerjaan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LIX</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PANEL PENGAWASAN — DAFTAR PEKERJAAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /pengawasan/pekerjaan.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppgpekerjaan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="200" y1="56" x2="200" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgpekerjaan)"/><line x1="200" y1="134" x2="200" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgpekerjaan)"/><g>
    <rect x="169" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Daftar</text>
  </g><g>
    <rect x="169" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Filter</text>
  </g><g>
    <rect x="169" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Detail</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Assign aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tabel paket</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Filter &amp; paginasi daftar pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Paket terfilter</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik baris → buka detail pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 1 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Halaman detail</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-pg-pekerjaan.svg">sop-flow/sop-pg-pekerjaan.svg</a></em></p>

---

## SOP-60 PG Detail Pekerjaan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pengawasan/pekerjaan/:id</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LX</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PANEL PENGAWASAN — DETAIL PEKERJAAN (6 TAB)</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tab Ringkasan: baca metadata paket &amp; status foto.</td>
  <td colspan="4" rowspan="6" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:468px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="468" viewBox="0 0 320 468" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppgdetail" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="200" y1="56" x2="200" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgdetail)"/><line x1="200" y1="134" x2="200" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgdetail)"/><line x1="200" y1="212" x2="200" y2="256" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgdetail)"/><line x1="200" y1="290" x2="200" y2="334" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgdetail)"/><line x1="200" y1="368" x2="200" y2="403" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgdetail)"/><g>
    <rect x="169" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Ringkasan</text>
  </g><g>
    <rect x="169" y="100" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Output</text>
  </g><g>
    <rect x="169" y="178" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Penerima</text>
  </g><g>
    <rect x="169" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Foto GPS</text>
  </g><g>
    <rect x="169" y="334" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="355" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Progress</text>
  </g><path d="M224 429 L280 429" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="252" y="424" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="200,403 226,429 200,455 174,429" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="200" y="433" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Kendala?</text>
      <text x="200" y="469" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Konteks paket</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tab Output: kelola komponen output pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">RAB</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output lengkap</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tab Penerima: input individu/komunal, jiwa, NIK.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data penerima</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 20 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Penerima tercatat</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tab Foto: upload slot 0–100% + GPS per output.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">GPS aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Per kunjungan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Matriks foto</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">5.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tab Progress: estimasi fisik &amp; keuangan mingguan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form progress</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mingguan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Deviasi update</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">6.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tab Tiket: buat/lihat tiket terkait paket.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Modul tiket</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesuai kejadian</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tiket / selesai</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-pg-detail.svg">sop-flow/sop-pg-detail.svg</a></em></p>

---

## SOP-61 PG Buat Laporan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pengawasan/buat-laporan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LXI</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PANEL PENGAWASAN — BUAT LAPORAN MINGGUAN</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /pengawasan/buat-laporan → pilih paket.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppgbuatlaporan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="200" y1="56" x2="200" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgbuatlaporan)"/><path d="M200 134 L200 156 L280 156 L280 178" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgbuatlaporan)"/><path d="M280 212 L280 234 L200 234 L200 256" fill="none" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgbuatlaporan)"/><g>
    <rect x="169" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Pilih</text>
  </g><g>
    <rect x="169" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Input</text>
  </g><g>
    <rect x="249" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="280" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Simpan</text>
  </g><g>
    <rect x="169" y="256" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="277" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Minggu aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Form laporan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Isi Rencana &amp; Realisasi per item RAB.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kunjungan lapangan</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 30 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Angka terisi</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Simpan → sinkron ke APIAMIS/Arumanis.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">API aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Real-time</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Laporan tersimpan</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Verifikasi di tab Progress pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Konsisten</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-pg-buat-laporan.svg">sop-flow/sop-pg-buat-laporan.svg</a></em></p>

---

## SOP-62 PG Tiket

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pengawasan/tiket</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LXII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PANEL PENGAWASAN — TIKET KENDALA</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /pengawasan/tiket.</td>
  <td colspan="4" rowspan="4" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:312px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="312" viewBox="0 0 320 312" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppgtiket" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="200" y1="56" x2="200" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgtiket)"/><line x1="200" y1="134" x2="200" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgtiket)"/><line x1="200" y1="212" x2="200" y2="247" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgtiket)"/><g>
    <rect x="169" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Tiket</text>
  </g><g>
    <rect x="169" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Buat</text>
  </g><g>
    <rect x="169" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Pantau</text>
  </g><path d="M176 273 L40 273" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="108" y="268" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="200,247 226,273 200,299 174,273" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="200" y="277" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Selesai?</text>
      <text x="200" y="313" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Login SSO</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Daftar tiket</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buat tiket: judul, deskripsi, paket terkait.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kendala lapangan</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 10 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tiket terbuka</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pantau komentar &amp; status dari kantor.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Harian</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tindak lanjut</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">4.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tutup bila kendala selesai.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 5 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tiket closed</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-pg-tiket.svg">sop-flow/sop-pg-tiket.svg</a></em></p>

---

## SOP-63 PG Notifikasi

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pengawasan/notifikasi</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LXIII</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PANEL PENGAWASAN — NOTIFIKASI</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /pengawasan/notifikasi atau bell icon.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppgnotifikasi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="200" y1="56" x2="200" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgnotifikasi)"/><line x1="200" y1="134" x2="200" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgnotifikasi)"/><g>
    <rect x="169" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Notif</text>
  </g><g>
    <rect x="169" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Baca</text>
  </g><g>
    <rect x="169" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 1 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Riwayat notif</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Baca broadcast &amp; deadline dari kantor.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Harian</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Inbox clear</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Klik notifikasi → navigasi ke modul terkait.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Link valid</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 2 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tindak lanjut</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-pg-notifikasi.svg">sop-flow/sop-pg-notifikasi.svg</a></em></p>

---

## SOP-64 PG Profil

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pengawasan/profile</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LXIV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PANEL PENGAWASAN — PROFIL PENGAWAS</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /pengawasan/profile.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppgprofil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="200" y1="56" x2="200" y2="91" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgprofil)"/><line x1="200" y1="143" x2="200" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgprofil)"/><g>
    <rect x="169" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Profil</text>
  </g><path d="M176 117 L40 117" fill="none" stroke="#2F5597" stroke-width="1.8"/><text x="108" y="112" text-anchor="middle" font-size="9" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text><g>
      <polygon points="200,91 226,117 200,143 174,117" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="200" y="121" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">Cocok?</text>
      <text x="200" y="157" text-anchor="middle" font-size="8" font-weight="bold" fill="#2F5597" font-family="Arial">Ya</text>
    </g><g>
    <rect x="169" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 1 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Data user</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Cek kecocokan NIP dengan master /pengawas.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Master pengawas</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 3 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Profil valid / hubungi admin</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Logout dari menu profil bila selesai.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 1 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sesi berakhir</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-pg-profil.svg">sop-flow/sop-pg-profil.svg</a></em></p>

---

## SOP-65 PG Panduan

<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:4px 0;"><strong>Route:</strong> <code>/pengawasan/panduan</code></p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">LAMPIRAN LXV</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="border:1px solid #000;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" style="border:1px solid #000;background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">PROSEDUR PELAKSANAAN PANEL PENGAWASAN — PANDUAN IN-APP</td></tr>
<tr>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">No.</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Kegiatan</td>
  <td colspan="4" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pelaksana</td>
  <td colspan="3" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Mutu Baku</td>
  <td rowspan="2" style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ket</td>
</tr>
<tr>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Admin</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Operator</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pengawas</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Sistem</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Persyaratan / Kelengkapan</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Waktu</td>
  <td style="border:1px solid #000;background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Output</td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">1.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Buka /pengawasan/panduan.</td>
  <td colspan="4" rowspan="3" style="border:1px solid #000;padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:234px">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="234" viewBox="0 0 320 234" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"><defs>
    <marker id="arr-soppgpanduan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
    </marker>
  </defs><line x1="200" y1="56" x2="200" y2="100" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgpanduan)"/><line x1="200" y1="134" x2="200" y2="178" stroke="#2F5597" stroke-width="2" marker-end="url(#arr-soppgpanduan)"/><g>
    <rect x="169" y="22" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Panduan</text>
  </g><g>
    <rect x="169" y="100" width="62" height="34" rx="4" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="121" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Pelajari</text>
  </g><g>
    <rect x="169" y="178" width="62" height="34" rx="4" fill="#5B9BD5" stroke="#000" stroke-width="1.5"/>
    <text x="200" y="199" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">Selesai</text>
  </g></svg>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed"><tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>
<tr style="height:78px">
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000;width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr></table>
  </div>
</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 1 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Tutorial interaktif</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">2.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Ikuti langkah upload foto, progress, tiket.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">± 15 mnt</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pemahaman alur</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
<tr style="height:78px">
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">3.</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Praktikkan di modul pekerjaan.</td>
  
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Penugasan aktif</td>
  <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;">—</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Siap operasional</td>
  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;"></td>
</tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;font-size:10px;"><em>Flowchart SVG: <a href="sop-flow/sop-pg-panduan.svg">sop-flow/sop-pg-panduan.svg</a></em></p>

---


## Lampiran Referensi

| Dokumen | Lokasi |
|:--------|:-------|
| Panduan modul | [docs/user-guide/](user-guide/index.md) |
| Panel pengawasan | [docs/user-guide/pengawas-panel.md](user-guide/pengawas-panel.md) |
| Flowchart SVG | [docs/sop-flow/](sop-flow/) |
| Sidebar modul | `src/components/layout/data/sidebar-data.ts` |

| Regenerasi | Perintah |
|:-----------|:---------|
| Markdown | `bun run docs:sop:md` |
| Word | `bun run docs:sop` |
| Excel | `bun run docs:sop:xlsx` |

---

*65 SOP — satu lembar per modul/alur. Shape dan garis penghubung dirender sebagai SVG di area Pelaksana.*
