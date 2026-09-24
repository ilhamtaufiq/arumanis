/**
 * Naskah mengikuti Template_Jurnal-SINTA
 * (SINTA: Jurnal Sistem Informasi dan Teknologi Komputasi)
 * Sumber template user: Google Docs 1hSWnGvb_n-_mJyM2HKLmmdWr7yf3LS3Y
 *
 * Aturan template:
 * - Font Garamond
 * - Judul 15pt, max 16 kata, tanpa tanda baca
 * - Abstrak 150-250 kata, Garamond 10pt
 * - Kata kunci 3-5, titikkoma, urut alfabet
 * - Struktur: PENDAHULUAN, METODE, HASIL PENELITIAN, DISKUSI, KESIMPULAN,
 *   UCAPAN TERIMA KASIH, DAFTAR PUSTAKA (Vancouver/IEEE-like)
 * - Metode menjelaskan alur (flowchart) secara naratif
 * - 5-10 halaman
 *
 * Isi: kajian manfaat Arumanis (bukan rancang bangun)
 * Penulis: Moch Irsan Firmansyah, NIM 5520124132, UNSUR Cianjur
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
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(
  __dirname,
  '..',
  'SINTA_Kajian_Arumanis_Moch_Irsan_Firmansyah.docx',
)

const font = 'Garamond'
// margin template ≈ 2.5 cm
const M = 1418
const PAGE = {
  size: { width: 11907, height: 16840 },
  margin: { top: M, right: M, bottom: M, left: M, header: 720, footer: 720 },
}
const CW = 11907 - M * 2

const noV = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const hLine = { style: BorderStyle.SINGLE, size: 6, color: '000000' }

function t(text, o = {}) {
  return new TextRun({
    text,
    font,
    size: o.size ?? 22, // 11 pt default body
    bold: o.bold ?? false,
    italics: o.italics ?? false,
    superScript: o.superScript,
    color: o.color,
  })
}

function p(content, o = {}) {
  const children = Array.isArray(content)
    ? content.map((c) =>
        typeof c === 'string' ? t(c, o) : t(c.text, { ...o, ...c }),
      )
    : [t(content, o)]
  return new Paragraph({
    alignment: o.align ?? AlignmentType.JUSTIFIED,
    spacing: {
      after: o.after ?? 120,
      before: o.before ?? 0,
      line: o.line ?? 276,
      lineRule: 'auto',
    },
    indent: o.firstLine != null ? { firstLine: o.firstLine } : undefined,
    children,
  })
}

function center(content, o = {}) {
  return p(content, { ...o, align: AlignmentType.CENTER, firstLine: 0 })
}

function left(content, o = {}) {
  return p(content, { ...o, align: AlignmentType.LEFT, firstLine: 0 })
}

/** Heading 1 template: Garamond 12pt bold */
function h1(text, o = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: o.align ?? AlignmentType.LEFT,
    spacing: { before: 240, after: 140, line: 276, lineRule: 'auto' },
    children: [t(text, { bold: true, size: 24 })],
  })
}

/** Heading subsection 11pt */
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 100, line: 276, lineRule: 'auto' },
    children: [t(text, { bold: true, size: 22 })],
  })
}

function body(text, o = {}) {
  return p(text, { size: 22, after: 120, ...o })
}

function cell(text, w, o = {}) {
  return new TableCell({
    borders: { top: hLine, bottom: hLine, left: noV, right: noV },
    width: { size: w, type: WidthType.DXA },
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: o.align ?? AlignmentType.LEFT,
        spacing: { after: 20, line: 220, lineRule: 'auto' },
        children: [
          t(text, { size: o.size ?? 20, bold: o.bold ?? false }), // 10pt in table
        ],
      }),
    ],
  })
}

function dataTable(headers, rows, caption) {
  const n = headers.length
  const colW = Math.floor(CW / n)
  const widths = Array(n).fill(colW)
  widths[n - 1] = CW - colW * (n - 1)
  const out = []
  if (caption) {
    // judul tabel Garamond 11pt
    out.push(
      center(caption, {
        size: 22,
        after: 60,
        before: 160,
      }),
    )
  }
  out.push(
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: widths,
      rows: [
        new TableRow({
          children: headers.map((h, i) =>
            cell(h, widths[i], { bold: true, fill: 'E7E6E6', size: 20 }),
          ),
        }),
        ...rows.map((row) =>
          new TableRow({
            children: row.map((c, i) => cell(String(c), widths[i], { size: 20 })),
          }),
        ),
      ],
    }),
  )
  out.push(p('', { after: 160 }))
  return out
}

function ref(num, text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 80, line: 240, lineRule: 'auto' },
    indent: { left: 360, hanging: 360 },
    children: [t(`[${num}]  ${text}`, { size: 20 })],
  })
}

// Judul max 16 kata, tanpa tanda baca (template)
// "Kajian Manfaat Inovasi Arumanis bagi Layanan Air Minum Sanitasi Cianjur" = 11 kata
const TITLE =
  'Kajian Manfaat Inovasi Arumanis bagi Layanan Air Minum Sanitasi Cianjur'

const doc = new Document({
  styles: {
    default: { document: { run: { font, size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font },
        paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 22, bold: true, font },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 },
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
              alignment: AlignmentType.CENTER,
              spacing: { after: 40 },
              children: [
                t('SINTA Jurnal Sistem Informasi dan Teknologi Komputasi', {
                  size: 18,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 12,
                  color: '000000',
                  space: 4,
                },
              },
              spacing: { after: 80 },
              children: [
                t(
                  'Volume x Nomor x 2026  |  DOI: https://doi.org/10.xx/paperID  |  ISSN 3032-5072 | jurnalsinta.id',
                  { size: 16 },
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
                  color: '000000',
                  space: 4,
                },
              },
              spacing: { before: 60 },
              children: [
                t('ISSN 3032-5072 | jurnalsinta.id  |  Hal. ', { size: 16 }),
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
      children: [
        // ===== JUDUL 15pt = 30 half-points =====
        center(TITLE, { size: 30, after: 160, line: 320 }),

        // ===== PENULIS =====
        center(
          [
            { text: 'Moch Irsan Firmansyah', size: 22 },
            { text: '*', size: 22, superScript: true },
            { text: '1', size: 18, superScript: true },
          ],
          { after: 40 },
        ),
        left(
          '1Program Studi Teknik Informatika, Universitas Surya Kencana, Indonesia',
          { size: 20, after: 20 },
        ),
        left(
          [
            { text: '*', size: 20, superScript: true },
            {
              text: 'e-mail: moch.irsan.firmansyah@unsur.ac.id',
              size: 20,
            },
          ],
          { after: 40 },
        ),
        left('NIM 5520124132', { size: 18, italics: true, after: 200 }),

        // ===== ABSTRAK =====
        left('Abstrak', { bold: true, size: 20, after: 80 }),
        p(
          'Fragmentasi data unit SPAM, capaian Standar Pelayanan Minimum SPM, dan monitoring pekerjaan infrastruktur air minum sanitasi di Kabupaten Cianjur menghambat rekapitulasi serta transparansi layanan. Penelitian ini mengkaji inovasi Arumanis Aplikasi Satu Data Air Minum dan Sanitasi pada Dinas Perumahan dan Kawasan Permukiman DPKP Kabupaten Cianjur. Tujuan kajian adalah menganalisis permasalahan pra-inovasi, mendeskripsikan posisi Arumanis, dan menilai indikasi manfaat operasional. Metode yang digunakan adalah studi kasus kualitatif deskriptif melalui telaah dokumen, observasi modul operasional, serta perbandingan proses sebelum dan sesudah sistem dengan acuan snapshot 26 Juni 2026. Hasil menunjukkan data terpusat meliputi 364 unit SPAM, 365 desa pada peta capaian, 426 paket pekerjaan, dan 3866 dokumentasi foto progres. Rekapitulasi SPM lintas desa memendek dari estimasi 5 hingga 10 hari kerja menjadi kurang dari satu hari, sementara pelaporan progres lapangan bergeser ke siklus mingguan terstruktur. Disimpulkan bahwa Arumanis memperkuat konsolidasi data, akuntabilitas pengawasan, dan transparansi publik, dengan ketergantungan pada kualitas input dan penguatan kapasitas pengguna. Kajian ini relevan sebagai bukti analisis mahasiswa atau PKL untuk persyaratan lomba inovasi daerah.',
          { size: 20, after: 120, firstLine: 0 },
        ),
        left(
          [
            { text: 'Kata kunci: ', bold: true, size: 20 },
            {
              text: 'air minum sanitasi; Arumanis; inovasi daerah; kajian manfaat; SPM',
              size: 20,
            },
          ],
          { after: 200 },
        ),

        // ===== ABSTRACT EN =====
        left('Abstract', { bold: true, size: 20, after: 80 }),
        p(
          'Fragmented SPAM unit data, Minimum Service Standard SPM achievements, and infrastructure work monitoring for drinking water and sanitation in Cianjur Regency hindered consolidation and service transparency. This study examines the Arumanis One-Data Application for Drinking Water and Sanitation innovation at the Housing and Settlement Area Office DPKP of Cianjur Regency. The objectives are to analyze pre-innovation problems, describe the position of Arumanis, and assess operational benefit indications. The method is a descriptive qualitative case study through document review, observation of operational modules, and before-after process comparison using a 26 June 2026 snapshot. Results show centralized data covering 364 SPAM units, 365 villages on the achievement map, 426 work packages, and 3866 progress photos. Cross-village SPM consolidation shortens from an estimated 5 to 10 working days to under one day, while field progress reporting shifts to structured weekly cycles. It is concluded that Arumanis strengthens data consolidation, supervision accountability, and public transparency, while remaining dependent on input quality and continuous user capacity building. The study is relevant as student or internship analytical evidence for regional innovation competition requirements.',
          { size: 20, after: 120, firstLine: 0 },
        ),
        left(
          [
            { text: 'Keywords: ', bold: true, size: 20 },
            {
              text: 'Arumanis; benefit analysis; drinking water sanitation; regional innovation; SPM',
              size: 20,
            },
          ],
          { after: 240 },
        ),

        // ===== 1 PENDAHULUAN =====
        h1('1. PENDAHULUAN'),
        body(
          'Akses air minum layak dan sanitasi yang memadai merupakan bagian dari target pembangunan berkelanjutan SDGs 6 dan perencanaan daerah melalui RPJMD serta instrumen perencanaan SPAM [1], [2]. Kabupaten Cianjur mengelola wilayah layanan yang luas meliputi 33 kecamatan dan 365 desa atau kelurahan. Pada kondisi tersebut data unit Sistem Penyediaan Air Minum SPAM, capaian Standar Pelayanan Minimum SPM, serta monitoring pekerjaan infrastruktur sering tersebar di lembar kerja, berkas fisik, dan saluran komunikasi informal. Fragmentasi data memperlambat rekapitulasi, melemahkan deteksi dini deviasi proyek, dan membatasi transparansi capaian bagi masyarakat.',
        ),
        body(
          'Inovasi pelayanan publik berbasis teknologi informasi di daerah sejalan dengan arah Sistem Pemerintahan Berbasis Elektronik SPBE dan reformasi birokrasi [3], [4]. Keberhasilan inovasi tidak hanya diukur dari ketersediaan aplikasi, tetapi dari perubahan proses kerja, kualitas data, dan kemanfaatan bagi pemangku kepentingan [5], [6]. Arumanis Aplikasi Satu Data Air Minum dan Sanitasi yang dioperasikan DPKP Kabupaten Cianjur menempati posisi sebagai inovasi daerah yang menggabungkan data aset dan capaian SPM dengan monitoring pekerjaan serta dokumentasi lapangan [7].',
        ),
        body(
          'Beberapa kajian e-government menekankan integrasi proses dan transparansi sebagai penentu nilai publik digitalisasi [5], [8]. Model keberhasilan sistem informasi juga menekankan kualitas sistem, kualitas informasi, dan dampak penggunaan [9]. Namun kajian empiris yang mensintesiskan bukti operasional inovasi air minum sanitasi pada tingkat kabupaten di Cianjur masih terbatas, khususnya dalam format yang dapat dipakai sebagai bukti lomba inovasi daerah maupun laporan praktik kerja lapangan mahasiswa.',
        ),
        body(
          'Penelitian ini tidak bertujuan membangun ulang sistem. Fokusnya adalah mengkaji dan menganalisis kemanfaatan Arumanis sebagai inovasi yang telah beroperasi. Pertanyaan penelitian yang diajukan adalah bagaimana Arumanis menjawab fragmentasi data air minum dan sanitasi di DPKP Cianjur, serta apa indikasi manfaat operasional yang dapat diamati dari data sistem dan perbandingan proses sebelum sesudah. Tujuan kajian meliputi pendeskripsian konteks permasalahan, pemetaan fungsi inovasi terhadap alur kerja kantor dan lapangan, analisis manfaat berbasis indikator operasional, serta perumusan keterbatasan dan rekomendasi penguatan. Kontribusi naskah terletak pada sintesis bukti empiris operasional untuk evaluasi inovasi daerah dengan sudut pandang mahasiswa Program Studi Teknik Informatika Universitas Surya Kencana. Struktur naskah meliputi pendahuluan, metode, hasil penelitian, diskusi, kesimpulan, ucapan terima kasih, dan daftar pustaka.',
        ),

        // ===== 2 METODE =====
        h1('2. METODE'),
        body(
          'Alur penelitian disusun secara sistematis mulai dari penentuan fokus kajian hingga perumusan kesimpulan. Penelitian dimulai dengan perumusan masalah fragmentasi data air minum sanitasi di DPKP Cianjur, dilanjutkan studi dokumen inovasi dan operasional Arumanis, observasi modul portal dan panel pengawasan, kompilasi indikator snapshot operasional, analisis tematik dan komparatif sebelum sesudah sistem, triangulasi antar sumber dokumen, serta penarikan kesimpulan dan rekomendasi. Setiap tahap saling terkait sehingga temuan tidak berdiri sendiri dari konteks organisasi.',
        ),
        body(
          'Penelitian menggunakan pendekatan kualitatif deskriptif dengan desain studi kasus tunggal pada inovasi Arumanis di DPKP Kabupaten Cianjur. Desain studi kasus dipilih karena fokus kajian adalah pemahaman mendalam atas satu inovasi dalam konteks organisasinya, bukan generalisasi statistik populasi luas [10], [11]. Objek kajian adalah platform Arumanis dan ekosistem pemanfaatannya yang mencakup portal operator, panel pengawasan, dan publikasi capaian SPM. Analisis mengacu dokumentasi dan snapshot operasional yang tersedia hingga 26 Juni 2026.',
        ),
        body(
          'Data dikumpulkan melalui tiga jalur. Pertama telaah dokumen rancang bangun inovasi, uraian tujuan manfaat hasil, peta integrasi platform, dan dokumentasi operasional. Kedua observasi terstruktur terhadap modul dashboard, pekerjaan, SPAM unit, pengawasan, dan peta publik. Ketiga analisis data agregat operasional yang tercatat pada dokumentasi instansi. Kombinasi ini meniru pola kajian magang atau PKL yang mengandalkan akses observasi dan dokumen resmi tanpa eksperimen laboratorium.',
        ),
        body(
          'Analisis dilakukan secara tematik dan komparatif. Analisis tematik merangkum permasalahan pra-inovasi, unsur kebaruan, serta manfaat bagi pemerintah daerah, pelaksana teknis, dan masyarakat. Analisis komparatif membandingkan indikator proses administrasi dan pengawasan pada kondisi sebelum digitalisasi terpusat dengan kondisi setelah Arumanis beroperasi [5], [9]. Validitas diperkuat dengan triangulasi antar dokumen operasional. Batasan metode mencakup ketiadaan survei kepuasan pengguna berskala besar dan ketiadaan eksperimen terkontrol. Angka sebelum pada beberapa indikator proses bersifat estimasi operasional yang tercatat dalam dokumen inovasi, sementara angka sesudah bersumber snapshot sistem. Interpretasi dibatasi pada indikasi manfaat, bukan klaim kausal absolut.',
        ),

        // ===== 3 HASIL =====
        h1('3. HASIL PENELITIAN'),
        h2('3.1 Konteks permasalahan dan posisi inovasi'),
        body(
          'Sebelum integrasi digital terpusat, data SPAM dan proyek tersebar pada empat hingga enam format penanganan. Rekapitulasi capaian SPM lintas 365 desa diperkirakan memakan 5 hingga 10 hari kerja per periode evaluasi. Interval pelaporan progres lapangan ke pusat umumnya 2 hingga 4 minggu, sementara dokumentasi foto tersebar di perangkat pengawas tanpa indeks terpusat. Kondisi ini menyulitkan penyusunan bahan rapat berbasis data terkini dan melemahkan jejak audit koordinasi.',
        ),
        body(
          'Arumanis menempatkan diri sebagai platform satu data yang menghubungkan operator kantor, pengawas lapangan, dan publik. Portal web mendukung pengelolaan program dan pelaporan. Panel pengawasan mendukung dokumentasi ber-GPS serta laporan mingguan. Halaman publik menyajikan peta capaian SPM per desa. Posisi tersebut membedakan inovasi dari praktik spreadsheet terpisah maupun aplikasi tunggal yang hanya berfokus pada satu fungsi [7], [12].',
        ),

        h2('3.2 Bukti hasil operasional'),
        body(
          'Snapshot operasional 26 Juni 2026 menunjukkan skala data yang sudah terkonsolidasi di tingkat kabupaten. Capaian SPM sebesar 13,2 persen terhadap target KK menampilkan gap layanan secara eksplisit, sehingga sistem tidak hanya menyimpan data tetapi juga menampilkan posisi capaian untuk perencanaan intervensi. Ringkasan indikator disajikan pada Tabel 1.',
        ),
        ...dataTable(
          ['Indikator', 'Nilai 26 Juni 2026'],
          [
            ['Unit SPAM terdata', '364 unit'],
            ['Desa pada peta capaian SPM', '365 desa'],
            ['Target KK master desa', '534952 KK'],
            ['Capaian SR KK sampai 2025', '52911'],
            ['Capaian jiwa terlayani', '264557 jiwa'],
            ['Persentase capaian SPM', '13,2 persen'],
            ['Record achievement', '505 entri'],
            ['Nilai kontrak SPAM terdata', 'Rp 90479525404'],
            ['Paket pekerjaan terpantau', '426 paket'],
            ['Dokumentasi foto progres', '3866 berkas'],
          ],
          'Tabel 1. Ringkasan indikator data operasional Arumanis.',
        ),
        body(
          'Temuan pada Tabel 1 mendukung argumen bahwa inovasi telah melewati tahap rintisan formal semata. Keberadaan ratusan unit SPAM dan ratusan paket pekerjaan dalam satu basis data memberi fondasi bagi monitoring dan pelaporan yang sebelumnya sulit disatukan. Dari sisi lomba inovasi daerah, angka-angka tersebut berfungsi sebagai bukti hasil output yang dapat diverifikasi pada sistem operasional.',
        ),

        h2('3.3 Perbandingan proses sebelum dan sesudah'),
        body(
          'Perbandingan proses pada Tabel 2 menunjukkan pergeseran yang paling terasa pada kecepatan rekapitulasi, keteraturan pelaporan lapangan, dan akses publik. Impor data SPAM massal yang sebelumnya memakan hitungan hari dapat diselesaikan dalam hitungan jam melalui template. Koordinasi pengawas pusat meninggalkan jejak melalui notifikasi dan tiket.',
        ),
        ...dataTable(
          ['Indikator proses', 'Sebelum estimasi', 'Sesudah operasional'],
          [
            ['Sumber data SPAM dan proyek', '4 hingga 6 format terpisah', 'Platform terintegrasi'],
            ['Rekap SPM lintas desa', '5 hingga 10 hari kerja', 'Kurang dari 1 hari'],
            ['Paket terpantau terpusat', 'Tidak terstandar', '426 paket'],
            ['Interval update progres', '2 hingga 4 minggu', 'Mingguan terstruktur'],
            ['Foto progres terindeks', 'Tersebar di perangkat', '3866 berkas ber GPS'],
            ['Impor data SPAM massal', '3 hingga 5 hari manual', 'Kurang dari 2 jam'],
            ['Akses publik capaian desa', 'Terbatas', 'Peta interaktif 24 jam'],
          ],
          'Tabel 2. Perbandingan indikator proses sebelum dan sesudah Arumanis.',
        ),
        body(
          'Sebagaimana ditunjukkan Tabel 2, manfaat proses tersebar pada beberapa titik layanan. Bagi DPKP, dashboard dan peta mempercepat bahan keputusan. Bagi pengawas, alur foto dan laporan mingguan menertibkan pelaporan. Bagi masyarakat, capaian desa dapat dilihat tanpa harus meminta berkas manual. Pembagian manfaat ini penting agar penilaian inovasi tidak hanya berpusat pada kecanggihan teknis.',
        ),

        // ===== 4 DISKUSI =====
        h1('4. DISKUSI'),
        body(
          'Temuan kajian sejalan dengan literatur e-government yang menekankan integrasi proses dan transparansi sebagai penentu nilai publik dari digitalisasi [5], [8], [13]. Arumanis menunjukkan bahwa nilai inovasi daerah muncul ketika data aset SPAM, capaian SPM, monitoring paket, dan dokumentasi lapangan diikat dalam satu ekosistem layanan, bukan ketika fitur ditambahkan secara terpisah. Hal ini konsisten dengan perspektif public value pada reformasi sektor publik berbasis TIK [12].',
        ),
        body(
          'Dibanding praktik pra-sistem yang mengandalkan rekap manual multi-format, indikasi percepatan rekapitulasi SPM dan pergeseran pelaporan lapangan ke siklus mingguan memperlihatkan perubahan tata kelola data yang terukur. Namun perbandingan sebelum sesudah pada kajian ini tidak setara dengan eksperimen terkontrol. Angka sebelum bersifat estimasi operasional dokumen inovasi, sehingga interpretasi harus dibaca sebagai indikasi manfaat, bukan estimasi kausal yang definitif [10].',
        ),
        body(
          'Kebaruan relatif Arumanis bersifat integratif. Sistem menggabungkan data aset dan capaian, monitoring pekerjaan, dokumentasi lapangan ber-GPS, serta publikasi peta. Integrasi kanal lapangan menutup celah klasik sistem kantor yang miskin data primer. Dari sudut pandang mahasiswa Teknik Informatika yang mengkaji objek PKL, temuan ini memperlihatkan bahwa evaluasi inovasi daerah dapat dilakukan secara sistematis tanpa harus mengklaim kepengarangan rekayasa perangkat lunak secara penuh [7], [14].',
        ),
        body(
          'Keterbatasan kajian perlu dinyatakan terbuka. Belum dilakukan pengukuran kepuasan pengguna dengan instrumen standar seperti System Usability Scale pada sampel besar [15]. Kualitas output tetap bergantung pada disiplin input lapangan dan kelengkapan data unit desa. Integrasi eksternal dan ketahanan layanan nonfungsional tidak diuji khusus. Penelitian lanjutan disarankan menambahkan survei penerimaan pengguna, audit kelengkapan data per kecamatan, dan pengukuran dampak keputusan program terhadap penajaman intervensi SPM per wilayah [9], [16].',
        ),

        // ===== 5 KESIMPULAN =====
        h1('5. KESIMPULAN'),
        body(
          'Kajian ini meneliti Arumanis sebagai inovasi daerah pada layanan air minum dan sanitasi DPKP Kabupaten Cianjur dengan pendekatan studi kasus analitis. Hasil menunjukkan bahwa Arumanis menjawab fragmentasi data melalui konsolidasi unit SPAM, capaian SPM, monitoring paket, dan dokumentasi lapangan dalam satu platform yang juga membuka akses publik terhadap peta capaian. Bukti operasional per 26 Juni 2026 meliputi 364 unit SPAM, 365 desa terpetakan, 426 paket pekerjaan, dan 3866 foto progres, disertai indikasi percepatan rekapitulasi SPM serta pelaporan lapangan yang lebih teratur dibanding praktik pra-sistem. Manfaat tersebar pada pengambilan keputusan dinas, penertiban kerja pengawas, dan transparansi bagi masyarakat. Arumanis layak diposisikan sebagai inovasi pelayanan publik berbasis data yang telah menghasilkan keluaran terukur dan relevan didukung kajian mahasiswa atau laporan PKL sebagai bagian persyaratan lomba inovasi daerah. Penelitian lanjutan disarankan memperdalam evaluasi penerimaan pengguna, kualitas data tingkat desa, dan dampak keputusan program terhadap penajaman intervensi SPM per wilayah.',
        ),

        // ===== UCAPAN TERIMA KASIH =====
        h1('UCAPAN TERIMA KASIH', { align: AlignmentType.CENTER }),
        body(
          'Penulis mengucapkan terima kasih kepada Program Studi Teknik Informatika Universitas Surya Kencana dan Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur atas kesempatan observasi serta akses dokumen yang digunakan dalam kajian inovasi Arumanis. Penulis menyatakan tidak ada konflik kepentingan terkait penyusunan naskah ini.',
        ),

        // ===== DAFTAR PUSTAKA =====
        h1('DAFTAR PUSTAKA', { align: AlignmentType.CENTER }),
        ref(
          1,
          'United Nations, Transforming our world: the 2030 Agenda for Sustainable Development. New York: United Nations, 2015.',
        ),
        ref(
          2,
          'Pemerintah Kabupaten Cianjur, Rencana Pembangunan Jangka Menengah Daerah Kabupaten Cianjur Tahun 2025-2029. Cianjur: Pemerintah Kabupaten Cianjur.',
        ),
        ref(
          3,
          'R. Heeks, “Most eGovernment-for-development projects fail: How can risks be reduced?,” iGovernment Working Paper Series, no. 14, University of Manchester, 2003.',
        ),
        ref(
          4,
          'Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi, kebijakan dan pedoman SPBE di lingkungan instansi pemerintah. Jakarta: KemenPANRB.',
        ),
        ref(
          5,
          'J. R. Gil-Garcia, N. Helbig, and A. Ojo, “Being smart: Emerging technologies and innovation in the public sector,” Government Information Quarterly, vol. 31, pp. I1–I8, 2014, doi: 10.1016/j.giq.2014.09.001.',
        ),
        ref(
          6,
          'P. Dunleavy, H. Margetts, S. Bastow, and J. Tinkler, “New public management is dead long live digital-era governance,” Journal of Public Administration Research and Theory, vol. 16, no. 3, pp. 467–494, 2006, doi: 10.1093/jopart/mui057.',
        ),
        ref(
          7,
          'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur, Dokumentasi operasional dan rancang bangun inovasi Arumanis. Cianjur: DPKP, 2026.',
        ),
        ref(
          8,
          'T. Janowski, “Digital government evolution: From transformation to contextualization,” Government Information Quarterly, vol. 32, no. 3, pp. 221–236, 2015, doi: 10.1016/j.giq.2015.07.001.',
        ),
        ref(
          9,
          'W. H. DeLone and E. R. McLean, “The DeLone and McLean model of information systems success: A ten-year update,” Journal of Management Information Systems, vol. 19, no. 4, pp. 9–30, 2003, doi: 10.1080/07421222.2003.11045748.',
        ),
        ref(
          10,
          'R. K. Yin, Case Study Research and Applications: Design and Methods, 6th ed. Thousand Oaks: SAGE, 2018.',
        ),
        ref(
          11,
          'K. M. Eisenhardt, “Building theories from case study research,” Academy of Management Review, vol. 14, no. 4, pp. 532–550, 1989, doi: 10.5465/amr.1989.4308385.',
        ),
        ref(
          12,
          'A. Cordella and C. M. Bonina, “A public value perspective for ICT enabled public sector reforms: A theoretical reflection,” Government Information Quarterly, vol. 29, no. 4, pp. 512–520, 2012, doi: 10.1016/j.giq.2012.03.004.',
        ),
        ref(
          13,
          'J. C. Bertot, P. T. Jaeger, and J. M. Grimes, “Using ICTs to create a culture of transparency,” Government Information Quarterly, vol. 27, no. 3, pp. 264–271, 2010, doi: 10.1016/j.giq.2010.03.001.',
        ),
        ref(
          14,
          'OECD, The OECD Digital Government Policy Framework. Paris: OECD Publishing, 2020, doi: 10.1787/f64fed2a-en.',
        ),
        ref(
          15,
          'J. Brooke, “SUS: A quick and dirty usability scale,” in Usability Evaluation in Industry, P. W. Jordan et al., Eds. London: Taylor and Francis, 1996, pp. 189–194.',
        ),
        ref(
          16,
          'F. D. Davis, “Perceived usefulness, perceived ease of use, and user acceptance of information technology,” MIS Quarterly, vol. 13, no. 3, pp. 319–340, 1989, doi: 10.2307/249008.',
        ),
        ref(
          17,
          'V. Venkatesh, M. G. Morris, G. B. Davis, and F. D. Davis, “User acceptance of information technology: Toward a unified view,” MIS Quarterly, vol. 27, no. 3, pp. 425–478, 2003, doi: 10.2307/30036540.',
        ),
        ref(
          18,
          'World Health Organization and UNICEF, Progress on household drinking water, sanitation and hygiene. Geneva: WHO/UNICEF JMP, 2023.',
        ),
        ref(
          19,
          'Kementerian Pekerjaan Umum dan Perumahan Rakyat, pedoman dan ketentuan terkait SPM bidang air minum serta pengembangan SPAM. Jakarta: Kementerian PUPR.',
        ),
        ref(
          20,
          'I. Mergel, N. Edelmann, and N. Haug, “Defining digital transformation: Results from expert interviews,” Government Information Quarterly, vol. 36, no. 4, 2019, doi: 10.1016/j.giq.2019.06.002.',
        ),

        p('', { after: 200 }),
        p(
          [
            {
              text: 'Catatan: ',
              bold: true,
              size: 18,
              italics: true,
            },
            {
              text: 'Naskah mengikuti Template Jurnal SINTA Sistem Informasi dan Teknologi Komputasi font Garamond, struktur PENDAHULUAN METODE HASIL DISKUSI KESIMPULAN, abstrak 150-250 kata, kata kunci berurutan alfabet. Salin ke file template Google Docs resmi bila editor mensyaratkan header volume/DOI persis. Email masih placeholder. Kelola sitasi dengan Mendeley atau Zotero gaya IEEE/Vancouver sesuai panduan jurnal.',
              size: 18,
              italics: true,
            },
          ],
          { firstLine: 0, after: 40 },
        ),
      ],
    },
  ],
})

const buf = await Packer.toBuffer(doc)
fs.writeFileSync(OUT, buf)

// also save a copy of the original template next to it
const templateCopy = path.resolve(__dirname, '..', 'Template_Jurnal_SINTA_asli.docx')
const srcTemplate = path.resolve(__dirname, '..', '_gdoc_template', 'export.docx')
if (fs.existsSync(srcTemplate)) {
  fs.copyFileSync(srcTemplate, templateCopy)
}

console.log('OK:', OUT)
console.log('Template asli:', templateCopy)
