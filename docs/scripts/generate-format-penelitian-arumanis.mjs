/**
 * Format Proposal Penelitian — Arumanis
 * Mahasiswa: Moch Irsan Firmansyah (5520124132)
 * Teknik Informatika — Universitas Surya Kencana Cianjur
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  PageBreak,
  LevelFormat,
  VerticalAlign,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '..', 'Format_Penelitian_Arumanis_Moch_Irsan_Firmansyah.docx')

const PAGE = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1701, right: 1418, bottom: 1701, left: 1701 },
}
const CONTENT_W = 11906 - 1701 - 1418

const thin = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const borders = { top: thin, bottom: thin, left: thin, right: thin }
const font = 'Times New Roman'

function t(text, opts = {}) {
  return new TextRun({
    text,
    font,
    size: opts.size ?? 24,
    bold: opts.bold ?? false,
    italics: opts.italics ?? false,
    color: opts.color,
  })
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align ?? AlignmentType.JUSTIFIED,
    spacing: {
      after: opts.after ?? 120,
      before: opts.before ?? 0,
      line: opts.line ?? 360,
      lineRule: 'auto',
    },
    indent: opts.firstLine ? { firstLine: opts.firstLine } : undefined,
    children: [t(text, opts)],
  })
}

function center(text, opts = {}) {
  return p(text, { ...opts, align: AlignmentType.CENTER, firstLine: 0 })
}

function empty(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [] }))
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 200, line: 360, lineRule: 'auto' },
    children: [t(text, { bold: true, size: 28 })],
  })
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 160, line: 360, lineRule: 'auto' },
    children: [t(text, { bold: true, size: 26 })],
  })
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 120, line: 360, lineRule: 'auto' },
    children: [t(text, { bold: true, size: 24 })],
  })
}

function cell(text, w, opts = {}) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: opts.align ?? AlignmentType.LEFT,
        spacing: { after: 40, line: 276, lineRule: 'auto' },
        children: [
          t(text, {
            size: opts.size ?? 20,
            bold: opts.bold ?? false,
            color: opts.color,
          }),
        ],
      }),
    ],
  })
}

function metaTable(rows) {
  const c1 = 2800
  const c2 = CONTENT_W - c1
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [c1, c2],
    rows: rows.map(
      ([a, b]) =>
        new TableRow({
          children: [cell(a, c1, { bold: true, fill: 'F3F4F6' }), cell(b, c2)],
        }),
    ),
  })
}

function dataTable(headers, data) {
  const n = headers.length
  const colW = Math.floor(CONTENT_W / n)
  const widths = Array(n).fill(colW)
  widths[n - 1] = CONTENT_W - colW * (n - 1)

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        children: headers.map((h, i) =>
          cell(h, widths[i], { bold: true, fill: '1E3A5F', color: 'FFFFFF', size: 18 }),
        ),
      }),
      ...data.map(
        (row) =>
          new TableRow({
            children: row.map((c, i) => cell(String(c), widths[i], { size: 18 })),
          }),
      ),
    ],
  })
}

function num(ref, text) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80, line: 360, lineRule: 'auto' },
    children: [t(text)],
  })
}

const level = (ref) => ({
  reference: ref,
  levels: [
    {
      level: 0,
      format: LevelFormat.DECIMAL,
      text: '%1.',
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    },
  ],
})

const children = [
  // COVER
  center('FORMAT PROPOSAL PENELITIAN', { bold: true, size: 32, after: 80, line: 276 }),
  center('SKRIPSI / TUGAS AKHIR', { bold: true, size: 28, after: 200, line: 276 }),
  center('(Program Studi Teknik Informatika)', { size: 22, after: 400, line: 276 }),
  ...empty(1),
  center('EVALUASI KUALITAS SISTEM INFORMASI ARUMANIS', {
    bold: true,
    size: 28,
    after: 80,
    line: 320,
  }),
  center('SEBAGAI PLATFORM SATU DATA AIR MINUM DAN SANITASI', {
    bold: true,
    size: 28,
    after: 80,
    line: 320,
  }),
  center('(Studi Kasus: Dinas Perumahan dan Kawasan Permukiman', {
    bold: true,
    size: 26,
    after: 60,
    line: 320,
  }),
  center('Kabupaten Cianjur)', { bold: true, size: 26, after: 400, line: 320 }),
  ...empty(2),
  center('Diajukan untuk memenuhi sebagian syarat memperoleh', { size: 22, after: 60 }),
  center('gelar Sarjana Komputer (S.Kom.)', { size: 22, after: 400 }),
  ...empty(1),
  center('Disusun oleh:', { size: 22, after: 200 }),
  center('MOCH IRSAN FIRMANSYAH', { bold: true, size: 28, after: 80 }),
  center('NIM 5520124132', { bold: true, size: 24, after: 400 }),
  ...empty(2),
  center('PROGRAM STUDI TEKNIK INFORMATIKA', { bold: true, size: 24, after: 60 }),
  center('FAKULTAS TEKNIK', { bold: true, size: 24, after: 60 }),
  center('UNIVERSITAS SURYA KENCANA', { bold: true, size: 24, after: 60 }),
  center('CIANJUR', { bold: true, size: 24, after: 200 }),
  center('2026', { bold: true, size: 24, after: 0 }),
  new Paragraph({ children: [new PageBreak()] }),

  // IDENTITAS
  h1('LEMBAR IDENTITAS PENELITIAN'),
  metaTable([
    [
      'Judul Penelitian',
      'Evaluasi Kualitas Sistem Informasi Arumanis sebagai Platform Satu Data Air Minum dan Sanitasi (Studi Kasus: Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur)',
    ],
    ['Nama Mahasiswa', 'Moch Irsan Firmansyah'],
    ['NIM', '5520124132'],
    ['Program Studi', 'Teknik Informatika'],
    ['Fakultas', 'Fakultas Teknik'],
    ['Perguruan Tinggi', 'Universitas Surya Kencana Cianjur'],
    ['Jenis Dokumen', 'Format Proposal Penelitian (Skripsi / Tugas Akhir)'],
    ['Objek Penelitian', 'Aplikasi Arumanis (arumanis.cianjur.space) dan APIAMIS'],
    ['Instansi Mitra', 'Dinas Perumahan dan Kawasan Permukiman (DPKP) Kabupaten Cianjur'],
    ['Bidang Keilmuan', 'Sistem Informasi, Rekayasa Perangkat Lunak, Evaluasi Kualitas SI'],
    ['Tahun Akademik', '2025/2026'],
  ]),
  ...empty(1),
  p(
    'Dokumen ini merangkum kerangka formal proposal penelitian yang dapat dipakai sebagai acuan penyusunan proposal skripsi. Bagian isi diisi dengan rumusan yang selaras dengan objek Arumanis di lingkungan DPKP Kabupaten Cianjur. Judul, rumusan masalah, dan metode masih dapat disesuaikan dengan arahan dosen pembimbing.',
    { firstLine: 720 },
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // BAB I
  h1('BAB I PENDAHULUAN'),
  h2('1.1 Latar Belakang'),
  p(
    'Kabupaten Cianjur mengelola program air minum dan sanitasi di 33 kecamatan dan 365 desa/kelurahan. Data unit SPAM, capaian Standar Pelayanan Minimum (SPM), progres pekerjaan infrastruktur, serta dokumentasi lapangan semula tersebar di lembar kerja terpisah, berkas cetak, dan saluran komunikasi informal. Kondisi itu menyulitkan rekapitulasi cepat dan verifikasi di tingkat dinas.',
    { firstLine: 720 },
  ),
  p(
    'Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) dikembangkan sebagai platform digital terpusat. Portal web Arumanis melayani operator dan pejabat di kantor, sedangkan Panel Pengawasan (web dan mobile) dipakai pengawas lapangan untuk foto ber-GPS, laporan progres, dan tiket kendala. Backend APIAMIS (Laravel) menjadi sumber data tunggal, dihubungkan lewat BFF (Bun) dengan sesi cookie httpOnly.',
    { firstLine: 720 },
  ),
  p(
    'Dari sudut pandang Teknik Informatika, keberadaan sistem yang sudah beroperasi di lingkungan pemerintahan daerah membuka peluang penelitian evaluasi kualitas sistem informasi. Evaluasi tidak berhenti pada fitur yang ada, tetapi mengukur seberapa baik sistem memenuhi kebutuhan pengguna (operator, pengawas, pengambil keputusan) menurut kriteria kualitas yang mapan, misalnya ISO/IEC 25010 atau model penerimaan teknologi (TAM/UTAUT), dilengkapi tinjauan arsitektur perangkat lunak.',
    { firstLine: 720 },
  ),
  p(
    'Penelitian ini disusun agar hasilnya relevan bagi prodi Teknik Informatika sekaligus memberi masukan operasional bagi DPKP Cianjur. Objek kajian dibatasi pada Arumanis sebagai studi kasus nyata, bukan sekadar rancang bangun hipotetis.',
    { firstLine: 720 },
  ),

  h2('1.2 Rumusan Masalah'),
  p('Berdasarkan latar belakang di atas, rumusan masalah penelitian dirumuskan sebagai berikut.', {
    firstLine: 720,
  }),
  num(
    'rumusan',
    'Bagaimana kualitas sistem informasi Arumanis menurut kriteria kualitas perangkat lunak (misalnya functional suitability, performance efficiency, usability, reliability, security, maintainability) dari perspektif pengguna di DPKP Kabupaten Cianjur?',
  ),
  num(
    'rumusan',
    'Faktor apa saja yang memengaruhi penerimaan dan penggunaan Arumanis oleh operator dan pengawas lapangan?',
  ),
  num(
    'rumusan',
    'Bagaimana kesesuaian arsitektur dan alur data Arumanis (portal, BFF, APIAMIS, panel pengawasan) dengan kebutuhan monitoring pekerjaan air minum dan sanitasi?',
  ),
  num(
    'rumusan',
    'Rekomendasi perbaikan apa yang dapat diusulkan berdasarkan temuan evaluasi untuk meningkatkan kualitas dan kemanfaatan sistem?',
  ),

  h2('1.3 Tujuan Penelitian'),
  num('obj', 'Mengevaluasi kualitas sistem informasi Arumanis berdasarkan model kualitas yang dipilih.'),
  num(
    'obj',
    'Mengidentifikasi faktor penerimaan dan hambatan penggunaan di kalangan operator dan pengawas.',
  ),
  num(
    'obj',
    'Menganalisis kesesuaian arsitektur dan alur bisnis (pekerjaan, kontrak, progres, dokumentasi, SPM/SPAM) terhadap kebutuhan organisasi.',
  ),
  num(
    'obj',
    'Menyusun rekomendasi perbaikan teknis dan nonteknis yang dapat ditindaklanjuti pengelola sistem.',
  ),

  h2('1.4 Manfaat Penelitian'),
  h3('1.4.1 Manfaat Teoretis'),
  p(
    'Menambah kajian evaluasi sistem informasi pemerintahan daerah di bidang infrastruktur air minum dan sanitasi, dengan studi kasus platform yang sudah dipakai operasional.',
    { firstLine: 720 },
  ),
  h3('1.4.2 Manfaat Praktis'),
  num(
    'manfaat',
    'Bagi DPKP Kabupaten Cianjur: masukan prioritas perbaikan Arumanis (modul, alur kerja, pelatihan pengguna).',
  ),
  num(
    'manfaat',
    'Bagi pengelola teknis Arumanis: gambaran kesenjangan antara arsitektur aktual dan ekspektasi kualitas pengguna.',
  ),
  num(
    'manfaat',
    'Bagi Program Studi Teknik Informatika UNSUR: contoh penelitian terapan berbasis objek nyata di wilayah Cianjur.',
  ),

  h2('1.5 Batasan Penelitian'),
  num(
    'langkah',
    'Objek dibatasi pada portal Arumanis dan Panel Pengawasan yang terhubung ke APIAMIS; integrasi eksternal (SPSE, SIPD, WhatsApp, Instagram) dibahas sebatas relevansi alur data, tidak diuji end-to-end satu per satu kecuali diperlukan.',
  ),
  num(
    'langkah',
    'Responden diutamakan pengguna internal DPKP dan pengawas/konsultan yang memakai sistem; masyarakat umum (akses publik peta SPM) dapat dilibatkan terbatas jika disetujui pembimbing.',
  ),
  num(
    'langkah',
    'Penelitian bersifat evaluatif (bukan membangun ulang seluruh aplikasi). Prototype perbaikan kecil hanya dilakukan jika disepakati dan relevan dengan rekomendasi.',
  ),
  num(
    'langkah',
    'Data operasional sensitif (identitas penerima, nilai kontrak rinci) diperlakukan sesuai izin instansi; laporan hanya memuat agregat atau contoh yang sudah diizinkan.',
  ),

  h2('1.6 Sistematika Penulisan'),
  p(
    'Bab I memuat pendahuluan. Bab II memuat tinjauan pustaka dan landasan teori. Bab III memuat metodologi penelitian. Bab IV memuat hasil dan pembahasan. Bab V memuat kesimpulan dan saran. Daftar pustaka dan lampiran melengkapi laporan akhir.',
    { firstLine: 720 },
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // BAB II
  h1('BAB II TINJAUAN PUSTAKA'),
  h2('2.1 Sistem Informasi'),
  p(
    'Sistem informasi mengolah data menjadi informasi yang mendukung keputusan organisasi. Dalam konteks pemerintahan daerah, sistem informasi sering menjadi tulang punggung SPBE (Sistem Pemerintahan Berbasis Elektronik) dan pelayanan publik. Kualitas input, proses, dan output menentukan apakah sistem benar-benar dipakai atau hanya formalitas digital.',
    { firstLine: 720 },
  ),

  h2('2.2 Evaluasi Kualitas Perangkat Lunak'),
  p(
    'ISO/IEC 25010 mendefinisikan model kualitas produk perangkat lunak yang umum dipakai dalam penelitian akademik, antara lain kesesuaian fungsional, efisiensi kinerja, kompatibilitas, usability, reliability, security, maintainability, dan portability. Untuk sistem web pemerintahan, dimensi usability dan security biasanya mendapat perhatian khusus karena pengguna beragam dan data bersifat kelembagaan.',
    { firstLine: 720 },
  ),
  p(
    'Alternatif atau pelengkap: System Usability Scale (SUS) untuk skor usability ringkas; Technology Acceptance Model (TAM) atau UTAUT untuk niat dan perilaku penggunaan; WebQual untuk kualitas situs web dari sisi pengguna.',
    { firstLine: 720 },
  ),

  h2('2.3 Arsitektur Aplikasi Web Modern'),
  p(
    'Pola client-server dengan SPA (Single Page Application), API REST, dan lapisan BFF (Backend for Frontend) banyak dipakai agar otentikasi dan proxy aman di sisi server. Arumanis memakai React + BFF Bun di portal, API Laravel (APIAMIS) sebagai domain API, serta panel pengawasan terpisah dengan handoff SSO. Pola ini relevan ditinjau dari segi keamanan sesi, pemisahan concern, dan skalabilitas.',
    { firstLine: 720 },
  ),

  h2('2.4 Arumanis sebagai Objek Studi'),
  p(
    'Arumanis adalah platform satu data air minum dan sanitasi Kabupaten Cianjur di bawah DPKP. Modul inti mencakup master wilayah, kegiatan/sub kegiatan, pekerjaan (paket), output, kontrak dan penyedia, penerima manfaat, berkas, foto progres, rekap progress, dashboard, serta capaian SPAM/SPM. Panel Pengawasan mendukung pelaporan lapangan. URL produksi portal: arumanis.cianjur.space; API: apiamis.cianjur.space.',
    { firstLine: 720 },
  ),
  p('Ringkasan komponen teknis (dapat dilengkapi bagan pada lampiran):', { firstLine: 720 }),
  dataTable(
    ['Lapisan', 'Teknologi / Komponen', 'Peran'],
    [
      ['Portal web', 'React, BFF Bun/Hono', 'UI operator, sesi cookie, proxy API'],
      ['API domain', 'Laravel (APIAMIS), MySQL, Redis', 'Bisnis, otorisasi role, antrian'],
      ['Panel pengawasan', 'Web + mobile (Expo)', 'Foto GPS, progres, tiket lapangan'],
      ['Integrasi', 'SPSE, SIPD Lite, WA, OnlyOffice, dsb.', 'Kontrak, Renja, notifikasi, dokumen'],
    ],
  ),
  ...empty(1),

  h2('2.5 Penelitian Terdahulu'),
  p(
    'Bagian ini diisi mahasiswa dengan minimal 5 sampai 10 ringkasan penelitian sejenis (evaluasi SI pemerintahan, usability e-government, monitoring infrastruktur berbasis web). Setiap entri memuat: penulis dan tahun, tujuan, metode, hasil pokok, serta celah yang membedakan penelitian ini (studi kasus Arumanis Cianjur).',
    { firstLine: 720 },
  ),
  dataTable(
    ['No', 'Peneliti (Tahun)', 'Fokus', 'Metode', 'Kaitan dgn penelitian ini'],
    [
      ['1', '[diisi]', '[diisi]', '[diisi]', '[diisi]'],
      ['2', '[diisi]', '[diisi]', '[diisi]', '[diisi]'],
      ['3', '[diisi]', '[diisi]', '[diisi]', '[diisi]'],
      ['4', '[diisi]', '[diisi]', '[diisi]', '[diisi]'],
      ['5', '[diisi]', '[diisi]', '[diisi]', '[diisi]'],
    ],
  ),
  ...empty(1),

  h2('2.6 Kerangka Pemikiran'),
  p(
    'Input penelitian: objek Arumanis, responden pengguna, dan model kualitas/penerimaan yang dipilih. Proses: observasi sistem, kuesioner/wawancara, analisis arsitektur, analisis data. Output: skor/temuan kualitas, faktor penerimaan, rekomendasi perbaikan. Kerangka ini digambar ulang dalam bentuk diagram alir pada versi final proposal.',
    { firstLine: 720 },
  ),

  h2('2.7 Hipotesis (jika memakai pendekatan kuantitatif)'),
  p(
    'Jika penelitian memakai model penerimaan (contoh TAM), hipotesis dapat dirumuskan misalnya:',
    { firstLine: 720 },
  ),
  num('hipotesis', 'Perceived usefulness berpengaruh positif terhadap attitude toward using Arumanis.'),
  num(
    'hipotesis',
    'Perceived ease of use berpengaruh positif terhadap attitude toward using Arumanis.',
  ),
  num(
    'hipotesis',
    'Attitude toward using berpengaruh positif terhadap behavioral intention to use.',
  ),
  p(
    'Jika pendekatan utama kualitatif/evaluatif deskriptif, subbab hipotesis dapat diganti dengan proposisi penelitian atau pertanyaan penelitian rinci.',
    { firstLine: 720 },
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // BAB III
  h1('BAB III METODOLOGI PENELITIAN'),
  h2('3.1 Jenis dan Pendekatan Penelitian'),
  p(
    'Penelitian ini disarankan memakai pendekatan mixed methods (kuantitatif + kualitatif) atau evaluasi sistem informasi deskriptif. Kuantitatif: kuesioner kualitas/usability/penerimaan. Kualitatif: wawancara semi-terstruktur dan observasi penggunaan modul. Pilihan akhir disesuaikan dengan pembimbing dan ketersediaan responden.',
    { firstLine: 720 },
  ),

  h2('3.2 Lokasi dan Waktu Penelitian'),
  metaTable([
    [
      'Lokasi',
      'DPKP Kabupaten Cianjur; akses sistem Arumanis (kantor dan/atau remote sesuai izin)',
    ],
    ['Objek sistem', 'Portal Arumanis, Panel Pengawasan, dokumentasi teknis terkait'],
    ['Waktu', 'Semester berjalan tahun akademik 2025/2026 (jadwal rinci diisi mahasiswa)'],
  ]),
  ...empty(1),

  h2('3.3 Populasi dan Sampel'),
  p(
    'Populasi: pengguna aktif Arumanis di lingkungan DPKP dan pengawas/konsultan terkait program air minum-sanitasi. Teknik sampling yang realistis: purposive sampling (pengguna yang benar-benar memakai sistem), atau stratified jika ingin membedakan peran (admin, operator, pengawas, pejabat). Target jumlah responden kuesioner disesuaikan rumus/praktis (misalnya minimal 30 untuk analisis deskriptif, atau lebih jika SEM).',
    { firstLine: 720 },
  ),

  h2('3.4 Variabel Penelitian (contoh model kualitas + penerimaan)'),
  dataTable(
    ['Variabel / Dimensi', 'Indikator ringkas', 'Skala'],
    [
      ['Functional suitability', 'Fitur sesuai tugas pekerjaan harian', 'Likert 1–5'],
      ['Usability', 'Kemudahan, kejelasan antarmuka, SUS opsional', 'Likert / SUS'],
      ['Performance efficiency', 'Kecepatan respons, kelancaran unduh/export', 'Likert 1–5'],
      ['Reliability', 'Gangguan, error, ketersediaan layanan', 'Likert 1–5'],
      ['Security', 'Kontrol akses, kepercayaan pada login/sesi', 'Likert 1–5'],
      ['Perceived usefulness', 'Manfaat sistem bagi pekerjaan', 'Likert 1–5'],
      ['Perceived ease of use', 'Kemudahan dipelajari dan dipakai', 'Likert 1–5'],
      ['Intention to use', 'Niat terus memakai sistem', 'Likert 1–5'],
    ],
  ),
  ...empty(1),

  h2('3.5 Teknik Pengumpulan Data'),
  num('instrumen', 'Studi dokumentasi: panduan pengguna, arsitektur, SOP, proposal inovasi Arumanis.'),
  num(
    'instrumen',
    'Observasi: alur login, master data, pekerjaan, kontrak, foto, dashboard, export laporan.',
  ),
  num('instrumen', 'Kuesioner daring/luring kepada pengguna terpilih.'),
  num(
    'instrumen',
    'Wawancara singkat dengan admin sistem, operator, dan pengawas (panduan wawancara di lampiran).',
  ),

  h2('3.6 Instrumen Penelitian'),
  p(
    'Instrumen utama: lembar kuesioner (butir per dimensi), form wawancara, checklist observasi modul. Uji validitas isi (expert judgment dosen/pembimbing + praktisi), reliabilitas Cronbach Alpha untuk skala Likert (target Alpha ≥ 0,70).',
    { firstLine: 720 },
  ),

  h2('3.7 Teknik Analisis Data'),
  p(
    'Kuantitatif: statistik deskriptif (mean, standar deviasi, frekuensi), interpretasi interval skor, uji reliabilitas; jika hipotesis diuji, gunakan regresi/SEM sesuai jumlah sampel. Kualitatif: reduksi data wawancara, pengodean tema (hambatan, fitur yang disukai, usulan perbaikan), triangulasi dengan observasi. Hasil digabung dalam pembahasan Bab IV.',
    { firstLine: 720 },
  ),

  h2('3.8 Tahapan Penelitian'),
  dataTable(
    ['Tahap', 'Kegiatan', 'Keluaran'],
    [
      ['1. Persiapan', 'Konsultasi judul, izin penelitian, kajian pustaka', 'Proposal disetujui'],
      ['2. Instrumen', 'Susun kuesioner dan panduan wawancara, uji coba', 'Instrumen final'],
      ['3. Pengumpulan data', 'Observasi, sebar kuesioner, wawancara', 'Dataset dan transkrip'],
      ['4. Analisis', 'Olah data kuantitatif dan kualitatif', 'Temuan terstruktur'],
      ['5. Pelaporan', 'Bab IV–V, presentasi, revisi', 'Naskah skripsi'],
    ],
  ),
  ...empty(1),

  h2('3.9 Jadwal Penelitian (contoh 4 bulan)'),
  dataTable(
    ['Kegiatan', 'Bln 1', 'Bln 2', 'Bln 3', 'Bln 4'],
    [
      ['Penyusunan proposal dan perizinan', 'X', '', '', ''],
      ['Kajian pustaka dan instrumen', 'X', 'X', '', ''],
      ['Pengumpulan data', '', 'X', 'X', ''],
      ['Analisis data', '', '', 'X', 'X'],
      ['Penulisan dan sidang', '', '', 'X', 'X'],
    ],
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // BAB IV
  h1('BAB IV HASIL DAN PEMBAHASAN (Kerangka)'),
  p(
    'Bab ini diisi setelah data terkumpul. Kerangka usulan agar penulisan tetap sistematis:',
    { firstLine: 720 },
  ),
  h2('4.1 Gambaran Umum Objek Penelitian'),
  p(
    'Uraikan profil DPKP, sejarah singkat Arumanis, modul utama, jumlah pengguna/peran (jika diizinkan dipublikasikan), dan arsitektur aktual (diagram).',
    { firstLine: 720 },
  ),
  h2('4.2 Karakteristik Responden'),
  p('Tabel demografi: peran, frekuensi penggunaan, lama mengenal sistem, perangkat akses.', {
    firstLine: 720,
  }),
  h2('4.3 Hasil Evaluasi Kualitas / Usability / Penerimaan'),
  p(
    'Tabel mean per dimensi, grafik, interpretasi (sangat baik / baik / cukup / kurang). Jika SUS, konversi skor 0–100 dan bandingkan dengan benchmark.',
    { firstLine: 720 },
  ),
  h2('4.4 Hasil Analisis Arsitektur dan Alur Proses'),
  p(
    'Petakan alur: login, master, pekerjaan, kontrak, progress/foto, dashboard/SPM. Catat bottleneck, redudansi input, dan titik rawan error. Bandingkan dengan praktik rekayasa perangkat lunak yang relevan.',
    { firstLine: 720 },
  ),
  h2('4.5 Temuan Kualitatif'),
  p('Tema dari wawancara: kemudahan, keluhan, fitur kritis, kebutuhan pelatihan, dukungan teknis.', {
    firstLine: 720,
  }),
  h2('4.6 Pembahasan'),
  p(
    'Hubungkan temuan dengan teori (ISO 25010, TAM, dsb.) dan penelitian terdahulu. Jelaskan implikasi praktis bagi DPKP. Hindari mengulang tabel tanpa tafsir.',
    { firstLine: 720 },
  ),
  h2('4.7 Rekomendasi Perbaikan'),
  dataTable(
    ['Prioritas', 'Temuan', 'Rekomendasi', 'Pihak terkait'],
    [
      ['Tinggi', '[diisi setelah riset]', '[diisi]', 'Pengelola teknis / DPKP'],
      ['Sedang', '[diisi]', '[diisi]', '[diisi]'],
      ['Rendah', '[diisi]', '[diisi]', '[diisi]'],
    ],
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // BAB V
  h1('BAB V KESIMPULAN DAN SARAN (Kerangka)'),
  h2('5.1 Kesimpulan'),
  p(
    'Jawab rumusan masalah secara ringkas, berbasis data, tanpa mengulang seluruh pembahasan. Satu paragraf per rumusan masalah disarankan.',
    { firstLine: 720 },
  ),
  h2('5.2 Saran'),
  p(
    'Saran bagi pengelola Arumanis, bagi DPKP (kebijakan penggunaan), dan bagi penelitian lanjutan (misalnya pengujian performa beban, keamanan penetrasi terbatas, atau pengembangan modul tertentu).',
    { firstLine: 720 },
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // PUSTAKA
  h1('DAFTAR PUSTAKA (Contoh Awal)'),
  p(
    'Mahasiswa melengkapi dengan style sitasi yang ditetapkan prodi (APA/IEEE/Harvard). Contoh entri awal:',
    { firstLine: 0 },
  ),
  p(
    'ISO/IEC. (2011). ISO/IEC 25010:2011 Systems and software engineering. Systems and software Quality Requirements and Evaluation (SQuaRE). System and software quality models. Geneva: ISO.',
    { firstLine: 0, after: 160 },
  ),
  p(
    'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319–340.',
    { firstLine: 0, after: 160 },
  ),
  p(
    'Brooke, J. (1996). SUS: A quick and dirty usability scale. In P. W. Jordan et al. (Eds.), Usability Evaluation in Industry (pp. 189–194). London: Taylor & Francis.',
    { firstLine: 0, after: 160 },
  ),
  p(
    'Venkatesh, V., Morris, M. G., Davis, G. B., & Davis, F. D. (2003). User acceptance of information technology: Toward a unified view. MIS Quarterly, 27(3), 425–478.',
    { firstLine: 0, after: 160 },
  ),
  p(
    'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur. (2026). Dokumentasi dan proposal inovasi Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi). Cianjur: DPKP.',
    { firstLine: 0, after: 160 },
  ),
  p(
    'Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner’s Approach (9th ed.). New York: McGraw-Hill.',
    { firstLine: 0, after: 160 },
  ),
  p(
    '[Tambahkan jurnal/skripsi sejenis evaluasi e-government dan SI pemerintahan daerah di Indonesia.]',
    { firstLine: 0, italics: true, after: 200 },
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // LAMPIRAN
  h1('LAMPIRAN'),
  h2('Lampiran A. Outline Kuesioner (Draf)'),
  p(
    'Petunjuk: beri tanda pada skala 1 = Sangat Tidak Setuju sampai 5 = Sangat Setuju. Sesuaikan butir dengan model final.',
    { firstLine: 720 },
  ),
  dataTable(
    ['Kode', 'Pernyataan (contoh)', '1', '2', '3', '4', '5'],
    [
      ['PU1', 'Arumanis membantu saya menyelesaikan pekerjaan lebih cepat', '', '', '', '', ''],
      ['PU2', 'Informasi di Arumanis relevan dengan tugas saya', '', '', '', '', ''],
      ['PEOU1', 'Saya mudah mempelajari fitur Arumanis', '', '', '', '', ''],
      ['PEOU2', 'Antarmuka Arumanis jelas dan tidak membingungkan', '', '', '', '', ''],
      ['US1', 'Saya jarang menemui error saat memakai Arumanis', '', '', '', '', ''],
      ['SEC1', 'Saya merasa login dan hak akses di Arumanis aman', '', '', '', '', ''],
      ['BI1', 'Saya berniat terus memakai Arumanis dalam pekerjaan', '', '', '', '', ''],
    ],
  ),
  ...empty(1),

  h2('Lampiran B. Panduan Wawancara (Draf)'),
  num('wawancara', 'Peran Anda di DPKP/lapangan dan frekuensi memakai Arumanis?'),
  num(
    'wawancara',
    'Modul mana yang paling sering dipakai? Modul mana yang jarang atau dibutuhkan tapi kurang?',
  ),
  num('wawancara', 'Kendala teknis atau nonteknis yang paling mengganggu?'),
  num('wawancara', 'Apakah data di Arumanis dipercaya sebagai acuan rapat/evaluasi? Mengapa?'),
  num(
    'wawancara',
    'Jika bisa memperbaiki satu hal dalam 3 bulan ke depan, apa yang diprioritaskan?',
  ),

  h2('Lampiran C. Checklist Observasi Modul'),
  dataTable(
    ['Modul', 'Dapat diakses', 'Alur jelas', 'Catatan'],
    [
      ['Login / sesi', '', '', ''],
      ['Dashboard', '', '', ''],
      ['Kegiatan dan pekerjaan', '', '', ''],
      ['Kontrak', '', '', ''],
      ['Progress / foto', '', '', ''],
      ['Export laporan (Excel/PDF)', '', '', ''],
      ['Panel pengawasan', '', '', ''],
      ['SPAM / SPM', '', '', ''],
    ],
  ),
  ...empty(1),

  h2('Lampiran D. Surat Izin Penelitian'),
  p(
    '[Tempel salinan surat pengantar dari Universitas Surya Kencana dan surat izin / balasan dari DPKP Kabupaten Cianjur.]',
    { italics: true, firstLine: 0 },
  ),
  ...empty(1),

  h2('Lampiran E. Dokumentasi Sistem'),
  p(
    '[Screenshot berizin, diagram arsitektur, dan daftar modul. Hindari menampilkan data pribadi penerima atau kredensial.]',
    { italics: true, firstLine: 0 },
  ),
  ...empty(2),

  center('— Akhir Format Proposal Penelitian —', { italics: true, size: 20 }),
  center('Moch Irsan Firmansyah · NIM 5520124132', { size: 20 }),
  center('Teknik Informatika · Universitas Surya Kencana Cianjur', { size: 20 }),
]

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font, size: 24 },
      },
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 28, bold: true, font },
        paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 26, bold: true, font },
        paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font },
        paragraph: { spacing: { before: 160, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      level('obj'),
      level('manfaat'),
      level('rumusan'),
      level('langkah'),
      level('instrumen'),
      level('wawancara'),
      {
        reference: 'hipotesis',
        levels: [
          {
            level: 0,
            format: LevelFormat.LOWER_LETTER,
            text: '%1)',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: { page: PAGE },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 6, color: '1E3A5F', space: 4 },
              },
              spacing: { after: 120 },
              children: [
                t('Format Penelitian Arumanis · Moch Irsan Firmansyah (5520124132)', {
                  size: 16,
                  color: '4B5563',
                  italics: true,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: {
                top: { style: BorderStyle.SINGLE, size: 6, color: '1E3A5F', space: 4 },
              },
              spacing: { before: 80 },
              children: [
                t('Teknik Informatika · Universitas Surya Kencana Cianjur  ·  Hal. ', {
                  size: 16,
                }),
                new TextRun({ children: [PageNumber.CURRENT], font, size: 16 }),
                t(' dari ', { size: 16 }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font, size: 16 }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
})

const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(OUT, buffer)
console.log('OK:', OUT)
