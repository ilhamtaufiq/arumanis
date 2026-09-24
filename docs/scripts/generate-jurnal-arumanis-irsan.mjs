/**
 * Naskah jurnal ilmiah — Arumanis
 * Penulis: Moch Irsan Firmansyah (5520124132)
 * Teknik Informatika, Universitas Surya Kencana Cianjur
 * Format: kaidah jurnal IMRaD (Indonesia + abstrak EN)
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
  LevelFormat,
  VerticalAlign,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(
  __dirname,
  '..',
  'Jurnal_Arumanis_Moch_Irsan_Firmansyah.docx',
)

// A4, margin 2.5 cm ≈ 1418 DXA (common journal draft)
const M = 1418
const PAGE = {
  size: { width: 11906, height: 16838 },
  margin: { top: M, right: M, bottom: M, left: M },
}
const CW = 11906 - M * 2

const thin = { style: BorderStyle.SINGLE, size: 4, color: '666666' }
const borders = { top: thin, bottom: thin, left: thin, right: thin }
const font = 'Times New Roman'

function t(text, o = {}) {
  return new TextRun({
    text,
    font,
    size: o.size ?? 22, // 11 pt body journal
    bold: o.bold ?? false,
    italics: o.italics ?? false,
    color: o.color,
  })
}

function p(text, o = {}) {
  return new Paragraph({
    alignment: o.align ?? AlignmentType.JUSTIFIED,
    spacing: {
      after: o.after ?? 120,
      before: o.before ?? 0,
      line: o.line ?? 276, // ~1.15
      lineRule: 'auto',
    },
    indent: o.firstLine ? { firstLine: o.firstLine } : undefined,
    children: Array.isArray(text)
      ? text.map((x) => (typeof x === 'string' ? t(x, o) : t(x.text, { ...o, ...x })))
      : [t(text, o)],
  })
}

function center(text, o = {}) {
  return p(text, { ...o, align: AlignmentType.CENTER, firstLine: 0 })
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 160, line: 276, lineRule: 'auto' },
    children: [t(text.toUpperCase(), { bold: true, size: 22 })],
  })
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 120, line: 276, lineRule: 'auto' },
    children: [t(text, { bold: true, size: 22 })],
  })
}

function cell(text, w, o = {}) {
  return new TableCell({
    borders,
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
            color: o.color,
            italics: o.italics,
          }),
        ],
      }),
    ],
  })
}

function tbl(headers, rows) {
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
          cell(h, widths[i], {
            bold: true,
            fill: '1F4E79',
            color: 'FFFFFF',
            size: 16,
          }),
        ),
      }),
      ...rows.map(
        (r, ri) =>
          new TableRow({
            children: r.map((c, i) =>
              cell(String(c), widths[i], {
                size: 16,
                fill: ri % 2 === 0 ? 'F8FAFC' : undefined,
              }),
            ),
          }),
      ),
    ],
  })
}

function caption(text) {
  return p(text, {
    align: AlignmentType.CENTER,
    size: 18,
    italics: true,
    after: 160,
    before: 80,
  })
}

function ref(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100, line: 240, lineRule: 'auto' },
    indent: { left: 360, hanging: 360 },
    children: [t(text, { size: 20 })],
  })
}

function num(refId, text) {
  return new Paragraph({
    numbering: { reference: refId, level: 0 },
    spacing: { after: 80, line: 276, lineRule: 'auto' },
    children: [t(text)],
  })
}

const level = (id, format = LevelFormat.DECIMAL, pattern = '%1.') => ({
  reference: id,
  levels: [
    {
      level: 0,
      format,
      text: pattern,
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    },
  ],
})

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
        run: { size: 22, bold: true, font, allCaps: true },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 22, bold: true, font },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      level('tujuan'),
      level('tahap'),
      level('saran'),
      level('kontribusi'),
      {
        reference: 'bullet1',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
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
              alignment: AlignmentType.CENTER,
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 6, color: '1F4E79', space: 4 },
              },
              spacing: { after: 80 },
              children: [
                t('Naskah Jurnal · Teknik Informatika · Universitas Surya Kencana', {
                  size: 16,
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
              border: {
                top: { style: BorderStyle.SINGLE, size: 6, color: '1F4E79', space: 4 },
              },
              spacing: { before: 60 },
              children: [
                t('Moch Irsan Firmansyah  |  Halaman ', { size: 16, color: '555555' }),
                new TextRun({ children: [PageNumber.CURRENT], font, size: 16, color: '555555' }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ========== TITLE BLOCK ==========
        center(
          'RANCANG BANGUN SISTEM INFORMASI ARUMANIS UNTUK INTEGRASI DATA AIR MINUM DAN SANITASI KABUPATEN CIANJUR',
          { bold: true, size: 26, after: 200, line: 300 },
        ),
        center('Design and Development of the Arumanis Information System for Integrating Drinking Water and Sanitation Data in Cianjur Regency', {
          italics: true,
          size: 20,
          after: 280,
          line: 276,
        }),

        center('Moch Irsan Firmansyah', { bold: true, size: 22, after: 40 }),
        center('Program Studi Teknik Informatika, Fakultas Teknik', { size: 20, after: 20 }),
        center('Universitas Surya Kencana, Cianjur, Indonesia', { size: 20, after: 20 }),
        center('NIM 5520124132', { size: 18, after: 20 }),
        center('Email: moch.irsan.firmansyah@unsur.ac.id (korespondensi)', {
          size: 18,
          italics: true,
          after: 280,
        }),

        // ========== ABSTRAK ID ==========
        p('ABSTRAK', { bold: true, align: AlignmentType.CENTER, after: 120, firstLine: 0 }),
        p(
          'Fragmentasi data unit SPAM, capaian Standar Pelayanan Minimum (SPM), dan monitoring pekerjaan infrastruktur air minum-sanitasi di Kabupaten Cianjur menghambat rekapitulasi, pengawasan lapangan, dan transparansi publik. Penelitian ini merancang dan membangun Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) sebagai sistem informasi terintegrasi pada Dinas Perumahan dan Kawasan Permukiman (DPKP) Kabupaten Cianjur. Metode yang digunakan adalah Research and Development dengan tahapan analisis kebutuhan, perancangan arsitektur berlapis, implementasi, serta evaluasi kesesuaian fungsional dan dampak operasional sebelum-sesudah. Arsitektur sistem memisahkan portal web (React dengan BFF Bun), API domain (Laravel/APIAMIS), panel pengawasan web/mobile, dan integrasi pendukung (SPSE, SIPD, notifikasi). Hasil implementasi menunjukkan data operasional yang terpusat: 364 unit SPAM, 365 desa pada peta capaian, 426 paket pekerjaan, serta 3.866 dokumentasi foto progres ber-GPS (snapshot 26 Juni 2026). Perbandingan pra-sistem dan pasca-sistem mengindikasikan percepatan rekapitulasi SPM lintas desa (dari estimasi 5-10 hari kerja menjadi kurang dari 1 hari) dan pemantauan progres mingguan. Sistem ini mendukung pengambilan keputusan berbasis data, pengawasan lapangan yang terstruktur, dan publikasi capaian SPM kepada masyarakat.',
          { firstLine: 0, after: 120 },
        ),
        p(
          [
            { text: 'Kata kunci: ', bold: true },
            {
              text: 'sistem informasi; Arumanis; air minum dan sanitasi; SPM; monitoring pekerjaan; Kabupaten Cianjur',
            },
          ],
          { firstLine: 0, after: 280 },
        ),

        // ========== ABSTRACT EN ==========
        p('ABSTRACT', { bold: true, align: AlignmentType.CENTER, after: 120, firstLine: 0 }),
        p(
          'Fragmented SPAM unit data, Minimum Service Standards (SPM) achievements, and infrastructure work monitoring for drinking water and sanitation in Cianjur Regency hindered consolidation, field supervision, and public transparency. This study designs and develops Arumanis (One-Data Application for Drinking Water and Sanitation) as an integrated information system at the Housing and Settlement Area Office (DPKP) of Cianjur Regency. The research applies a Research and Development approach covering requirements analysis, layered architecture design, implementation, and evaluation of functional fit and before-after operational impact. The architecture separates a web portal (React with a Bun BFF), a domain API (Laravel/APIAMIS), web/mobile supervision panels, and supporting integrations (SPSE, SIPD, notifications). Implementation results show centralized operational data: 364 SPAM units, 365 villages on the achievement map, 426 work packages, and 3,866 GPS-tagged progress photos (snapshot 26 June 2026). Pre-post comparison indicates faster cross-village SPM consolidation (from an estimated 5-10 working days to under one day) and weekly progress monitoring. The system supports data-driven decision making, structured field supervision, and public SPM achievement disclosure.',
          { firstLine: 0, after: 120 },
        ),
        p(
          [
            { text: 'Keywords: ', bold: true },
            {
              text: 'information system; Arumanis; drinking water and sanitation; SPM; work monitoring; Cianjur Regency',
            },
          ],
          { firstLine: 0, after: 200 },
        ),

        // ========== 1 PENDAHULUAN ==========
        h1('1. Pendahuluan'),
        p(
          'Penyediaan air minum layak dan sanitasi yang memadai merupakan bagian dari target pembangunan berkelanjutan (SDGs 6) dan arah kebijakan daerah. Di Kabupaten Cianjur, program air minum dan sanitasi mencakup 33 kecamatan serta 365 desa/kelurahan. Pengelolaan data unit Sistem Penyediaan Air Minum (SPAM), capaian SPM, dan pelaksanaan pekerjaan infrastruktur semula tersebar pada lembar kerja, berkas fisik, dan saluran komunikasi informal. Akibatnya, rekapitulasi lintas desa memakan waktu, deviasi proyek sulit dideteksi dini, dan informasi capaian bagi masyarakat tidak selalu tersedia secara terbuka.',
          { firstLine: 720 },
        ),
        p(
          'Digitalisasi layanan pemerintahan daerah melalui SPBE menuntut sistem yang bukan hanya menampilkan data, tetapi juga menjaga satu sumber kebenaran (single source of truth), memisahkan antarmuka dari logika bisnis, serta mendukung peran pengguna yang berbeda (operator kantor, pengawas lapangan, pejabat, dan publik). Kebutuhan tersebut mendorong perancangan Arumanis sebagai platform satu data air minum dan sanitasi di lingkungan DPKP Kabupaten Cianjur.',
          { firstLine: 720 },
        ),
        p(
          'Penelitian ini menjawab pertanyaan: bagaimana merancang dan membangun sistem informasi terintegrasi yang mampu menyatukan data SPAM/SPM dengan monitoring pekerjaan lapangan, serta apa dampak operasionalnya dibanding praktik pra-sistem? Tujuan penelitian meliputi: (1) menganalisis kebutuhan integrasi data air minum dan sanitasi di DPKP; (2) merancang arsitektur berlapis portal-API-panel lapangan; (3) mengimplementasikan modul inti (SPAM unit, pekerjaan, pengawasan, publikasi capaian); dan (4) mengevaluasi hasil implementasi berdasarkan data operasional dan perbandingan sebelum-sesudah.',
          { firstLine: 720 },
        ),
        p(
          'Kontribusi naskah ini ada pada dua ranah. Secara praktis, naskah mendokumentasikan rancang bangun dan hasil penerapan Arumanis di instansi daerah. Secara keilmuan Teknik Informatika, naskah menempatkan penerapan pola BFF, API domain, RBAC, dan sinkronisasi pengawasan lapangan pada kasus infrastruktur air minum-sanitasi yang terukur.',
          { firstLine: 720 },
        ),

        // ========== 2 TINJAUAN ==========
        h1('2. Tinjauan Pustaka'),
        h2('2.1 Sistem Informasi dan SPBE'),
        p(
          'Sistem informasi mengolah data menjadi informasi untuk mendukung keputusan organisasi [1]. Dalam pemerintahan, SPBE menuntut layanan elektronik yang terintegrasi, aman, dan dapat diaudit. Keberhasilan sistem tidak hanya ditentukan fitur, tetapi juga kualitas data, kejelasan peran pengguna, dan kesesuaian alur kerja organisasi [2].',
          { firstLine: 720 },
        ),

        h2('2.2 Kualitas dan Arsitektur Perangkat Lunak'),
        p(
          'Model kualitas ISO/IEC 25010 menekankan kesesuaian fungsional, usability, reliability, security, dan maintainability [3]. Pada aplikasi web modern, pemisahan SPA, Backend for Frontend (BFF), dan API domain membantu menjaga keamanan sesi di sisi server, mengurangi paparan token di peramban, serta memudahkan evolusi antarmuka tanpa menduplikasi aturan bisnis [4], [5].',
          { firstLine: 720 },
        ),

        h2('2.3 Monitoring Infrastruktur dan Data SPM'),
        p(
          'Monitoring pekerjaan infrastruktur membutuhkan pencatatan progres fisik/keuangan, dokumentasi lapangan, dan pelacakan kendala. Pada sektor air minum, indikator SPM (sambungan rumah/KK, jiwa terlayani) menjadi acuan capaian layanan [6]. Integrasi data aset SPAM dengan data proyek memperkuat perencanaan intervensi per desa dan akuntabilitas anggaran.',
          { firstLine: 720 },
        ),

        h2('2.4 Penelitian Terkait'),
        p(
          'Kajian e-government dan sistem informasi daerah umumnya membahas portal layanan, dashboard eksekutif, atau aplikasi lapangan secara terpisah. Celah yang diisi penelitian ini adalah integrasi satu platform untuk data SPAM/SPM, manajemen paket pekerjaan, panel pengawasan ber-GPS, dan publikasi capaian, dengan arsitektur portal-BFF-API yang dapat dikembangkan bertahap di tingkat kabupaten.',
          { firstLine: 720 },
        ),

        // ========== 3 METODE ==========
        h1('3. Metode Penelitian'),
        h2('3.1 Jenis Penelitian'),
        p(
          'Penelitian menggunakan pendekatan Research and Development (R&D) rekayasa perangkat lunak terapan, dengan studi kasus implementasi pada DPKP Kabupaten Cianjur. Luaran utama adalah sistem yang dioperasikan (bukan sekadar prototipe konseptual), dilengkapi evaluasi kesesuaian fungsional dan dampak operasional.',
          { firstLine: 720 },
        ),

        h2('3.2 Tahapan Penelitian'),
        p('Tahapan mengikuti siklus rekayasa perangkat lunak yang disederhanakan sebagai berikut.', {
          firstLine: 720,
        }),
        num(
          'tahap',
          'Analisis kebutuhan: wawancara informal pemangku kepentingan internal, inventaris dokumen pelaporan, dan pemetaan sumber data terfragmentasi (Excel, berkas, komunikasi lapangan).',
        ),
        num(
          'tahap',
          'Perancangan: model arsitektur berlapis, pemodelan domain (desa, unit SPAM, capaian, pekerjaan, kontrak, foto, pengguna), matriks role-permission, dan alur SSO panel pengawasan.',
        ),
        num(
          'tahap',
          'Implementasi: portal React + BFF Bun, API Laravel (APIAMIS) + MySQL/Redis, panel pengawasan web/mobile, impor data, dan endpoint publik peta SPM.',
        ),
        num(
          'tahap',
          'Pengujian dan evaluasi: uji kesesuaian alur utama (login, master, pekerjaan, SPAM, export, pengawasan), serta evaluasi sebelum-sesudah berdasarkan snapshot data operasional 26 Juni 2026.',
        ),

        h2('3.3 Instrumen dan Sumber Data Evaluasi'),
        p(
          'Evaluasi menggunakan (a) checklist fungsional modul inti, (b) data agregat basis data operasional APIAMIS (unit SPAM, achievement, pekerjaan, foto), dan (c) perbandingan indikator proses administrasi pra-digitalisasi (estimasi operasional) dengan kondisi pasca-sistem. Pendekatan ini dipilih karena sistem sudah berjalan di lingkungan produksi, sehingga metrik operasional lebih relevan dibanding simulasi laboratorium semata.',
          { firstLine: 720 },
        ),

        h2('3.4 Batasan'),
        p(
          'Naskah berfokus pada rancang bangun dan hasil integrasi data. Pengujian beban skala besar, audit keamanan formal (penetration test), dan survei kepuasan pengguna berskala luas dapat menjadi penelitian lanjutan. Integrasi eksternal (SPSE, SIPD, WhatsApp) dibahas sejauh mendukung alur bisnis utama.',
          { firstLine: 720 },
        ),

        // ========== 4 HASIL ==========
        h1('4. Hasil dan Pembahasan'),
        h2('4.1 Arsitektur Sistem'),
        p(
          'Arumanis dirancang sebagai ekosistem, bukan monolit tunggal. Peramban operator tidak memanggil API domain secara langsung. Permintaan terautentikasi melalui cookie sesi httpOnly ke BFF, lalu diteruskan ke APIAMIS dengan Bearer token. Panel pengawasan memperoleh akses lewat handoff SSO sekali pakai, sedangkan aplikasi mobile dapat memakai token API sesuai kebijakan otentikasi lapangan.',
          { firstLine: 720 },
        ),
        caption('Tabel 1. Komponen arsitektur Arumanis'),
        tbl(
          ['Komponen', 'Teknologi', 'Fungsi utama'],
          [
            ['Portal Arumanis', 'React SPA + BFF Bun (Hono)', 'UI operator, proxy API, SSO handoff'],
            ['APIAMIS', 'Laravel, MySQL, Redis, Reverb', 'Domain bisnis, RBAC, antrian, realtime'],
            ['Panel Pengawasan', 'Web + mobile (Expo)', 'Foto GPS, progres, tiket lapangan'],
            ['SIPD Lite', 'Proxy BFF → FastAPI', 'Cache Renja dan rincian anggaran'],
            ['SPSE / LPSE', 'Integrasi lewat APIAMIS', 'Sinkron paket dan push kontrak'],
            ['Publikasi SPM', 'API publik + peta web', 'Capaian desa tanpa login'],
          ],
        ),
        p(
          'Pemisahan portal dan API memudahkan pemeliharaan. Aturan bisnis (validasi, otorisasi wilayah, sinkron progres) tetap di server domain, sehingga antarmuka dapat diganti tanpa menduplikasi logika. Realtime (Laravel Reverb) dipakai untuk notifikasi dan presence pengguna portal maupun pengawasan.',
          { firstLine: 720, before: 120 },
        ),

        h2('4.2 Modul Fungsional'),
        p(
          'Modul inti mencakup master wilayah (kecamatan/desa), kegiatan/sub kegiatan tahun anggaran, pekerjaan (paket), output, kontrak dan penyedia, penerima manfaat, berkas, foto progres, rekap progress, dashboard, serta SPAM unit dan capaian SPM. Pengawas lapangan mengunggah dokumentasi pada slot progres 0% sampai 100% dengan metadata lokasi. Tiket dan notifikasi menjadi jejak kendala yang dapat ditindaklanjuti, menggantikan koordinasi yang sebelumnya sulit diaudit.',
          { firstLine: 720 },
        ),
        p(
          'Keamanan akses memakai role dan permission granular (admin, operator wilayah, viewer, pengawas). Operator dibatasi pada wilayah kerja, sehingga risiko ubah data di luar kewenangan ditekan. Export PDF/Excel mendukung pelaporan dinas tanpa rekap manual berulang.',
          { firstLine: 720 },
        ),

        h2('4.3 Hasil Implementasi Data Operasional'),
        p(
          'Snapshot basis data operasional per 26 Juni 2026 menunjukkan cakupan yang sudah terisi pada skala kabupaten. Tabel 2 merangkum indikator utama yang relevan dengan tujuan integrasi data.',
          { firstLine: 720 },
        ),
        caption('Tabel 2. Indikator data operasional Arumanis (26 Juni 2026)'),
        tbl(
          ['Indikator', 'Nilai'],
          [
            ['Unit SPAM terdata', '364 unit (18 SIMSPAM; 346 non-SIMSPAM)'],
            ['Desa pada peta capaian SPM', '365 desa'],
            ['Target KK (master desa)', '534.952 KK'],
            ['Capaian SR/KK (s.d. 2025)', '52.911'],
            ['Capaian jiwa terlayani', '264.557 jiwa'],
            ['Persentase capaian SPM', '13,2%'],
            ['Record achievement tahunan', '505 entri'],
            ['Nilai kontrak SPAM terdata', 'Rp 90.479.525.404'],
            ['Paket pekerjaan terpantau', '426 paket'],
            ['Dokumentasi foto progres', '3.866 berkas'],
          ],
        ),
        p(
          'Angka capaian SPM 13,2% terhadap target KK menegaskan bahwa sistem bukan hanya repositori, tetapi juga menampilkan gap layanan secara eksplisit. Informasi gap ini berguna untuk prioritas intervensi desa, selaras perencanaan daerah (RPJMD dan RISPAM).',
          { firstLine: 720, before: 120 },
        ),

        h2('4.4 Evaluasi Sebelum dan Sesudah Sistem'),
        p(
          'Tabel 3 membandingkan kondisi pra-digitalisasi (estimasi operasional) dengan kondisi sesudah Arumanis beroperasi. Perbandingan menekankan proses administrasi dan pengawasan, bukan klaim kausal statistik eksperimen terkontrol.',
          { firstLine: 720 },
        ),
        caption('Tabel 3. Perbandingan indikator proses sebelum dan sesudah Arumanis'),
        tbl(
          ['Indikator proses', 'Sebelum (estimasi)', 'Sesudah (operasional)'],
          [
            ['Sumber data SPAM & proyek', '4-6 format terpisah', '1 platform + API terpusat'],
            ['Rekap capaian SPM 365 desa', '5-10 hari kerja/triwulan', '< 1 hari (agregasi sistem)'],
            ['Paket terpantau terpusat', 'Tidak terstandar', '426 paket'],
            ['Interval update progres ke pusat', '2-4 minggu', 'Mingguan (panel + sinkron)'],
            ['Foto progres terindeks', 'Tersebar di perangkat', '3.866 berkas + GPS/slot'],
            ['Impor data SPAM massal', '3-5 hari input manual', '< 2 jam (CSV/Excel)'],
            ['Akses publik capaian desa', 'Terbatas/berkas', '24/7 peta interaktif'],
          ],
        ),
        p(
          'Temuan tersebut sejalan dengan tujuan rancang bangun: menurunkan biaya koordinasi data, mempercepat pelaporan, dan membuka informasi capaian. Dari sisi rekayasa, keberhasilan integrasi bergantung pada disiplin domain model (relasi desa-unit-achievement-pekerjaan) dan penegakan otorisasi di API, bukan hanya pada tampilan dashboard.',
          { firstLine: 720, before: 120 },
        ),

        h2('4.5 Pembahasan'),
        p(
          'Arumanis menunjukkan bahwa integrasi data sektoral di daerah dapat ditempuh dengan arsitektur modular: portal untuk operator, API untuk kebenaran bisnis, dan kanal lapangan untuk data primer. Pendekatan BFF mengurangi risiko penanganan token di klien dan menyederhanakan kebijakan CORS/sesi. Sementara itu, panel pengawasan menutup celah klasik sistem kantor yang “buta lapangan”.',
          { firstLine: 720 },
        ),
        p(
          'Kebaruan relatif terletak pada penggabungan aset SPAM/SPM, monitoring paket, dokumentasi GPS, dan publikasi capaian dalam satu ekosistem yang sama, bukan pada klaim algoritma baru. Keterbatasan penelitian mencakup ketergantungan pada kualitas input pengguna lapangan, kebutuhan pelatihan berkelanjutan, dan belum dilakukannya pengukuran kepuasan pengguna dengan instrumen standar (misalnya SUS) pada sampel besar. Keterbatasan ini membuka agenda riset lanjutan di prodi Teknik Informatika: evaluasi usability formal, pengujian performa, dan analisis keamanan terarah.',
          { firstLine: 720 },
        ),

        // ========== 5 KESIMPULAN ==========
        h1('5. Kesimpulan'),
        p(
          'Penelitian ini merancang dan membangun Arumanis sebagai sistem informasi terintegrasi untuk data air minum dan sanitasi di DPKP Kabupaten Cianjur. Arsitektur berlapis (portal React + BFF, APIAMIS Laravel, panel pengawasan, integrasi pendukung) mampu menyatukan data SPAM/SPM dengan monitoring pekerjaan lapangan. Data operasional (364 unit SPAM, 365 desa terpetakan, 426 paket, 3.866 foto progres) dan perbandingan proses sebelum-sesudah menunjukkan percepatan rekapitulasi serta pengawasan yang lebih terstruktur. Disarankan penelitian lanjutan pada evaluasi usability kuantitatif, pengujian nonfungsional (kinerja dan keamanan), serta penguatan kualitas data di tingkat desa/POKMAS.',
          { firstLine: 720 },
        ),

        h1('Ucapan Terima Kasih'),
        p(
          'Penulis mengucapkan terima kasih kepada Program Studi Teknik Informatika Universitas Surya Kencana Cianjur serta Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur atas kesempatan mempelajari dan mendokumentasikan penerapan Arumanis sebagai objek penelitian terapan.',
          { firstLine: 720 },
        ),

        // ========== PUSTAKA ==========
        h1('Daftar Pustaka'),
        ref(
          '[1] K. C. Laudon dan J. P. Laudon, Management Information Systems: Managing the Digital Firm, 16th ed. Harlow: Pearson, 2020.',
        ),
        ref(
          '[2] R. Heeks, “Most eGovernment-for-development projects fail: How can risks be reduced?,” iGovernment Working Paper Series, no. 14, Univ. of Manchester, 2003.',
        ),
        ref(
          '[3] ISO/IEC, ISO/IEC 25010:2011 Systems and software engineering—Systems and software Quality Requirements and Evaluation (SQuaRE)—System and software quality models. Geneva: ISO, 2011.',
        ),
        ref(
          '[4] R. S. Pressman dan B. R. Maxim, Software Engineering: A Practitioner’s Approach, 9th ed. New York: McGraw-Hill, 2020.',
        ),
        ref(
          '[5] M. Fowler, Patterns of Enterprise Application Architecture. Boston: Addison-Wesley, 2003.',
        ),
        ref(
          '[6] Kementerian Pekerjaan Umum dan Perumahan Rakyat, ketentuan dan pedoman terkait Standar Pelayanan Minimum bidang air minum serta pengembangan SPAM. Jakarta: Kementerian PUPR, berbagai tahun.',
        ),
        ref(
          '[7] F. D. Davis, “Perceived usefulness, perceived ease of use, and user acceptance of information technology,” MIS Quarterly, vol. 13, no. 3, pp. 319–340, 1989.',
        ),
        ref(
          '[8] V. Venkatesh, M. G. Morris, G. B. Davis, dan F. D. Davis, “User acceptance of information technology: Toward a unified view,” MIS Quarterly, vol. 27, no. 3, pp. 425–478, 2003.',
        ),
        ref(
          '[9] J. Brooke, “SUS: A quick and dirty usability scale,” dalam Usability Evaluation in Industry, P. W. Jordan dkk., Eds. London: Taylor & Francis, 1996, pp. 189–194.',
        ),
        ref(
          '[10] Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur, Dokumentasi operasional dan rancang bangun inovasi Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi). Cianjur: DPKP, 2026.',
        ),
        ref(
          '[11] Pemerintah Kabupaten Cianjur, Rencana Pembangunan Jangka Menengah Daerah (RPJMD) Kabupaten Cianjur Tahun 2025–2029. Cianjur: Pemerintah Kabupaten Cianjur.',
        ),
        ref(
          '[12] United Nations, Transforming our world: the 2030 Agenda for Sustainable Development. New York: United Nations, 2015.',
        ),

        // ========== BIO SINGKAT ==========
        new Paragraph({
          spacing: { before: 360, after: 80 },
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 8 } },
          children: [t('Biodata Penulis', { bold: true, size: 20 })],
        }),
        p(
          'Moch Irsan Firmansyah, NIM 5520124132, adalah mahasiswa Program Studi Teknik Informatika, Fakultas Teknik, Universitas Surya Kencana Cianjur. Minat kajian meliputi sistem informasi, rekayasa perangkat lunak, dan penerapan teknologi informasi pada layanan pemerintahan daerah.',
          { firstLine: 0, size: 20, after: 80 },
        ),
        p(
          'Catatan editorial: Naskah ini disusun mengikuti struktur IMRaD jurnal ilmiah (abstrak dwibahasa, pendahuluan, tinjauan pustaka, metode, hasil dan pembahasan, kesimpulan, daftar pustaka IEEE-like). Sitasi instansi dan angka operasional merujuk dokumentasi Arumanis/DPKP; penulis perlu menyesuaikan email korespondensi, menambahkan DOI/URL sumber primer, serta menguji plagiasi sebelum submit ke jurnal tujuan.',
          { firstLine: 0, size: 18, italics: true, after: 40 },
        ),
      ],
    },
  ],
})

const buf = await Packer.toBuffer(doc)
fs.writeFileSync(OUT, buf)
console.log('OK:', OUT)
