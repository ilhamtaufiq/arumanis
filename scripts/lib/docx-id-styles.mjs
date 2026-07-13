/**
 * Format dokumen Word: Bahasa Indonesia (id-ID).
 * Spasi 1,5, isi rata kiri-kanan, font Arial 11 pt.
 */
import { AlignmentType, LevelFormat, LineRuleType, TextRun } from 'docx';

/** Bahasa Indonesia (Indonesia) — pengaturan bahasa di Word */
export const ID_LANG = { value: 'id-ID' };

export const FONT = 'Arial';
export const SIZE_BODY = 22; // 11 pt
export const SIZE_SMALL = 20; // 10 pt
export const SIZE_CAPTION = 20;
export const SIZE_H1 = 32; // 16 pt
export const SIZE_H2 = 28; // 14 pt
export const SIZE_H3 = 24; // 12 pt

/** Spasi baris 1,5 (standar naskah Indonesia) */
export const LINE_SPACING = { line: 360, lineRule: LineRuleType.AUTO };

/** Margin A4: atas/bawah/kiri 3 cm, kanan 2,5 cm (dalam twips) */
export const PAGE_MARGINS = {
  top: 1701,
  bottom: 1701,
  left: 1701,
  right: 1417,
};

export const PAGE_SIZE = { width: 11906, height: 16838 };

/**
 * TextRun dengan bahasa Indonesia dan font standar.
 */
export function tr(text, opts = {}) {
  return new TextRun({
    text,
    font: opts.font ?? FONT,
    size: opts.size ?? SIZE_BODY,
    language: ID_LANG,
    bold: opts.bold,
    italics: opts.italics,
    color: opts.color,
    children: opts.children,
  });
}

/** Properti paragraf isi (rata kiri-kanan, spasi 1,5) */
export function bodyPara(spacing = {}) {
  return {
    alignment: AlignmentType.JUSTIFIED,
    spacing: {
      after: spacing.after ?? 200,
      before: spacing.before ?? 0,
      ...LINE_SPACING,
    },
  };
}

/** Proparagraf daftar / bullet */
export function listPara(spacing = {}) {
  return {
    alignment: AlignmentType.JUSTIFIED,
    spacing: {
      after: spacing.after ?? 120,
      before: spacing.before ?? 0,
      ...LINE_SPACING,
    },
  };
}

/** Judul: rata kiri */
export function headingPara(level = 1) {
  const gaps = {
    1: { before: 400, after: 200 },
    2: { before: 320, after: 160 },
    3: { before: 240, after: 120 },
  };
  const g = gaps[level] ?? gaps[3];
  return {
    alignment: AlignmentType.LEFT,
    spacing: { ...g, ...LINE_SPACING },
  };
}

export function buildDocumentStyles(accent = '1F4E79', accent2 = '2E75B6') {
  return {
    default: {
      document: {
        run: {
          font: FONT,
          size: SIZE_BODY,
          language: ID_LANG,
        },
        paragraph: {
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200, ...LINE_SPACING },
        },
      },
    },
    paragraphStyles: [
      {
        id: 'Normal',
        name: 'Normal',
        run: { font: FONT, size: SIZE_BODY, language: ID_LANG },
        paragraph: {
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200, ...LINE_SPACING },
        },
      },
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: SIZE_H1, bold: true, font: FONT, color: accent, language: ID_LANG },
        paragraph: { ...headingPara(1), outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: SIZE_H2, bold: true, font: FONT, color: accent2, language: ID_LANG },
        paragraph: { ...headingPara(2), outlineLevel: 1 },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: SIZE_H3, bold: true, font: FONT, color: '333333', language: ID_LANG },
        paragraph: { ...headingPara(3), outlineLevel: 2 },
      },
      {
        id: 'Caption',
        name: 'Caption',
        basedOn: 'Normal',
        next: 'Normal',
        run: { size: SIZE_CAPTION, italics: true, color: '444444', language: ID_LANG },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 240, ...LINE_SPACING },
        },
      },
    ],
  };
}

export function buildNumberingConfig(refs) {
  const bulletRefs = refs.filter((r) => !r.endsWith('-num'));
  const config = bulletRefs.map((ref) => ({
    reference: ref,
    levels: [
      {
        level: 0,
        format: LevelFormat.BULLET,
        text: '\u2022',
        alignment: AlignmentType.LEFT,
        style: {
          paragraph: {
            indent: { left: 720, hanging: 360 },
            alignment: AlignmentType.JUSTIFIED,
            spacing: LINE_SPACING,
          },
          run: { language: ID_LANG, font: FONT, size: SIZE_BODY },
        },
      },
    ],
  }));

  for (const ref of refs.filter((r) => r.endsWith('-num'))) {
    config.push({
      reference: ref,
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: '%1.',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: 720, hanging: 360 },
              alignment: AlignmentType.JUSTIFIED,
              spacing: LINE_SPACING,
            },
            run: { language: ID_LANG, font: FONT, size: SIZE_BODY },
          },
        },
      ],
    });
  }
  return config;
}