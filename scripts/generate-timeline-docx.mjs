/**
 * Generate Timeline Pengembangan Arumanis (Jan–Apr 2024) — format id-ID
 * Run: bun scripts/generate-timeline-docx.mjs
 */
import fs from 'fs';
import path from 'path';
import { GANTT_PHASES, TIMELINE_NARRATIVE } from './lib/timeline-gantt-data.mjs';
import { buildGanttTable } from './lib/timeline-gantt-docx.mjs';
import {
  buildDocumentStyles,
  buildNumberingConfig,
  bodyPara,
  PAGE_MARGINS,
  PAGE_SIZE,
  SIZE_BODY,
  SIZE_H2,
  SIZE_SMALL,
  tr,
} from './lib/docx-id-styles.mjs';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

const OUT = path.join(process.cwd(), 'docs', 'Timeline-Pengembangan-Arumanis-Jan-Apr-2024.docx');
const accent = '1F4E79';
const accent2 = '2E75B6';
const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : opts.heading ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
    spacing: opts.spacing ?? bodyPara().spacing,
    heading: opts.heading,
    children: [tr(text, { bold: opts.bold, italics: opts.italics, size: opts.size, color: opts.color })],
  });
}

function h1(t) {
  return p(t, { heading: HeadingLevel.HEADING_1 });
}
function h2(t) {
  return p(t, { heading: HeadingLevel.HEADING_2 });
}
function h3(t) {
  return p(t, { heading: HeadingLevel.HEADING_3 });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets-tl', level: 0 },
    ...{ alignment: AlignmentType.JUSTIFIED, spacing: { after: 100, line: 360, lineRule: 'auto' } },
    children: [tr(text)],
  });
}

function tableFromRows(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const mk = (cells, ri) =>
    new TableRow({
      children: cells.map((cell, ci) =>
        new TableCell({
          borders,
          width: { size: colWidths[ci], type: WidthType.DXA },
          shading: ri === 0 ? { fill: 'D5E8F0', type: ShadingType.CLEAR } : undefined,
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [
            new Paragraph({
              ...bodyPara({ after: 0 }),
              children: [tr(cell, { bold: ri === 0 })],
            }),
          ],
        }),
      ),
    });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [mk(headers, 0), ...rows.map((r) => mk(r, 1))],
  });
}

const MONTHS = [
  {
    no: 1,
    name: 'Januari 2024',
    tema: 'Persiapan dan penciptaan fondasi konsep',
    kegiatan: [
      'Rapat koordinasi bidang air minum dan sanitasi: pemetaan alur pelaporan manual (Excel, berkas fisik, WhatsApp).',
      'Inventarisasi data unit SPAM, capaian SR/KK, paket pekerjaan, dan foto lapangan yang sudah terkumpul.',
      'Penyusunan daftar kebutuhan fungsional prioritas: master wilayah, pekerjaan, kontrak, foto ber-GPS, laporan progres.',
      'Studi referensi SIMSPAM PUPR dan pilot database sanitasi (lini SandB).',
      'Penunjukan tim pengembang dan operator pendamping (belum penetapan implementasi sistem).',
    ],
    deliverable: [
      'Dokumen analisis kebutuhan versi 0.1',
      'Daftar modul target fase pilot',
      'Keputusan awal: sistem web berbasis database terpusat menggantikan lembar kerja terpisah',
    ],
  },
  {
    no: 2,
    name: 'Februari 2024',
    tema: 'Pilot database sanitasi (era SandB)',
    kegiatan: [
      'Setup lingkungan Laravel + MySQL (Laragon).',
      'Tabel master kecamatan dan 365 desa/kelurahan Kabupaten Cianjur.',
      'Form input capaian sanitasi per desa dengan data sampel.',
      'Validasi pola data wilayah bersama operator bidang sanitasi.',
      'Uji impor data dari file Excel ke struktur database (uji coba awal, masih bagian pembuatan).',
    ],
    deliverable: [
      'Repo pilot SandB dengan CRUD wilayah dan capaian sanitasi dasar',
      'Template impor CSV/Excel wilayah',
      'Catatan kendala inkonsistensi data historis antar sumber',
    ],
  },
  {
    no: 3,
    name: 'Maret 2024',
    tema: 'Integrasi air minum dan modul pekerjaan (transisi AMS Pro)',
    kegiatan: [
      'Perluasan cakupan program air minum dan sanitasi terpadu.',
      'Perancangan ERD: kegiatan, pekerjaan, kontrak, penyedia, penerima.',
      'Prototipe monolith Laravel + Inertia.js + React (AMS Pro).',
      'Login email/password dan role awal: admin, operator, viewer.',
      'Halaman daftar pekerjaan dan form tambah pekerjaan (pagu, lokasi, tahun anggaran).',
      'Uji coba modul bersama operator: input data nyata dan catatan perbaikan.',
    ],
    deliverable: [
      'Repo AMS Pro versi 0.1',
      'Modul auth dan RBAC dasar',
      'Modul pekerjaan CRUD + hasil uji coba internal tahap pertama',
    ],
  },
  {
    no: 4,
    name: 'April 2024',
    tema: 'Verifikasi uji coba, penetapan, dan implementasi awal',
    kegiatan: [
      'Uji coba lanjutan dengan 2–3 operator kantor: input paket pekerjaan nyata.',
      'Percobaan unggah foto dokumentasi ke pekerjaan.',
      'Feedback pengawas: kebutuhan laporan mingguan dan akses mobile-friendly.',
      'Verifikasi hasil uji coba dan evaluasi arsitektur monolith.',
      'Penetapan keputusan implementasi awal prototipe AMS Pro di lingkungan Dinas (April 2024).',
      'Rekomendasi resmi pemisahan API Laravel (apiamis) dan SPA React (arumanis) untuk kuartal berikutnya.',
    ],
    deliverable: [
      'Berita acara penetapan / implementasi awal April 2024',
      'Laporan evaluasi pilot internal',
      'Daftar perbaikan UX dari umpan balik operator',
      'Roadmap Q2 2024: kontrak, foto, progress spreadsheet, panel pengawasan',
    ],
  },
];

const children = [
  new Paragraph({ spacing: { before: 1600 } }),
  p('TIMELINE PENGEMBANGAN', { center: true, bold: true, size: 28, color: accent }),
  p('Aplikasi ARUMANIS', { center: true, bold: true, size: 40, color: accent }),
  p('Periode: Januari – April 2024 (Bulan ke-1 sampai ke-4)', { center: true, size: SIZE_BODY }),
  p('Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur', { center: true, size: SIZE_BODY, color: '555555' }),
  p('Bahasa: Indonesia (Indonesia) · Font: Arial 11 pt · Spasi baris: 1,5', { center: true, size: SIZE_SMALL, color: '888888' }),
  new Paragraph({ children: [new PageBreak()] }),

  h1('1. Pendahuluan'),
  p(TIMELINE_NARRATIVE.intro),
  p(TIMELINE_NARRATIVE.aprilFocus),
  p(
    'Timeline direkonstruksi dari LINEAGE.md, rancang bangun inovasi, dan changelog platform. Repo produksi aktif (arumanis, apiamis) mencatat commit intensif mulai 2025; fase 2024 mencerminkan warisan pilot sebelum migrasi SPA + BFF + Laravel API.',
    { italics: true, color: '666666' },
  ),

  h2('1.1 Tabel tahapan kegiatan (Januari–April 2024)'),
  p(
    'Tabel berikut mengikuti format perencanaan tahapan: sumbu horizontal = bulan dan minggu ke-1 sampai ke-4. Sel abu-abu menandakan periode kegiatan berjalan. Pembuatan dan uji coba berlangsung sepanjang empat bulan; penetapan dan implementasi awal ditetapkan pada April 2024.',
  ),
  buildGanttTable(GANTT_PHASES),
  new Paragraph({ spacing: { after: 200 } }),
  p('Keterangan: sel abu-abu = kegiatan aktif pada minggu tersebut.', { italics: true, size: SIZE_SMALL, color: '666666' }),
  new Paragraph({ spacing: { after: 240 } }),

  h2('1.2 Ringkasan per bulan'),
  tableFromRows(
    ['Bulan', 'Fokus', 'Output kunci'],
    [
      ['1 · Januari 2024', 'Analisis kebutuhan', 'Dokumen kebutuhan v0.1, awal uji coba konsep'],
      ['2 · Februari 2024', 'Pembuatan pilot SandB', 'Wilayah + capaian sanitasi, uji coba impor'],
      ['3 · Maret 2024', 'Pembuatan AMS Pro', 'Prototipe monolith, uji coba modul pekerjaan'],
      ['4 · April 2024', 'Penetapan & implementasi', 'BA penetapan, implementasi awal, roadmap API/SPA'],
    ],
    [1400, 3200, 4426],
  ),
  new Paragraph({ spacing: { after: 240 } }),

  h2('1.3 Diagram evolusi produk'),
  tableFromRows(
    ['Era', 'Periode kira-kira', 'Arsitektur', 'Status'],
    [
      ['SandB (pilot)', 'Awal 2024', 'Laravel monolith, fokus sanitasi', 'Diarsipkan'],
      ['AMS Pro (prototipe)', '2024', 'Laravel + Inertia + React monolith', 'Diarsipkan'],
      ['Arumanis Platform', '2025 – sekarang', 'SPA React + BFF + API Laravel + app pengawas', 'Aktif'],
    ],
    [2200, 2000, 3200, 1626],
  ),
  new Paragraph({ children: [new PageBreak()] }),

  h1('2. Rincian per bulan'),
  ...MONTHS.flatMap((m) => [
    h2(`Bulan ${m.no} · ${m.name}`),
    p(`Tema: ${m.tema}`, { bold: true }),
    h3('Kegiatan'),
    ...m.kegiatan.map((k) => bullet(k)),
    h3('Deliverable'),
    ...m.deliverable.map((d) => bullet(d)),
    new Paragraph({ spacing: { after: 200 } }),
  ]),

  h1('3. Pencapaian kumulatif (akhir April 2024)'),
  tableFromRows(
    ['Aspek', 'Status akhir April 2024'],
    [
      ['Master data wilayah', 'Teruji di pilot SandB'],
      ['Modul pekerjaan', 'Prototipe jalan di AMS Pro'],
      ['Modul kontrak', 'Belum; direncanakan Q2 2024'],
      ['Panel pengawasan SSO', 'Belum; konsep disetujui'],
      ['Landing publik SPM', 'Belum; fase platform final'],
      ['Penetapan implementasi awal', 'April 2024 (prototipe AMS Pro di Dinas)'],
      ['Produksi arumanis.cianjur.space', 'Belum go-live (2025–2026)'],
    ],
    [3600, 5426],
  ),
  new Paragraph({ spacing: { after: 240 } }),

  h1('4. Lanjutan setelah April 2024'),
  tableFromRows(
    ['Periode', 'Era', 'Perkembangan utama'],
    [
      ['Mei – Des 2024', 'AMS Pro', 'Kontrak, foto, berkas, progress spreadsheet'],
      ['2025', 'Migrasi platform', 'Pemisahan arumanis + apiamis'],
      ['Des 2025', 'v0.4.0', 'Dashboard, peta, modul inti stabil'],
      ['2026', 'v0.5.0', 'Landing publik, Drive, ONLYOFFICE, SSO pengawas'],
    ],
    [2000, 2200, 4826],
  ),

  new Paragraph({ spacing: { before: 320 } }),
  p('Versi dokumen: 1.1 · Dibuat: Juli 2026 · Sumber: LINEAGE.md, rancang_bangun_inovasi.md, platform-changelog', {
    italics: true,
    color: '888888',
    size: SIZE_SMALL,
  }),
];

const doc = new Document({
  styles: buildDocumentStyles(accent, accent2),
  numbering: { config: buildNumberingConfig(['bullets-tl']) },
  sections: [
    {
      properties: { page: { size: PAGE_SIZE, margin: PAGE_MARGINS } },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD', space: 4 } },
              spacing: { after: 80 },
              children: [
                tr('Timeline Pengembangan ARUMANIS', { bold: true, size: SIZE_SMALL, color: accent }),
                tr('  |  Jan–Apr 2024', { size: SIZE_SMALL, color: '888888' }),
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
                tr('Halaman ', { size: SIZE_SMALL, color: '888888' }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Arial',
                  size: SIZE_SMALL,
                  color: '888888',
                  language: { value: 'id-ID' },
                }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUT, buffer);
console.log(`Written: ${OUT} (${(buffer.length / 1024).toFixed(1)} KB)`);