/**
 * Data tabel Gantt timeline Arumanis (Jan–Apr 2024).
 * weeks: 16 boolean — Jan(1-4), Feb(1-4), Mar(1-4), Apr(1-4)
 */
export const GANTT_MONTHS = [
  { key: 'jan', label: 'Januari' },
  { key: 'feb', label: 'Februari' },
  { key: 'mar', label: 'Maret' },
  { key: 'apr', label: 'April' },
];

/** Abu-abu = kegiatan berjalan pada minggu tersebut */
export const GANTT_PHASES = [
  {
    label:
      'Tahap analisis kebutuhan dan inventarisasi data manual (SPAM, sanitasi, pekerjaan, dokumentasi lapangan)',
    weeks: [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    label:
      'Tahap pembuatan sistem informasi (pilot SandB, prototipe AMS Pro, modul wilayah, pekerjaan, auth) — termasuk uji coba berulang sepanjang bulan ke-1 sampai ke-4',
    weeks: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  },
  {
    label:
      'Tahap uji coba internal bersama operator kantor dan pengawas lapangan (bagian dari siklus pembuatan, bukan fase terpisah)',
    weeks: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  },
  {
    label: 'Tahap verifikasi dan evaluasi hasil uji coba serta klarifikasi kebutuhan perbaikan',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  },
  {
    label:
      'Tahap penetapan dan implementasi awal aplikasi di lingkungan Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  },
];

export const TIMELINE_NARRATIVE = {
  intro:
    'Empat bulan pertama (Januari–April 2024) merupakan satu kesatuan tahap pembuatan: analisis, pengembangan pilot, prototipe, dan uji coba berjalan berlapis. Penetapan dan implementasi resmi di lingkungan Dinas ditetapkan pada April 2024 setelah verifikasi uji coba.',
  aprilFocus:
    'April 2024 bukan hanya evaluasi teknis. Bulan ini menjadi titik penetapan keputusan implementasi awal, pemberlakuan prototipe AMS Pro untuk operator terpilih, dan persetujuan roadmap pemisahan API (apiamis) dan frontend (arumanis).',
};