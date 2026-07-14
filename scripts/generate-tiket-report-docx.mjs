/**
 * Laporan audit fitur Tiket (live) — format id-ID
 * Run: bun scripts/generate-tiket-report-docx.mjs
 */
import fs from 'fs';
import path from 'path';
import {
  buildDocumentStyles,
  buildNumberingConfig,
  bodyPara,
  PAGE_MARGINS,
  PAGE_SIZE,
  SIZE_BODY,
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
  ImageRun,
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

const SNAPSHOT = path.join(process.cwd(), 'docs', 'reports', 'tiket-live-snapshot.json');
const OUT = path.join(process.cwd(), 'docs', 'Laporan-Tiket-Live.docx');
const SCREENSHOT = path.join(process.cwd(), 'docs', 'assets', 'screenshots', 'tiket-live-01.png');

const accent = '1F4E79';
const accent2 = '2E75B6';
const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

const STATUS_LABEL = {
  open: 'Terbuka',
  pending: 'Dalam Proses',
  closed: 'Selesai (Closed)',
};

const KATEGORI_LABEL = {
  bug: 'Bug',
  request: 'Permintaan',
  lapangan: 'Lapangan',
  document: 'Dokumen',
  other: 'Lainnya',
};

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center
      ? AlignmentType.CENTER
      : opts.heading
        ? AlignmentType.LEFT
        : AlignmentType.JUSTIFIED,
    spacing: opts.spacing ?? bodyPara().spacing,
    heading: opts.heading,
    children: [
      tr(text, {
        bold: opts.bold,
        italics: opts.italics,
        size: opts.size,
        color: opts.color,
      }),
    ],
  });
}

function h1(t) {
  return p(t, { heading: HeadingLevel.HEADING_1 });
}
function h2(t) {
  return p(t, { heading: HeadingLevel.HEADING_2 });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets-tiket', level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100, line: 360, lineRule: 'auto' },
    children: [tr(text)],
  });
}

function tableFromRows(headers, rows, colWidths, opts = {}) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const fontSize = opts.fontSize ?? SIZE_SMALL;
  const mk = (cells, ri) =>
    new TableRow({
      children: cells.map((cell, ci) =>
        new TableCell({
          borders,
          width: { size: colWidths[ci], type: WidthType.DXA },
          shading:
            ri === 0
              ? { fill: 'D5E8F0', type: ShadingType.CLEAR }
              : opts.shadeRow?.(ri, cells)
                ? { fill: 'F5F5F5', type: ShadingType.CLEAR }
                : undefined,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              ...bodyPara({ after: 0 }),
              children: [
                tr(String(cell ?? ''), { bold: ri === 0, size: fontSize }),
              ],
            }),
          ],
        }),
      ),
    });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [mk(headers, 0), ...rows.map((r, i) => mk(r, i + 1))],
  });
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function truncate(s, max = 120) {
  const t = (s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function normalizeSubjek(s) {
  return (s ?? '').trim().toLowerCase();
}

function screenshotBlock() {
  if (!fs.existsSync(SCREENSHOT)) return [];
  return [
    h2('1.3 Tangkapan Layar Halaman Tiket'),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100, line: 360, lineRule: 'auto' },
      children: [
        new ImageRun({
          type: 'png',
          data: fs.readFileSync(SCREENSHOT),
          transformation: { width: 520, height: 292 },
          altText: {
            title: 'tiket-live',
            description: 'Halaman daftar tiket Arumanis live',
            name: 'tiket-live-01',
          },
        }),
      ],
    }),
    p('Gambar 1. Halaman fitur Tiket pada lingkungan produksi (live).', {
      center: true,
      italics: true,
      size: SIZE_SMALL,
    }),
  ];
}

function loadSnapshot() {
  if (!fs.existsSync(SNAPSHOT)) {
    throw new Error(`Snapshot tidak ditemukan: ${SNAPSHOT}. Jalankan scripts/capture-tiket-live.ps1 terlebih dahulu.`);
  }
  const raw = fs.readFileSync(SNAPSHOT, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function analyze(tickets) {
  const byStatus = { open: 0, pending: 0, closed: 0 };
  const byKategori = {};
  const bySubjek = {};

  for (const t of tickets) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    byKategori[t.kategori] = (byKategori[t.kategori] ?? 0) + 1;
    const key = normalizeSubjek(t.subjek);
    if (!bySubjek[key]) {
      bySubjek[key] = { label: t.subjek.trim(), count: 0, closed: 0, pending: 0, open: 0 };
    }
    bySubjek[key].count++;
    bySubjek[key][t.status]++;
  }

  const problemGroups = Object.values(bySubjek).sort((a, b) => b.count - a.count);
  const unsolved = tickets.filter((t) => t.status !== 'closed');
  const solved = tickets.filter((t) => t.status === 'closed');

  return { byStatus, byKategori, problemGroups, unsolved, solved };
}

function buildDoc(snapshot) {
  const tickets = snapshot.tickets ?? [];
  const stats = analyze(tickets);
  const captured = fmtDate(snapshot.captured_at);
  const total = tickets.length;
  const { byStatus, byKategori, problemGroups, unsolved, solved } = stats;

  const summaryRows = [
    ['Total tiket', String(total)],
    ['Terbuka (open)', String(byStatus.open ?? 0)],
    ['Dalam proses (pending)', String(byStatus.pending ?? 0)],
    ['Selesai (closed)', String(byStatus.closed ?? 0)],
    ['Belum selesai', String(unsolved.length)],
    ['Sudah selesai', String(solved.length)],
  ];

  const kategoriRows = Object.entries(byKategori)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => [KATEGORI_LABEL[k] ?? k, String(n)]);

  const problemRows = problemGroups.map((g) => [
    g.label,
    String(g.count),
    String(g.closed),
    String(g.pending + g.open),
    g.pending + g.open === 0 ? 'Ya' : 'Belum',
  ]);

  const detailRows = [...tickets]
    .sort((a, b) => b.id - a.id)
    .map((t) => [
      String(t.id),
      truncate(t.subjek, 50),
      truncate(t.deskripsi, 80),
      KATEGORI_LABEL[t.kategori] ?? t.kategori,
      STATUS_LABEL[t.status] ?? t.status,
      t.status === 'closed' ? 'Ya' : 'Belum',
      truncate(t.admin_notes ?? '—', 40),
      fmtDate(t.created_at),
    ]);

  const unsolvedRows = unsolved.map((t) => [
    String(t.id),
    truncate(t.subjek, 60),
    truncate(t.deskripsi, 100),
    truncate(t.admin_notes ?? '—', 60),
    STATUS_LABEL[t.status] ?? t.status,
  ]);

  const pctSolved = total ? Math.round((solved.length / total) * 100) : 0;

  const children = [
    p('LAPORAN AUDIT FITUR TIKET', { center: true, bold: true, size: 32 }),
    p('Arumanis — Portal Air Minum & Sanitasi', { center: true, size: SIZE_BODY }),
    p('Kabupaten Cianjur', { center: true, size: SIZE_BODY }),
    p('Lingkungan: Produksi (Live)', { center: true, italics: true, size: SIZE_SMALL }),
    p(`URL: https://arumanis.cianjur.space/tiket`, { center: true, size: SIZE_SMALL }),
    p(`Tanggal pengambilan data: ${captured}`, { center: true, size: SIZE_SMALL }),
    p(`Akun audit: ${snapshot.login_email ?? '—'}`, { center: true, size: SIZE_SMALL }),
    p(''),

    h1('1. Ringkasan Eksekutif'),
    p(
      `Pemeriksaan fitur Tiket pada lingkungan live menemukan ${total} tiket terdaftar. ` +
        `Dari jumlah tersebut, ${solved.length} tiket (${pctSolved}%) berstatus selesai (closed) ` +
        `dan ${unsolved.length} tiket masih belum selesai (${byStatus.pending ?? 0} dalam proses, ${byStatus.open ?? 0} terbuka).`,
    ),
    p(
      unsolved.length === 0
        ? 'Seluruh permasalahan yang dilaporkan telah ditandai selesai oleh admin.'
        : unsolved.length === 1
          ? 'Terdapat satu tiket yang masih dalam proses penyelesaian.'
          : `Terdapat ${unsolved.length} tiket yang masih memerlukan tindak lanjut admin.`,
    ),

    h2('1.1 Statistik Status'),
    tableFromRows(['Indikator', 'Jumlah'], summaryRows, [4500, 2500]),

    h2('1.2 Statistik Kategori'),
    tableFromRows(['Kategori', 'Jumlah'], kategoriRows, [4500, 2500]),
    ...screenshotBlock(),

    h1('2. Analisis Permasalahan'),
    p(
      'Tabel berikut mengelompokkan tiket berdasarkan subjek/permasalahan yang dilaporkan. ' +
        'Kolom "Sudah selesai?" bernilai Ya jika seluruh tiket dalam kelompok tersebut berstatus closed.',
    ),
    tableFromRows(
      ['Permasalahan', 'Jumlah', 'Closed', 'Belum selesai', 'Sudah selesai?'],
      problemRows,
      [3200, 900, 900, 1100, 1100],
    ),

    h1('3. Tiket Belum Selesai'),
    ...(unsolved.length === 0
      ? [p('Tidak ada tiket dengan status terbuka atau dalam proses.')]
      : [
          tableFromRows(
            ['ID', 'Subjek', 'Deskripsi', 'Catatan Admin', 'Status'],
            unsolvedRows,
            [700, 1800, 2800, 2000, 1200],
          ),
        ]),

    h1('4. Daftar Lengkap Tiket'),
    p(`Total ${total} tiket, diurutkan dari ID terbaru.`),
    tableFromRows(
      ['ID', 'Subjek', 'Deskripsi', 'Kategori', 'Status', 'Selesai?', 'Catatan Admin', 'Dibuat'],
      detailRows,
      [500, 1200, 1800, 900, 1000, 700, 1200, 1000],
      { fontSize: 18 },
    ),

    h1('5. Kesimpulan'),
    bullet(
      `Fitur Tiket di live dapat diakses dan menampilkan ${total} entri tiket dari berbagai pengguna lapangan.`,
    ),
    bullet(
      `Tingkat penyelesaian: ${solved.length} dari ${total} tiket (${pctSolved}%) sudah closed.`,
    ),
    bullet(
      problemGroups[0]
        ? `Permasalahan dominan: "${problemGroups[0].label}" (${problemGroups[0].count} tiket, ${problemGroups[0].closed} closed).`
        : 'Tidak ada pola permasalahan dominan.',
    ),
    ...(unsolved.length > 0
      ? unsolved.map(
          (t) =>
            bullet(
              `Tiket #${t.id} ("${truncate(t.subjek, 60)}") — status ${STATUS_LABEL[t.status] ?? t.status}` +
                (t.admin_notes ? `; catatan admin: ${truncate(t.admin_notes, 80)}` : '') +
                '.',
            ),
        )
      : [bullet('Semua tiket telah diselesaikan (status closed).')]),
    p(
      'Rekomendasi: pantau tiket yang masih pending secara berkala, pastikan catatan admin diperbarui, ' +
        'dan verifikasi bahwa perbaikan pada modul terkait (misalnya master wilayah/desa) sudah terdeploy di production.',
    ),

    h1('6. Metodologi Pengambilan Data'),
    bullet('Login ke https://arumanis.cianjur.space dengan akun admin yang berwenang.'),
    bullet('Mengambil data melalui API BFF /bff/api/tiket (semua halaman) beserta detail per ID.'),
    bullet('Snapshot disimpan di docs/reports/tiket-live-snapshot.json sebagai bukti audit.'),
    bullet('Laporan ini dihasilkan otomatis oleh scripts/generate-tiket-report-docx.mjs.'),
  ];

  return new Document({
    styles: buildDocumentStyles(accent, accent2),
    numbering: { config: buildNumberingConfig(['bullets-tiket']) },
    sections: [
      {
        properties: {
          page: { size: PAGE_SIZE, margin: PAGE_MARGINS },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  tr('Laporan Tiket Live — Arumanis', { size: SIZE_SMALL, color: '666666' }),
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
                  tr('Halaman ', { size: SIZE_SMALL }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Arial',
                    size: SIZE_SMALL,
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
}

async function main() {
  const snapshot = loadSnapshot();
  const doc = buildDoc(snapshot);
  const buf = await Packer.toBuffer(doc);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buf);
  console.log(`Wrote ${OUT}`);
  console.log(`Tickets: ${snapshot.tickets?.length ?? 0}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});