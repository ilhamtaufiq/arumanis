#!/usr/bin/env node
/**
 * Generate SOP Word (.docx) — 65 lembar, selaras dengan SOP-PENGGUNAAN-ARUMANIS.md
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    HeadingLevel,
    ImageRun,
    LevelFormat,
    Packer,
    PageBreak,
    PageNumber,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    VerticalMerge,
    WidthType,
} from 'docx'
import { ALL_SOPS, SOP_KETERANGAN } from './sop-modules-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_PATH = path.join(ROOT, 'docs', 'SOP_PENGGUNAAN_ARUMANIS.docx')
const FLOW_DIR = path.join(ROOT, 'docs', 'sop-flow')

const ROW_H = 78
const FLOW_W = 320

const border = { style: BorderStyle.SINGLE, size: 1, color: '000000' }
const borders = { top: border, bottom: border, left: border, right: border }
const cellMargins = { top: 60, bottom: 60, left: 80, right: 80 }

const COL_W = [420, 2100, 520, 520, 520, 520, 1280, 720, 1280, 1146]

function cellPara(text, opts = {}) {
    return new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
            new TextRun({
                text: String(text ?? ''),
                bold: !!opts.bold,
                size: opts.size ?? 18,
            }),
        ],
    })
}

function hdrCell(text, colspan = 1, rowspan = 1, fill = 'D9E1F2') {
    return new TableCell({
        borders,
        columnSpan: colspan,
        rowSpan: rowspan,
        width: { size: colspan === 1 ? COL_W[0] : COL_W.slice(0, colspan).reduce((a, b) => a + b, 0), type: WidthType.DXA },
        shading: { fill, type: ShadingType.CLEAR },
        margins: cellMargins,
        verticalAlign: 'center',
        children: [cellPara(text, { bold: true, center: true })],
    })
}

function dataCell(text, colIdx, opts = {}) {
    return new TableCell({
        borders,
        columnSpan: opts.colspan ?? 1,
        rowSpan: opts.rowspan ?? 1,
        verticalMerge: opts.vMerge,
        width: { size: COL_W[colIdx] ?? 1000, type: WidthType.DXA },
        margins: cellMargins,
        verticalAlign: opts.top ? 'top' : 'center',
        children: opts.children ?? [cellPara(text, { center: opts.center, size: opts.size })],
    })
}

function svgToPng(svgPath) {
    if (!fs.existsSync(svgPath)) return null
    const svg = fs.readFileSync(svgPath, 'utf8')
    const fixed = svg.replace(/width="100%"/, `width="${FLOW_W}"`)
    const resvg = new Resvg(fixed, {
        fitTo: { mode: 'width', value: FLOW_W * 2 },
        background: 'white',
    })
    return resvg.render().asPng()
}

function flowImageParagraph(sop) {
    const svgPath = path.join(FLOW_DIR, `${sop.slug}.svg`)
    const png = svgToPng(svgPath)
    if (!png) {
        return cellPara('(Flowchart: jalankan bun run docs:sop:md)', { size: 16 })
    }
    const h = sop.steps.length * ROW_H
    const imgW = 220
    const imgH = Math.round((h / FLOW_W) * imgW)
    return new Paragraph({
        alignment: AlignmentType.CENTER,
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

function pengesahanTable() {
    const thin = (text, opts = {}) =>
        new TableCell({
            borders,
            margins: cellMargins,
            columnSpan: opts.colspan ?? 1,
            rowSpan: opts.rowspan ?? 1,
            width: { size: 4500, type: WidthType.DXA },
            children: [
                new Paragraph({
                    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
                    children: [new TextRun({ text, bold: !!opts.bold, size: opts.size ?? 20 })],
                }),
            ],
        })

    const meta = (label, value) =>
        new TableRow({
            children: [
                thin(label, { bold: true }),
                thin(`: ${value}`),
            ],
        })

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

    const rows = [
        new TableRow({
            children: [
                thin('DINAS PEKERJAAN UMUM DAN TATA RUANG\nKABUPATEN CIANJUR', { center: true }),
                new TableCell({
                    borders,
                    margins: cellMargins,
                    children: [
                        new Table({
                            width: { size: 4500, type: WidthType.DXA },
                            rows: [meta('Nama SOP', 'SOP Penggunaan Arumanis & Panel Pengawasan')],
                        }),
                    ],
                }),
            ],
        }),
        new TableRow({
            children: [
                thin('BIDANG AIR MINUM DAN SANITASI', { center: true, bold: true }),
                new TableCell({
                    borders,
                    margins: cellMargins,
                    children: [
                        new Table({
                            width: { size: 4500, type: WidthType.DXA },
                            rows: [meta('Tgl Pembuatan', '1 Juli 2026')],
                        }),
                    ],
                }),
            ],
        }),
        new TableRow({
            children: [
                thin('SEKSI PERENCANAAN DAN PENGEMBANGAN SISTEM INFORMASI', {
                    center: true,
                    rowspan: 4,
                }),
                new TableCell({
                    borders,
                    margins: cellMargins,
                    children: [
                        new Table({
                            width: { size: 4500, type: WidthType.DXA },
                            rows: [meta('Tanggal Revisi', '—')],
                        }),
                    ],
                }),
            ],
        }),
        new TableRow({
            children: [
                new TableCell({
                    borders,
                    margins: cellMargins,
                    children: [
                        new Table({
                            width: { size: 4500, type: WidthType.DXA },
                            rows: [meta('Tanggal Aktif', '1 Juli 2026')],
                        }),
                    ],
                }),
            ],
        }),
        new TableRow({
            children: [
                new TableCell({
                    borders,
                    margins: cellMargins,
                    children: [
                        new Table({
                            width: { size: 4500, type: WidthType.DXA },
                            rows: [meta('Disahkan oleh', 'Kepala Bidang Air Minum dan Sanitasi')],
                        }),
                    ],
                }),
            ],
        }),
        new TableRow({
            children: [
                thin('Tanda Tangan dan Stempel\n\n\n\n', { center: true }),
            ],
        }),
        new TableRow({
            children: [thin('Nama SOP'), thin('SOP PENGGUNAAN APLIKASI ARUMANIS\nDAN PANEL PENGAWASAN', { center: true, bold: true, size: 24 })],
        }),
    ]

    for (let i = 0; i < leftBlocks.length; i += 2) {
        const [t1, items1] = leftBlocks[i]
        const [t2, items2] = leftBlocks[i + 1]
        rows.push(
            new TableRow({
                children: [
                    thin(block(t1, items1)),
                    thin(block(t2, items2)),
                ],
            }),
        )
    }

    return new Table({
        width: { size: 9500, type: WidthType.DXA },
        rows,
    })
}

function daftarIsiTable() {
    const header = ['No', 'Lembar', 'Judul', 'Route', 'Aplikasi']
    const rows = [
        new TableRow({
            children: header.map((h, i) => hdrCell(h, 1, 1, 'BDD7EE')),
        }),
        new TableRow({
            children: [
                dataCell('—', 0, { center: true }),
                dataCell('Halaman Pengesahan', 1),
                dataCell('Metadata & pengesahan SOP', 2),
                dataCell('—', 3, { center: true }),
                dataCell('—', 4, { center: true }),
            ],
        }),
        ...ALL_SOPS.map((s) => {
            const no = String(s.num).padStart(2, '0')
            const title = s.title.replace('PROSEDUR PELAKSANAAN ', '')
            return new TableRow({
                children: [
                    dataCell(no, 0, { center: true }),
                    dataCell(s.id, 1),
                    dataCell(title, 2),
                    dataCell(s.route ?? '—', 3),
                    dataCell(s.app, 4),
                ],
            })
        }),
    ]
    return new Table({
        width: { size: 9500, type: WidthType.DXA },
        columnWidths: [600, 1600, 3600, 2000, 1700],
        rows,
    })
}

function sopTable(sop) {
    const { lampiran, title, steps, route } = sop
    const n = steps.length
    const titleFill = 'BDD7EE'
    const rows = []

    rows.push(
        new TableRow({
            children: [hdrCell(lampiran, 10, 1, titleFill)],
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
            children: [hdrCell(title, 10, 1, titleFill)],
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
            children: [
                hdrCell('No.', 1, 2),
                hdrCell('Kegiatan', 1, 2),
                hdrCell('Pelaksana', 4, 1),
                hdrCell('Mutu Baku', 3, 1),
                hdrCell('Ket', 1, 2),
            ],
        }),
    )
    rows.push(
        new TableRow({
            children: [
                hdrCell('Admin', 1, 1),
                hdrCell('Operator', 1, 1),
                hdrCell('Pengawas', 1, 1),
                hdrCell('Sistem', 1, 1),
                hdrCell('Persyaratan / Kelengkapan', 1, 1),
                hdrCell('Waktu', 1, 1),
                hdrCell('Output', 1, 1),
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
                      rowSpan: n,
                      verticalMerge: VerticalMerge.RESTART,
                      margins: cellMargins,
                      children: [flowPara],
                  })
                : new TableCell({
                      borders,
                      columnSpan: 4,
                      verticalMerge: VerticalMerge.CONTINUE,
                      children: [new Paragraph({ children: [] })],
                  })

        rows.push(
            new TableRow({
                children: [
                    dataCell(step.no, 0, { center: true, top: true }),
                    dataCell(step.kegiatan, 1, { top: true }),
                    pelaksana,
                    dataCell(step.persyaratan ?? step.kategori ?? '', 6, { top: true }),
                    dataCell(step.waktu ?? '', 7, { center: true, top: true }),
                    dataCell(step.output ?? '', 8, { top: true }),
                    dataCell(step.ket ?? '', 9, { top: true }),
                ],
            }),
        )
    })

    return new Table({
        width: { size: COL_W.reduce((a, b) => a + b, 0), type: WidthType.DXA },
        columnWidths: COL_W,
        rows,
    })
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
    new Table({
        width: { size: 9500, type: WidthType.DXA },
        columnWidths: [3200, 6300],
        rows: [
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
                        new TableCell({
                            borders,
                            margins: cellMargins,
                            children: [cellPara(k, { bold: true })],
                        }),
                        new TableCell({
                            borders,
                            margins: cellMargins,
                            children: [cellPara(v)],
                        }),
                    ],
                }),
        ),
    }),
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
    new Table({
        width: { size: 9500, type: WidthType.DXA },
        columnWidths: [3500, 6000],
        rows: [
            ['Panduan modul', 'docs/user-guide/'],
            ['Panel pengawasan', 'docs/user-guide/pengawas-panel.md'],
            ['Flowchart SVG', 'docs/sop-flow/'],
            ['Markdown SOP', 'docs/SOP-PENGGUNAAN-ARUMANIS.md'],
            ['Regenerasi Word', 'bun run docs:sop'],
        ].map(
            ([k, v]) =>
                new TableRow({
                    children: [
                        new TableCell({ borders, margins: cellMargins, children: [cellPara(k)] }),
                        new TableCell({ borders, margins: cellMargins, children: [cellPara(v)] }),
                    ],
                }),
        ),
    }),
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