#!/usr/bin/env node
/**
 * Generate SOP Word (.docx) — selaras 1:1 dengan docs/SOP-PENGGUNAAN-ARUMANIS.md
 * Struktur: meta → pengesahan → snapshot DB/role → daftar isi → 65 lembar SOP → lampiran
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
import { Resvg } from '@resvg/resvg-js'
import { ALL_SOPS, SOP_KETERANGAN } from './sop-modules-data.mjs'
import { svgToPngBuffer } from './sop-flow-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_PATH = path.join(ROOT, 'docs', 'SOP_PENGGUNAAN_ARUMANIS.docx')
const FLOW_DIR = path.join(ROOT, 'docs', 'sop-flow')
const PNG_DIR = path.join(ROOT, 'docs', 'sop-flow-png')
const LIVE_PATH = path.join(ROOT, 'docs', 'sop-live-data.json')

const DOC_VERSION = '1.3'
const DOC_DATE = '19 Juli 2026'

const border = { style: BorderStyle.SINGLE, size: 1, color: '000000' }
const borders = { top: border, bottom: border, left: border, right: border }
const cellMargins = { top: 30, bottom: 30, left: 40, right: 40 }

// A4 landscape usable ~15758 DXA (margin 540)
// No | Kegiatan | Pelaksana | Persyaratan | Waktu | Output | Ket
const COL_W = [600, 4000, 1500, 3200, 1300, 2500, 2658]
const META_W = [4000, 11758]
const TOC_W = [700, 2800, 6000, 3200, 3058]
const TWO_W = [7879, 7879]
const KV_W = [5000, 10758]
const ROLE_W = [2400, 1600, 1000, 7000, 3758]
const COUNT_W = [10000, 5758]
const DUAL_W = [4000, 5500, 6258]

/** A4 landscape (mm→DXA: 1mm ≈ 56.7) */
const A4_LANDSCAPE = {
    width: 16838, // 297mm
    height: 11906, // 210mm
    orientation: 'landscape',
}
const PAGE_MARGIN = { top: 540, right: 540, bottom: 540, left: 540 }

const COL_LABEL = {
    admin: 'Admin',
    operator: 'Operator',
    pengawas: 'Pengawas',
    sistem: 'Sistem',
}

const CORE_ROLES = [
    {
        name: 'admin',
        group: 'Kantor',
        akses: 'Semua data; bypass route/menu; settings, broadcast, IAM, impersonate',
        app: 'Arumanis',
    },
    {
        name: 'operator',
        group: 'Kantor',
        akses: 'Hampir semua data di portal; kontrak, register dokumen, import/export',
        app: 'Arumanis',
    },
    {
        name: 'pengawas',
        group: 'Lapangan',
        akses: 'Hanya pekerjaan ter-assign (user_pekerjaan); foto GPS, progress, tiket, laporan',
        app: 'Panel Pengawasan',
    },
    {
        name: 'konsultan_pengawas',
        group: 'Lapangan',
        akses: 'Setara pengawas — scope assign; Panel Pengawasan / lapangan',
        app: 'Panel Pengawasan',
    },
    {
        name: 'tfl',
        group: 'Lapangan',
        akses: 'Setara pengawas & konsultan_pengawas — scope assign; Panel Pengawasan',
        app: 'Panel Pengawasan',
    },
    {
        name: 'user',
        group: 'Terbatas',
        akses: 'Assign dan/atau kegiatan_role; view terbatas (bukan full master data)',
        app: 'Arumanis (terbatas)',
    },
]

function loadLive() {
    try {
        return JSON.parse(fs.readFileSync(LIVE_PATH, 'utf8'))
    } catch {
        return null
    }
}

function fmt(n) {
    return Number(n ?? 0).toLocaleString('id-ID')
}

function colWidthSum(start, span = 1, widths = COL_W) {
    return widths.slice(start, start + span).reduce((a, b) => a + b, 0)
}

function makeTable(rows, columnWidths = COL_W) {
    const total = columnWidths.reduce((a, b) => a + b, 0)
    return new Table({
        width: { size: total, type: WidthType.DXA },
        columnWidths,
        layout: TableLayoutType.FIXED,
        rows,
    })
}

function cellPara(text, opts = {}) {
    return new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: opts.wrap ? { line: 240, after: 0, before: 0 } : { after: 0, before: 0 },
        children: [
            new TextRun({
                text: String(text ?? ''),
                bold: !!opts.bold,
                italics: !!opts.italics,
                size: opts.size ?? 15,
                color: opts.color,
            }),
        ],
    })
}

function multiPara(lines, opts = {}) {
    return lines.map((line) =>
        new Paragraph({
            alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { after: 40 },
            children: [
                new TextRun({
                    text: String(line ?? ''),
                    bold: !!opts.bold,
                    size: opts.size ?? 18,
                }),
            ],
        }),
    )
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
        children:
            opts.children ??
            (Array.isArray(text)
                ? multiPara(text, { bold: opts.bold, center: opts.center, size: opts.size })
                : [cellPara(text, { bold: opts.bold, center: opts.center, size: opts.size, wrap: opts.wrap, italics: opts.italics, color: opts.color })]),
    })
}

function hdrCell(text, startCol, colspan = 1, widths = COL_W, fill = 'D9E1F2') {
    return mkCell(text, startCol, { colspan, fill, bold: true, center: true, colWidths: widths, size: 14 })
}

function dataCell(text, colIdx, opts = {}) {
    return mkCell(text, colIdx, { colspan: opts.colspan ?? 1, ...opts })
}

function pelaksanaLabel(step) {
    const col = step.flow?.col ?? 'operator'
    return COL_LABEL[col] ?? col
}

function p(text, opts = {}) {
    return new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: opts.before ?? 0, after: opts.after ?? 80 },
        keepNext: !!opts.keepNext,
        keepLines: !!opts.keepLines,
        children: [
            new TextRun({
                text: String(text ?? ''),
                bold: !!opts.bold,
                italics: !!opts.italics,
                size: opts.size ?? 18,
                color: opts.color,
            }),
        ],
    })
}

function h1(text, opts = {}) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        keepNext: !!opts.keepNext,
        children: [new TextRun({ text, bold: true })],
    })
}

function h2(text, opts = {}) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: opts.before ?? 80, after: opts.after ?? 60 },
        keepNext: opts.keepNext !== false,
        keepLines: true,
        children: [new TextRun({ text, bold: true })],
    })
}

function h3(text, opts = {}) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: opts.before ?? 80, after: opts.after ?? 40 },
        keepNext: opts.keepNext !== false,
        keepLines: true,
        children: [new TextRun({ text, bold: true, size: 18 })],
    })
}

function spacer(after = 60) {
    return new Paragraph({ spacing: { after }, children: [] })
}

function kvTable(pairs, widths = META_W) {
    return makeTable(
        pairs.map(([k, v]) =>
            new TableRow({
                children: [
                    mkCell(k, 0, { bold: true, colWidths: widths }),
                    mkCell(v, 1, { colWidths: widths }),
                ],
            }),
        ),
        widths,
    )
}

function simpleTable(headers, rows, widths) {
    const head = new TableRow({
        children: headers.map((h, i) => hdrCell(h, i, 1, widths, 'BDD7EE')),
    })
    const body = rows.map(
        (row) =>
            new TableRow({
                children: row.map((cell, i) =>
                    mkCell(cell, i, {
                        colWidths: widths,
                        center: i === 0 || (typeof cell === 'string' && /^\d/.test(cell) && cell.length < 8),
                        wrap: true,
                        top: true,
                        size: 16,
                    }),
                ),
            }),
    )
    return makeTable([head, ...body], widths)
}

/* ─── Diagram (PNG pre-render dari docs:sop:md) ─── */

function loadDiagramPng(slug, stepCount) {
    const pngPath = path.join(PNG_DIR, `${slug}.png`)
    if (fs.existsSync(pngPath)) {
        return fs.readFileSync(pngPath)
    }
    const svgPath = path.join(FLOW_DIR, `${slug}.svg`)
    if (!fs.existsSync(svgPath)) return null
    return svgToPngBuffer(svgPath, stepCount, 560, Math.max(140, (stepCount || 4) * 72))
}

function imageParaFromPng(png, opts = {}) {
    if (!png) {
        return p('(Diagram: jalankan bun run docs:sop:md terlebih dahulu)', {
            italics: true,
            size: 14,
            color: '666666',
            after: 40,
            keepNext: opts.keepNext,
        })
    }
    return new Paragraph({
        spacing: { before: opts.before ?? 40, after: opts.after ?? 40 },
        alignment: AlignmentType.CENTER,
        keepNext: !!opts.keepNext,
        keepLines: true,
        children: [
            new ImageRun({
                type: 'png',
                data: png,
                transformation: {
                    width: opts.width ?? 320,
                    height: opts.height ?? 200,
                },
                altText: {
                    title: opts.title ?? 'diagram',
                    description: opts.title ?? 'Diagram alur',
                    name: opts.title ?? 'diagram',
                },
            }),
        ],
    })
}

/** Diagram kompak agar muat satu halaman A4 landscape bersama tabel */
function flowImageParagraph(sop, opts = {}) {
    const png = loadDiagramPng(sop.slug, sop.steps.length)
    const n = sop.steps.length
    // max ~220px tinggi agar sisa ruang untuk tabel
    const h = Math.min(220, Math.max(110, 28 + n * 32))
    const w = Math.min(360, Math.round(h * 1.35))
    return imageParaFromPng(png, {
        width: w,
        height: h,
        title: sop.slug,
        before: 20,
        after: 20,
        keepNext: opts.keepNext,
    })
}

function overviewImage() {
    let png = loadDiagramPng('sop-00-overview-integrasi', 3)
    if (!png) {
        const svgPath = path.join(FLOW_DIR, 'sop-00-overview-integrasi.svg')
        if (fs.existsSync(svgPath)) {
            try {
                const raw = fs.readFileSync(svgPath, 'utf8')
                png = new Resvg(raw, { background: 'white' }).render().asPng()
            } catch {
                png = null
            }
        }
    }
    if (!png) {
        return p('(Overview diagram belum digenerate — jalankan bun run docs:sop:md)', {
            italics: true,
            size: 16,
            color: '666666',
        })
    }
    return imageParaFromPng(png, { width: 560, height: 156, title: 'overview' })
}

/* ─── Halaman pengesahan (sama MD) ─── */

function pengesahanTable() {
    const block = (title, items) => [title, ...items.map((t, i) => `${i + 1}. ${t}`)]

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
                'Pengawas lapangan (role pengawas / konsultan_pengawas / tfl — setara): mampu mengisi foto ber-GPS, progress, laporan mingguan, dan tiket.',
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
                'Database APIAMIS lokal (MySQL) — sumber snapshot operasional SOP.',
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
                mkCell(['DINAS PEKERJAAN UMUM DAN TATA RUANG', 'KABUPATEN CIANJUR'], 0, {
                    center: true,
                    colWidths: TWO_W,
                }),
                mkCell('Nama SOP : SOP Penggunaan Arumanis & Panel Pengawasan', 1, { colWidths: TWO_W }),
            ],
        }),
        new TableRow({
            children: [
                mkCell('BIDANG AIR MINUM DAN SANITASI', 0, { center: true, bold: true, colWidths: TWO_W }),
                mkCell('Tgl Pembuatan : 1 Juli 2026', 1, { colWidths: TWO_W }),
            ],
        }),
        new TableRow({
            children: [
                mkCell('SEKSI PERENCANAAN DAN PENGEMBANGAN SISTEM INFORMASI', 0, {
                    center: true,
                    vMerge: VerticalMerge.RESTART,
                    colWidths: TWO_W,
                }),
                mkCell(`Tanggal Revisi : ${DOC_DATE}`, 1, { colWidths: TWO_W }),
            ],
        }),
        new TableRow({
            children: [
                mkCell('', 0, {
                    vMerge: VerticalMerge.CONTINUE,
                    colWidths: TWO_W,
                    children: [new Paragraph({ children: [] })],
                }),
                mkCell(`Tanggal Aktif : ${DOC_DATE}`, 1, { colWidths: TWO_W }),
            ],
        }),
        new TableRow({
            children: [
                mkCell('', 0, {
                    vMerge: VerticalMerge.CONTINUE,
                    colWidths: TWO_W,
                    children: [new Paragraph({ children: [] })],
                }),
                mkCell('Disahkan oleh : Kepala Bidang Air Minum dan Sanitasi', 1, { colWidths: TWO_W }),
            ],
        }),
        new TableRow({
            children: [
                mkCell('', 0, {
                    vMerge: VerticalMerge.CONTINUE,
                    colWidths: TWO_W,
                    children: [new Paragraph({ children: [] })],
                }),
                mkCell(['Tanda Tangan dan Stempel', '', '', ''], 1, { center: true, colWidths: TWO_W }),
            ],
        }),
        new TableRow({
            children: [
                mkCell('Nama SOP', 0, { colWidths: TWO_W }),
                mkCell(['SOP PENGGUNAAN APLIKASI ARUMANIS', 'DAN PANEL PENGAWASAN'], 1, {
                    center: true,
                    bold: true,
                    size: 22,
                    colWidths: TWO_W,
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
                    mkCell(block(t1, items1), 0, { top: true, size: 15, colWidths: TWO_W }),
                    mkCell(block(t2, items2), 1, { top: true, size: 15, colWidths: TWO_W }),
                ],
            }),
        )
    }

    return makeTable(rows, TWO_W)
}

/* ─── Snapshot (sama MD) ─── */

function snapshotSection(live) {
    const parts = [h1('Snapshot Operasional (Database Lokal)')]

    if (!live) {
        parts.push(
            p('Snapshot belum tersedia. Jalankan: bun run docs:sop:md', {
                italics: true,
                color: '666666',
            }),
        )
        return parts
    }

    const c = live.counts ?? {}
    const byName = live.roles_by_name ?? {}

    parts.push(
        p(
            `Sumber: MySQL apiamis@127.0.0.1 (restore lokal) · Snapshot: ${live.snapshot_at} · Platform v${live.platform}`,
            { italics: true, size: 17, color: '444444', after: 160 },
        ),
    )

    parts.push(h3('Alur Integrasi Sistem'))
    parts.push(overviewImage())

    parts.push(h3('Matriks Role'))
    parts.push(
        p(
            'Kolom Pelaksana di lembar SOP memakai label ringkas: Admin, Operator, Pengawas, Sistem. Pengawas pada SOP mencakup tiga role lapangan yang setara: pengawas, konsultan_pengawas, dan tfl.',
            { size: 17, after: 100 },
        ),
    )

    const roleRows = CORE_ROLES.map((r) => [
        r.name,
        r.group,
        fmt(byName[r.name] ?? 0),
        r.akses,
        r.app,
    ])
    parts.push(
        simpleTable(['Role (DB)', 'Kelompok', 'User', 'Akses data / fungsi', 'Aplikasi utama'], roleRows, ROLE_W),
    )
    parts.push(
        p(
            `Jumlah akun role lapangan (pengawas + konsultan_pengawas + tfl): ${fmt(live.field_role_users ?? 0)} (hitungan unik per role, bisa multi-role)`,
            { size: 16, after: 120 },
        ),
    )

    const otherRoles = (live.roles ?? []).filter((r) => !CORE_ROLES.some((c) => c.name === r.name))
    if (otherRoles.length) {
        parts.push(h3('Role legacy / non-inti'))
        parts.push(
            simpleTable(
                ['Role', 'User', 'Catatan'],
                otherRoles.map((r) => [r.name, fmt(r.users), 'Legacy / tidak dipakai operasional']),
                [4000, 2000, 9000],
            ),
        )
        parts.push(spacer(80))
    }

    if (live.dual_roles?.length) {
        parts.push(h3('User multi-role (dual/triple)'))
        parts.push(
            simpleTable(
                ['Nama', 'Email', 'Roles'],
                live.dual_roles.map((d) => [d.name, d.email, d.roles]),
                DUAL_W,
            ),
        )
        parts.push(
            p(
                'Dual operator + role lapangan: di portal Arumanis data pekerjaan full (operator); di Panel Pengawasan tetap dibatasi assign.',
                { italics: true, size: 16, after: 120 },
            ),
        )
    }

    parts.push(h3('Volume Data Induk'))
    const induk = [
        ['Users', c.users],
        ['Roles', c.roles],
        ['Permissions', c.permissions],
        ['Route permissions', c.route_permissions],
        ['Kegiatan', c.kegiatan],
        ['Pekerjaan', c.pekerjaan],
        ['Draft pekerjaan', c.draft_pekerjaan],
        ['Kontrak', c.kontrak],
        ['Addendum kontrak', c.kontrak_addendum],
        ['Penyedia', c.penyedia],
        ['Output', c.output],
        ['Penerima manfaat', c.penerima],
        ['Pengawas (master NIP)', c.pengawas],
        ['Assign user↔pekerjaan', c.user_pekerjaan],
        ['Kecamatan', c.kecamatan],
        ['Desa', c.desa],
        ['Unit SPAM', c.unit_spam],
        ['SPM Sanitasi', c.spm_sanitasi],
    ]
    parts.push(simpleTable(['Entitas', 'Jumlah'], induk.map(([k, v]) => [k, fmt(v)]), COUNT_W))
    parts.push(spacer(80))

    parts.push(h3('Operasional Lapangan & Pelaporan'))
    const ops = [
        ['Foto dokumentasi', c.foto],
        ['Progress (laporan)', c.progress],
        ['Tiket', c.tiket],
        ['Tiket closed', c.tiket_closed],
        ['Berkas digital', c.berkas],
        ['Progress fisik Puspen', c.puspen_progress_fisik],
        ['Notifikasi', c.notifications],
        ['Audit logs', c.audit_logs],
        ['Publikasi (blog)', c.blog],
        ['Halaman panduan', c.panduan_pages],
    ]
    parts.push(simpleTable(['Entitas', 'Jumlah'], ops.map(([k, v]) => [k, fmt(v)]), COUNT_W))

    return parts
}

/* ─── Daftar isi ─── */

function daftarIsiTable() {
    const rows = [
        ['—', 'Halaman Pengesahan', 'Metadata & pengesahan SOP', '—', '—'],
        ...ALL_SOPS.map((s) => [
            String(s.num).padStart(2, '0'),
            s.id,
            s.title.replace('PROSEDUR PELAKSANAAN ', ''),
            s.route ?? '—',
            s.app,
        ]),
    ]
    return simpleTable(['No', 'Lembar', 'Judul', 'Route', 'Aplikasi'], rows, TOC_W)
}

/* ─── Lembar SOP (sama MD: tabel 7 kolom + diagram di bawah) ─── */

function sopTable(sop) {
    const { lampiran, title, steps, route } = sop
    const titleFill = 'BDD7EE'
    const nCols = COL_W.length
    const rows = []

    rows.push(new TableRow({ children: [hdrCell(lampiran, 0, nCols, COL_W, titleFill)] }))
    rows.push(
        new TableRow({
            children: [
                mkCell(
                    'Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur',
                    0,
                    { colspan: nCols, center: true, size: 16, colWidths: COL_W },
                ),
            ],
        }),
    )
    rows.push(
        new TableRow({
            children: [
                mkCell(`Nomor : ....................................    Tanggal : ${DOC_DATE}`, 0, {
                    colspan: nCols,
                    center: true,
                    size: 16,
                    colWidths: COL_W,
                }),
            ],
        }),
    )
    rows.push(new TableRow({ children: [hdrCell(title, 0, nCols, COL_W, titleFill)] }))

    if (route && route !== '—') {
        rows.push(
            new TableRow({
                children: [
                    mkCell(`Route: ${route}`, 0, { colspan: nCols, size: 17, colWidths: COL_W }),
                ],
            }),
        )
    }

    rows.push(
        new TableRow({
            height: { value: 280, rule: HeightRule.ATLEAST },
            cantSplit: true,
            tableHeader: true,
            children: [
                hdrCell('No.', 0),
                hdrCell('Kegiatan', 1),
                hdrCell('Pelaksana', 2),
                hdrCell('Persyaratan / Kelengkapan', 3),
                hdrCell('Waktu', 4),
                hdrCell('Output', 5),
                hdrCell('Ket', 6),
            ],
        }),
    )

    // Baris kompak agar tabel + diagram muat 1 halaman landscape
    const rowH = steps.length >= 6 ? 320 : steps.length >= 5 ? 360 : 400
    for (const step of steps) {
        rows.push(
            new TableRow({
                height: { value: rowH, rule: HeightRule.ATLEAST },
                cantSplit: true,
                children: [
                    dataCell(step.no, 0, { center: true, top: true, size: 14 }),
                    dataCell(step.kegiatan, 1, { top: true, wrap: true, size: 14 }),
                    dataCell(pelaksanaLabel(step), 2, { center: true, top: true, size: 14 }),
                    dataCell(step.persyaratan ?? step.kategori ?? '', 3, { top: true, wrap: true, size: 14 }),
                    dataCell(step.waktu ?? '', 4, { center: true, top: true, size: 14 }),
                    dataCell(step.output ?? '', 5, { top: true, wrap: true, size: 14 }),
                    dataCell(step.ket ?? '', 6, { top: true, wrap: true, size: 14 }),
                ],
            }),
        )
    }

    return makeTable(rows)
}

/**
 * Satu lembar SOP: judul + tabel + diagram (tidak dipisah halaman).
 * keepNext mengikat judul→tabel→label diagram→gambar.
 */
function sopSection(sop) {
    return [
        h2(sop.id, { before: 0, after: 40, keepNext: true }),
        // tabel — baris cantSplit; Word tetap bisa memecah antar-baris, tapi kita padat
        sopTable(sop),
        h3('Diagram Alur', { before: 60, after: 20, keepNext: true }),
        flowImageParagraph(sop),
    ]
}

/* ─── Build document ─── */

const live = loadLive()
const platform = live?.platform ?? '0.8.0'

const metaPairs = [
    ['Versi dokumen', DOC_VERSION],
    ['Tanggal', DOC_DATE],
    ['Platform', `Arumanis v${platform}`],
    ['Total SOP', `${ALL_SOPS.length} lembar`],
    ['Sumber data', 'MySQL lokal apiamis (restore)'],
    ['Snapshot', live?.snapshot_at ?? '—'],
    ['Markdown', 'docs/SOP-PENGGUNAAN-ARUMANIS.md'],
    ['Live JSON', 'docs/sop-live-data.json'],
    ['Regenerasi', 'bun run docs:sop'],
    ['Role lapangan', 'pengawas = konsultan_pengawas = tfl (setara)'],
]

// Seluruh dokumen: A4 landscape
const children = [
    p('STANDAR OPERASIONAL PROSEDUR', { center: true, bold: true, size: 28, after: 40 }),
    p('PENGGUNAAN APLIKASI ARUMANIS dan PANEL PENGAWASAN', { center: true, bold: true, size: 26, after: 40 }),
    p('Air Minum & Sanitasi Kabupaten Cianjur · A4 Landscape', { center: true, size: 18, after: 120 }),
    p(
        'Format: pengesahan + snapshot DB + daftar isi + 65 lembar SOP (tabel + diagram satu halaman). Role lapangan setara: pengawas, konsultan_pengawas, tfl.',
        { size: 15, italics: true, after: 120 },
    ),
    kvTable(metaPairs, META_W),
    new Paragraph({ children: [new PageBreak()] }),
    h1('Halaman Pengesahan'),
    pengesahanTable(),
    new Paragraph({ children: [new PageBreak()] }),
    ...snapshotSection(live),
    new Paragraph({ children: [new PageBreak()] }),
    h1('Daftar Isi'),
    daftarIsiTable(),
    spacer(80),
    p(
        'Legenda diagram: biru = proses · merah = aksi utama · hijau belah ketupat = keputusan · panah putus-putus = Tidak/loop',
        { italics: true, size: 14, after: 40 },
    ),
    p(
        'Legenda pelaksana: Admin · Operator · Pengawas (= pengawas / konsultan_pengawas / tfl) · Sistem',
        { italics: true, size: 14, after: 60 },
    ),
]

let currentCategory = ''
for (const sop of ALL_SOPS) {
    // Setiap SOP mulai halaman baru; tabel + diagram tetap di halaman yang sama
    children.push(new Paragraph({ children: [new PageBreak()] }))
    if (sop.category && sop.category !== currentCategory) {
        currentCategory = sop.category
        children.push(
            p(`Bagian: ${currentCategory}`, {
                bold: true,
                size: 16,
                after: 40,
                keepNext: true,
                color: '2F5597',
            }),
        )
    }
    children.push(...sopSection(sop))
}

children.push(new Paragraph({ children: [new PageBreak()] }))
children.push(h1('Lampiran Referensi'))
children.push(
    kvTable(
        [
            ['Panduan modul', 'docs/user-guide/'],
            ['Panel pengawasan', 'docs/user-guide/pengawas-panel.md'],
            ['Diagram alur', 'docs/sop-flow-png/ · docs/sop-flow/'],
            ['Snapshot DB', 'docs/sop-live-data.json'],
            ['Markdown SOP', 'docs/SOP-PENGGUNAAN-ARUMANIS.md'],
            ['Regenerasi Markdown + DB', 'bun run docs:sop:md'],
            ['Regenerasi Word', 'bun run docs:sop'],
            ['Regenerasi Excel', 'bun run docs:sop:xlsx'],
        ],
        KV_W,
    ),
)
children.push(spacer(80))
children.push(
    p(
        `${ALL_SOPS.length} SOP · A4 landscape · tabel + diagram satu halaman · role lapangan setara: pengawas, konsultan_pengawas, tfl.`,
        { italics: true, size: 14, color: '555555' },
    ),
)

function footer() {
    return new Footer({
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: 'SOP Penggunaan Arumanis & Panel Pengawasan — Halaman ',
                        size: 16,
                    }),
                    new TextRun({ children: [PageNumber.CURRENT], size: 16 }),
                ],
            }),
        ],
    })
}

const doc = new Document({
    styles: {
        default: { document: { run: { font: 'Arial', size: 18 } } },
        paragraphStyles: [
            {
                id: 'Heading1',
                name: 'Heading 1',
                basedOn: 'Normal',
                next: 'Normal',
                run: { size: 26, bold: true, font: 'Arial' },
                paragraph: { spacing: { before: 120, after: 80 }, outlineLevel: 0 },
            },
            {
                id: 'Heading2',
                name: 'Heading 2',
                basedOn: 'Normal',
                next: 'Normal',
                run: { size: 20, bold: true, font: 'Arial' },
                paragraph: {
                    spacing: { before: 40, after: 40 },
                    outlineLevel: 1,
                },
            },
            {
                id: 'Heading3',
                name: 'Heading 3',
                basedOn: 'Normal',
                next: 'Normal',
                run: { size: 17, bold: true, font: 'Arial' },
                paragraph: {
                    spacing: { before: 40, after: 20 },
                    outlineLevel: 2,
                },
            },
        ],
    },
    sections: [
        {
            properties: {
                page: {
                    size: {
                        width: A4_LANDSCAPE.width,
                        height: A4_LANDSCAPE.height,
                        orientation: 'landscape',
                    },
                    margin: PAGE_MARGIN,
                },
            },
            footers: { default: footer() },
            children,
        },
    ],
})

const buffer = await Packer.toBuffer(doc)
try {
    fs.writeFileSync(OUT_PATH, buffer)
    console.log(`✓ SOP Word tersimpan: ${OUT_PATH} (${ALL_SOPS.length} lembar) — A4 landscape, tabel+diagram 1 halaman`)
} catch (err) {
    if (err.code === 'EBUSY' || err.code === 'EPERM') {
        const alt = OUT_PATH.replace(/\.docx$/, `-${Date.now()}.docx`)
        fs.writeFileSync(alt, buffer)
        console.warn(`⚠ File terkunci. Disimpan ke: ${alt}`)
    } else {
        throw err
    }
}
