# Arumanis Project To-Do List

Daftar rekomendasi fitur dan optimalisasi untuk pengembangan aplikasi ARUMANIS selanjutnya.

## Backlog Prioritas Produk

Urutan ini disusun dari dampak tertinggi ke tambahan nilai yang berikutnya.

### Epic 1 - Workflow Operasional

#### 1.1 Approval flow untuk pekerjaan, kontrak, publikasi
- [ ] User story: Sebagai admin/editor, saya ingin perubahan penting masuk ke status review sebelum publish agar data tidak langsung final.
- [ ] Acceptance criteria:
  - Status minimal mencakup `draft`, `review`, `approved`, `rejected`.
  - Aksi approval tercatat di audit log.
  - Item yang belum approved tidak tampil sebagai final di tampilan publik.

#### 1.2 Bulk action di list utama
- [ ] User story: Sebagai operator, saya ingin memilih banyak item sekaligus agar pekerjaan massal selesai lebih cepat.
- [ ] Acceptance criteria:
  - Bisa select multiple row.
  - Aksi massal tersedia untuk status, assign, export, dan hapus jika diizinkan.
  - Ada konfirmasi sebelum eksekusi.

#### 1.3 Filter/search/sort seragam
- [ ] User story: Sebagai user operasional, saya ingin pola pencarian yang konsisten agar saya tidak belajar ulang di tiap modul.
- [ ] Acceptance criteria:
  - Semua tabel utama punya search.
  - Filter dan sort mengikuti pola yang sama.
  - State query bisa dipertahankan saat reload atau navigasi kembali.

### Epic 2 - Visibilitas dan Kontrol

#### 2.1 Dashboard role-based
- [ ] User story: Sebagai admin, operator, pengawas, atau editor, saya ingin melihat ringkasan berbeda sesuai tugas saya.
- [ ] Acceptance criteria:
  - Widget menyesuaikan role.
  - Admin melihat kontrol dan alarm sistem.
  - Pengawas melihat tugas lapangan dan notifikasi kerja.

#### 2.2 Audit trail yang bisa difilter
- [ ] User story: Sebagai admin, saya ingin mencari histori perubahan per modul dan user agar investigasi cepat.
- [ ] Acceptance criteria:
  - Filter per modul, user, aksi, dan rentang waktu.
  - Detail before/after untuk perubahan penting.
  - Data bisa diekspor jika diperlukan.

#### 2.3 Saved views dan quick assign
- [ ] User story: Sebagai user, saya ingin menyimpan tampilan kerja dan menugaskan orang cepat agar alur harian lebih pendek.
- [ ] Acceptance criteria:
  - Filter favorit bisa disimpan.
  - Quick assign tersedia di `user-pekerjaan`, `pengawas`, dan `penerima`.
  - Aksi assign tidak mengharuskan pindah halaman detail penuh.

### Epic 3 - Automasi dan Integrasi

#### 3.1 Template dan inline editing
- [ ] User story: Sebagai editor/admin, saya ingin memakai template dan edit ringan langsung dari list agar input berulang berkurang.
- [ ] Acceptance criteria:
  - Template dapat dipakai ulang untuk data berulang.
  - Field ringan bisa diedit inline.
  - Validasi tetap jalan sebelum simpan.

#### 3.2 Unified upload experience
- [ ] User story: Sebagai user lapangan, saya ingin pola upload yang sama di berkas dan foto agar tidak bingung.
- [ ] Acceptance criteria:
  - Upload punya progress, retry, dan preview yang konsisten.
  - Error upload muncul jelas.
  - Metadata penting tidak hilang saat proses upload.

#### 3.3 Bulk import/export dan activity feed
- [ ] User story: Sebagai admin, saya ingin impor/ekspor massal dan melihat aktivitas lintas modul agar administrasi lebih cepat.
- [ ] Acceptance criteria:
  - Excel import/export tersedia di modul yang relevan.
  - Activity feed menampilkan event lintas modul.
  - Item aktivitas bisa ditautkan ke entitas sumbernya.

### Epic 4 - Permission dan Akses

#### 4.1 Advanced permission matrix
- [ ] User story: Sebagai admin, saya ingin satu alur kontrol untuk menu, route, dan role agar aturan akses tidak tercerai-berai.
- [ ] Acceptance criteria:
  - Menu permission, route permission, dan role permission bisa dibaca bersama.
  - Perubahan permission mempengaruhi sidebar dan route protection.
  - Konfigurasi akses konsisten antara frontend dan backend.

### Epic 5 - Lapangan dan Reliabilitas

#### 5.1 Offline/poor-network support
- [ ] User story: Sebagai pengawas lapangan, saya ingin aplikasi tetap bisa dipakai saat sinyal jelek agar pekerjaan tidak berhenti.
- [ ] Acceptance criteria:
  - Data penting bisa disimpan sementara lokal.
  - Ada antrean sinkronisasi saat koneksi kembali.
  - User tahu mana data yang belum terkirim.

#### 5.2 Notifikasi event-driven
- [ ] User story: Sebagai user terkait, saya ingin mendapat notifikasi otomatis saat ada perubahan penting agar respon saya cepat.
- [ ] Acceptance criteria:
  - Notifikasi dipicu oleh event status, assignment, komentar, atau dokumen baru.
  - Preferensi notifikasi bisa diatur per role atau user.
  - Notifikasi masuk ke UI dan, bila aktif, kanal real-time.

## 🗺️ Visual & UX Peta (Map Page)
- [ ] **Marker Clustering**: Mengelompokkan marker yang berdekatan untuk meningkatkan performa dan kebersihan visual.
- [ ] **Color-Coded Progress**: Pewarnaan marker berdasarkan persentase kemajuan (Merah < 30%, Kuning 30-70%, Hijau > 70%).
- [ ] **Spiderfy for Overlap**: Memekarkan marker yang menumpuk di koordinat yang sama (seperti di titik tengah desa) saat diklik.
- [ ] **Export Laporan Geo-Spasial**: Fitur untuk mengekspor peta (markers/heatmaps) ke format PDF atau Image.

## 📱 Fitur Lapangan (Pengawas)
- [x] **Geo-Fencing Validation**: Validasi lokasi pengambilan foto berdasarkan koordinat rencana pekerjaan.
- [x] **Offline Photo Queue (PWA)**: Antrean unggah foto luring untuk lokasi proyek dengan sinyal rendah.
- [x] **Camera Integration**: Integrasi langsung dengan kamera device untuk watermark otomatis (tanggal & koordinat).

## 📊 Analytics & Reporting
- [x] **Dashboard Analytics**: Mengaktifkan tab Analytics dengan grafik tren progres fisik vs rencana.
- [x] **Statistik per Wilayah**: Perbandingan performa pembangunan antar kecamatan dalam bentuk diagram.
- [x] **Advanced Filtering**: Filter berdasarkan multi-kecamatan, kategori pekerjaan, atau rentang progres.
- [ ] **Bulk Export Implementation**: Implementasi logika backend dan frontend untuk ekspor massal di tab Reports (PDF/Excel).

## 🛡️ Data Integrity & Backend
- [x] **Data Quality Dashboard**: Panel admin untuk mendeteksi data yang tidak lengkap (koordinat kosong, foto progres minim).
- [x] **Log Perubahan (Auditing)**: Melacak histori perubahan data krusial pada pekerjaan dan kontrak.

## 🔍 Search & Filtering
- [ ] **Search by Contractor**: Pencarian lokasi pekerjaan berdasarkan nama Penyedia/Kontraktor.
- [ ] **Global Search Enhancement**: Integrasi hasil pencarian pekerjaan langsung ke navigasi peta.

## 👤 User & Reporting Expansion
- [ ] **Extended User Profiles**: Implementasi profil pengguna dengan tambahan field NIP dan Jabatan.
- [ ] **Export Signature Integration**: Mengintegrasikan Nama, NIP, dan Jabatan profil ke dalam export progres pekerjaan (PDF/Excel) untuk tanda tangan laporan.

## 📜 Document Automation & Administration
- [ ] **Automatic Document Numbering**: Sistem penomoran otomatis untuk SPPBJ, SPK, SPMK, dan semua jenis Berita Acara.
    - [ ] **Format Standar**: Implementasi format `602.4/(TIPE)/PPK/DISPERKIM-AMS.{ID_PEKERJAAN}.{URUT_SURAT}/{TAHUN}`.
    - [ ] **Sequential Counter Logic**: Pelacakan nomor urut surat (`URUT_SURAT`) per tipe dokumen dan tahun anggaran.
    - [ ] **Dynamic Data Injection**: Mapping otomatis `{ID_PEKERJAAN}` dari database dan `{TAHUN}` dari fiscal year aktif.
    - [ ] **Auto-Fill Integration**: Integrasi nomor otomatis langsung ke form input dokumen terkait.
    - [ ] **Conflict Prevention**: Mekanisme untuk mencegah nomor ganda saat pembuatan dokumen massal.

## 💰 RAB (Rencana Anggaran Biaya)
- [ ] **AHSP Import System**: Import data AHSP Cipta Karya SE Bina Konstruksi No. 30/2025 ke database.
    - [ ] Migrasi tabel `tbl_ahsp_kategori`, `tbl_ahsp_item`, `tbl_ahsp_koefisien`.
    - [ ] Artisan command `php artisan ahsp:import` untuk import Excel.
- [ ] **RAB CRUD API**: Endpoint untuk membuat dan mengelola RAB per pekerjaan.
    - [ ] Model `Rab`, `RabItem` dengan relasi ke `Pekerjaan` dan `AhspItem`.
    - [ ] Controller untuk kalkulasi otomatis (volume × harga satuan + PPN).
- [ ] **RAB Frontend**:
    - [ ] Tab RAB di halaman detail Pekerjaan.
    - [ ] Selector AHSP item dengan search dan kategori filter.
    - [ ] Tabel RAB dengan input volume dan kalkulasi otomatis.
    - [ ] Export RAB ke PDF/Excel.

## 🔔 Real-Time & Notifications
- [ ] **Push Notifications**: Notifikasi instan ke device Pengawas jika ada komentar baru di Tiket atau instruksi dari Admin.
- [ ] **Sistem Disposisi Tiket**: Alur kerja formal untuk memindahkan tiket/kendala dari satu bagian ke bagian lain (misal: dari teknis ke pengadaan).

## ⚡ Performance & Media Optimization
- [ ] **Automated Image Compression**: Kompresi otomatis pada sisi client atau server sebelum foto disimpan tanpa menghilangkan metadata GPS.
- [ ] **Lazy Loading Map Layers**: Hanya memuat data peta (GeoJSON) yang sedang dilihat (viewbound) untuk menghemat data dan memory browser.

## 🛡️ Maintenance & Reliability
- [ ] **Automated Daily Backups**: Sistem pencadangan database dan media (S3/Cloud Storage) secara berkala.
- [ ] **Data Archive System**: Fitur untuk melakukan "Freeze" atau pengarsipan data di akhir Tahun Anggaran agar tidak bisa diubah lagi.
- [ ] **Debug Reporting Center**: Sistem pencatatan error runtime agar admin bisa memantau masalah aplikasi dari dashboard.
    - [ ] **Backend Error Capture**: Simpan exception backend penting ke tabel khusus `error_logs` melalui handler global.
    - [ ] **Admin Debug Dashboard**: Halaman admin untuk melihat daftar error, detail stack/context, filter, dan status penyelesaian.
    - [ ] **Dashboard Summary Widget**: Ringkasan error terbaru, total error hari ini, dan error belum terselesaikan.
    - [ ] **Frontend Error Reporting**: Opsi untuk mengirim error client-side penting ke backend agar masalah browser juga tercatat.

## 📱 PWA & UX Enhancement
- [ ] **Smart Local Caching**: Menyimpan data dasar (kecamatan, desa, daftar pekerjaan) secara lokal untuk akses luring di daerah blank spot.
- [ ] **Guided Tour / Tutorial**: Panduan interaktif singkat untuk user baru (terutama pengawas lapangan) saat pertama kali login.

## 🌊 Hydraulic Simulation Enhancement

### ✅ Completed
- [x] **EPANET.js Integration**: Engine hidrolika untuk simulasi tekanan dan aliran air pada jaringan pipa langsung di browser.
- [x] **Network Editor**: Interactive map-based drawing tool dengan 8 mode (junction, reservoir, tank, pipe, pump, valve).
- [x] **INP File Import/Export**: Support format EPANET 2.2 standard.
- [x] **KMZ/KML Import**: Import dari Google Earth dengan auto-elevation fetching.
- [x] **Extended Period Simulation**: Simulasi 24 jam dengan time-step selector.
- [x] **Pressure/Flow Visualization**: Color-coded visualization dengan dynamic legends.
- [x] **Properties Panel**: Edit semua properti node dan link secara real-time.

### 🔴 Prioritas Tinggi (Critical)
- [ ] **Backend Integration & Persistence**:
    - [ ] Buat API endpoints untuk save/load networks ke database.
    - [ ] Model `SimulationNetwork` di backend dengan relasi ke User.
    - [x] Auto-save & version history untuk tracking perubahan.
    - [ ] User ownership & sharing permissions.
- [ ] **Integrasi dengan Pekerjaan**:
    - [ ] Link simulasi ke pekerjaan infrastruktur air (foreign key).
    - [ ] Attach network designs ke kontrak (SPPBJ/SPK).
    - [ ] Validasi desain vs kebutuhan proyek.
    - [ ] Include simulation dalam progress reports.
- [x] **Undo/Redo System**:
    - [x] Implementasi command pattern untuk action history.
    - [x] Keyboard shortcuts (Ctrl+Z, Ctrl+Y).
    - [ ] History panel untuk melihat dan revert perubahan.

### 🟡 Prioritas Menengah (Enhancement)
- [ ] **Water Quality Simulation**:
    - [ ] Chlorine decay modeling.
    - [ ] Water age analysis.
    - [ ] Contaminant source tracing.
- [ ] **Demand Patterns & Time Controls**:
    - [x] Pola permintaan harian/mingguan (multiplier patterns).
    - [ ] Pump scheduling & time-based rules.
    - [ ] Seasonal demand variations.
- [ ] **Advanced Pump & Valve Modeling**:
    - [ ] Pump curves (Head vs Flow diagram).
    - [ ] Variable speed drives simulation.
    - [ ] Multiple pump operation modes.
- [x] **Time-Step Animation**:
    - [x] Play/pause button untuk animate through time steps.
    - [x] Speed control untuk animation.
    - [x] Timeline scrubber.
- [x] **Enhanced Visualization**:
    - [x] Pressure contour maps (interpolasi antar node).
    - [x] 3D pipe network view dengan elevation.
    - [x] Profile/longitudinal section views.
- [x] **Reporting & Export**:
    - [x] Export diagram ke PNG/SVG.
    - [x] PDF report generation (network + results).
    - [x] Excel report dengan summary statistics.
    - [ ] Integration dengan existing berkas feature.

### 🟢 Prioritas Rendah (Nice to Have)
- [ ] **Additional Import/Export Formats**:
    - [ ] Shapefile (.shp) import/export.
    - [ ] CAD file import (.dxf).
    - [ ] GeoJSON export.
    - [ ] CSV bulk data import.
- [ ] **Network Templates & Library**:
    - [ ] Pre-built network templates.
    - [ ] Sample networks untuk learning.
    - [ ] Copy/paste functionality.
    - [ ] Network library dengan search.
- [ ] **Analysis Tools**:
    - [ ] Fire flow analysis.
    - [ ] Energy cost calculation.
    - [ ] Pipe aging/deterioration modeling.
    - [ ] Leak detection simulation.
    - [ ] Pressure zone management.
- [ ] **Calibration & Optimization**:
    - [ ] Field measurement comparison.
    - [ ] Auto-calibration tools.
    - [ ] Pipe sizing optimization.
    - [ ] Pump selection assistant.
- [ ] **GIS Integration**:
    - [ ] Overlay dengan GeoJSON kecamatan/desa.
    - [ ] Service area analysis.
    - [ ] Population-based demand estimation.
- [ ] **Collaboration Features**:
    - [ ] Real-time collaboration (WebSocket).
    - [ ] Comments & annotations pada network.
    - [ ] Review workflow.
    - [ ] Network sharing dengan permissions.

### ⚡ Quick Wins (Low Effort, High Impact)
- [x] **Keyboard Shortcuts**: Delete key, Escape untuk cancel, Arrow keys untuk pan.
- [x] **Network Statistics Dashboard**: Summary (total nodes, pipes, length, avg pressure).
- [x] **Tooltips & Help Text**: Contextual help untuk setiap tool dan property.
- [x] **Auto-save ke localStorage**: Prevent data loss saat browser crash.
- [x] **Network Validation Warnings**: Warning untuk orphan nodes, disconnected pipes, dll.
- [x] **Zoom to Fit**: Button untuk zoom ke extent seluruh network.

## 🧠 AI & Smart Analytics (Medium-Hard)
- [ ] **Predictive Delay Model**: Implementasi algoritma untuk memprediksi potensi keterlambatan pekerjaan berdasarkan tren progres mingguan dan performa historis penyedia.
- [ ] **Natural Language Data Explorer**: Asisten AI (LLM) untuk melakukan kueri data dashboard menggunakan bahasa alami (misal: "Berapa sisa pagu di desa yang belum memiliki foto progres 100%?").

## 📍 Advanced GIS Engine (Medium-Hard)
- [ ] **Service Coverage Analysis**: Perhitungan otomatis cakupan layanan (area pelayanan) menggunakan algoritma Buffer atau Voronoi berdasarkan lokasi sarana.
- [ ] **Pipe Network Topology**: Implementasi struktur data Graf pada jaringan pipa untuk fitur *Network Tracing* (mencari titik hulu/hilir saat terjadi kebocoran).

## ⚙️ DevOps & Architecture
- [ ] **Event-Driven UI Updates**: Implementasi WebSocket (Laravel Reverb/Socket.io) agar dashboard diperbarui secara real-time saat ada update progres dari lapangan.
- [ ] **Horizontal Scaling Readiness**: Optimisasi state management (Redis) dan filesystem (S3) agar aplikasi siap dipindahkan ke arsitektur High Availability (HA).

## 🧪 Quality Assurance & Testing
- [/] **Frontend Unit Testing**: Implementasi unit testing menggunakan Vitest dan React Testing Library.
    - [ ] **Utility Tests**: Testing fungsi helper di `src/lib/`.
    - [ ] **Store Tests**: Testing logic state management Zustand di `src/stores/`.
    - [ ] **Hook Tests**: Testing custom hooks di `src/hooks/`.
    - [ ] **Component Tests**: Testing komponen UI kritis dan navigasi.
- [ ] **Coverage Monitoring**: Pengaturan laporan cakupan kode (code coverage) untuk memastikan area krusial teruji.

## 🍉 WatermelonDB Integration (Offline-First)

Implementasi database lokal untuk akses data luring (offline) yang lebih responsif dan sinkronisasi otomatis.

### Backend (apiamis)
- [ ] **SoftDeletes Preparation**: Menambahkan `SoftDeletes` pada model `Pekerjaan`, `Penerima`, `Output`, dan `Foto`.
- [ ] **Sync API - Pull Endpoint**: Implementasi endpoint untuk mengambil perubahan data terbaru dari server.
- [ ] **Sync API - Push Endpoint**: Implementasi endpoint untuk menerima dan memproses perubahan data dari client.

### Frontend (bun)
- [ ] **WatermelonDB Setup**: Instalasi dan konfigurasi dasar database lokal.
- [ ] **Schema & Models Definition**: Membuat skema database lokal dan model untuk Pekerjaan, Penerima, Output, dan Foto.
- [ ] **Sync Service**: Implementasi protokol sinkronisasi otomatis antara WatermelonDB dan Laravel API.
- [ ] **UI Refactor**: Mengubah komponen Tab (Penerima, Foto, dll) agar membaca data secara reaktif dari database lokal.
- [ ] **Conflict Management**: Sistem penanganan konflik data saat sinkronisasi.
