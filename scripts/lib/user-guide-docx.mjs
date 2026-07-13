/**
 * Load docs/user-guide/*.md and convert to docx blocks.
 * Mirrors nav order from src/lib/user-guide.ts (getNavSections).
 */
import fs from 'fs';
import path from 'path';
import { bodyPara, FONT, ID_LANG, listPara, SIZE_SMALL, tr } from './docx-id-styles.mjs';
import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from 'docx';

const GUIDE_DIR = path.join(process.cwd(), 'docs', 'user-guide');
const SS_DIR = path.join(process.cwd(), 'docs', 'assets', 'screenshots');

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

/** Map placeholder paths in markdown to actual screenshot filenames */
const IMAGE_ALIASES = {
  'auth-sign-in.png': 'auth-01-sign-in.png',
  'kegiatan-list.png': 'admin-03-kegiatan-pptk.png',
  'dashboard-main.png': 'dashboard-01.png',
};

export const NAV_SECTIONS = [
  {
    title: 'Pendahuluan & Navigasi',
    slugs: ['navigasi-global', 'komponen-ui-dasar'],
  },
  {
    title: 'Panduan per Modul',
    slugs: [
      'auth',
      'dashboard',
      'kegiatan',
      'desa-kecamatan',
      'pekerjaan-output',
      'kontrak',
      'penerima-penyedia',
      'berkas-foto',
      'users',
      'roles-permissions',
      'settings',
      'spam-unit',
    ],
  },
  {
    title: 'Panduan Lintas Modul',
    slugs: [
      'pengawas-panel',
      'skenario-penggunaan',
      'manajemen-akses',
      'pemecahan-masalah',
      'glosarium',
    ],
  },
];

function filenameToSlug(filename) {
  const base = filename.replace(/\.md$/, '').replace(/\.mdx$/, '');
  return base.replace(/^\d+[-_]/, '').toLowerCase();
}

export function listUserGuideFiles() {
  if (!fs.existsSync(GUIDE_DIR)) return [];
  return fs
    .readdirSync(GUIDE_DIR)
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .map((filename) => ({
      filename,
      slug: filenameToSlug(filename),
      path: path.join(GUIDE_DIR, filename),
    }));
}

export function loadUserGuideBySlug(slug) {
  const files = listUserGuideFiles();
  const hit = files.find((f) => f.slug === slug);
  if (!hit) return null;
  const content = fs.readFileSync(hit.path, 'utf8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return {
    slug,
    filename: hit.filename,
    title: titleMatch ? titleMatch[1].trim() : slug,
    content,
  };
}

function resolveImagePath(rawPath) {
  const base = path.basename(rawPath.replace(/\\/g, '/'));
  const aliased = IMAGE_ALIASES[base] ?? base;
  const candidates = [
    path.join(SS_DIR, aliased),
    path.join(process.cwd(), rawPath.replace(/^\//, '')),
    path.join(SS_DIR, base),
  ];
  return candidates.find((c) => fs.existsSync(c)) ?? null;
}

function parseInline(text) {
  const runs = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push(tr(text.slice(last, m.index)));
    const token = m[0];
    if (token.startsWith('**')) {
      runs.push(tr(token.slice(2, -2), { bold: true }));
    } else if (token.startsWith('`')) {
      runs.push(tr(token.slice(1, -1), { font: 'Consolas', size: SIZE_SMALL }));
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) runs.push(tr(`${link[1]} (${link[2]})`, { color: '2E75B6' }));
    }
    last = m.index + token.length;
  }
  if (last < text.length) runs.push(tr(text.slice(last)));
  return runs.length ? runs : [tr(text)];
}

function mdParagraph(text, opts = {}) {
  const cleaned = text
    .replace(/\\!/g, '!')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return null;
  const isHeading = !!opts.heading;
  return new Paragraph({
    alignment: isHeading ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
    spacing: opts.spacing ?? (opts.numbering ? listPara({ after: 100 }).spacing : bodyPara({ after: 100 }).spacing),
    heading: opts.heading,
    numbering: opts.numbering,
    children: parseInline(cleaned),
  });
}

function mdTable(rows) {
  if (!rows.length) return null;
  const colCount = Math.max(...rows.map((r) => r.length));
  const colWidth = Math.floor(9026 / colCount);
  const tableRows = rows.map((row, ri) =>
    new TableRow({
      children: Array.from({ length: colCount }, (_, ci) => {
        const cell = (row[ci] ?? '').trim();
        return new TableCell({
          borders,
          width: { size: colWidth, type: WidthType.DXA },
          shading: ri === 0 ? { fill: 'EEF5FA', type: ShadingType.CLEAR } : undefined,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              ...bodyPara({ after: 0 }),
              children: ri === 0 ? [tr(cell, { bold: true })] : parseInline(cell),
            }),
          ],
        });
      }),
    }),
  );
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: Array(colCount).fill(colWidth),
    rows: tableRows,
  });
}

function mdImage(line, embedFigure) {
  const m = line.match(/^!\\?\[(.*?)\]\((.+)\)\s*$/);
  if (!m) return null;
  const [, alt, src] = m;
  const resolved = resolveImagePath(src);
  if (resolved && embedFigure) {
    return embedFigure(path.basename(resolved), alt || path.basename(resolved));
  }
  return mdParagraph(`[Gambar: ${alt || src}]`, { spacing: { after: 80 } });
}

function headingLevel(depth, offset = 0) {
  const level = Math.min(3, depth - 1 + offset);
  if (level <= 0) return HeadingLevel.HEADING_2;
  if (level === 1) return HeadingLevel.HEADING_2;
  if (level === 2) return HeadingLevel.HEADING_3;
  return HeadingLevel.HEADING_3;
}

/**
 * @param {string} md
 * @param {{ bulletRef?: string, embedFigure?: Function, headingOffset?: number }} opts
 */
export function markdownToDocxBlocks(md, opts = {}) {
  const bulletRef = opts.bulletRef ?? 'bullets-guide';
  const blocks = [];
  const lines = md.replace(/\r\n/g, '\n').split('\n');

  let i = 0;
  let inCode = false;
  let codeBuf = [];
  let tableBuf = [];

  const flushCode = () => {
    if (!codeBuf.length) return;
    blocks.push(
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [9026],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 9026, type: WidthType.DXA },
                shading: { fill: 'F4F4F4', type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: codeBuf.map(
                  (ln) =>
                    new Paragraph({
                      spacing: { after: 0 },
                      children: [tr(ln, { font: 'Consolas', size: 18, language: ID_LANG })],
                    }),
                ),
              }),
            ],
          }),
        ],
      }),
    );
    blocks.push(new Paragraph({ spacing: { after: 120 } }));
    codeBuf = [];
  };

  const flushTable = () => {
    if (!tableBuf.length) return;
    const parsed = tableBuf
      .filter((ln) => !/^\|[-:\s|]+\|$/.test(ln.trim()))
      .map((ln) =>
        ln
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim()),
      );
    const tbl = mdTable(parsed);
    if (tbl) blocks.push(tbl);
    blocks.push(new Paragraph({ spacing: { after: 140 } }));
    tableBuf = [];
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (line.startsWith('```')) {
      if (inCode) {
        inCode = false;
        flushCode();
      } else {
        flushTable();
        inCode = true;
      }
      i += 1;
      continue;
    }

    if (inCode) {
      codeBuf.push(raw);
      i += 1;
      continue;
    }

    if (line.trim().startsWith('|')) {
      tableBuf.push(line.trim());
      i += 1;
      continue;
    }
    flushTable();

    const trimmed = line.trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      blocks.push(new Paragraph({ spacing: { before: 80, after: 80 } }));
      i += 1;
      continue;
    }

    const img = mdImage(trimmed, opts.embedFigure);
    if (img) {
      const items = Array.isArray(img) ? img : [img];
      blocks.push(...items);
      i += 1;
      continue;
    }

    const hm = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (hm) {
      const depth = hm[1].length;
      const text = hm[2].replace(/\\!/g, '!').trim();
      if (depth === 1 && opts.skipFirstH1) {
        i += 1;
        continue;
      }
      blocks.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: depth <= 2 ? 240 : 160, after: 100, line: 360 },
          heading: headingLevel(depth, opts.headingOffset ?? 0),
          children: parseInline(text),
        }),
      );
      i += 1;
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      blocks.push(
        new Paragraph({
          numbering: { reference: bulletRef, level: 0 },
          ...listPara({ after: 80 }),
          children: parseInline(bullet[1]),
        }),
      );
      i += 1;
      continue;
    }

    const numbered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      blocks.push(
        new Paragraph({
          numbering: { reference: `${bulletRef}-num`, level: 0 },
          ...listPara({ after: 80 }),
          children: parseInline(numbered[1]),
        }),
      );
      i += 1;
      continue;
    }

    const para = mdParagraph(trimmed);
    if (para) blocks.push(para);
    i += 1;
  }

  flushTable();
  flushCode();
  return blocks;
}

/**
 * Build Bagian D blocks from docs/user-guide/
 */
export function buildUserGuideSection({ h1, h2, p, spacer, PageBreak, infoBox, figure }) {
  const blocks = [];
  const files = listUserGuideFiles();
  const slugSet = new Set(files.map((f) => f.slug));

  blocks.push(
    h1('Bagian D · Panduan Modul (sinkron /panduan)'),
    p(
      'Isi di bawah ini diambil langsung dari docs/user-guide/, file yang sama dengan menu Panduan Pengguna di aplikasi (/panduan). Ubah markdown di repo, lalu jalankan ulang generator DOCX agar dokumen ini ikut terbarui.',
    ),
    p(`Total ${files.length} modul ter-load. Terakhir dibaca dari folder docs/user-guide/.`),
  );

  if (infoBox) {
    blocks.push(
      ...infoBox('Sinkronisasi sumber', [
        'Sumber: docs/user-guide/*.md',
        'Loader aplikasi: src/lib/user-guide.ts',
        'Tampilan web: /panduan dan /panduan/$slug',
      ]),
    );
  }

  blocks.push(new Paragraph({ children: [new PageBreak()] }));

  let sectionNo = 0;
  for (const section of NAV_SECTIONS) {
    const slugs = section.slugs.filter((s) => slugSet.has(s));
    if (!slugs.length) continue;
    sectionNo += 1;
    blocks.push(h2(`D.${sectionNo} ${section.title}`));

    for (const slug of slugs) {
      const doc = loadUserGuideBySlug(slug);
      if (!doc) continue;
      blocks.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 200, after: 80, line: 360 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'DDDDDD', space: 4 } },
          children: [tr(doc.title, { bold: true, size: 28, color: '1F4E79' })],
        }),
      );
      blocks.push(
        ...markdownToDocxBlocks(doc.content, {
          bulletRef: 'bullets-guide',
          skipFirstH1: true,
          embedFigure: figure,
        }),
      );
      blocks.push(spacer(80, 200));
    }
  }

  return blocks;
}

// Re-export for tests
export { resolveImagePath, filenameToSlug };