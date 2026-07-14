import { GANTT_MONTHS } from './timeline-gantt-data.mjs';
import { tr } from './docx-id-styles.mjs';
import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  VerticalMergeType,
  WidthType,
} from 'docx';

const border = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
const borders = { top: border, bottom: border, left: border, right: border };
const HEADER_FILL = 'D9E2F3';
const BAR_FILL = 'A6A6A6';

const ACT_W = 4000;
const WEEK_W = 300;

function mkCell(text, opts = {}) {
  const w = opts.width ?? WEEK_W;
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    columnSpan: opts.columnSpan,
    verticalMerge: opts.verticalMerge,
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
        spacing: { after: 0, line: 276 },
        children: text ? [tr(text, { bold: !!opts.bold, size: opts.size ?? 18 })] : [],
      }),
    ],
  });
}

/**
 * Tabel Gantt ala contoh Pergub ASB: bulan + minggu 1–4, sel abu-abu = durasi kegiatan.
 */
export function buildGanttTable(phases) {
  const colWidths = [ACT_W, ...Array(16).fill(WEEK_W)];

  const headerRow1 = new TableRow({
    children: [
      mkCell('Tahapan Kegiatan', {
        width: ACT_W,
        bold: true,
        shading: HEADER_FILL,
        verticalMerge: VerticalMergeType.RESTART,
      }),
      ...GANTT_MONTHS.map((m) =>
        mkCell(m.label, {
          width: WEEK_W * 4,
          columnSpan: 4,
          bold: true,
          center: true,
          shading: HEADER_FILL,
        }),
      ),
    ],
  });

  const headerRow2 = new TableRow({
    children: [
      mkCell('', { width: ACT_W, verticalMerge: VerticalMergeType.CONTINUE }),
      ...Array.from({ length: 16 }, (_, i) =>
        mkCell(String((i % 4) + 1), { bold: true, center: true, shading: HEADER_FILL, size: 16 }),
      ),
    ],
  });

  const dataRows = phases.map(
    (phase) =>
      new TableRow({
        children: [
          mkCell(phase.label, { width: ACT_W, size: 18 }),
          ...phase.weeks.map((on) => mkCell('', { shading: on ? BAR_FILL : undefined })),
        ],
      }),
  );

  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow1, headerRow2, ...dataRows],
  });
}