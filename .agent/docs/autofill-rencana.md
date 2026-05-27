# Dokumentasi: Fitur Auto-Fill Rencana Mingguan Berbasis Logika Konstruksi

Dokumen ini menjelaskan implementasi fitur **Auto-Fill Rencana Mingguan** yang menghubungkan backend APIAMIS dan frontend Arumanis.

## Konteks Bisnis
Sistem e-katalog Arumanis membutuhkan fitur di mana saat pengguna mengunggah RAB (Rencana Anggaran Biaya), jadwal pelaksanaan (Rencana Mingguan) dapat terisi secara otomatis dengan urutan yang masuk akal menurut kaidah konstruksi.
Karena proyek memiliki 2 jenis utama: **SPAM (Air Minum)** dan **Sanitasi**, maka durasi dan urutan logisnya berbeda.

## Arsitektur & Perubahan di Arumanis (Frontend)

Frontend bertanggung jawab pada *business logic* untuk melakukan pemindaian RAB, mencocokkan kata kunci, dan menghitung porsi distribusi volume berdasarkan master data dari Backend.

### 1. Integrasi API & Tipe Data
- `src/features/progress/types/master-fase.ts`: Definisi antarmuka `MasterFasePekerjaan`.
- `src/features/progress/api/master-fase.ts`: HTTP Client untuk memanggil endpoint CRUD dari Backend.

### 2. Algoritma Construction Scheduler
Terletak di `src/features/progress/utils/construction-scheduler.ts`, file ini adalah "otak" dari penjadwalan otomatis yang mencakup 3 tahapan utama:

1. **Auto-Detect Proyek (`detectJenisProyek`)**:
   Membaca seluruh uraian pekerjaan. Jika banyak kata "Sumur", "Pemboran", "Reservoir", proyek dianggap **SPAM**. Jika banyak kata "STP", "Biofilter", "Sump Pit", proyek dianggap **Sanitasi**.

2. **Klasifikasi Fase (`classifyPhase`)**:
   Menerima string uraian pekerjaan/kategori, lalu mencocokkannya dengan `keywords` yang ada di array `MasterFasePekerjaan` (contoh: kata "persiapan" masuk ke fase "Pekerjaan Persiapan").

3. **Penjadwalan Waktu (`calculateSchedule` & `distributeVolume`)**:
   - Mengelompokkan pekerjaan berdasarkan header/lokasinya.
   - Mengurutkan kelompok tersebut berdasarkan `prioritas` fase.
   - Membagi proporsi dari `Total Minggu` (durasi kontrak) menggunakan bobot `durasi_faktor`.
   - Menghitung irisan minggu jika ada `overlap_persen` > 0 agar pekerjaan dapat berjalan paralel di waktu transisi.
   - Mendistribusikan `target_volume` masing-masing item ke dalam atribut `rencana` secara proporsional.

### 3. Komponen UI
- **ProgressTabContent.tsx**:
  - Tombol baru: **Auto-Fill Rencana (Wand Icon)** diletakkan bersebelahan dengan Import RAB.
  - **Dialog Pratinjau (Preview)**: Sebelum jadwal benar-benar diterapkan (overwrite input user), muncul dialog visual yang menampilkan rentang waktu masing-masing kategori pekerjaan berbentuk Timeline.
  - Setelah "Terapkan Jadwal" ditekan, fungsi `applyAutoFill` dipanggil dan state `editableItems` diperbarui. Nilai `realisasi` tidak akan tertimpa.

- **Admin UI Master Fase (`MasterFaseList.tsx`)**:
  - Berada pada route `/#/master-fase`.
  - Halaman ini memungkinkan Admin untuk menambah, mengubah, dan menghapus konfigurasi fase, termasuk mendefinisikan *keywords* deteksi, mengubah bobot durasi, dan menyesuaikan prioritas. Tidak diperlukan deploy kode baru ketika ada item RAB dengan gaya penamaan yang asing.

---
*Lihat dokumentasi `.agent/docs/autofill-rencana.md` di repositori **APIAMIS** (apiamis) untuk detail skema database dan controller.*
