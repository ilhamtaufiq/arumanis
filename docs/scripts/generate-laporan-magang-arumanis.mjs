/**
 * Laporan Magang / PKL — Arumanis
 * Mahasiswa: Moch Irsan Firmansyah (NIM 5520124132)
 * Teknik Informatika — Universitas Surya Kencana Cianjur
 * Tempat: DPKP Kabupaten Cianjur (objek: Arumanis)
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
const OUT = path.resolve(
  __dirname,
  '..',
  'Laporan_Magang_Arumanis_Moch_Irsan_Firmansyah.docx',
)

const font = 'Times New Roman'
// Laporan magang: kiri 4cm, kanan 3cm, atas/bawah 3cm (lazim)
const PAGE = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1701, right: 1701, bottom: 1701, left: 2268 },
}
const CW = 11906 - 2268 - 1701

const thin = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const borders = { top: thin, bottom: thin, left: thin, right: thin }

function t(text, o = {}) {
  return new TextRun({
    text,
    font,
    size: o.size ?? 24,
    bold: o.bold ?? false,
    italics: o.italics ?? false,
  })
}

function p(text, o = {}) {
  return new Paragraph({
    alignment: o.align ?? AlignmentType.JUSTIFIED,
    spacing: {
      after: o.after ?? 120,
      before: o.before ?? 0,
      line: o.line ?? 360,
      lineRule: 'auto',
    },
    indent: o.firstLine != null ? { firstLine: o.firstLine } : o.noIndent ? undefined : { firstLine: 720 },
    children: Array.isArray(text)
      ? text.map((x) => (typeof x === 'string' ? t(x, o) : t(x.text, { ...o, ...x })))
      : [t(text, o)],
  })
}

function center(text, o = {}) {
  return p(text, { ...o, align: AlignmentType.CENTER, firstLine: 0, noIndent: true })
}

function empty(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [] }))
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 200, line: 360, lineRule: 'auto' },
    children: [t(text.toUpperCase(), { bold: true, size: 28 })],
  })
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 140, line: 360, lineRule: 'auto' },
    children: [t(text, { bold: true, size: 24 })],
  })
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 100, line: 360, lineRule: 'auto' },
    children: [t(text, { bold: true, size: 24 })],
  })
}

function cell(text, w, o = {}) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 50, bottom: 50, left: 70, right: 70 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: o.align ?? AlignmentType.LEFT,
        spacing: { after: 20, line: 276, lineRule: 'auto' },
        children: [t(text, { size: o.size ?? 20, bold: o.bold ?? false })],
      }),
    ],
  })
}

function metaTable(rows) {
  const c1 = 3200
  const c2 = CW - c1
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [c1, c2],
    rows: rows.map(
      ([a, b]) =>
        new TableRow({
          children: [
            cell(a, c1, { bold: true, fill: 'F0F0F0' }),
            cell(b, c2),
          ],
        }),
    ),
  })
}

function dataTable(headers, rows) {
  const n = headers.length
  const colW = Math.floor(CW / n)
  const widths = Array(n).fill(colW)
  widths[n - 1] = CW - colW * (n - 1)
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        children: headers.map((h, i) =>
          cell(h, widths[i], { bold: true, fill: '1F4E79', size: 18 }),
        ),
      }),
      ...rows.map(
        (r, ri) =>
          new TableRow({
            children: r.map((c, i) =>
              cell(String(c), widths[i], {
                size: 18,
                fill: ri % 2 === 0 ? 'F8F8F8' : undefined,
              }),
            ),
          }),
      ),
    ],
  })
}

// Fix header cell white text
function dataTableDark(headers, rows) {
  const n = headers.length
  const colW = Math.floor(CW / n)
  const widths = Array(n).fill(colW)
  widths[n - 1] = CW - colW * (n - 1)
  const headerCell = (text, w) =>
    new TableCell({
      borders,
      width: { size: w, type: WidthType.DXA },
      shading: { fill: '1F4E79', type: ShadingType.CLEAR },
      margins: { top: 50, bottom: 50, left: 70, right: 70 },
      children: [
        new Paragraph({
          spacing: { after: 20, line: 276, lineRule: 'auto' },
          children: [
            new TextRun({
              text,
              font,
              size: 18,
              bold: true,
              color: 'FFFFFF',
            }),
          ],
        }),
      ],
    })
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        children: headers.map((h, i) => headerCell(h, widths[i])),
      }),
      ...rows.map(
        (r) =>
          new TableRow({
            children: r.map((c, i) => cell(String(c), widths[i], { size: 18 })),
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

function tocLine(label, pageHint = '') {
  return new Paragraph({
    spacing: { after: 80, line: 360, lineRule: 'auto' },
    tabStops: [{ type: 'right', position: CW }],
    children: [
      t(label),
      t('\t'),
      t(pageHint, { italics: true, size: 20 }),
    ],
  })
}

const level = (id) => ({
  reference: id,
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
  // ========== COVER ==========
  center('LAPORAN MAGANG / PRAKTIK KERJA LAPANGAN', {
    bold: true,
    size: 28,
    after: 80,
    line: 300,
  }),
  center('(PKL)', { bold: true, size: 26, after: 280, line: 300 }),
  ...empty(1),
  center('KAJIAN DAN DOKUMENTASI INOVASI ARUMANIS', {
    bold: true,
    size: 28,
    after: 60,
    line: 320,
  }),
  center('APLIKASI SATU DATA AIR MINUM DAN SANITASI', {
    bold: true,
    size: 28,
    after: 60,
    line: 320,
  }),
  center('DINAS PERUMAHAN DAN KAWASAN PERMUKIMAN', {
    bold: true,
    size: 26,
    after: 40,
    line: 300,
  }),
  center('KABUPATEN CIANJUR', { bold: true, size: 26, after: 400, line: 300 }),
  ...empty(1),
  center('Disusun untuk memenuhi sebagian persyaratan', { size: 22, after: 40 }),
  center('Praktik Kerja Lapangan Program Studi Teknik Informatika', {
    size: 22,
    after: 280,
  }),
  ...empty(1),
  center('Disusun oleh:', { size: 22, after: 120 }),
  center('MOCH IRSAN FIRMANSYAH', { bold: true, size: 28, after: 60 }),
  center('NIM 5520124132', { bold: true, size: 24, after: 400 }),
  ...empty(2),
  center('PROGRAM STUDI TEKNIK INFORMATIKA', { bold: true, size: 24, after: 40 }),
  center('FAKULTAS TEKNIK', { bold: true, size: 24, after: 40 }),
  center('UNIVERSITAS SURYA KENCANA', { bold: true, size: 24, after: 40 }),
  center('CIANJUR', { bold: true, size: 24, after: 120 }),
  center('2026', { bold: true, size: 24, after: 0 }),
  new Paragraph({ children: [new PageBreak()] }),

  // ========== LEMBAR PENGESAHAN ==========
  h1('Lembar Pengesahan'),
  p(
    'Laporan magang / praktik kerja lapangan berjudul:',
    { firstLine: 0, after: 120 },
  ),
  center(
    '“Kajian dan Dokumentasi Inovasi Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) pada Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur”',
    { italics: true, size: 22, after: 200 },
  ),
  p('yang disusun oleh:', { firstLine: 0, after: 120 }),
  metaTable([
    ['Nama', 'Moch Irsan Firmansyah'],
    ['NIM', '5520124132'],
    ['Program Studi', 'Teknik Informatika'],
    ['Fakultas', 'Fakultas Teknik'],
    ['Perguruan Tinggi', 'Universitas Surya Kencana Cianjur'],
    ['Tempat Magang', 'DPKP Kabupaten Cianjur (objek: Arumanis)'],
    ['Periode Magang', '……………… s.d. ……………… 2026'],
  ]),
  ...empty(1),
  p(
    'telah diperiksa dan disetujui sebagai laporan praktik kerja lapangan.',
    { firstLine: 0, after: 280 },
  ),
  p('Cianjur, …………………… 2026', { firstLine: 0, align: AlignmentType.RIGHT, after: 280 }),
  ...empty(1),
  new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [Math.floor(CW / 2), Math.floor(CW / 2)],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            },
            width: { size: Math.floor(CW / 2), type: WidthType.DXA },
            children: [
              center('Mengetahui,', { size: 22, after: 40 }),
              center('Pembimbing Lapangan', { size: 22, after: 400 }),
              center('________________________', { size: 22, after: 40 }),
              center('NIP/NIK. …………………', { size: 20, after: 40 }),
            ],
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            },
            width: { size: Math.floor(CW / 2), type: WidthType.DXA },
            children: [
              center('Menyetujui,', { size: 22, after: 40 }),
              center('Dosen Pembimbing PKL', { size: 22, after: 400 }),
              center('________________________', { size: 22, after: 40 }),
              center('NIDN. …………………', { size: 20, after: 40 }),
            ],
          }),
        ],
      }),
    ],
  }),
  ...empty(2),
  center('Mengetahui,', { size: 22, after: 40 }),
  center('Ketua Program Studi Teknik Informatika', { size: 22, after: 400 }),
  center('________________________', { size: 22, after: 40 }),
  center('NIDN. …………………', { size: 20, after: 40 }),
  new Paragraph({ children: [new PageBreak()] }),

  // ========== KATA PENGANTAR ==========
  h1('Kata Pengantar'),
  p(
    'Puji syukur penulis panjatkan ke hadirat Tuhan Yang Maha Esa karena atas rahmat-Nya laporan magang / praktik kerja lapangan ini dapat diselesaikan. Laporan ini disusun berdasarkan kegiatan magang yang berfokus pada kajian dan dokumentasi inovasi Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) di lingkungan Dinas Perumahan dan Kawasan Permukiman (DPKP) Kabupaten Cianjur.',
  ),
  p(
    'Kegiatan magang ini memberi kesempatan bagi penulis untuk menghubungkan materi perkuliahan Teknik Informatika dengan penerapan sistem informasi di instansi pemerintahan daerah. Melalui observasi modul, penelaahan dokumen, dan penyusunan dokumentasi, penulis memperoleh gambaran nyata tentang peran teknologi informasi dalam mendukung pelayanan air minum dan sanitasi.',
  ),
  p('Ucapan terima kasih penulis sampaikan kepada:'),
  num(
    'terima',
    'Dosen Pembimbing PKL Program Studi Teknik Informatika Universitas Surya Kencana yang telah memberikan arahan selama penyusunan laporan.',
  ),
  num(
    'terima',
    'Pimpinan dan staf DPKP Kabupaten Cianjur serta pengelola Arumanis yang telah memberikan kesempatan magang, bimbingan lapangan, dan akses observasi.',
  ),
  num(
    'terima',
    'Ketua Program Studi Teknik Informatika dan jajaran Fakultas Teknik Universitas Surya Kencana.',
  ),
  num(
    'terima',
    'Keluarga dan rekan yang telah memberikan dukungan selama pelaksanaan magang.',
  ),
  p(
    'Penulis menyadari laporan ini masih memiliki kekurangan. Kritik dan saran yang membangun sangat diharapkan. Semoga laporan ini bermanfaat bagi mahasiswa, perguruan tinggi, dan instansi terkait.',
  ),
  p('Cianjur, …………………… 2026', {
    firstLine: 0,
    align: AlignmentType.RIGHT,
    after: 200,
  }),
  p('Penulis,', { firstLine: 0, align: AlignmentType.RIGHT, after: 400 }),
  p('Moch Irsan Firmansyah', {
    firstLine: 0,
    align: AlignmentType.RIGHT,
    bold: true,
    after: 40,
  }),
  p('NIM 5520124132', { firstLine: 0, align: AlignmentType.RIGHT, after: 40 }),
  new Paragraph({ children: [new PageBreak()] }),

  // ========== DAFTAR ISI ==========
  h1('Daftar Isi'),
  tocLine('LEMBAR PENGESAHAN'),
  tocLine('KATA PENGANTAR'),
  tocLine('DAFTAR ISI'),
  tocLine('DAFTAR TABEL'),
  tocLine('BAB I PENDAHULUAN'),
  tocLine('    1.1 Latar Belakang'),
  tocLine('    1.2 Tujuan Magang'),
  tocLine('    1.3 Manfaat Magang'),
  tocLine('    1.4 Ruang Lingkup'),
  tocLine('    1.5 Metode Pelaksanaan'),
  tocLine('BAB II GAMBARAN UMUM INSTANSI DAN SISTEM'),
  tocLine('    2.1 Profil DPKP Kabupaten Cianjur'),
  tocLine('    2.2 Profil Inovasi Arumanis'),
  tocLine('    2.3 Arsitektur dan Modul Utama'),
  tocLine('BAB III PELAKSANAAN KEGIATAN MAGANG'),
  tocLine('    3.1 Jadwal dan Aktivitas'),
  tocLine('    3.2 Observasi Modul dan Alur Kerja'),
  tocLine('    3.3 Dokumentasi Temuan'),
  tocLine('BAB IV HASIL DAN PEMBAHASAN'),
  tocLine('    4.1 Hasil Observasi Operasional'),
  tocLine('    4.2 Analisis Manfaat Inovasi'),
  tocLine('    4.3 Kendala dan Pembelajaran'),
  tocLine('BAB V KESIMPULAN DAN SARAN'),
  tocLine('DAFTAR PUSTAKA'),
  tocLine('LAMPIRAN'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('Daftar Tabel'),
  tocLine('Tabel 1.1 Tujuan kegiatan magang'),
  tocLine('Tabel 2.1 Ringkasan modul Arumanis'),
  tocLine('Tabel 3.1 Contoh jadwal aktivitas magang'),
  tocLine('Tabel 4.1 Indikator data operasional Arumanis'),
  tocLine('Tabel 4.2 Perbandingan proses sebelum dan sesudah'),
  new Paragraph({ children: [new PageBreak()] }),

  // ========== BAB I ==========
  h1('Bab I Pendahuluan'),
  h2('1.1 Latar Belakang'),
  p(
    'Program Studi Teknik Informatika menempatkan praktik kerja lapangan sebagai sarana menghubungkan teori perkuliahan dengan dunia kerja. Mahasiswa diharapkan mampu mengamati, mendokumentasikan, dan menganalisis penerapan sistem informasi di organisasi nyata. Salah satu objek yang relevan di Kabupaten Cianjur adalah Arumanis, yaitu Aplikasi Satu Data Air Minum dan Sanitasi yang dioperasikan Dinas Perumahan dan Kawasan Permukiman (DPKP).',
  ),
  p(
    'Sebelum digitalisasi terpusat, data unit SPAM, capaian Standar Pelayanan Minimum (SPM), dan monitoring pekerjaan infrastruktur sering tersebar di lembar kerja, berkas fisik, serta saluran komunikasi informal. Arumanis hadir untuk menyatukan data tersebut, mendukung pengawasan lapangan, dan membuka akses publik terhadap capaian layanan. Bagi mahasiswa Teknik Informatika, magang pada objek ini memberi kesempatan memahami bagaimana sistem informasi mendukung pelayanan publik daerah.',
  ),
  p(
    'Laporan ini disusun sebagai pertanggungjawaban kegiatan magang yang fokus pada kajian dan dokumentasi Arumanis, bukan sebagai klaim kepemilikan rekayasa perangkat lunak. Isi laporan memuat gambaran instansi, aktivitas magang, hasil observasi, analisis manfaat, serta kesimpulan dan saran.',
  ),

  h2('1.2 Tujuan Magang'),
  p('Tujuan umum kegiatan magang adalah memperoleh pengalaman kerja di bidang sistem informasi pemerintahan daerah melalui kajian inovasi Arumanis. Tujuan khusus disajikan pada Tabel 1.1.', {
    firstLine: 720,
  }),
  ...empty(0),
  center('Tabel 1.1 Tujuan kegiatan magang', {
    bold: true,
    italics: true,
    size: 20,
    after: 80,
  }),
  dataTableDark(
    ['No', 'Tujuan khusus'],
    [
      ['1', 'Memahami profil DPKP dan posisi Arumanis dalam pelayanan air minum–sanitasi'],
      ['2', 'Mengobservasi modul dan alur kerja portal Arumanis serta panel pengawasan'],
      ['3', 'Mendokumentasikan data operasional dan indikasi manfaat inovasi'],
      ['4', 'Menyusun laporan magang yang dapat mendukung dokumentasi lomba inovasi daerah'],
      ['5', 'Mengasah kemampuan analisis, komunikasi, dan penulisan ilmiah terapan'],
    ],
  ),
  ...empty(1),

  h2('1.3 Manfaat Magang'),
  h3('1.3.1 Bagi Mahasiswa'),
  p(
    'Mahasiswa memperoleh pengalaman observasi sistem informasi nyata, memahami alur data pemerintahan daerah, serta melatih penyusunan laporan formal. Kegiatan ini juga memperluas wawasan tentang peran teknologi informasi pada layanan publik.',
  ),
  h3('1.3.2 Bagi Perguruan Tinggi'),
  p(
    'Laporan magang menjadi bukti kemitraan Program Studi Teknik Informatika Universitas Surya Kencana dengan instansi daerah, serta bahan evaluasi kurikulum terkait sistem informasi dan rekayasa perangkat lunak terapan.',
  ),
  h3('1.3.3 Bagi Instansi'),
  p(
    'DPKP memperoleh dokumentasi ringkas dari sudut pandang mahasiswa mengenai kemanfaatan Arumanis, yang dapat dipakai sebagai bahan pendukung sosialisasi, evaluasi internal, atau kelengkapan lomba inovasi daerah.',
  ),

  h2('1.4 Ruang Lingkup'),
  p(
    'Ruang lingkup magang dibatasi pada kajian dan dokumentasi Arumanis di DPKP Kabupaten Cianjur. Aktivitas utama meliputi observasi modul, penelaahan dokumen, pencatatan alur kerja, serta penyusunan laporan. Ruang lingkup tidak mencakup pengembangan fitur baru, pengujian keamanan penetrasi, atau akses data pribadi penerima manfaat di luar yang diizinkan pembimbing lapangan.',
  ),

  h2('1.5 Metode Pelaksanaan'),
  p(
    'Pelaksanaan magang menggunakan pendekatan observasi partisipatif terbatas, wawancara informal dengan pembimbing lapangan, studi dokumen, dan pencatatan harian aktivitas. Analisis dilakukan secara deskriptif dengan membandingkan kondisi proses kerja yang tercatat sebelum digitalisasi terpusat dan kondisi operasional Arumanis berdasarkan dokumentasi serta observasi modul.',
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // ========== BAB II ==========
  h1('Bab II Gambaran Umum Instansi dan Sistem'),
  h2('2.1 Profil DPKP Kabupaten Cianjur'),
  p(
    'Dinas Perumahan dan Kawasan Permukiman (DPKP) Kabupaten Cianjur merupakan perangkat daerah yang menangani urusan perumahan, kawasan permukiman, serta program terkait air minum dan sanitasi sesuai kewenangan daerah. Dalam konteks magang ini, unit terkait menjadi mitra tempat mahasiswa mengamati penerapan Arumanis sebagai platform data dan monitoring program.',
  ),
  p(
    'Wilayah kerja program air minum dan sanitasi mencakup 33 kecamatan dan 365 desa/kelurahan. Skala wilayah tersebut menuntut sistem data yang terpusat agar rekapitulasi capaian dan monitoring pekerjaan tidak bergantung pada berkas terpisah.',
  ),

  h2('2.2 Profil Inovasi Arumanis'),
  p(
    'Arumanis adalah Aplikasi Satu Data Air Minum dan Sanitasi yang dikembangkan dan dioperasikan untuk menyatukan data unit SPAM, capaian SPM, paket pekerjaan, dokumentasi lapangan, dan informasi yang dapat diakses publik. Portal produksi dapat diakses melalui arumanis.cianjur.space dengan backend API pada apiamis.cianjur.space.',
  ),
  p(
    'Secara fungsional, Arumanis mendukung operator kantor, pengawas lapangan, pejabat yang membutuhkan ringkasan data, serta masyarakat yang ingin melihat capaian layanan per desa melalui peta publik. Inovasi ini relevan dengan arah SPBE dan target akses air minum layak di daerah.',
  ),

  h2('2.3 Arsitektur dan Modul Utama'),
  p(
    'Dari hasil observasi dan penelaahan dokumen, Arumanis bekerja sebagai ekosistem. Portal web dipakai operator di kantor. Backend API (APIAMIS) menjadi pusat data dan aturan bisnis. Panel pengawasan (web/mobile) dipakai pengawas lapangan untuk foto ber-GPS, progres, dan tiket. Beberapa integrasi pendukung (misalnya data perencanaan dan pengadaan) memperkaya alur data, namun fokus magang tetap pada pemahaman modul inti dan manfaat operasional.',
  ),
  center('Tabel 2.1 Ringkasan modul Arumanis yang diamati', {
    bold: true,
    italics: true,
    size: 20,
    after: 80,
  }),
  dataTableDark(
    ['Modul / area', 'Fungsi ringkas', 'Pengguna utama'],
    [
      ['Login & akses peran', 'Otentikasi dan pembatasan menu sesuai role', 'Semua pengguna internal'],
      ['Dashboard', 'Ringkasan KPI dan pantauan singkat', 'Operator, pejabat'],
      ['Kegiatan & pekerjaan', 'Kelola sub kegiatan dan paket pekerjaan', 'Operator, admin'],
      ['Kontrak & penyedia', 'Data kontrak dan rekanan', 'Admin / operator terkait'],
      ['SPAM unit & capaian SPM', 'Data unit, achievement, anggaran', 'Operator SPAM'],
      ['Foto & progress', 'Dokumentasi lapangan dan progres', 'Pengawas, operator'],
      ['Panel pengawasan', 'Laporan lapangan, tiket, SSO', 'Pengawas / TFL'],
      ['Peta publik capaian', 'Visualisasi capaian desa tanpa login', 'Masyarakat / publik'],
      ['Export laporan', 'Unduh data PDF/Excel', 'Operator, pejabat'],
    ],
  ),
  ...empty(1),
  p(
    'Pemahaman modul di atas menjadi dasar aktivitas magang pada Bab III, khususnya saat menyusun catatan observasi dan alur kerja harian.',
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // ========== BAB III ==========
  h1('Bab III Pelaksanaan Kegiatan Magang'),
  h2('3.1 Jadwal dan Aktivitas'),
  p(
    'Kegiatan magang dilaksanakan sesuai kesepakatan antara Program Studi Teknik Informatika Universitas Surya Kencana dengan DPKP Kabupaten Cianjur. Secara umum, aktivitas dibagi menjadi tahap pengenalan, observasi mendalam, dokumentasi temuan, dan penyusunan laporan. Contoh kerangka jadwal disajikan pada Tabel 3.1 (tanggal menyesuaikan surat tugas aktual).',
  ),
  center('Tabel 3.1 Contoh jadwal aktivitas magang', {
    bold: true,
    italics: true,
    size: 20,
    after: 80,
  }),
  dataTableDark(
    ['Minggu', 'Fokus aktivitas', 'Keluaran'],
    [
      ['1', 'Orientasi instansi, pengenalan Arumanis, baca panduan', 'Catatan orientasi'],
      ['2', 'Observasi login, dashboard, master data, pekerjaan', 'Log observasi modul'],
      ['3', 'Observasi SPAM/SPM, export, panel pengawasan', 'Catatan alur lapangan–kantor'],
      ['4', 'Kompilasi data operasional & perbandingan proses', 'Draft temuan'],
      ['5', 'Penulisan laporan, revisi pembimbing', 'Draft laporan lengkap'],
      ['6', 'Finalisasi, pengesahan, presentasi (jika diminta)', 'Laporan final'],
    ],
  ),
  ...empty(1),
  p(
    'Setiap hari kerja, mahasiswa mencatat aktivitas pada jurnal magang (lihat lampiran). Bimbingan dilakukan dengan pembimbing lapangan di instansi dan dosen pembimbing di kampus sesuai jadwal konsultasi.',
  ),

  h2('3.2 Observasi Modul dan Alur Kerja'),
  h3('3.2.1 Alur operator kantor'),
  p(
    'Pada sisi kantor, pengguna masuk melalui halaman login, kemudian mengakses dashboard untuk melihat ringkasan. Selanjutnya operator mengelola data sesuai peran: kegiatan/sub kegiatan, paket pekerjaan, kontrak, data SPAM unit, capaian SPM, hingga unduh laporan. Observasi menekankan pentingnya validasi data dan pembatasan akses wilayah agar data tetap konsisten.',
  ),
  h3('3.2.2 Alur pengawas lapangan'),
  p(
    'Pengawas dapat masuk melalui portal lalu dialihkan ke panel pengawasan, atau mengakses kanal pengawasan sesuai kebijakan instansi. Di lapangan, pengawas mengunggah dokumentasi foto pada slot progres, mengisi laporan progres, dan mencatat kendala melalui tiket. Sinkronisasi data ke pusat membuat kondisi lapangan lebih cepat terbaca dibanding pelaporan multi-minggu yang tidak terstandar.',
  ),
  h3('3.2.3 Akses publik'),
  p(
    'Masyarakat atau pihak yang membutuhkan informasi capaian dapat membuka halaman publik untuk melihat peta capaian SPM per desa tanpa harus login. Observasi ini penting untuk memahami dimensi transparansi inovasi, bukan hanya efisiensi internal dinas.',
  ),

  h2('3.3 Dokumentasi Temuan'),
  p(
    'Temuan magang didokumentasikan dalam bentuk: (1) jurnal harian aktivitas; (2) catatan observasi per modul; (3) ringkasan indikator operasional dari dokumen resmi; (4) daftar kendala dan pembelajaran; serta (5) laporan magang ini. Screenshot dan salinan dokumen hanya dilampirkan jika diizinkan pembimbing lapangan dan tidak menampilkan data pribadi sensitif.',
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // ========== BAB IV ==========
  h1('Bab IV Hasil dan Pembahasan'),
  h2('4.1 Hasil Observasi Operasional'),
  p(
    'Berdasarkan dokumentasi operasional yang ditelaah selama magang (snapshot acuan 26 Juni 2026), Arumanis telah menampung data pada skala kabupaten. Ringkasan indikator disajikan pada Tabel 4.1.',
  ),
  center('Tabel 4.1 Indikator data operasional Arumanis (snapshot 26 Juni 2026)', {
    bold: true,
    italics: true,
    size: 20,
    after: 80,
  }),
  dataTableDark(
    ['Indikator', 'Nilai'],
    [
      ['Unit SPAM terdata', '364 unit'],
      ['Desa pada peta capaian SPM', '365 desa'],
      ['Target KK master desa', '534.952 KK'],
      ['Capaian SR/KK (s.d. 2025)', '52.911'],
      ['Capaian jiwa terlayani', '264.557 jiwa'],
      ['Persentase capaian SPM', '13,2%'],
      ['Record achievement', '505 entri'],
      ['Nilai kontrak SPAM terdata', 'Rp 90.479.525.404'],
      ['Paket pekerjaan terpantau', '426 paket'],
      ['Dokumentasi foto progres', '3.866 berkas'],
    ],
  ),
  ...empty(1),
  p(
    'Angka capaian SPM 13,2% terhadap target KK memperlihatkan bahwa sistem tidak hanya menyimpan data, tetapi juga menampilkan gap layanan. Bagi dinas, gap tersebut dapat menjadi bahan perencanaan intervensi. Bagi mahasiswa magang, data ini menjadi bukti bahwa inovasi memiliki keluaran yang terukur.',
  ),

  h2('4.2 Analisis Manfaat Inovasi'),
  p(
    'Perbandingan proses administrasi dan pengawasan sebelum–sesudah digitalisasi terpusat (berdasarkan dokumen inovasi dan observasi) diringkas pada Tabel 4.2.',
  ),
  center('Tabel 4.2 Perbandingan proses sebelum dan sesudah Arumanis', {
    bold: true,
    italics: true,
    size: 20,
    after: 80,
  }),
  dataTableDark(
    ['Indikator proses', 'Sebelum (estimasi)', 'Sesudah (operasional)'],
    [
      ['Sumber data SPAM & proyek', '4–6 format terpisah', 'Platform terintegrasi'],
      ['Rekap SPM lintas desa', '5–10 hari kerja', 'Kurang dari 1 hari'],
      ['Paket terpantau terpusat', 'Tidak terstandar', '426 paket'],
      ['Interval update progres', '2–4 minggu', 'Mingguan terstruktur'],
      ['Foto progres terindeks', 'Tersebar di perangkat', '3.866 berkas + GPS'],
      ['Impor data SPAM massal', '3–5 hari manual', 'Kurang dari 2 jam'],
      ['Akses publik capaian desa', 'Terbatas', 'Peta interaktif 24/7'],
    ],
  ),
  ...empty(1),
  p(
    'Dari sisi manfaat, operator kantor memperoleh sumber data tunggal dan filter wilayah/tahun yang mempercepat pelaporan. Pengawas memperoleh alur dokumentasi yang lebih teratur. Pejabat memperoleh ringkasan untuk bahan keputusan. Masyarakat memperoleh akses informasi capaian desa. Dengan demikian, magang ini menegaskan bahwa nilai Arumanis terletak pada perubahan proses dan keterukuran data, bukan sekadar keberadaan aplikasi.',
  ),

  h2('4.3 Kendala dan Pembelajaran'),
  p(
    'Selama magang, beberapa catatan penting muncul. Pertama, kualitas data tetap bergantung pada kedisiplinan input di lapangan dan kelengkapan profil unit desa. Kedua, pengguna baru membutuhkan waktu adaptasi dan pelatihan berulang. Ketiga, akses observasi mahasiswa harus selalu seizin pembimbing agar tidak melanggar kebijakan data. Keempat, angka “sebelum sistem” pada beberapa dokumen bersifat estimasi operasional, sehingga interpretasi manfaat harus hati-hati dan tidak berlebihan.',
  ),
  p(
    'Pembelajaran bagi penulis mencakup pemahaman arsitektur sistem informasi pemerintahan daerah, pentingnya role-based access, alur data kantor–lapangan, serta keterampilan menyusun laporan formal. Materi kuliah seperti basis data, rekayasa perangkat lunak, dan sistem informasi menjadi lebih mudah dipahami ketika dihadapkan pada kasus nyata Arumanis.',
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // ========== BAB V ==========
  h1('Bab V Kesimpulan dan Saran'),
  h2('5.1 Kesimpulan'),
  p(
    'Kegiatan magang / praktik kerja lapangan pada objek Arumanis di DPKP Kabupaten Cianjur telah dilaksanakan sesuai ruang lingkup kajian dan dokumentasi. Penulis memperoleh pemahaman tentang profil instansi, modul sistem, alur kerja operator dan pengawas, serta indikasi manfaat operasional inovasi. Data operasional yang ditelaah menunjukkan konsolidasi data pada skala kabupaten, sementara perbandingan proses mengindikasikan percepatan rekapitulasi dan penertiban pelaporan lapangan. Laporan ini juga dapat mendukung dokumentasi inovasi daerah dari sudut pandang mahasiswa.',
  ),
  p(
    'Secara keseluruhan, tujuan magang tercapai: mahasiswa mampu mengamati, mendokumentasikan, dan menganalisis penerapan sistem informasi pelayanan publik, serta menyusun laporan formal sebagai pertanggungjawaban akademik.',
  ),

  h2('5.2 Saran'),
  p('Berdasarkan hasil magang, penulis menyampaikan saran sebagai berikut.'),
  num(
    'saran',
    'Bagi DPKP/pengelola Arumanis: perkuat pelatihan pengguna, audit kelengkapan data per kecamatan, dan dokumentasi perubahan proses untuk keperluan evaluasi inovasi.',
  ),
  num(
    'saran',
    'Bagi mahasiswa magang berikutnya: susun jurnal harian sejak hari pertama, siapkan daftar pertanyaan observasi, dan patuhi kebijakan kerahasiaan data.',
  ),
  num(
    'saran',
    'Bagi Program Studi: pertahankan kerja sama dengan DPKP serta arahkan topik magang yang menghasilkan dokumentasi bermanfaat bagi instansi dan mahasiswa.',
  ),
  num(
    'saran',
    'Bagi pengembangan kajian lanjutan: tambahkan survei kepuasan pengguna dan pengukuran usability formal jika izin penelitian tersedia.',
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // ========== PUSTAKA ==========
  h1('Daftar Pustaka'),
  p(
    'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur. (2026). Dokumentasi operasional dan rancang bangun inovasi Arumanis. Cianjur: DPKP.',
    { firstLine: 0, after: 120 },
  ),
  p(
    'Pemerintah Kabupaten Cianjur. Rencana Pembangunan Jangka Menengah Daerah Kabupaten Cianjur Tahun 2025–2029. Cianjur: Pemerintah Kabupaten Cianjur.',
    { firstLine: 0, after: 120 },
  ),
  p(
    'United Nations. (2015). Transforming our world: the 2030 Agenda for Sustainable Development. New York: United Nations.',
    { firstLine: 0, after: 120 },
  ),
  p(
    'DeLone, W. H., & McLean, E. R. (2003). The DeLone and McLean model of information systems success: A ten-year update. Journal of Management Information Systems, 19(4), 9–30.',
    { firstLine: 0, after: 120 },
  ),
  p(
    'Heeks, R. (2003). Most eGovernment-for-development projects fail: How can risks be reduced? iGovernment Working Paper Series No. 14. University of Manchester.',
    { firstLine: 0, after: 120 },
  ),
  p(
    'Laudon, K. C., & Laudon, J. P. (2020). Management information systems: Managing the digital firm (16th ed.). Harlow: Pearson.',
    { firstLine: 0, after: 120 },
  ),
  p(
    'Yin, R. K. (2018). Case study research and applications: Design and methods (6th ed.). Thousand Oaks: SAGE.',
    { firstLine: 0, after: 200 },
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // ========== LAMPIRAN ==========
  h1('Lampiran'),
  h2('Lampiran A. Identitas Peserta Magang'),
  metaTable([
    ['Nama', 'Moch Irsan Firmansyah'],
    ['NIM', '5520124132'],
    ['Program Studi', 'Teknik Informatika'],
    ['Perguruan Tinggi', 'Universitas Surya Kencana Cianjur'],
    ['Tempat Magang', 'DPKP Kabupaten Cianjur'],
    ['Objek kajian', 'Arumanis (arumanis.cianjur.space)'],
    ['Periode', '……………… s.d. ……………… 2026'],
    ['Pembimbing lapangan', '……………………………………'],
    ['Dosen pembimbing', '……………………………………'],
  ]),
  ...empty(1),

  h2('Lampiran B. Format Jurnal Harian Magang'),
  center('Tabel B.1 Contoh jurnal harian', {
    bold: true,
    italics: true,
    size: 20,
    after: 80,
  }),
  dataTableDark(
    ['Tanggal', 'Aktivitas', 'Modul/area', 'Hasil/catatan', 'Paraf'],
    [
      ['…/…/2026', 'Orientasi & pengenalan Arumanis', 'Umum', 'Catatan struktur menu', ''],
      ['…/…/2026', 'Observasi dashboard & pekerjaan', 'Portal', 'Alur input paket', ''],
      ['…/…/2026', 'Observasi SPAM/SPM & peta publik', 'SPAM/Publik', 'Indikator capaian', ''],
      ['…/…/2026', 'Observasi panel pengawasan', 'Pengawasan', 'Foto & progres', ''],
      ['…/…/2026', 'Penyusunan laporan', 'Dokumentasi', 'Draft bab IV–V', ''],
    ],
  ),
  ...empty(1),

  h2('Lampiran C. Checklist Observasi Modul'),
  dataTableDark(
    ['No', 'Item observasi', 'Sudah', 'Catatan'],
    [
      ['1', 'Proses login dan pembagian role', '', ''],
      ['2', 'Dashboard dan ringkasan KPI', '', ''],
      ['3', 'Master kegiatan / pekerjaan', '', ''],
      ['4', 'Kontrak / penyedia (jika diizinkan)', '', ''],
      ['5', 'Modul SPAM unit & capaian SPM', '', ''],
      ['6', 'Foto progres / progress estimasi', '', ''],
      ['7', 'Panel pengawasan (web/mobile)', '', ''],
      ['8', 'Export laporan PDF/Excel', '', ''],
      ['9', 'Halaman publik peta capaian', '', ''],
      ['10', 'Kebijakan akses & kerahasiaan data', '', ''],
    ],
  ),
  ...empty(1),

  h2('Lampiran D. Surat Keterangan / Tugas Magang'),
  p(
    '[Lampirkan salinan surat pengantar dari Universitas Surya Kencana dan surat penerimaan / keterangan magang dari DPKP Kabupaten Cianjur.]',
    { italics: true, firstLine: 0 },
  ),
  ...empty(1),

  h2('Lampiran E. Dokumentasi Kegiatan'),
  p(
    '[Lampirkan foto kegiatan magang dan/atau tangkapan layar modul Arumanis yang sudah diizinkan pembimbing lapangan. Hindari menampilkan data pribadi, kredensial, atau informasi rahasia.]',
    { italics: true, firstLine: 0 },
  ),
  ...empty(2),
  center('— Akhir Laporan Magang —', { italics: true, size: 20, after: 80 }),
  center('Moch Irsan Firmansyah · NIM 5520124132', { size: 20, after: 40 }),
  center(
    'Teknik Informatika · Universitas Surya Kencana Cianjur',
    { size: 20, after: 40 },
  ),
  center('Objek: Arumanis · DPKP Kabupaten Cianjur · 2026', { size: 20, after: 40 }),
]

const doc = new Document({
  styles: {
    default: { document: { run: { font, size: 24 } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 28, bold: true, font },
        paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font },
        paragraph: { spacing: { before: 220, after: 140 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font },
        paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [level('terima'), level('saran')],
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
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 8,
                  color: '1F4E79',
                  space: 4,
                },
              },
              spacing: { after: 80 },
              children: [
                t(
                  'Laporan Magang Arumanis · Moch Irsan Firmansyah (5520124132)',
                  { size: 16, italics: true },
                ),
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
                top: {
                  style: BorderStyle.SINGLE,
                  size: 6,
                  color: '1F4E79',
                  space: 4,
                },
              },
              spacing: { before: 60 },
              children: [
                t(
                  'Teknik Informatika · Universitas Surya Kencana  ·  Halaman ',
                  { size: 16 },
                ),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font,
                  size: 16,
                }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
})

const buf = await Packer.toBuffer(doc)
fs.writeFileSync(OUT, buf)
console.log('OK:', OUT)
