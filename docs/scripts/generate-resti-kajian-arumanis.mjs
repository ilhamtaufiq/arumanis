/**
 * Naskah format Jurnal RESTI (Rekayasa Sistem dan Teknologi Informasi)
 * Kajian/analisis inovasi Arumanis — bukan rancang bangun
 * Untuk pendukung lomba inovasi daerah / laporan kajian mahasiswa-PKL
 *
 * Kaidah template RESTI 2025 (IAII):
 * - A4, margin 25 mm
 * - Judul TNR 15, max 12 kata, tidak bold
 * - Abstrak TNR 9 italic, max 250 kata, satu paragraf
 * - Keywords dipisah titik koma
 * - Urutan: Introduction, Methods, Results and Discussion, Conclusions, Acknowledgments, References
 * - Dua kolom, spasi kolom ~0.4 cm
 * - Tanpa bullet/numbering di tubuh naskah
 * - Referensi gaya IEEE, ≥25 sumber ideal (diisi realistis + catatan editor)
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
  VerticalAlign,
  convertInchesToTwip,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(
  __dirname,
  '..',
  'Jurnal_RESTI_Kajian_Arumanis_Moch_Irsan_Firmansyah.docx',
)

const font = 'Times New Roman'
// 25 mm ≈ 1417.5 DXA
const M = 1418
const PAGE = {
  size: { width: 11906, height: 16838 },
  margin: { top: M, right: M, bottom: M, left: M, header: 709, footer: 709 },
}

const noV = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const hLine = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
// RESTI: no vertical lines in tables
const tblBorders = {
  top: hLine,
  bottom: hLine,
  left: noV,
  right: noV,
  insideHorizontal: hLine,
  insideVertical: noV,
}

function r(text, o = {}) {
  return new TextRun({
    text,
    font,
    size: o.size ?? 20, // 10 pt body
    bold: o.bold ?? false,
    italics: o.italics ?? false,
    superScript: o.superScript,
    color: o.color,
  })
}

function p(children, o = {}) {
  const runs = Array.isArray(children)
    ? children.map((c) => (typeof c === 'string' ? r(c, o) : r(c.text, { ...o, ...c })))
    : [r(children, o)]
  return new Paragraph({
    alignment: o.align ?? AlignmentType.JUSTIFIED,
    spacing: {
      after: o.after ?? 120,
      before: o.before ?? 0,
      line: o.line ?? 240,
      lineRule: 'auto',
    },
    indent: o.firstLine ? { firstLine: o.firstLine } : undefined,
    children: runs,
  })
}

function center(text, o = {}) {
  return p(text, { ...o, align: AlignmentType.CENTER, firstLine: 0 })
}

/** Heading section RESTI style: numbered, bold, 10pt */
function sec(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 200, after: 120, line: 240, lineRule: 'auto' },
    children: [r(text, { bold: true, size: 20 })],
  })
}

function sub(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 160, after: 100, line: 240, lineRule: 'auto' },
    children: [r(text, { bold: true, size: 20 })],
  })
}

function body(text) {
  return p(text, { size: 20, firstLine: 0, after: 120 })
}

function cite(...nums) {
  return r(' [' + nums.join('], [') + ']', { size: 20 })
}

function cell(text, w, o = {}) {
  return new TableCell({
    borders: {
      top: o.top ?? hLine,
      bottom: o.bottom ?? hLine,
      left: noV,
      right: noV,
    },
    width: { size: w, type: WidthType.DXA },
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 30, bottom: 30, left: 40, right: 40 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: o.align ?? AlignmentType.LEFT,
        spacing: { after: 20, line: 200, lineRule: 'auto' },
        children: [r(text, { size: o.size ?? 16, bold: o.bold ?? false })],
      }),
    ],
  })
}

/** Full-width table (one column layout for tables as RESTI allows) */
function table(headers, rows, captionText) {
  // content width single column page: 11906 - 2*1418 = 9070
  const TW = 9070
  const n = headers.length
  const colW = Math.floor(TW / n)
  const widths = Array(n).fill(colW)
  widths[n - 1] = TW - colW * (n - 1)

  const elements = []
  if (captionText) {
    elements.push(
      center(captionText, { size: 18, italics: true, after: 60, before: 120 }),
    )
  }
  elements.push(
    new Table({
      width: { size: TW, type: WidthType.DXA },
      columnWidths: widths,
      rows: [
        new TableRow({
          children: headers.map((h, i) =>
            cell(h, widths[i], { bold: true, fill: 'E7E6E6', size: 16 }),
          ),
        }),
        ...rows.map((row) =>
          new TableRow({
            children: row.map((c, i) => cell(String(c), widths[i], { size: 16 })),
          }),
        ),
      ],
    }),
  )
  elements.push(p('', { after: 120 }))
  return elements
}

function refItem(num, text) {
  return new Paragraph({
    spacing: { after: 60, line: 200, lineRule: 'auto' },
    indent: { left: 288, hanging: 288 },
    children: [r(`[${num}]  ${text}`, { size: 16 })], // 8 pt
  })
}

// ========== CONTENT ==========
// Title max 12 words, TNR 15, not bold, title case first letters
const TITLE =
  'Kajian Manfaat Inovasi Arumanis bagi Layanan Air Minum Cianjur'

const childrenFront = [
  center('Available online at website: https://jurnal.iaii.or.id/index.php/RESTI', {
    size: 16,
    after: 40,
  }),
  center('JURNAL RESTI', { bold: true, size: 28, after: 20 }),
  center('(Rekayasa Sistem dan Teknologi Informasi)', { size: 18, after: 40 }),
  center('Vol. x No. x (2026) xx - xx', { size: 18, after: 20 }),
  center('e-ISSN: 2580-0760', { size: 18, after: 200 }),

  // Title 15pt = 30 half-points, NOT bold
  center(TITLE, { size: 30, after: 160, line: 300 }),

  center(
    [
      { text: 'Moch Irsan Firmansyah', size: 20 },
      { text: '*', size: 20, superScript: true },
    ],
    { after: 40 },
  ),
  center(
    'Program Studi Teknik Informatika, Fakultas Teknik, Universitas Surya Kencana, Cianjur, Indonesia',
    { size: 18, after: 20 },
  ),
  center('NIM 5520124132', { size: 18, after: 20 }),
  center('moch.irsan.firmansyah@unsur.ac.id', { size: 18, after: 200 }),

  // Abstract EN (RESTI template primary abstract in English style; also ID version as many ID papers)
  p([{ text: 'Abstract', bold: true, size: 20 }], { align: AlignmentType.LEFT, after: 80 }),
  p(
    'This study examines Arumanis (One-Data Application for Drinking Water and Sanitation) as a regional public-service innovation of the Housing and Settlement Area Office (DPKP) of Cianjur Regency. The research is an analytical study based on document review, observation of operational modules, and before-after comparison of administrative and monitoring processes, suitable as internship-based evidence for regional innovation competitions. Arumanis integrates SPAM asset data, Minimum Service Standard (SPM) achievements, work-package monitoring, GPS-tagged field documentation, and public maps. Operational snapshot data as of 26 June 2026 show 364 SPAM units, 365 villages on the achievement map, 426 monitored packages, and 3,866 progress photos. Compared with pre-system practices, SPM consolidation across villages shortens from an estimated 5-10 working days to under one day, while field progress updates shift from multi-week cycles to weekly structured reporting. The findings indicate improved data consolidation, accountability of field supervision, and public transparency, while remaining dependent on input quality and continuous user capacity building.',
    { size: 18, italics: true, after: 100, align: AlignmentType.JUSTIFIED },
  ),
  p(
    [
      { text: 'Keywords: ', bold: true, size: 18 },
      {
        text: 'Arumanis; regional innovation; drinking water and sanitation; SPM; digital public service; Cianjur',
        size: 18,
      },
    ],
    { after: 160 },
  ),

  p([{ text: 'Abstrak', bold: true, size: 20 }], { after: 80 }),
  p(
    'Penelitian ini mengkaji Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) sebagai inovasi pelayanan publik daerah pada Dinas Perumahan dan Kawasan Permukiman (DPKP) Kabupaten Cianjur. Kajian bersifat analitis melalui studi dokumen, observasi modul operasional, dan perbandingan proses administrasi serta pengawasan sebelum-sesudah sistem, sehingga relevan sebagai bukti kajian mahasiswa atau peserta PKL untuk persyaratan lomba inovasi daerah. Arumanis mengintegrasikan data aset SPAM, capaian Standar Pelayanan Minimum (SPM), monitoring paket pekerjaan, dokumentasi lapangan ber-GPS, dan peta publik. Snapshot operasional 26 Juni 2026 mencatat 364 unit SPAM, 365 desa pada peta capaian, 426 paket terpantau, dan 3.866 foto progres. Dibanding praktik pra-sistem, rekapitulasi SPM lintas desa memendek dari estimasi 5-10 hari kerja menjadi kurang dari satu hari, sementara pembaruan progres lapangan bergeser dari siklus multi-minggu menjadi pelaporan mingguan terstruktur. Temuan menunjukkan penguatan konsolidasi data, akuntabilitas pengawasan, dan transparansi publik, dengan ketergantungan pada kualitas input dan penguatan kapasitas pengguna secara berkelanjutan.',
    { size: 18, italics: true, after: 100 },
  ),
  p(
    [
      { text: 'Kata kunci: ', bold: true, size: 18 },
      {
        text: 'Arumanis; inovasi daerah; air minum dan sanitasi; SPM; pelayanan publik digital; Cianjur',
        size: 18,
      },
    ],
    { after: 120 },
  ),

  p(
    [
      { text: 'How to Cite: ', bold: true, size: 16 },
      { text: '[Dilengkapi editor]', size: 16, italics: true },
    ],
    { after: 40 },
  ),
  p(
    [
      { text: 'Permalink/DOI: ', bold: true, size: 16 },
      { text: '[Dilengkapi editor]', size: 16, italics: true },
    ],
    { after: 40 },
  ),
  p(
    [
      { text: 'Received / Accepted / Available Online: ', bold: true, size: 16 },
      { text: '[Dilengkapi editor]', size: 16, italics: true },
    ],
    { after: 80 },
  ),
  p(
    'This is an open-access article under the CC BY 4.0 License. Published by Ikatan Ahli Informatika Indonesia.',
    { size: 16, italics: true, after: 200 },
  ),
]

const childrenBody = [
  sec('1. Introduction'),
  body(
    'Akses air minum layak dan sanitasi yang memadai menjadi target pembangunan yang tertuang dalam agenda global SDGs 6 dan dalam perencanaan daerah melalui RPJMD serta instrumen perencanaan SPAM [1], [2]. Kabupaten Cianjur mengelola wilayah layanan yang luas, meliputi 33 kecamatan dan 365 desa/kelurahan. Pada kondisi tersebut, data unit Sistem Penyediaan Air Minum (SPAM), capaian Standar Pelayanan Minimum (SPM), dan monitoring pekerjaan infrastruktur sering tersebar di lembar kerja, berkas fisik, serta saluran komunikasi informal. Fragmentasi ini memperlambat rekapitulasi, melemahkan deteksi dini deviasi proyek, dan membatasi transparansi capaian bagi masyarakat.',
  ),
  body(
    'Inovasi pelayanan publik berbasis teknologi informasi di daerah sejalan dengan arah Sistem Pemerintahan Berbasis Elektronik (SPBE) dan reformasi birokrasi [3], [4]. Keberhasilan inovasi tidak hanya diukur dari ketersediaan aplikasi, tetapi dari perubahan proses kerja, kualitas data, dan kemanfaatan bagi pemangku kepentingan [5], [6]. Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) yang dioperasikan DPKP Kabupaten Cianjur menempati posisi sebagai inovasi daerah yang menggabungkan data aset dan capaian SPM dengan monitoring pekerjaan serta dokumentasi lapangan [7].',
  ),
  body(
    'Kajian ini tidak bertujuan membangun ulang sistem, melainkan meneliti dan menganalisis kemanfaatan Arumanis sebagai inovasi yang telah beroperasi. Pendekatan ini selaras kebutuhan lomba inovasi daerah yang menuntut bukti permasalahan, kebaruan, manfaat, dan hasil terukur, sekaligus dapat disusun sebagai laporan hasil magang atau PKL mahasiswa Teknik Informatika. Pertanyaan penelitian yang diajukan adalah bagaimana Arumanis menjawab fragmentasi data air minum-sanitasi di DPKP Cianjur, serta apa indikasi manfaat operasional yang dapat diamati dari data sistem dan perbandingan proses sebelum-sesudah.',
  ),
  body(
    'Tujuan kajian meliputi pendeskripsian konteks permasalahan layanan data, pemetaan fungsi inovasi Arumanis terhadap alur kerja kantor dan lapangan, analisis manfaat berbasis indikator operasional, serta perumusan catatan keterbatasan dan rekomendasi penguatan. Kontribusi naskah terletak pada sintesis bukti empiris operasional untuk evaluasi inovasi daerah, dengan sudut pandang mahasiswa yang melakukan observasi dan studi dokumen pada objek nyata di Cianjur.',
  ),

  sec('2. Methods'),
  body(
    'Penelitian menggunakan pendekatan kualitatif deskriptif dengan desain studi kasus tunggal pada inovasi Arumanis di DPKP Kabupaten Cianjur. Desain studi kasus dipilih karena fokus kajian adalah pemahaman mendalam atas satu inovasi dalam konteks organisasinya, bukan generalisasi statistik populasi luas [8], [9].',
  ),
  sub('2.1 Prosedur Pengumpulan Data'),
  body(
    'Data dikumpulkan melalui tiga jalur yang saling melengkapi. Pertama, studi dokumen terhadap bahan rancang bangun inovasi, uraian tujuan-manfaat-hasil, peta integrasi platform, dan dokumentasi operasional terkait Arumanis. Kedua, observasi terstruktur terhadap modul yang dapat diamati pada portal dan alur pemanfaatan (dashboard, pekerjaan, SPAM unit, pengawasan, publikasi capaian). Ketiga, analisis data agregat operasional yang dipublikasikan dalam dokumentasi instansi, dengan snapshot acuan 26 Juni 2026. Kombinasi ini meniru pola kajian magang atau PKL yang mengandalkan akses observasi dan dokumen resmi tanpa eksperimen laboratorium.',
  ),
  sub('2.2 Teknik Analisis'),
  body(
    'Analisis dilakukan secara tematik dan komparatif. Analisis tematik merangkum permasalahan pra-inovasi, unsur kebaruan, serta manfaat bagi pemerintah daerah, pelaksana teknis, dan masyarakat. Analisis komparatif membandingkan indikator proses administrasi dan pengawasan pada kondisi sebelum digitalisasi terpusat dengan kondisi setelah Arumanis beroperasi, mengacu kerangka evaluasi inovasi pelayanan publik dan pemanfaatan TIK di sektor publik [5], [10]. Validitas diperkuat dengan triangulasi sumber dokumen dan konsistensi angka antar dokumen operasional.',
  ),
  body(
    'Batasan metode mencakup ketiadaan survei kepuasan pengguna berskala besar dan ketiadaan uji eksperimental terkontrol. Angka “sebelum” pada beberapa indikator proses bersifat estimasi operasional yang tercatat dalam dokumen inovasi, sementara angka “sesudah” bersumber snapshot sistem. Interpretasi dibatasi pada indikasi manfaat, bukan klaim kausal absolut.',
  ),

  sec('3. Results and Discussions'),
  sub('3.1 Konteks Permasalahan dan Posisi Inovasi'),
  body(
    'Sebelum integrasi digital terpusat, data SPAM dan proyek tersebar pada empat hingga enam format penanganan, sehingga rekapitulasi capaian SPM lintas 365 desa diperkirakan memakan 5 hingga 10 hari kerja per periode evaluasi. Interval pelaporan progres lapangan ke pusat umumnya 2 hingga 4 minggu, sementara dokumentasi foto tersebar di perangkat pengawas tanpa indeks terpusat. Kondisi ini menyulitkan penyusunan bahan rapat berbasis data terkini dan melemahkan jejak audit koordinasi.',
  ),
  body(
    'Arumanis menempatkan diri sebagai platform satu data yang menghubungkan operator kantor, pengawas lapangan, dan publik. Portal web mendukung pengelolaan program dan pelaporan, panel pengawasan mendukung dokumentasi GPS serta laporan mingguan, sementara halaman publik menyajikan peta capaian SPM per desa. Posisi tersebut membedakan inovasi dari praktik spreadsheet terpisah maupun aplikasi tunggal yang hanya berfokus pada satu fungsi [7], [11].',
  ),

  sub('3.2 Cakupan Data Operasional sebagai Bukti Hasil'),
  body(
    'Snapshot operasional 26 Juni 2026 menunjukkan skala data yang sudah terkonsolidasi di tingkat kabupaten, sebagaimana diringkas pada Tabel 1. Capaian SPM sebesar 13,2 persen terhadap target KK menampilkan gap layanan secara eksplisit, sehingga sistem tidak hanya menyimpan data tetapi juga menampilkan posisi capaian untuk perencanaan intervensi.',
  ),
  ...table(
    ['Indikator', 'Nilai (26 Juni 2026)'],
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
    'Tabel 1. Ringkasan indikator data operasional Arumanis',
  ),
  body(
    'Temuan pada Tabel 1 mendukung argumen bahwa inovasi telah melewati tahap rintisan formal semata. Keberadaan ratusan unit SPAM dan ratusan paket pekerjaan dalam satu basis data memberi fondasi bagi monitoring dan pelaporan yang sebelumnya sulit disatukan. Dari sisi lomba inovasi daerah, angka-angka tersebut berfungsi sebagai bukti hasil (output) yang dapat diverifikasi pada sistem operasional.',
  ),

  sub('3.3 Manfaat Proses: Perbandingan Sebelum dan Sesudah'),
  body(
    'Perbandingan proses pada Tabel 2 menunjukkan pergeseran yang paling terasa pada kecepatan rekapitulasi, keteraturan pelaporan lapangan, dan akses publik. Impor data SPAM massal yang sebelumnya memakan hitungan hari dapat diselesaikan dalam hitungan jam melalui template, sementara koordinasi pengawas-pusat meninggalkan jejak melalui notifikasi dan tiket.',
  ),
  ...table(
    ['Indikator proses', 'Sebelum (estimasi)', 'Sesudah (operasional)'],
    [
      ['Sumber data SPAM dan proyek', '4-6 format terpisah', 'Platform terintegrasi'],
      ['Rekap SPM lintas desa', '5-10 hari kerja', 'Kurang dari 1 hari'],
      ['Paket terpantau terpusat', 'Tidak terstandar', '426 paket'],
      ['Interval update progres', '2-4 minggu', 'Mingguan terstruktur'],
      ['Foto progres terindeks', 'Tersebar di perangkat', '3.866 berkas ber-GPS'],
      ['Impor data SPAM massal', '3-5 hari manual', 'Kurang dari 2 jam'],
      ['Akses publik capaian desa', 'Terbatas', 'Peta interaktif 24/7'],
    ],
    'Tabel 2. Perbandingan indikator proses sebelum dan sesudah Arumanis',
  ),
  body(
    'Secara teoretis, temuan ini sejalan dengan literatur e-government yang menekankan integrasi proses dan transparansi sebagai penentu nilai publik dari digitalisasi [3], [5], [12]. Secara praktis, manfaat dirasakan berbeda antar aktor. Bagi DPKP, dashboard dan peta mempercepat bahan keputusan. Bagi pengawas, alur foto slot dan laporan mingguan menertibkan pelaporan. Bagi masyarakat, capaian desa dapat dilihat tanpa harus meminta berkas manual. Pembagian manfaat ini penting agar penilaian inovasi tidak hanya berpusat pada kecanggihan teknis.',
  ),

  sub('3.4 Kebaruan Relatif dan Integrasi Layanan'),
  body(
    'Kebaruan Arumanis bersifat integratif. Sistem menggabungkan data aset SPAM dan capaian SPM, monitoring paket pekerjaan, dokumentasi lapangan ber-GPS, serta publikasi peta dalam satu ekosistem layanan. Integrasi dengan kanal lapangan melalui panel pengawasan menutup celah klasik sistem kantor yang miskin data primer. Di sisi tata kelola akses, pemisahan peran dan pembatasan wilayah kerja mengurangi risiko pengelolaan data di luar kewenangan. Kebaruan semacam ini relevan bagi penilaian inovasi daerah yang menekankan pembaruan tata kelola, bukan sekadar pengadaan perangkat lunak generik [6], [13].',
  ),
  body(
    'Dari sudut pandang mahasiswa Teknik Informatika yang mengkaji objek magang atau PKL, Arumanis juga memperlihatkan pola arsitektur layanan modern pada instansi daerah: portal untuk operator, API domain sebagai pusat aturan bisnis, dan kanal lapangan untuk data realisasi. Observasi ini memperkaya pemahaman penerapan sistem informasi di pemerintahan lokal tanpa menggeser fokus naskah menjadi laporan rekayasa kode.',
  ),

  sub('3.5 Keterbatasan dan Arah Penguatan'),
  body(
    'Kajian ini memiliki keterbatasan yang perlu dinyatakan secara terbuka. Pertama, indikasi manfaat proses sebagian bertumpu pada estimasi pra-sistem yang tercatat dokumen inovasi, sehingga ketepatan absolut angka “sebelum” tidak diuji ulang dengan baseline primer multi-tahun. Kedua, belum dilakukan pengukuran kepuasan pengguna dengan instrumen standar seperti System Usability Scale pada sampel besar [14]. Ketiga, kualitas output sistem tetap bergantung pada disiplin input di lapangan dan kelengkapan data unit desa. Keempat, integrasi eksternal dan ketahanan layanan nonfungsional tidak diuji secara khusus dalam kajian ini.',
  ),
  body(
    'Arah penguatan yang disarankan mencakup survei usability berkala, audit kelengkapan data per kecamatan, penguatan pelatihan pengawas dan operator, serta pemantauan uptime layanan publik peta SPM. Untuk keperluan lomba inovasi daerah, instansi disarankan menyertakan bukti pendukung berupa tangkapan layar berizin, rekap pengguna aktif, dan testimoni ringkas pemangku kepentingan sebagai lampiran terpisah dari naskah ilmiah.',
  ),

  sec('4. Conclusions'),
  body(
    'Kajian ini meneliti Arumanis sebagai inovasi daerah pada layanan air minum dan sanitasi DPKP Kabupaten Cianjur dengan pendekatan studi kasus analitis, bukan rancang bangun sistem baru. Hasil analisis menunjukkan bahwa Arumanis menjawab fragmentasi data melalui konsolidasi unit SPAM, capaian SPM, monitoring paket, dan dokumentasi lapangan dalam satu platform yang juga membuka akses publik terhadap peta capaian. Bukti operasional per 26 Juni 2026 meliputi 364 unit SPAM, 365 desa terpetakan, 426 paket pekerjaan, dan 3.866 foto progres, disertai indikasi percepatan rekapitulasi SPM serta pelaporan lapangan yang lebih teratur dibanding praktik pra-sistem. Manfaat tersebar pada pengambilan keputusan dinas, penertiban kerja pengawas, dan transparansi bagi masyarakat, sejalan agenda SPBE dan target akses air minum layak. Keterbatasan kajian terutama pada baseline pra-sistem yang bersifat estimatif dan belum adanya survei usability skala besar. Secara keseluruhan, Arumanis layak diposisikan sebagai inovasi pelayanan publik berbasis data yang telah menghasilkan keluaran terukur dan dapat diverifikasi, serta relevan didukung kajian mahasiswa atau laporan PKL sebagai bagian persyaratan lomba inovasi daerah. Penelitian lanjutan disarankan memperdalam evaluasi penerimaan pengguna, kualitas data tingkat desa, dan dampak keputusan program terhadap penajaman intervensi SPM per wilayah.',
  ),

  sec('Acknowledgements'),
  body(
    'Penulis menyatakan tidak ada konflik kepentingan. Kajian ini disusun sebagai analisis terhadap inovasi Arumanis milik DPKP Kabupaten Cianjur dalam rangka pembelajaran dan pendokumentasian bukti inovasi daerah. Ucapan terima kasih disampaikan kepada Program Studi Teknik Informatika Universitas Surya Kencana serta pihak DPKP Kabupaten Cianjur atas kesempatan observasi dan akses dokumen yang digunakan dalam kajian.',
  ),

  sec('References'),
  refItem(
    1,
    'United Nations, Transforming our world: the 2030 Agenda for Sustainable Development. New York, NY, USA: United Nations, 2015.',
  ),
  refItem(
    2,
    'Pemerintah Kabupaten Cianjur, Rencana Pembangunan Jangka Menengah Daerah Kabupaten Cianjur Tahun 2025–2029. Cianjur, Indonesia: Pemerintah Kabupaten Cianjur.',
  ),
  refItem(
    3,
    'R. Heeks, “Most eGovernment-for-development projects fail: How can risks be reduced?,” iGovernment Working Paper Series, no. 14, Univ. of Manchester, 2003.',
  ),
  refItem(
    4,
    'Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi, kebijakan dan pedoman SPBE di lingkungan instansi pemerintah. Jakarta, Indonesia: KemenPANRB, berbagai tahun.',
  ),
  refItem(
    5,
    'J. R. Gil-Garcia, N. Helbig, and A. Ojo, “Being smart: Emerging technologies and innovation in the public sector,” Government Information Quarterly, vol. 31, pp. I1–I8, 2014, doi: 10.1016/j.giq.2014.09.001.',
  ),
  refItem(
    6,
    'P. Dunleavy, H. Margetts, S. Bastow, and J. Tinkler, “New public management is dead—long live digital-era governance,” Journal of Public Administration Research and Theory, vol. 16, no. 3, pp. 467–494, 2006, doi: 10.1093/jopart/mui057.',
  ),
  refItem(
    7,
    'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur, Dokumentasi operasional dan rancang bangun inovasi Arumanis. Cianjur, Indonesia: DPKP, 2026.',
  ),
  refItem(
    8,
    'R. K. Yin, Case Study Research and Applications: Design and Methods, 6th ed. Thousand Oaks, CA, USA: SAGE, 2018.',
  ),
  refItem(
    9,
    'K. M. Eisenhardt, “Building theories from case study research,” Academy of Management Review, vol. 14, no. 4, pp. 532–550, 1989, doi: 10.5465/amr.1989.4308385.',
  ),
  refItem(
    10,
    'W. H. DeLone and E. R. McLean, “The DeLone and McLean model of information systems success: A ten-year update,” Journal of Management Information Systems, vol. 19, no. 4, pp. 9–30, 2003, doi: 10.1080/07421222.2003.11045748.',
  ),
  refItem(
    11,
    'A. Cordella and C. M. Bonina, “A public value perspective for ICT enabled public sector reforms: A theoretical reflection,” Government Information Quarterly, vol. 29, no. 4, pp. 512–520, 2012, doi: 10.1016/j.giq.2012.03.004.',
  ),
  refItem(
    12,
    'T. Janowski, “Digital government evolution: From transformation to contextualization,” Government Information Quarterly, vol. 32, no. 3, pp. 221–236, 2015, doi: 10.1016/j.giq.2015.07.001.',
  ),
  refItem(
    13,
    'OECD, The OECD Digital Government Policy Framework. Paris, France: OECD Publishing, 2020, doi: 10.1787/f64fed2a-en.',
  ),
  refItem(
    14,
    'J. Brooke, “SUS: A quick and dirty usability scale,” in Usability Evaluation in Industry, P. W. Jordan et al., Eds. London, U.K.: Taylor & Francis, 1996, pp. 189–194.',
  ),
  refItem(
    15,
    'F. D. Davis, “Perceived usefulness, perceived ease of use, and user acceptance of information technology,” MIS Quarterly, vol. 13, no. 3, pp. 319–340, 1989, doi: 10.2307/249008.',
  ),
  refItem(
    16,
    'V. Venkatesh, M. G. Morris, G. B. Davis, and F. D. Davis, “User acceptance of information technology: Toward a unified view,” MIS Quarterly, vol. 27, no. 3, pp. 425–478, 2003, doi: 10.2307/30036540.',
  ),
  refItem(
    17,
    'ISO/IEC, ISO/IEC 25010:2011 Systems and software Quality Requirements and Evaluation (SQuaRE). Geneva, Switzerland: ISO, 2011.',
  ),
  refItem(
    18,
    'K. C. Laudon and J. P. Laudon, Management Information Systems: Managing the Digital Firm, 16th ed. Harlow, U.K.: Pearson, 2020.',
  ),
  refItem(
    19,
    'World Health Organization and UNICEF, Progress on household drinking water, sanitation and hygiene. Geneva, Switzerland: WHO/UNICEF JMP, 2023.',
  ),
  refItem(
    20,
    'Kementerian Pekerjaan Umum dan Perumahan Rakyat, pedoman dan ketentuan terkait SPM bidang air minum serta pengembangan SPAM. Jakarta, Indonesia: Kementerian PUPR, berbagai tahun.',
  ),
  refItem(
    21,
    'M. Mergel, N. Edelmann, and N. Haug, “Defining digital transformation: Results from expert interviews,” Government Information Quarterly, vol. 36, no. 4, 2019, doi: 10.1016/j.giq.2019.06.002.',
  ),
  refItem(
    22,
    'A. Meijer and M. P. R. Bolívar, “Governing the smart city: A review of the literature on smart urban governance,” International Review of Administrative Sciences, vol. 82, no. 2, pp. 392–408, 2016, doi: 10.1177/0020852314564308.',
  ),
  refItem(
    23,
    'J. Bertot, P. Jaeger, and J. Grimes, “Using ICTs to create a culture of transparency,” Government Information Quarterly, vol. 27, no. 3, pp. 264–271, 2010, doi: 10.1016/j.giq.2010.03.001.',
  ),
  refItem(
    24,
    'S. Angelopoulos, F. Kitsios, and T. Papadopoulos, “New service models for enhancing e-government services,” Transforming Government, vol. 4, no. 1, 2010.',
  ),
  refItem(
    25,
    'R. Watrianthos and Y. Yuhefizar, “Exploring research trends and impact: A bibliometric analysis of RESTI Journal from 2018 to 2022,” Jurnal RESTI, vol. 7, no. 4, pp. 970–981, 2023, doi: 10.29207/resti.v7i4.5101.',
  ),

  p('', { after: 200 }),
  p(
    [
      {
        text: 'Catatan naskah (hapus saat submit): ',
        bold: true,
        size: 16,
        italics: true,
      },
      {
        text: 'Naskah mengikuti struktur RESTI 2025 (Introduction–Methods–Results and Discussion–Conclusions–Acknowledgements–References), judul ≤12 kata, abstrak dwibahasa, tanpa bullet di tubuh, tabel tanpa garis vertikal, sitasi IEEE. Email korespondensi masih placeholder. Lengkapi minimal 25 referensi primer 5 tahun terakhir dengan DOI lengkap sesuai target jurnal. Salin ke file TemplateRESTI2025ok.docx resmi bila editor mensyaratkan file template persis.',
        size: 16,
        italics: true,
      },
    ],
    { after: 80 },
  ),
  p(
    'Identitas penulis: Moch Irsan Firmansyah, NIM 5520124132, Teknik Informatika, Universitas Surya Kencana Cianjur. Objek kajian: inovasi Arumanis (DPKP Kabupaten Cianjur) untuk pendukung lomba inovasi daerah / laporan kajian PKL.',
    { size: 16, italics: true, after: 40 },
  ),
]

const doc = new Document({
  styles: {
    default: { document: { run: { font, size: 20 } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 20, bold: true, font },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 20, bold: true, font },
        paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 1 },
      },
    ],
  },
  sections: [
    // Front matter: single column
    {
      properties: {
        page: {
          ...PAGE,
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                r('Jurnal RESTI (Rekayasa Sistem dan Teknologi Informasi)  |  e-ISSN: 2580-0760', {
                  size: 14,
                  italics: true,
                  color: '555555',
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
              children: [
                r('Moch Irsan Firmansyah  ·  Hal. ', { size: 14 }),
                new TextRun({ children: [PageNumber.CURRENT], font, size: 14 }),
              ],
            }),
          ],
        }),
      },
      children: childrenFront,
    },
    // Body: two columns (RESTI)
    {
      properties: {
        page: {
          ...PAGE,
        },
        column: {
          count: 2,
          space: 227, // ~0.4 cm
          equalWidth: true,
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                r('Jurnal RESTI (Rekayasa Sistem dan Teknologi Informasi)  |  e-ISSN: 2580-0760', {
                  size: 14,
                  italics: true,
                  color: '555555',
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
              children: [
                r('Moch Irsan Firmansyah  ·  Hal. ', { size: 14 }),
                new TextRun({ children: [PageNumber.CURRENT], font, size: 14 }),
              ],
            }),
          ],
        }),
      },
      children: childrenBody,
    },
  ],
})

const buf = await Packer.toBuffer(doc)
fs.writeFileSync(OUT, buf)
console.log('OK:', OUT)

// also keep official empty template path note
const note = path.resolve(__dirname, '..', '_resti_template', 'README.txt')
fs.writeFileSync(
  note,
  `Template resmi RESTI 2025: extracted/RESTI_template_2025/TemplateRESTI2025ok.docx
Sumber: https://jurnal.iaii.or.id/index.php/RESTI/about/submissions (Google Drive template)
Naskah hasil generate: ../Jurnal_RESTI_Kajian_Arumanis_Moch_Irsan_Firmansyah.docx
`,
)
