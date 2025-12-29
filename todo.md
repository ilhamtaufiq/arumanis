# Arumanis Project To-Do List

Daftar rekomendasi fitur dan optimalisasi untuk pengembangan aplikasi ARUMANIS selanjutnya.

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

## 🔔 Real-Time & Notifications
- [ ] **Push Notifications**: Notifikasi instan ke device Pengawas jika ada komentar baru di Tiket atau instruksi dari Admin.
- [ ] **Sistem Disposisi Tiket**: Alur kerja formal untuk memindahkan tiket/kendala dari satu bagian ke bagian lain (misal: dari teknis ke pengadaan).

## ⚡ Performance & Media Optimization
- [ ] **Automated Image Compression**: Kompresi otomatis pada sisi client atau server sebelum foto disimpan tanpa menghilangkan metadata GPS.
- [ ] **Lazy Loading Map Layers**: Hanya memuat data peta (GeoJSON) yang sedang dilihat (viewbound) untuk menghemat data dan memory browser.

## 🛡️ Maintenance & Reliability
- [ ] **Automated Daily Backups**: Sistem pencadangan database dan media (S3/Cloud Storage) secara berkala.
- [ ] **Data Archive System**: Fitur untuk melakukan "Freeze" atau pengarsipan data di akhir Tahun Anggaran agar tidak bisa diubah lagi.

## 📱 PWA & UX Enhancement
- [ ] **Smart Local Caching**: Menyimpan data dasar (kecamatan, desa, daftar pekerjaan) secara lokal untuk akses luring di daerah blank spot.
- [ ] **Guided Tour / Tutorial**: Panduan interaktif singkat untuk user baru (terutama pengawas lapangan) saat pertama kali login.

## 🌊 Advanced Hydraulic & Engineering (Hard)
- [ ] **EPANET.js Integration**: Integrasi engine hidrolika untuk simulasi tekanan dan aliran air pada jaringan pipa langsung di browser menggunakan file `.inp`.
- [ ] **Hydraulic Visualizer**: Layer peta dinamis yang menampilkan hasil simulasi (degradasi tekanan, kecepatan aliran, path tracing).

## 🧠 AI & Smart Analytics (Medium-Hard)
- [ ] **Predictive Delay Model**: Implementasi algoritma untuk memprediksi potensi keterlambatan pekerjaan berdasarkan tren progres mingguan dan performa historis penyedia.
- [ ] **Natural Language Data Explorer**: Asisten AI (LLM) untuk melakukan kueri data dashboard menggunakan bahasa alami (misal: "Berapa sisa pagu di desa yang belum memiliki foto progres 100%?").

## 📍 Advanced GIS Engine (Medium-Hard)
- [ ] **Service Coverage Analysis**: Perhitungan otomatis cakupan layanan (area pelayanan) menggunakan algoritma Buffer atau Voronoi berdasarkan lokasi sarana.
- [ ] **Pipe Network Topology**: Implementasi struktur data Graf pada jaringan pipa untuk fitur *Network Tracing* (mencari titik hulu/hilir saat terjadi kebocoran).

## ⚙️ DevOps & Architecture
- [ ] **Event-Driven UI Updates**: Implementasi WebSocket (Laravel Reverb/Socket.io) agar dashboard diperbarui secara real-time saat ada update progres dari lapangan.
- [ ] **Horizontal Scaling Readiness**: Optimisasi state management (Redis) dan filesystem (S3) agar aplikasi siap dipindahkan ke arsitektur High Availability (HA).
