import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    Packer,
    PageNumber,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_PATH = path.join(ROOT, 'docs', 'Glosarium_Arumanis_LIDA.docx')

const TABLE_WIDTH = 9380
const COL_TERM = 2200
const COL_PLAIN = 3180
const COL_TECH = 4000
const border = { style: BorderStyle.SINGLE, size: 8, color: '000000' }
const borders = { top: border, bottom: border, left: border, right: border }
const cellMargins = { top: 80, bottom: 80, left: 140, right: 140 }

/** Istilah asing — miring di kolom istilah */
const FOREIGN_TERMS = [
    'Single Sign-On',
    'single source of truth',
    'role-based access',
    'server-side',
    'audit log',
    'real-time',
    'dashboard',
    'monitoring',
    'progress',
    'platform',
    'prototype',
    'broadcast',
    'baseline',
    'snapshot',
    'coverage',
    'pipeline',
    'backend',
    'frontend',
    'upload',
    'online',
    'login',
    'output',
    'input',
    'record',
    'digital',
    'beta',
    'API',
    'SSO',
    'SPA',
    'GPS',
    'CSV',
    'PDF',
    'KPI',
    'gap',
    'deviasi',
    'slot',
    'PostgreSQL',
    'Laravel',
    'React',
    'WhatsApp',
    'Excel',
    'hosting',
    'URL',
    'QR code',
    'web',
    'browser',
    'BFF',
]
const foreignTermPattern = new RegExp(
    `(${FOREIGN_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a, b) => b.length - a.length).join('|')})`,
    'gi',
)

function runsFromText(text, opts = {}) {
    const size = opts.size ?? 22
    const runs = []
    let last = 0
    for (const match of text.matchAll(foreignTermPattern)) {
        if (match.index > last) {
            runs.push(
                new TextRun({
                    text: text.slice(last, match.index),
                    bold: !!opts.bold,
                    size,
                    font: 'Times New Roman',
                }),
            )
        }
        runs.push(
            new TextRun({
                text: match[0],
                bold: !!opts.bold,
                italics: true,
                size,
                font: 'Times New Roman',
            }),
        )
        last = match.index + match[0].length
    }
    if (last < text.length) {
        runs.push(
            new TextRun({
                text: text.slice(last),
                bold: !!opts.bold,
                size,
                font: 'Times New Roman',
            }),
        )
    }
    if (runs.length === 0) {
        runs.push(new TextRun({ text, bold: !!opts.bold, size, font: 'Times New Roman' }))
    }
    return runs
}

function body(text, opts = {}) {
    return new Paragraph({
        spacing: { after: 160, line: 360 },
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
        children: runsFromText(text, opts),
    })
}

function titleLine(text, size = 40) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text, bold: true, size, font: 'Times New Roman' })],
    })
}

function sectionTitle(text) {
    return new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text, bold: true, size: 24, font: 'Times New Roman' })],
    })
}

function headerCell(text, width) {
    return new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: { fill: 'D9E2F3', type: ShadingType.CLEAR },
        margins: cellMargins,
        children: [
            new Paragraph({
                children: runsFromText(text, { bold: true, size: 20 }),
            }),
        ],
    })
}

function dataCell(text, width, shaded = false) {
    return new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: shaded ? { fill: 'F9F9F9', type: ShadingType.CLEAR } : undefined,
        margins: cellMargins,
        children: [
            new Paragraph({
                spacing: { before: 40, after: 40, line: 320 },
                children: runsFromText(text, { size: 20 }),
            }),
        ],
    })
}

/** @type {{ term: string, plain: string, tech: string }[]} */
const GLOSSARY = [
    {
        term: 'Aplikasi Arumanis',
        plain: 'Nama inovasi yang dipakai di proposal utama',
        tech: 'Antarmuka utama di https://arumanis.cianjur.space — ringkasan pekerjaan, data SPAM/sanitasi, peta capaian',
    },
    {
        term: 'api amis',
        plain: 'Pusat penyimpanan dan pemeriksaan data program',
        tech: 'Layanan data di https://apiamis.cianjur.space (Laravel API) yang menerima input operator dan pengawas',
    },
    {
        term: 'Panel Pengawasan',
        plain: 'Fitur pengawasan lapangan terpadu',
        tech: 'Sub-aplikasi terintegrasi (/pengawasan/) untuk laporan mingguan, foto lokasi, dan RAB fisik',
    },
    {
        term: 'Dashboard',
        plain: 'Tampilan ringkasan data program',
        tech: 'Halaman utama yang menampilkan pekerjaan, kontrak, pagu, dan indikator kelengkapan data secara langsung',
    },
    {
        term: 'SSO (Single Sign-On)',
        plain: 'Satu akun untuk dinas dan pengawas',
        tech: 'Pengawas dan operator memakai akun yang sama untuk Arumanis dan Panel Pengawasan tanpa login ulang',
    },
    {
        term: 'Real-time',
        plain: 'Pembaruan data langsung',
        tech: 'Perubahan input lapangan langsung tercermin di ringkasan tanpa menunggu rekapitulasi manual',
    },
    {
        term: 'Monitoring',
        plain: 'Pemantauan',
        tech: 'Proses mengawasi progres fisik, keuangan, dan dokumentasi paket pekerjaan',
    },
    {
        term: 'Platform',
        plain: 'Aplikasi / sistem terpadu',
        tech: 'Ekosistem Arumanis yang menghubungkan data proyek, SPAM, dan sanitasi',
    },
    {
        term: 'Backend',
        plain: 'Pusat data program',
        tech: 'Lapisan server (api amis) yang menyimpan, memvalidasi, dan menyajikan data ke aplikasi',
    },
    {
        term: 'Frontend',
        plain: 'Tampilan pengguna',
        tech: 'Antarmuka web (React SPA) yang diakses melalui browser',
    },
    {
        term: 'React SPA',
        plain: 'Aplikasi web interaktif',
        tech: 'Single Page Application — halaman tidak perlu dimuat ulang penuh saat berpindah menu',
    },
    {
        term: 'Laravel API',
        plain: 'Pengelola data di server',
        tech: 'Kerangka kerja PHP untuk REST API, validasi data, dan hak akses per peran',
    },
    {
        term: 'PostgreSQL',
        plain: 'Basis data terintegrasi',
        tech: 'Sistem basis data relasional tempat disimpan pekerjaan, SPAM, foto, dan capaian SPM',
    },
    {
        term: 'API',
        plain: 'Saluran pertukaran data antar komponen sistem',
        tech: 'Application Programming Interface — kontrak data antara aplikasi dan server',
    },
    {
        term: 'GPS',
        plain: 'Lokasi lapangan pada foto dokumentasi',
        tech: 'Global Positioning System — koordinat lokasi saat foto progres diunggah',
    },
    {
        term: 'Baseline',
        plain: 'Kondisi awal sebelum inovasi',
        tech: 'Nilai pembanding pada indikator keberhasilan (mis. rekapitulasi 5–10 hari)',
    },
    {
        term: 'Snapshot',
        plain: 'Tanggal pengambilan data',
        tech: 'Cuplikan data operasional pada waktu tertentu (mis. 27 Juni 2026)',
    },
    {
        term: 'Record',
        plain: 'Catatan / entri data',
        tech: 'Satu baris data tersimpan (mis. capaian SPAM per unit per tahun)',
    },
    {
        term: 'Deviasi',
        plain: 'Penyimpangan rencana',
        tech: 'Selisih antara rencana dan realisasi progres fisik atau anggaran',
    },
    {
        term: 'KPI',
        plain: 'Indikator kinerja utama',
        tech: 'Key Performance Indicator — ukuran keberhasilan program (kelengkapan laporan, foto, dll.)',
    },
    {
        term: 'Coverage',
        plain: 'Cakupan layanan',
        tech: 'Persentase KK/jiwa terlayani terhadap target SPM',
    },
    {
        term: 'SIMSPAM',
        plain: 'Data unit SPAM tingkat nasional',
        tech: 'Sistem Informasi Manajemen SPAM Kementerian PUPR — 33 unit Cianjur terkait',
    },
    {
        term: 'Bimtek',
        plain: 'Pelatihan dan sosialisasi',
        tech: 'Bimbingan teknis kepada operator, pengawas, dan pengelola desa',
    },
    {
        term: 'docs/user-guide',
        plain: 'Panduan penggunaan',
        tech: 'Dokumentasi langkah demi langkah per peran pengguna di repositori proyek',
    },
    {
        term: 'Hosting',
        plain: 'Penyimpanan aplikasi di server',
        tech: 'Infrastruktur agar arumanis.cianjur.space dapat diakses publik',
    },
    {
        term: 'QR code',
        plain: 'Kode demo cepat',
        tech: 'Kode respon cepat pada versi cetak untuk membuka alamat aplikasi',
    },
    {
        term: 'Server-side validation',
        plain: 'Pemeriksaan data di server',
        tech: 'Validasi server-side — mencegah angka atau format salah masuk basis data',
    },
    {
        term: 'Audit log',
        plain: 'Jejak perubahan data',
        tech: 'Catatan siapa mengubah data dan kapan, untuk akuntabilitas',
    },
    {
        term: 'Role-based access',
        plain: 'Hak akses berbeda per peran',
        tech: 'Operator, pengawas, dan admin hanya melihat menu sesuai tugas dan wilayah',
    },
]

function glossaryTable() {
    const rows = [
        new TableRow({
            children: [
                headerCell('Istilah', COL_TERM),
                headerCell('Padanan di proposal utama', COL_PLAIN),
                headerCell('Penjelasan teknis / operasional', COL_TECH),
            ],
        }),
        ...GLOSSARY.map((row, i) =>
            new TableRow({
                children: [
                    dataCell(row.term, COL_TERM, i % 2 === 0),
                    dataCell(row.plain, COL_PLAIN, i % 2 === 0),
                    dataCell(row.tech, COL_TECH, i % 2 === 0),
                ],
            }),
        ),
    ]
    return new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: [COL_TERM, COL_PLAIN, COL_TECH],
        rows,
    })
}

const doc = new Document({
    styles: {
        default: {
            document: {
                run: { font: 'Times New Roman', size: 22 },
            },
        },
    },
    sections: [
        {
            properties: {
                page: {
                    size: { width: 11906, height: 16838 },
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                },
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ text: 'Glosarium Arumanis — Lampiran LIDA — Hal. ', size: 18 }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                titleLine('GLOSARIUM ISTILAH'),
                titleLine('PROPOSAL LOMBA INOVASI DAERAH', 32),
                titleLine('ARUMANIS — KABUPATEN CIANJUR 2026', 28),
                new Paragraph({ spacing: { after: 240 }, children: [] }),

                sectionTitle('Tujuan dokumen'),
                body(
                    'Dokumen ini merupakan lampiran terpisah dari Proposal Lomba Inovasi Daerah (LIDA). Proposal utama disusun dengan bahasa yang mudah dipahami juri dan masyarakat umum. Glosarium ini menyediakan padanan istilah teknis yang sengaja disederhanakan di badan proposal, beserta penjelasan operasional bagi peninjau yang memerlukan rincian lebih dalam.',
                ),
                body(
                    'Istilah asing atau bukan KBBI ditulis miring. Dokumen ini tidak mengganti proposal utama, melainkan melengkapi Lampiran Administratif.',
                ),

                sectionTitle('Daftar istilah'),
                glossaryTable(),

                new Paragraph({ spacing: { before: 360 }, children: [] }),
                body('Cianjur, 29 Juni 2026', { center: false }),
                new Paragraph({
                    spacing: { before: 480 },
                    indent: { left: 4820 },
                    children: [new TextRun({ text: 'Inisiator,', size: 22, font: 'Times New Roman' })],
                }),
                new Paragraph({
                    indent: { left: 4820 },
                    children: [new TextRun({ text: 'ILHAM TAUFIQ', bold: true, size: 22, font: 'Times New Roman' })],
                }),
            ],
        },
    ],
})

const buffer = await Packer.toBuffer(doc)
try {
    fs.writeFileSync(OUT_PATH, buffer)
    console.log(`✓ Glosarium tersimpan: ${OUT_PATH}`)
} catch (err) {
    if (err.code === 'EBUSY') {
        const alt = OUT_PATH.replace(/\.docx$/, '_baru.docx')
        fs.writeFileSync(alt, buffer)
        console.log(`⚠ File utama terkunci. Disimpan ke: ${alt}`)
    } else {
        throw err
    }
}