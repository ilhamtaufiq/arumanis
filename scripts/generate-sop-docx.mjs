#!/usr/bin/env node
/**
 * Generate SOP Word (.docx) — 65 lembar, selaras dengan SOP-PENGGUNAAN-ARUMANIS.md
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    HeadingLevel,
    HeightRule,
    ImageRun,
    Packer,
    PageBreak,
    PageNumber,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TableLayoutType,
    TextRun,
    VerticalMerge,
    WidthType,
} from 'docx'
import { ALL_SOPS, SOP_KETERANGAN } from './sop-modules-data.mjs'
import { ROW_H, ROW_H_TWIPS, svgToPngBuffer, wordPelaksanaSize } from './sop-flow-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_PATH = path.join(ROOT, 'docs', 'SOP_PENGGUNAAN_ARUMANIS.docx')
const FLOW_DIR = path.join(ROOT, 'docs', 'sop-flow')



const border = { style: BorderStyle.SINGLE, size: 1, color: '000000' }
const borders = { top: border, bottom: border, left: border, right: border }
const cellMargins = { top: 50, bottom: 50, left: 60, right: 60 }

// Proporsi kolom: No | Kegiatan | Admin | Op | Pengawas | Sistem | Persyaratan | Waktu | Output | Ket
const COL_W = [690, 3450, 870, 870, 870, 870, 2140, 1200, 2140, 1958]

function colWidthSum(start, span = 1, widths = COL_W) {
    return widths.slice(start, start + span).reduce((a, b) => a + b, 0)
}

function makeTable(rows, columnWidths = COL_W) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths,
        layout: TableLayoutType.FIXED,
        rows,
    })
}

function cellPara(text, opts = {}) {
    return new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: opts.wrap ? { line: 276 } : undefined,
        children: [
            new TextRun({
                text: String(text ?? ''),
                bold: !!opts.bold,
                size: opts.size ?? 18,
            }),
        ],
    })
}

function mkCell(text, startCol, opts = {}) {
    const colspan = opts.colspan ?? 1
    const widths = opts.colWidths ?? COL_W
    return new TableCell({
        borders,
        columnSpan: colspan,
        verticalMerge: opts.vMerge,
        width: { size: colWidthSum(startCol, colspan, widths), type: WidthType.DXA },
        shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
        margins: cellMargins,
        verticalAlign: opts.top ? 'top' : 'center',
        children: opts.children ?? [cellPara(text, { bold: opts.bold, center: opts.center, size: opts.size, wrap: opts.wrap })],
    })
}

function hdrCell(text, startCol, colspan = 1, vMerge, fill = 'D9E1F2') {
    return mkCell(text, startCol, { colspan, vMerge, fill, bold: true, center: true })
}

function dataCell(text, colIdx, opts = {}) {
    return mkCell(text, colIdx, { colspan: opts.colspan ?? 1, ...opts })
}

function vMergeContinue(startCol, colspan = 1) {
    return mkCell('', startCol, { colspan, vMerge: VerticalMerge.CONTINUE, children: [new Paragraph({ children: [] })] })
}

function flowImageParagraph(sop) {
    const svgPath = path.join(FLOW_DIR, `${sop.slug}.svg`)
    const { w: imgW, h: imgH } = wordPelaksanaSize(sop.steps.length, colWidthSum(2, 4))
    const png = svgToPngBuffer(svgPath, sop.steps.length, imgW, imgH)
    if (!png) {
        return cellPara('(Flowchart: jalankan bun run docs:sop:md)', { size: 16 })
    }
    return new Paragraph({
        spacing: { before: 0, after: 0 },
        alignment: AlignmentType.LEFT,
        indent: { left: 0, right: 0 },
        children: [
            new ImageRun({
                type: 'png',
                data: png,
                transformation: { width: imgW, height: imgH },
                altText: {
                    title: sop.slug,
                    description: `Flowchart ${sop.id}`,
                    name: sop.slug,
                },
            }),
        ],
    })
}

const PENGESAHAN_W = [4750, 4750]

function pengCell(text, col, opts = {}) {
    return new TableCell({
        borders,
        margins: cellMargins,
        columnSpan: opts.colspan ?? 1,
        verticalMerge: opts.vMerge,
        width: { size: PENGESAHAN_W[col], type: WidthType.DXA },
        verticalAlign: opts.top ? 'top' : 'center',
        children: [
            new Paragraph({
                alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
                children: [new TextRun({ text, bold: !!opts.bold, size: opts.size ?? 20 })],
            }),
        ],
    })
}

function pengesahanTable() {
    const block = (title, items) =>
        `${title}\n${items.map((t, i) => `${i + 1}. ${t}`).join('\n')}`

    const leftBlocks = [
        [
            'Dasar Hukum',
            [
                'Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik.',
                'Peraturan Menteri Dalam Negeri Nomor 57 Tahun 2007 tentang Petunjuk Teknis Penataan Organisasi Perangkat Daerah.',
                'Peraturan Bupati Cianjur tentang Standar Pelayanan Minimum Air Minum dan Sanitasi.',
                'Keputusan Kepala Dinas terkait pembentukan SOP operasional sistem informasi ARUMANIS.',
            ],
        ],
        [
            'Kualifikasi Pelaksana',
            [
                'Memahami tugas dan fungsi Bidang Air Minum dan Sanitasi.',
                'Memahami alur kerja aplikasi ARUMANIS (www/bun) dan Panel Pengawasan (www/pengawas).',
                'Admin/Operator: mampu mengelola master data, kontrak, dokumentasi, dan akses.',
                'Pengawas: mampu mengisi foto ber-GPS, progress, laporan mingguan, dan tiket lapangan.',
            ],
        ],
        ['Keterangan', SOP_KETERANGAN],
        [
            'Peralatan / Perlengkapan',
            [
                'Perangkat komputer / laptop / tablet.',
                'Browser Chrome, Firefox, atau Edge versi terbaru.',
                'Koneksi internet stabil.',
                'Akun APIAMIS aktif (email & password).',
                'GPS perangkat (untuk upload foto lapangan).',
                'ATK (bila mencetak dokumentasi foto PDF).',
            ],
        ],
        [
            'Peringatan',
            [
                'Setiap pengguna wajib menjaga kerahasiaan akun dan password.',
                'Data yang diinput harus sesuai kondisi di lapangan; kesalahan menjadi tanggung jawab penginput.',
                'Foto dokumentasi wajib memuat koordinat GPS dalam batas desa pekerjaan.',
                'Progress mingguan wajib diisi sebelum batas waktu yang ditetapkan unit.',
                'Dilarang menambahkan trailer Co-authored-by bot/AI pada commit sistem.',
            ],
        ],
        [
            'Pencatatan dan Pendataan',
            [
                'Database APIAMIS (backend Laravel).',
                'Audit Trail di modul /audit-logs (Arumanis).',
                'Berkas digital di modul Berkas & Drive 3-zona.',
                'Dokumentasi foto slot 0%–100% di Panel Pengawasan.',
                'Tiket dan notifikasi sebagai jejak tindak lanjut.',
            ],
        ],
    ]

    const metaRows = [
        ['Nama SOP', 'SOP Penggunaan Arumanis & Panel Pengawasan'],
        ['Tgl Pembuatan', '1 Juli 2026'],
        ['Tanggal Revisi', '—'],
        ['Tanggal Aktif', '1 Juli 2026'],
        ['Disahkan oleh', 'Kepala Bidang Air Minum dan Sanitasi'],
    ]

    const rows = [
        new TableRow({
            children: [
                pengCell('DINAS PEKERJAAN UMUM DAN TATA RUANG\nKABUPATEN CIANJUR', 0, { center: true }),
                pengCell(`Nama SOP : SOP Penggunaan Arumanis & Panel Pengawasan`, 1),
            ],
        }),
        new TableRow({
            children: [
                pengCell('BIDANG AIR MINUM DAN SANITASI', 0, { center: true, bold: true }),
                pengCell('Tgl Pembuatan : 1 Juli 2026', 1),
            ],
        }),
        new TableRow({
            children: [
                pengCell('SEKSI PERENCANAAN DAN PENGEMBANGAN SISTEM INFORMASI', 0, {
                    center: true,
                    vMerge: VerticalMerge.RESTART,
                }),
                pengCell('Tanggal Revisi : —', 1),
            ],
        }),
        ...metaRows.slice(2).map(([k, v]) =>
            new TableRow({
                children: [
                    pengCell('', 0, { vMerge: VerticalMerge.CONTINUE, children: [new Paragraph({ children: [] })] }),
                    pengCell(`${k} : ${v}`, 1),
                ],
            }),
        ),
        new TableRow({
            children: [
                pengCell('', 0, { vMerge: VerticalMerge.CONTINUE, children: [new Paragraph({ children: [] })] }),
                pengCell('Tanda Tangan dan Stempel\n\n\n\n', 1, { center: true }),
            ],
        }),
        new TableRow({
            children: [
                pengCell('Nama SOP', 0),
                pengCell('SOP PENGGUNAAN APLIKASI ARUMANIS\nDAN PANEL PENGAWASAN', 1, {
                    center: true,
                    bold: true,
                    size: 24,
                }),
            ],
        }),
    ]

    for (let i = 0; i < leftBlocks.length; i += 2) {
        const [t1, items1] = leftBlocks[i]
        const [t2, items2] = leftBlocks[i + 1]
        rows.push(
            new TableRow({
                children: [
                    pengCell(block(t1, items1), 0, { top: true }),
                    pengCell(block(t2, items2), 1, { top: true }),
                ],
            }),
        )
    }

    return makeTable(rows, PENGESAHAN_W)
}

const DAFTAR_W = [620, 1800, 4200, 2400, 2018]

function daftarIsiTable() {
    const di = (text, col, opts = {}) => mkCell(text, col, { ...opts, colWidths: DAFTAR_W })
    const header = ['No', 'Lembar', 'Judul', 'Route', 'Aplikasi']
    const rows = [
        new TableRow({
            children: header.map((h, i) => di(h, i, { bold: true, center: true, fill: 'BDD7EE' })),
        }),
        new TableRow({
            children: [
                di('—', 0, { center: true }),
                di('Halaman Pengesahan', 1),
                di('Metadata & pengesahan SOP', 2),
                di('—', 3, { center: true }),
                di('—', 4, { center: true }),
            ],
        }),
        ...ALL_SOPS.map((s) => {
            const no = String(s.num).padStart(2, '0')
            const title = s.title.replace('PROSEDUR PELAKSANAAN ', '')
            return new TableRow({
                children: [
                    di(no, 0, { center: true }),
                    di(s.id, 1),
                    di(title, 2, { wrap: true }),
                    di(s.route ?? '—', 3),
                    di(s.app, 4),
                ],
            })
        }),
    ]
    return makeTable(rows, DAFTAR_W)
}

function sopTable(sop) {
    const { lampiran, title, steps, route } = sop
    const n = steps.length
    const titleFill = 'BDD7EE'
    const rows = []

    rows.push(
        new TableRow({
            children: [hdrCell(lampiran, 0, 10, undefined, titleFill)],
        }),
    )
    rows.push(
        new TableRow({
            children: [
                new TableCell({
                    borders,
                    columnSpan: 10,
                    margins: cellMargins,
                    children: [
                        cellPara(
                            'Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur',
                            { center: true },
                        ),
                    ],
                }),
            ],
        }),
    )
    rows.push(
        new TableRow({
            children: [
                new TableCell({
                    borders,
                    columnSpan: 10,
                    margins: cellMargins,
                    children: [cellPara('Nomor : ....................................    Tanggal : 1 Juli 2026', { center: true })],
                }),
            ],
        }),
    )
    rows.push(
        new TableRow({
            children: [hdrCell(title, 0, 10, undefined, titleFill)],
        }),
    )

    if (route && route !== '—') {
        rows.push(
            new TableRow({
                children: [
                    new TableCell({
                        borders,
                        columnSpan: 10,
                        margins: cellMargins,
                        children: [cellPara(`Route: ${route}`, { size: 18 })],
                    }),
                ],
            }),
        )
    }

    rows.push(
        new TableRow({
            height: { value: 480, rule: HeightRule.ATLEAST },
            cantSplit: true,
            children: [
                hdrCell('No.', 0, 1, VerticalMerge.RESTART),
                hdrCell('Kegiatan', 1, 1, VerticalMerge.RESTART),
                hdrCell('Pelaksana', 2, 4),
                hdrCell('Mutu Baku', 6, 3),
                hdrCell('Ket', 9, 1, VerticalMerge.RESTART),
            ],
        }),
    )
    rows.push(
        new TableRow({
            height: { value: 400, rule: HeightRule.ATLEAST },
            cantSplit: true,
            children: [
                vMergeContinue(0),
                vMergeContinue(1),
                hdrCell('Admin', 2),
                hdrCell('Operator', 3),
                hdrCell('Pengawas', 4),
                hdrCell('Sistem', 5),
                hdrCell('Persyaratan / Kelengkapan', 6),
                hdrCell('Waktu', 7),
                hdrCell('Output', 8),
                vMergeContinue(9),
            ],
        }),
    )

    const flowPara = flowImageParagraph(sop)

    steps.forEach((step, i) => {
        const pelaksana =
            i === 0
                ? new TableCell({
                      borders,
                      columnSpan: 4,
                      verticalMerge: VerticalMerge.RESTART,
                      width: { size: colWidthSum(2, 4), type: WidthType.DXA },
                      margins: { top: 0, bottom: 0, left: 0, right: 0 },
                      verticalAlign: 'top',
                      children: [flowPara],
                  })
                : vMergeContinue(2, 4)

        rows.push(
            new TableRow({
                height: { value: ROW_H_TWIPS, rule: HeightRule.EXACT },
                cantSplit: true,
                children: [
                    dataCell(step.no, 0, { center: true, top: true }),
                    dataCell(step.kegiatan, 1, { top: true, wrap: true }),
                    pelaksana,
                    dataCell(step.persyaratan ?? step.kategori ?? '', 6, { top: true, wrap: true }),
                    dataCell(step.waktu ?? '', 7, { center: true, top: true }),
                    dataCell(step.output ?? '', 8, { top: true, wrap: true }),
                    dataCell(step.ket ?? '', 9, { top: true, wrap: true }),
                ],
            }),
        )
    })

    return makeTable(rows)
}

function h1(text) {
    return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true })] })
}
function h2(text) {
    return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true })] })
}
function spacer() {
    return new Paragraph({ spacing: { after: 120 }, children: [] })
}

const portraitChildren = [
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: 'STANDAR OPERASIONAL PROSEDUR', bold: true, size: 32 })],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text: 'PENGGUNAAN APLIKASI ARUMANIS', bold: true, size: 36 })],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'dan PANEL PENGAWASAN', bold: true, size: 30 })],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [new TextRun({ text: 'Air Minum & Sanitasi Kabupaten Cianjur', size: 26 })],
    }),
    makeTable(
        [
            ['Versi dokumen', '1.1'],
            ['Tanggal', '1 Juli 2026'],
            ['Platform', 'Arumanis v0.5.0'],
            ['Total SOP', `${ALL_SOPS.length} lembar`],
            ['URL produksi', 'https://arumanis.cianjurkab.go.id'],
            ['Panel pengawasan', 'https://arumanis.cianjurkab.go.id/pengawasan'],
            ['Maintainer', 'ilhamtaufiq'],
        ].map(
            ([k, v]) =>
                new TableRow({
                    children: [
                        mkCell(k, 0, { bold: true, colWidths: [3200, 6300] }),
                        mkCell(v, 1, { colWidths: [3200, 6300] }),
                    ],
                }),
        ),
        [3200, 6300],
    ),
    new Paragraph({ children: [new PageBreak()] }),
    h1('Halaman Pengesahan'),
    pengesahanTable(),
    new Paragraph({ children: [new PageBreak()] }),
    h1('Daftar Isi'),
    daftarIsiTable(),
    new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [
            new TextRun({
                text: 'Legenda: Kotak biru/merah = proses · Belah ketupat hijau = keputusan · Garis biru + panah = alur · Garis putus-putus = loop Tidak',
                italics: true,
                size: 18,
            }),
        ],
    }),
]

const landscapeChildren = []
let currentCategory = ''
for (const sop of ALL_SOPS) {
    if (sop.category && sop.category !== currentCategory) {
        currentCategory = sop.category
        landscapeChildren.push(new Paragraph({ children: [new PageBreak()] }))
        landscapeChildren.push(h2(`Bagian: ${currentCategory}`))
        landscapeChildren.push(spacer())
    } else {
        landscapeChildren.push(new Paragraph({ children: [new PageBreak()] }))
    }
    landscapeChildren.push(h2(sop.id))
    landscapeChildren.push(sopTable(sop))
    landscapeChildren.push(spacer())
}

landscapeChildren.push(new Paragraph({ children: [new PageBreak()] }))
landscapeChildren.push(h1('Lampiran Referensi'))
landscapeChildren.push(
    makeTable(
        [
            ['Panduan modul', 'docs/user-guide/'],
            ['Panel pengawasan', 'docs/user-guide/pengawas-panel.md'],
            ['Flowchart SVG', 'docs/sop-flow/'],
            ['Markdown SOP', 'docs/SOP-PENGGUNAAN-ARUMANIS.md'],
            ['Regenerasi Word', 'bun run docs:sop'],
        ].map(
            ([k, v]) =>
                new TableRow({
                    children: [
                        mkCell(k, 0, { colWidths: [3500, 6000] }),
                        mkCell(v, 1, { colWidths: [3500, 6000] }),
                    ],
                }),
        ),
        [3500, 6000],
    ),
)

const doc = new Document({
    styles: {
        default: { document: { run: { font: 'Arial', size: 22 } } },
        paragraphStyles: [
            {
                id: 'Heading1',
                name: 'Heading 1',
                basedOn: 'Normal',
                next: 'Normal',
                run: { size: 32, bold: true, font: 'Arial' },
                paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 0 },
            },
            {
                id: 'Heading2',
                name: 'Heading 2',
                basedOn: 'Normal',
                next: 'Normal',
                run: { size: 26, bold: true, font: 'Arial' },
                paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 },
            },
        ],
    },
    sections: [
        {
            properties: {
                page: {
                    size: { width: 11906, height: 16838 },
                    margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
                },
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: 'SOP Penggunaan Arumanis & Panel Pengawasan — Halaman ',
                                    size: 18,
                                }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                            ],
                        }),
                    ],
                }),
            },
            children: portraitChildren,
        },
        {
            properties: {
                page: {
                    size: { width: 16838, height: 11906, orientation: 'landscape' },
                    margin: { top: 900, right: 900, bottom: 900, left: 900 },
                },
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: 'SOP Penggunaan Arumanis & Panel Pengawasan — Halaman ',
                                    size: 18,
                                }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                            ],
                        }),
                    ],
                }),
            },
            children: landscapeChildren,
        },
    ],
})

const buffer = await Packer.toBuffer(doc)
try {
    fs.writeFileSync(OUT_PATH, buffer)
    console.log(`✓ SOP Word tersimpan: ${OUT_PATH} (${ALL_SOPS.length} lembar)`)
} catch (err) {
    if (err.code === 'EBUSY') {
        const alt = OUT_PATH.replace(/\.docx$/, '_baru.docx')
        fs.writeFileSync(alt, buffer)
        console.log(`⚠ File terkunci. Disimpan ke: ${alt}`)
    } else {
        throw err
    }
}