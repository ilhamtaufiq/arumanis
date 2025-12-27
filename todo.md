# Arumanis Project To-Do List

Daftar rekomendasi fitur dan optimalisasi untuk pengembangan aplikasi ARUMANIS selanjutnya.

## 🗺️ Visual & UX Peta (Map Page)
- [ ] **Marker Clustering**: Mengelompokkan marker yang berdekatan untuk meningkatkan performa dan kebersihan visual.
- [ ] **Color-Coded Progress**: Pewarnaan marker berdasarkan persentase kemajuan (Merah < 30%, Kuning 30-70%, Hijau > 70%).
- [ ] **Spiderfy for Overlap**: Memekarkan marker yang menumpuk di koordinat yang sama (seperti di titik tengah desa) saat diklik.
- [ ] **Export Laporan Geo-Spasial**: Fitur untuk mengekspor peta (markers/heatmaps) ke format PDF atau Image.

## 📱 Fitur Lapangan (Pengawas)
- [ ] **Geo-Fencing Validation**: Validasi lokasi pengambilan foto berdasarkan koordinat rencana pekerjaan.
- [ ] **Offline Photo Queue (PWA)**: Antrean unggah foto luring untuk lokasi proyek dengan sinyal rendah.
- [ ] **Camera Integration**: Integrasi langsung dengan kamera device untuk watermark otomatis (tanggal & koordinat).

## 📊 Analytics & Reporting
- [ ] **Dashboard Analytics**: Mengaktifkan tab Analytics dengan grafik tren progres fisik vs rencana.
- [ ] **Statistik per Wilayah**: Perbandingan performa pembangunan antar kecamatan dalam bentuk diagram.
- [ ] **Advanced Filtering**: Filter berdasarkan multi-kecamatan, kategori pekerjaan, atau rentang progres.

## 🛡️ Data Integrity & Backend
- [x] **Data Quality Dashboard**: Panel admin untuk mendeteksi data yang tidak lengkap (koordinat kosong, foto progres minim).
- [x] **Log Perubahan (Auditing)**: Melacak histori perubahan data krusial pada pekerjaan dan kontrak.

## 🔍 Search & Filtering
- [ ] **Search by Contractor**: Pencarian lokasi pekerjaan berdasarkan nama Penyedia/Kontraktor.
- [ ] **Global Search Enhancement**: Integrasi hasil pencarian pekerjaan langsung ke navigasi peta.
