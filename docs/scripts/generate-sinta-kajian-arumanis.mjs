/**
 * Naskah kajian Arumanis — format artikel jurnal SINTA (kaidah umum Indonesia)
 *
 * Catatan: SINTA adalah indeks jurnal; "format SINTA" di sini mengikuti
 * struktur naskah jurnal ilmiah nasional yang lazim (IMRaD + abstrak dwibahasa),
 * sesuai praktik submit ke jurnal terakreditasi SINTA.
 *
 * Penulis: Moch Irsan Firmansyah (5520124132)
 * Teknik Informatika — Universitas Surya Kencana Cianjur
 * Fokus: kajian/analisis inovasi (bukan rancang bangun)
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
  'Jurnal_SINTA_Kajian_Arumanis_Moch_Irsan_Firmansyah.docx',
)

const font = 'Times New Roman'
// Margin umum SINTA ID: kiri 3 cm, kanan/atas/bawah 2–3 cm → pakai 3/2.5/2.5/2.5 cm
// 3cm≈1701, 2.5cm≈1418
const ML = 1701
const M = 1418
const PAGE = {
  size: { width: 11906, height: 16838 }, // A4
  margin: { top: M, right: M, bottom: M, left: ML },
}
const CW = 11906 - ML - M // content width

const noV = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const hLine = { style: BorderStyle.SINGLE, size: 6, color: '000000' }

function t(text, o = {}) {
  return new TextRun({
    text,
    font,
    size: o.size ?? 24, // 12 pt body (lazim jurnal ID)
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
      line: o.line ?? 360, // 1.5 spasi (banyak jurnal SINTA)
      lineRule: 'auto',
    },
    indent: o.firstLine != null ? { firstLine: o.firstLine } : { firstLine: 720 },
    children,
  })
}

function center(content, o = {}) {
  return p(content, { ...o, align: AlignmentType.CENTER, firstLine: 0 })
}

function left(content, o = {}) {
  return p(content, { ...o, align: AlignmentType.LEFT, firstLine: 0 })
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.LEFT,
    spacing: { before: 280, after: 160, line: 360, lineRule: 'auto' },
    children: [t(text.toUpperCase(), { bold: true, size: 24 })],
  })
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 120, line: 360, lineRule: 'auto' },
    children: [t(text, { bold: true, size: 24 })],
  })
}

function cell(text, w, o = {}) {
  return new TableCell({
    borders: {
      top: hLine,
      bottom: hLine,
      left: noV,
      right: noV,
    },
    width: { size: w, type: WidthType.DXA },
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: o.align ?? AlignmentType.LEFT,
        spacing: { after: 20, line: 240, lineRule: 'auto' },
        children: [
          t(text, {
            size: o.size ?? 18,
            bold: o.bold ?? false,
          }),
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
    out.push(
      center(caption, {
        size: 20,
        italics: true,
        bold: true,
        after: 80,
        before: 160,
        firstLine: 0,
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
            cell(h, widths[i], { bold: true, fill: 'D9E2F3', size: 18 }),
          ),
        }),
        ...rows.map(
          (row, ri) =>
            new TableRow({
              children: row.map((c, i) =>
                cell(String(c), widths[i], {
                  size: 18,
                  fill: ri % 2 === 0 ? 'F2F2F2' : undefined,
                }),
              ),
            }),
        ),
      ],
    }),
  )
  out.push(p('', { firstLine: 0, after: 120 }))
  return out
}

function ref(num, text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 80, line: 276, lineRule: 'auto' },
    indent: { left: 360, hanging: 360 },
    children: [t(`[${num}] ${text}`, { size: 20 })],
  })
}

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
        run: { size: 24, bold: true, font, allCaps: true },
        paragraph: {
          spacing: { before: 280, after: 160 },
          outlineLevel: 0,
        },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font },
        paragraph: {
          spacing: { before: 200, after: 120 },
          outlineLevel: 1,
        },
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
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 12,
                  color: '1F4E79',
                  space: 4,
                },
              },
              spacing: { after: 80 },
              children: [
                t(
                  'Artikel Jurnal (Format SINTA)  ·  Kajian Inovasi Daerah  ·  e-ISSN/ISSN menyesuaikan jurnal tujuan',
                  { size: 16, italics: true, color: '555555' },
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
                t('Moch Irsan Firmansyah  |  Halaman ', {
                  size: 16,
                  color: '555555',
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font,
                  size: 16,
                  color: '555555',
                }),
                t(' dari ', { size: 16, color: '555555' }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font,
                  size: 16,
                  color: '555555',
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ===== JUDUL =====
        center(
          'KAJIAN MANFAAT INOVASI ARUMANIS BAGI LAYANAN AIR MINUM DAN SANITASI DI KABUPATEN CIANJUR',
          { bold: true, size: 28, after: 120, line: 360 },
        ),
        center(
          'A Study on the Benefits of the Arumanis Innovation for Drinking Water and Sanitation Services in Cianjur Regency',
          { italics: true, size: 22, after: 280, line: 300 },
        ),

        // ===== IDENTITAS =====
        center('Moch Irsan Firmansyah', { bold: true, size: 24, after: 40 }),
        center(
          'Program Studi Teknik Informatika, Fakultas Teknik, Universitas Surya Kencana, Cianjur, Indonesia',
          { size: 20, after: 20 },
        ),
        center('NIM 5520124132', { size: 20, after: 20 }),
        center(
          [
            { text: 'Email korespondensi: ', size: 20 },
            {
              text: 'moch.irsan.firmansyah@unsur.ac.id',
              size: 20,
              italics: true,
            },
          ],
          { after: 200 },
        ),

        // ===== ABSTRAK ID =====
        center('ABSTRAK', { bold: true, size: 24, after: 120 }),
        p(
          'Penelitian ini mengkaji Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) sebagai inovasi pelayanan publik Dinas Perumahan dan Kawasan Permukiman (DPKP) Kabupaten Cianjur. Tujuan kajian adalah menganalisis permasalahan fragmentasi data, mendeskripsikan posisi inovasi, serta menilai indikasi manfaat operasional bagi dinas, pelaksana lapangan, dan masyarakat. Metode yang digunakan adalah studi kasus kualitatif deskriptif melalui telaah dokumen, observasi modul operasional, dan perbandingan proses sebelum–sesudah sistem, dengan acuan snapshot operasional 26 Juni 2026. Hasil menunjukkan data terpusat meliputi 364 unit SPAM, 365 desa pada peta capaian, 426 paket pekerjaan, dan 3.866 dokumentasi foto progres. Rekapitulasi capaian SPM lintas desa memendek dari estimasi 5–10 hari kerja menjadi kurang dari satu hari, sementara pelaporan progres lapangan bergeser ke siklus mingguan terstruktur. Arumanis memberi kontribusi pada konsolidasi data, akuntabilitas pengawasan, dan transparansi publik, dengan catatan ketergantungan pada kualitas input dan penguatan kapasitas pengguna. Kajian ini relevan sebagai bukti analisis mahasiswa/PKL untuk persyaratan lomba inovasi daerah.',
          { firstLine: 0, after: 120 },
        ),
        left(
          [
            { text: 'Kata kunci: ', bold: true },
            {
              text: 'Arumanis; inovasi daerah; air minum dan sanitasi; SPM; kajian manfaat; Kabupaten Cianjur',
            },
          ],
          { after: 240 },
        ),

        // ===== ABSTRACT EN =====
        center('ABSTRACT', { bold: true, size: 24, after: 120 }),
        p(
          'This study examines Arumanis (One-Data Application for Drinking Water and Sanitation) as a public-service innovation of the Housing and Settlement Area Office (DPKP) of Cianjur Regency. The objectives are to analyze data fragmentation problems, describe the position of the innovation, and assess operational benefit indications for the agency, field implementers, and the public. The method is a descriptive qualitative case study through document review, observation of operational modules, and before–after process comparison, using an operational snapshot dated 26 June 2026. Results show centralized data covering 364 SPAM units, 365 villages on the achievement map, 426 work packages, and 3,866 progress photos. Cross-village SPM consolidation shortens from an estimated 5–10 working days to under one day, while field progress reporting shifts to structured weekly cycles. Arumanis contributes to data consolidation, supervision accountability, and public transparency, while remaining dependent on input quality and continuous user capacity building. The study is relevant as student/internship analytical evidence for regional innovation competition requirements.',
          { firstLine: 0, after: 120 },
        ),
        left(
          [
            { text: 'Keywords: ', bold: true },
            {
              text: 'Arumanis; regional innovation; drinking water and sanitation; SPM; benefit analysis; Cianjur Regency',
            },
          ],
          { after: 280 },
        ),

        // meta box ringkas
        ...dataTable(
          ['Unsur naskah', 'Keterangan'],
          [
            ['Jenis naskah', 'Artikel hasil kajian / analisis (bukan rancang bangun)'],
            ['Pendekatan', 'Studi kasus kualitatif deskriptif'],
            ['Objek', 'Inovasi Arumanis, DPKP Kabupaten Cianjur'],
            ['Kegunaan', 'Bukti kajian untuk lomba inovasi daerah / laporan PKL'],
            ['Format acuan', 'Artikel jurnal terakreditasi SINTA (IMRaD)'],
          ],
          null,
        ),

        // ===== 1 PENDAHULUAN =====
        h1('1. Pendahuluan'),
        p(
          'Akses air minum layak dan sanitasi yang memadai menjadi agenda pembangunan yang tertuang dalam SDGs 6 dan perencanaan daerah melalui RPJMD serta instrumen perencanaan SPAM [1], [2]. Kabupaten Cianjur mengelola wilayah layanan yang luas, meliputi 33 kecamatan dan 365 desa/kelurahan. Pada kondisi tersebut, data unit Sistem Penyediaan Air Minum (SPAM), capaian Standar Pelayanan Minimum (SPM), serta monitoring pekerjaan infrastruktur sering tersebar di lembar kerja, berkas fisik, dan saluran komunikasi informal. Fragmentasi data memperlambat rekapitulasi, melemahkan deteksi dini deviasi proyek, dan membatasi transparansi capaian bagi masyarakat.',
        ),
        p(
          'Inovasi pelayanan publik berbasis teknologi informasi di daerah sejalan dengan arah Sistem Pemerintahan Berbasis Elektronik (SPBE) dan reformasi birokrasi [3], [4]. Keberhasilan inovasi tidak hanya diukur dari ketersediaan aplikasi, tetapi dari perubahan proses kerja, kualitas data, dan kemanfaatan bagi pemangku kepentingan [5], [6]. Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) yang dioperasikan DPKP Kabupaten Cianjur menempati posisi sebagai inovasi daerah yang menggabungkan data aset dan capaian SPM dengan monitoring pekerjaan serta dokumentasi lapangan [7].',
        ),
        p(
          'Penelitian ini tidak bertujuan membangun ulang sistem. Fokusnya adalah mengkaji dan menganalisis kemanfaatan Arumanis sebagai inovasi yang telah beroperasi. Pendekatan ini selaras kebutuhan lomba inovasi daerah yang menuntut bukti permasalahan, kebaruan, manfaat, dan hasil terukur, sekaligus dapat disusun sebagai laporan hasil magang atau praktik kerja lapangan (PKL) mahasiswa. Pertanyaan penelitian yang diajukan adalah bagaimana Arumanis menjawab fragmentasi data air minum dan sanitasi di DPKP Cianjur, serta apa indikasi manfaat operasional yang dapat diamati dari data sistem dan perbandingan proses sebelum–sesudah.',
        ),
        p(
          'Tujuan kajian meliputi pendeskripsian konteks permasalahan layanan data, pemetaan fungsi inovasi terhadap alur kerja kantor dan lapangan, analisis manfaat berbasis indikator operasional, serta perumusan keterbatasan dan rekomendasi penguatan. Kontribusi naskah terletak pada sintesis bukti empiris operasional untuk evaluasi inovasi daerah, dengan sudut pandang mahasiswa Teknik Informatika Universitas Surya Kencana yang melakukan observasi dan studi dokumen pada objek nyata di Cianjur.',
        ),

        // ===== 2 TINJAUAN / LANDASAN (opsional SINTA: sering digabung intro atau terpisah) =====
        h1('2. Tinjauan Pustaka'),
        h2('2.1 Inovasi Pelayanan Publik dan SPBE'),
        p(
          'Inovasi pelayanan publik menekankan pembaruan tata kelola yang menghasilkan nilai bagi warga dan birokrasi. Dalam kerangka digital-era governance, integrasi proses dan transparansi menjadi penentu nilai publik dari digitalisasi [6], [8]. SPBE menuntut layanan elektronik yang terintegrasi, aman, dan dapat diaudit, sehingga keberhasilan sistem ditentukan juga oleh kejelasan peran pengguna dan kesesuaian alur kerja organisasi [3], [4].',
        ),
        h2('2.2 Sistem Informasi dan Keberhasilan SI'),
        p(
          'Model keberhasilan sistem informasi menekankan kualitas sistem, kualitas informasi, dan dampak penggunaan [9]. Untuk sistem pemerintahan daerah, dimensi transparansi dan akuntabilitas menambah bobot penilaian di luar efisiensi internal [10], [11]. Kajian ini memakai kerangka tersebut secara analitis untuk membaca indikasi manfaat Arumanis, tanpa menguji model statistik penerimaan pengguna secara penuh.',
        ),
        h2('2.3 Data SPM dan Monitoring Infrastruktur'),
        p(
          'Indikator SPM bidang air minum (sambungan rumah/KK, jiwa terlayani) menjadi acuan capaian layanan [12]. Monitoring pekerjaan infrastruktur membutuhkan pencatatan progres, dokumentasi lapangan, dan pelacakan kendala. Integrasi data aset SPAM dengan data proyek memperkuat perencanaan intervensi per desa dan akuntabilitas anggaran. Celah yang diisi kajian ini adalah sintesis bukti operasional inovasi yang menggabungkan kedua ranah tersebut pada kasus Cianjur.',
        ),

        // ===== 3 METODE =====
        h1('3. Metode Penelitian'),
        h2('3.1 Jenis dan Pendekatan'),
        p(
          'Penelitian menggunakan pendekatan kualitatif deskriptif dengan desain studi kasus tunggal pada inovasi Arumanis di DPKP Kabupaten Cianjur. Desain studi kasus dipilih karena fokus kajian adalah pemahaman mendalam atas satu inovasi dalam konteks organisasinya, bukan generalisasi statistik populasi luas [13], [14].',
        ),
        h2('3.2 Objek, Lokasi, dan Waktu'),
        p(
          'Objek kajian adalah platform Arumanis dan ekosistem pemanfaatannya (portal operator, panel pengawasan, publikasi capaian SPM). Lokasi konteks organisasi adalah DPKP Kabupaten Cianjur. Analisis mengacu dokumentasi dan snapshot operasional yang tersedia hingga 26 Juni 2026, serta observasi modul yang relevan pada periode penyusunan naskah.',
        ),
        h2('3.3 Teknik Pengumpulan dan Analisis Data'),
        p(
          'Data dikumpulkan melalui telaah dokumen inovasi dan operasional, observasi modul (dashboard, pekerjaan, SPAM unit, pengawasan, peta publik), serta analisis data agregat yang tercatat pada dokumentasi instansi. Analisis dilakukan secara tematik dan komparatif. Analisis tematik merangkum permasalahan pra-inovasi, unsur kebaruan, serta manfaat bagi pemerintah daerah, pelaksana teknis, dan masyarakat. Analisis komparatif membandingkan indikator proses administrasi dan pengawasan pada kondisi sebelum digitalisasi terpusat dengan kondisi setelah Arumanis beroperasi [5], [9].',
        ),
        p(
          'Validitas diperkuat dengan triangulasi antar dokumen operasional. Batasan metode mencakup ketiadaan survei kepuasan pengguna berskala besar dan ketiadaan eksperimen terkontrol. Angka “sebelum” pada beberapa indikator proses bersifat estimasi operasional yang tercatat dalam dokumen inovasi, sementara angka “sesudah” bersumber snapshot sistem. Interpretasi dibatasi pada indikasi manfaat, bukan klaim kausal absolut.',
        ),

        // ===== 4 HASIL =====
        h1('4. Hasil dan Pembahasan'),
        h2('4.1 Konteks Permasalahan dan Posisi Inovasi'),
        p(
          'Sebelum integrasi digital terpusat, data SPAM dan proyek tersebar pada empat hingga enam format penanganan. Rekapitulasi capaian SPM lintas 365 desa diperkirakan memakan 5 hingga 10 hari kerja per periode evaluasi. Interval pelaporan progres lapangan ke pusat umumnya 2 hingga 4 minggu, sementara dokumentasi foto tersebar di perangkat pengawas tanpa indeks terpusat. Kondisi ini menyulitkan penyusunan bahan rapat berbasis data terkini dan melemahkan jejak audit koordinasi.',
        ),
        p(
          'Arumanis menempatkan diri sebagai platform satu data yang menghubungkan operator kantor, pengawas lapangan, dan publik. Portal web mendukung pengelolaan program dan pelaporan. Panel pengawasan mendukung dokumentasi ber-GPS serta laporan mingguan. Halaman publik menyajikan peta capaian SPM per desa. Posisi tersebut membedakan inovasi dari praktik spreadsheet terpisah maupun aplikasi tunggal yang hanya berfokus pada satu fungsi [7], [10].',
        ),

        h2('4.2 Bukti Hasil Operasional'),
        p(
          'Snapshot operasional 26 Juni 2026 menunjukkan skala data yang sudah terkonsolidasi di tingkat kabupaten. Capaian SPM sebesar 13,2 persen terhadap target KK menampilkan gap layanan secara eksplisit, sehingga sistem tidak hanya menyimpan data tetapi juga menampilkan posisi capaian untuk perencanaan intervensi. Ringkasan indikator disajikan pada Tabel 1.',
        ),
        ...dataTable(
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
        p(
          'Temuan pada Tabel 1 mendukung argumen bahwa inovasi telah melewati tahap rintisan formal semata. Keberadaan ratusan unit SPAM dan ratusan paket pekerjaan dalam satu basis data memberi fondasi bagi monitoring dan pelaporan yang sebelumnya sulit disatukan. Dari sisi lomba inovasi daerah, angka-angka tersebut berfungsi sebagai bukti hasil (output) yang dapat diverifikasi pada sistem operasional.',
        ),

        h2('4.3 Manfaat Proses: Perbandingan Sebelum dan Sesudah'),
        p(
          'Perbandingan proses pada Tabel 2 menunjukkan pergeseran yang paling terasa pada kecepatan rekapitulasi, keteraturan pelaporan lapangan, dan akses publik. Impor data SPAM massal yang sebelumnya memakan hitungan hari dapat diselesaikan dalam hitungan jam melalui template. Koordinasi pengawas–pusat meninggalkan jejak melalui notifikasi dan tiket.',
        ),
        ...dataTable(
          ['Indikator proses', 'Sebelum (estimasi)', 'Sesudah (operasional)'],
          [
            ['Sumber data SPAM dan proyek', '4–6 format terpisah', 'Platform terintegrasi'],
            ['Rekap SPM lintas desa', '5–10 hari kerja', 'Kurang dari 1 hari'],
            ['Paket terpantau terpusat', 'Tidak terstandar', '426 paket'],
            ['Interval update progres', '2–4 minggu', 'Mingguan terstruktur'],
            ['Foto progres terindeks', 'Tersebar di perangkat', '3.866 berkas ber-GPS'],
            ['Impor data SPAM massal', '3–5 hari manual', 'Kurang dari 2 jam'],
            ['Akses publik capaian desa', 'Terbatas', 'Peta interaktif 24/7'],
          ],
          'Tabel 2. Perbandingan indikator proses sebelum dan sesudah Arumanis',
        ),
        p(
          'Secara teoretis, temuan ini sejalan dengan literatur e-government yang menekankan integrasi proses dan transparansi sebagai penentu nilai publik dari digitalisasi [5], [8], [11]. Secara praktis, manfaat dirasakan berbeda antar aktor. Bagi DPKP, dashboard dan peta mempercepat bahan keputusan. Bagi pengawas, alur foto dan laporan mingguan menertibkan pelaporan. Bagi masyarakat, capaian desa dapat dilihat tanpa harus meminta berkas manual. Pembagian manfaat ini penting agar penilaian inovasi tidak hanya berpusat pada kecanggihan teknis.',
        ),

        h2('4.4 Kebaruan Relatif'),
        p(
          'Kebaruan Arumanis bersifat integratif. Sistem menggabungkan data aset SPAM dan capaian SPM, monitoring paket pekerjaan, dokumentasi lapangan ber-GPS, serta publikasi peta dalam satu ekosistem layanan. Integrasi dengan kanal lapangan menutup celah klasik sistem kantor yang miskin data primer. Di sisi tata kelola akses, pemisahan peran dan pembatasan wilayah kerja mengurangi risiko pengelolaan data di luar kewenangan. Kebaruan semacam ini relevan bagi penilaian inovasi daerah yang menekankan pembaruan tata kelola, bukan sekadar pengadaan perangkat lunak generik [6], [15].',
        ),
        p(
          'Dari sudut pandang mahasiswa Teknik Informatika yang mengkaji objek magang atau PKL, Arumanis memperlihatkan penerapan sistem informasi pada instansi daerah secara nyata: satu data lintas modul, kanal lapangan, dan keterbukaan capaian. Observasi ini memperkuat pemahaman bahwa nilai inovasi terletak pada perubahan proses dan bukti data, bukan pada klaim fitur semata.',
        ),

        h2('4.5 Keterbatasan Kajian'),
        p(
          'Kajian ini memiliki keterbatasan yang perlu dinyatakan secara terbuka. Pertama, indikasi manfaat proses sebagian bertumpu pada estimasi pra-sistem yang tercatat dokumen inovasi, sehingga ketepatan absolut angka “sebelum” tidak diuji ulang dengan baseline primer multi-tahun. Kedua, belum dilakukan pengukuran kepuasan pengguna dengan instrumen standar seperti System Usability Scale pada sampel besar [16]. Ketiga, kualitas output sistem tetap bergantung pada disiplin input di lapangan dan kelengkapan data unit desa. Keempat, integrasi eksternal dan ketahanan layanan nonfungsional tidak diuji secara khusus dalam kajian ini.',
        ),
        p(
          'Arah penguatan yang disarankan mencakup survei usability berkala, audit kelengkapan data per kecamatan, penguatan pelatihan pengawas dan operator, serta pemantauan ketersediaan layanan publik peta SPM. Untuk keperluan lomba inovasi daerah, instansi disarankan menyertakan bukti pendukung berupa tangkapan layar berizin, rekap pengguna aktif, dan ringkasan testimoni pemangku kepentingan sebagai lampiran terpisah dari naskah ilmiah.',
        ),

        // ===== 5 KESIMPULAN =====
        h1('5. Kesimpulan dan Saran'),
        h2('5.1 Kesimpulan'),
        p(
          'Kajian ini meneliti Arumanis sebagai inovasi daerah pada layanan air minum dan sanitasi DPKP Kabupaten Cianjur dengan pendekatan studi kasus analitis. Hasil analisis menunjukkan bahwa Arumanis menjawab fragmentasi data melalui konsolidasi unit SPAM, capaian SPM, monitoring paket, dan dokumentasi lapangan dalam satu platform yang juga membuka akses publik terhadap peta capaian. Bukti operasional per 26 Juni 2026 meliputi 364 unit SPAM, 365 desa terpetakan, 426 paket pekerjaan, dan 3.866 foto progres, disertai indikasi percepatan rekapitulasi SPM serta pelaporan lapangan yang lebih teratur dibanding praktik pra-sistem. Manfaat tersebar pada pengambilan keputusan dinas, penertiban kerja pengawas, dan transparansi bagi masyarakat. Arumanis layak diposisikan sebagai inovasi pelayanan publik berbasis data yang telah menghasilkan keluaran terukur dan relevan didukung kajian mahasiswa atau laporan PKL sebagai bagian persyaratan lomba inovasi daerah.',
        ),
        h2('5.2 Saran'),
        p(
          'Bagi DPKP dan pengelola Arumanis, disarankan memperkuat kualitas data di tingkat desa, pelatihan pengguna secara berkala, dan evaluasi usability formal. Bagi peneliti selanjutnya, disarankan menambahkan survei penerimaan pengguna, analisis dampak keputusan program terhadap penajaman intervensi SPM per wilayah, serta pengukuran nonfungsional layanan. Bagi perguruan tinggi, objek inovasi daerah seperti Arumanis dapat terus dipakai sebagai wahana PKL yang menghasilkan naskah kajian terukur, bukan sekadar laporan kegiatan administratif.',
        ),

        // ===== UCAPAN TERIMA KASIH =====
        h1('Ucapan Terima Kasih'),
        p(
          'Penulis menyatakan tidak ada konflik kepentingan. Kajian ini disusun sebagai analisis terhadap inovasi Arumanis milik DPKP Kabupaten Cianjur dalam rangka pembelajaran dan pendokumentasian bukti inovasi daerah. Ucapan terima kasih disampaikan kepada Program Studi Teknik Informatika Universitas Surya Kencana serta pihak DPKP Kabupaten Cianjur atas kesempatan observasi dan akses dokumen yang digunakan dalam kajian.',
          { firstLine: 0 },
        ),

        // ===== DAFTAR PUSTAKA =====
        h1('Daftar Pustaka'),
        ref(
          1,
          'United Nations, Transforming our world: the 2030 Agenda for Sustainable Development. New York, NY, USA: United Nations, 2015.',
        ),
        ref(
          2,
          'Pemerintah Kabupaten Cianjur, Rencana Pembangunan Jangka Menengah Daerah Kabupaten Cianjur Tahun 2025–2029. Cianjur, Indonesia: Pemerintah Kabupaten Cianjur.',
        ),
        ref(
          3,
          'R. Heeks, “Most eGovernment-for-development projects fail: How can risks be reduced?,” iGovernment Working Paper Series, no. 14, University of Manchester, 2003.',
        ),
        ref(
          4,
          'Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi, kebijakan dan pedoman SPBE di lingkungan instansi pemerintah. Jakarta, Indonesia: KemenPANRB.',
        ),
        ref(
          5,
          'J. R. Gil-Garcia, N. Helbig, and A. Ojo, “Being smart: Emerging technologies and innovation in the public sector,” Government Information Quarterly, vol. 31, pp. I1–I8, 2014, doi: 10.1016/j.giq.2014.09.001.',
        ),
        ref(
          6,
          'P. Dunleavy, H. Margetts, S. Bastow, and J. Tinkler, “New public management is dead—long live digital-era governance,” Journal of Public Administration Research and Theory, vol. 16, no. 3, pp. 467–494, 2006, doi: 10.1093/jopart/mui057.',
        ),
        ref(
          7,
          'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur, Dokumentasi operasional dan rancang bangun inovasi Arumanis. Cianjur, Indonesia: DPKP, 2026.',
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
          'A. Cordella and C. M. Bonina, “A public value perspective for ICT enabled public sector reforms: A theoretical reflection,” Government Information Quarterly, vol. 29, no. 4, pp. 512–520, 2012, doi: 10.1016/j.giq.2012.03.004.',
        ),
        ref(
          11,
          'J. C. Bertot, P. T. Jaeger, and J. M. Grimes, “Using ICTs to create a culture of transparency,” Government Information Quarterly, vol. 27, no. 3, pp. 264–271, 2010, doi: 10.1016/j.giq.2010.03.001.',
        ),
        ref(
          12,
          'Kementerian Pekerjaan Umum dan Perumahan Rakyat, pedoman dan ketentuan terkait SPM bidang air minum serta pengembangan SPAM. Jakarta, Indonesia: Kementerian PUPR.',
        ),
        ref(
          13,
          'R. K. Yin, Case Study Research and Applications: Design and Methods, 6th ed. Thousand Oaks, CA, USA: SAGE, 2018.',
        ),
        ref(
          14,
          'K. M. Eisenhardt, “Building theories from case study research,” Academy of Management Review, vol. 14, no. 4, pp. 532–550, 1989, doi: 10.5465/amr.1989.4308385.',
        ),
        ref(
          15,
          'OECD, The OECD Digital Government Policy Framework. Paris, France: OECD Publishing, 2020, doi: 10.1787/f64fed2a-en.',
        ),
        ref(
          16,
          'J. Brooke, “SUS: A quick and dirty usability scale,” in Usability Evaluation in Industry, P. W. Jordan et al., Eds. London, U.K.: Taylor & Francis, 1996, pp. 189–194.',
        ),
        ref(
          17,
          'F. D. Davis, “Perceived usefulness, perceived ease of use, and user acceptance of information technology,” MIS Quarterly, vol. 13, no. 3, pp. 319–340, 1989, doi: 10.2307/249008.',
        ),
        ref(
          18,
          'V. Venkatesh, M. G. Morris, G. B. Davis, and F. D. Davis, “User acceptance of information technology: Toward a unified view,” MIS Quarterly, vol. 27, no. 3, pp. 425–478, 2003, doi: 10.2307/30036540.',
        ),
        ref(
          19,
          'World Health Organization and UNICEF, Progress on household drinking water, sanitation and hygiene. Geneva, Switzerland: WHO/UNICEF JMP, 2023.',
        ),
        ref(
          20,
          'I. Mergel, N. Edelmann, and N. Haug, “Defining digital transformation: Results from expert interviews,” Government Information Quarterly, vol. 36, no. 4, 2019, doi: 10.1016/j.giq.2019.06.002.',
        ),

        // ===== BIODATA =====
        new Paragraph({
          spacing: { before: 360, after: 100 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 10 },
          },
          children: [t('Biodata Penulis', { bold: true, size: 22 })],
        }),
        p(
          'Moch Irsan Firmansyah, NIM 5520124132, adalah mahasiswa Program Studi Teknik Informatika, Fakultas Teknik, Universitas Surya Kencana, Cianjur. Minat kajian meliputi sistem informasi, pelayanan publik digital, dan evaluasi kemanfaatan inovasi daerah. Naskah ini disusun sebagai hasil kajian terhadap inovasi Arumanis (DPKP Kabupaten Cianjur) untuk mendukung dokumentasi lomba inovasi daerah dan/atau laporan praktik kerja lapangan.',
          { firstLine: 0, size: 20, after: 120 },
        ),
        p(
          [
            {
              text: 'Catatan format: ',
              bold: true,
              size: 18,
              italics: true,
            },
            {
              text: 'Naskah memakai kaidah umum artikel jurnal terakreditasi SINTA (IMRaD, abstrak dwibahasa, spasi 1,5, Times New Roman 12, margin kiri 3 cm). Sesuaikan template final dengan jurnal SINTA tujuan (APA/IEEE, batasan halaman, gaya heading). Email korespondensi masih placeholder.',
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
console.log('OK:', OUT)
