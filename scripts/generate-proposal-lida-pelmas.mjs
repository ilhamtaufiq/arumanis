import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    ImageRun,
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
const DATA_PATH = path.join(ROOT, 'docs', 'proposal-live-data.json')
const OUT_PATH = path.join(ROOT, 'docs', 'Proposal_Inovasi_Arumanis_LIDA_PELMAS.docx')
const SCREENSHOTS_DIR = path.join(ROOT, 'docs', 'screenshots')
const IMG_WIDTH = 480

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8').replace(/^\uFEFF/, ''))
const spam = data.spam
const san = data.sanitasi
const dash = data.dashboard
const pengawas = data.pengawas
const scope = data.dataScope ?? {}
const achYears = data.achievementPerTahun ?? []
const pekerjaanYears = data.pekerjaanPerTahun ?? []
const studiKasus = data.studiKasus ?? {}
const chartData = data.chartData ?? {}
const fetched = new Date(data.fetchedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})

const fmtNum = (n) => new Intl.NumberFormat('id-ID').format(Math.round(Number(n) || 0))
const fmtPct = (n) => `${Number(n).toFixed(2).replace('.', ',')}%`
const fmtMilyar = (n) => {
    const v = Number(n) / 1_000_000_000
    return `Rp ${v.toFixed(2).replace('.', ',')} miliar`
}
const fmtRp = (n) => `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(Number(n) || 0))}`

const earliestYear = scope.earliestAchievementYear ?? achYears[0]?.tahun ?? '2017'
const syncStart = scope.syncStartYear ?? 2017
const SPM = 'Standar Pelayanan Minimum (SPM)'
/** Narasi untuk juri — hindari istilah teknis di badan proposal */
const APLIKASI = 'aplikasi Arumanis'
const FITUR_PENGAWASAN = 'fitur pengawasan lapangan terpadu'
const RINGKASAN_DATA = 'tampilan ringkasan data program'
const anggaranAirMinum = Number(spam.capaian_nilai_kontrak) || 0
const anggaranSanitasi = Number(san.total_investasi) || 0
const anggaranPekerjaan = Number(dash.totalPaguPekerjaan) || 0
const anggaranPengawasan = Number(pengawas.total_pagu) || 0
const gapAirMinumKk = Math.max(0, Number(spam.total_target) - Number(spam.capaian_kk))
const gapSanitasiKk = Math.max(0, Number(san.target_kk) - Number(san.total_pemanfaat_kk))

const achNarrative = achYears
    .map(
        (r) =>
            `tahun ${r.tahun} (${fmtNum(r.records)} record, ${fmtNum(r.units)} unit, ${fmtNum(r.kk)} KK / ${fmtNum(r.jiwa)} jiwa)`,
    )
    .join('; ')

const pekerjaanAktif = pekerjaanYears.filter((r) => r.pekerjaan > 0)
const pekerjaanNarrative = pekerjaanAktif
    .map(
        (r) =>
            `${r.tahun}: ${fmtNum(r.pekerjaan)} pekerjaan, ${fmtNum(r.kontrak)} kontrak, pagu ${fmtMilyar(r.paguPekerjaan)}`,
    )
    .join('; ')

const disclaimerSinkronisasi =
    'Catatan metodologi data: angka dalam proposal ini bersumber dari data operasional Arumanis per tanggal pengambilan data, telah diverifikasi operator data, dan masih dalam proses harmonisasi arsip multi-sumber sejak 2017. Capaian kuantitatif bersifat progresif seiring penyempurnaan data.'

/** Istilah asing / bukan KBBI — ditampilkan miring di dokumen */
const FOREIGN_TERMS = [
    'single source of truth',
    'role-based access',
    'Sustainability Plan',
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
    'WhatsApp',
    'PostgreSQL',
    'Excel',
    'Laravel',
    'React',
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
                    italics: !!opts.italics,
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
                italics: !!opts.italics,
                size,
                font: 'Times New Roman',
            }),
        )
    }
    if (runs.length === 0) {
        runs.push(
            new TextRun({
                text,
                bold: !!opts.bold,
                italics: !!opts.italics,
                size,
                font: 'Times New Roman',
            }),
        )
    }
    return runs
}

const TABLE_WIDTH = 9380
const COL_LABEL = 3109
const COL_VALUE = 6271
const border = { style: BorderStyle.SINGLE, size: 8, color: '000000' }
const borders = { top: border, bottom: border, left: border, right: border }
const cellMargins = { top: 80, bottom: 80, left: 140, right: 140 }

function body(text, opts = {}) {
    return new Paragraph({
        spacing: { after: 160, line: 360 },
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
        indent: opts.indent ? { left: opts.indent } : undefined,
        children: runsFromText(text, opts),
    })
}

function bagian1(text) {
    return new Paragraph({
        style: 'bagian1',
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text, bold: true, size: 24, font: 'Times New Roman' })],
    })
}

function bagian2(text) {
    return new Paragraph({
        style: 'bagian2',
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text, bold: true, size: 22, font: 'Times New Roman' })],
    })
}

function bagian3(text) {
    return new Paragraph({
        style: 'bagian3',
        spacing: { before: 160, after: 60 },
        children: [new TextRun({ text, bold: true, size: 22, font: 'Times New Roman' })],
    })
}

function titleLine(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text, bold: true, size: 40, font: 'Times New Roman' })],
    })
}

function labelCell(text, shaded = false) {
    return new TableCell({
        borders,
        width: { size: COL_LABEL, type: WidthType.DXA },
        shading: shaded ? { fill: 'F2F2F2', type: ShadingType.CLEAR } : undefined,
        margins: cellMargins,
        children: [
            new Paragraph({
                spacing: { before: 40, after: 40, line: 360 },
                children: [new TextRun({ text, bold: true, size: 22, font: 'Times New Roman' })],
            }),
        ],
    })
}

function valueCell(lines) {
    const items = Array.isArray(lines) ? lines : [lines]
    return new TableCell({
        borders,
        width: { size: COL_VALUE, type: WidthType.DXA },
        margins: cellMargins,
        children: items.map(
            (line) =>
                new Paragraph({
                    spacing: { before: 40, after: 40, line: 360 },
                    children: [new TextRun({ text: line, size: 22, font: 'Times New Roman' })],
                }),
        ),
    })
}

function identityRow(label, value, shaded = false) {
    return new TableRow({
        children: [labelCell(label, shaded), valueCell(value)],
    })
}

function identityTable() {
    return new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: [COL_LABEL, COL_VALUE],
        rows: [
            identityRow('Nama Inovasi', 'Arumanis – Air Minum dan Sanitasi', true),
            identityRow('Tahapan Inovasi', ['( ) Inisiatif', '( ) Uji Coba', '(x) Diterapkan']),
            identityRow('Inisiator Inovasi', ['(x) Masyarakat Umum', '( ) Pelajar'], true),
            identityRow('Nama Inisiator', 'Ilham Taufiq'),
            identityRow(
                'Profil Inisiator',
                'Warga Kabupaten Cianjur; pengembang utama Arumanis. DPKP Kab. Cianjur berperan sebagai mitra adopsi dan pengguna operasional.',
                true,
            ),
            identityRow('Jenis Inovasi', ['(x) Digital', '( ) Non-Digital']),
            identityRow('Titik Koordinat', '-6.82478266796685, 107.13908061164075'),
            identityRow('Bidang inovasi', 'Bidang Air Minum dan Sanitasi', true),
            identityRow('Tanggal Uji Coba', 'Januari 2024'),
            identityRow('Tanggal Diterapkan', 'Januari 2025', true),
            identityRow('Tanggal Pengembangan', 'Januari 2026 – Desember 2027'),
        ],
    })
}

function tableHeaderCell(text, width) {
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

function tableDataCell(text, width) {
    return new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        margins: cellMargins,
        children: [
            new Paragraph({
                children: runsFromText(text, { size: 20 }),
            }),
        ],
    })
}

function barCell(value, max, totalWidth, color, label) {
    const pct = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 6
    const filled = Math.round((totalWidth * pct) / 100)
    const empty = Math.max(200, totalWidth - filled)
    return new TableCell({
        borders,
        width: { size: totalWidth, type: WidthType.DXA },
        margins: cellMargins,
        children: [
            new Table({
                width: { size: totalWidth, type: WidthType.DXA },
                columnWidths: [filled, empty],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                shading: { fill: color, type: ShadingType.CLEAR },
                                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: label,
                                                size: 18,
                                                bold: true,
                                                color: 'FFFFFF',
                                                font: 'Times New Roman',
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new TableCell({ children: [new Paragraph({ children: [] })] }),
                        ],
                    }),
                ],
            }),
        ],
    })
}

function horizontalBarChart(title, items, labelHeader = 'Kategori') {
    const labelW = 2800
    const barW = 6580
    const max = Math.max(...items.map((i) => i.value), 1)
    return [
        bagian3(title),
        new Table({
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
            columnWidths: [labelW, barW],
            rows: [
                new TableRow({
                    children: [tableHeaderCell(labelHeader, labelW), tableHeaderCell('Distribusi', barW)],
                }),
                ...items.map(
                    (item) =>
                        new TableRow({
                            children: [
                                tableDataCell(item.label, labelW),
                                barCell(item.value, max, barW, item.color ?? '4472C4', item.display ?? fmtNum(item.value)),
                            ],
                        }),
                ),
            ],
        }),
        new Paragraph({ spacing: { after: 160 }, children: [] }),
    ]
}

function beforeAfterChart(title, items) {
    const labelW = 3000
    const beforeW = 1100
    const afterW = 1100
    const visualW = 4180
    return [
        bagian3(title),
        new Table({
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
            columnWidths: [labelW, beforeW, afterW, visualW],
            rows: [
                new TableRow({
                    children: [
                        tableHeaderCell('Indikator', labelW),
                        tableHeaderCell('Sebelum', beforeW),
                        tableHeaderCell('Sesudah', afterW),
                        tableHeaderCell('Perbandingan visual', visualW),
                    ],
                }),
                ...items.map((item) => {
                    const max = Math.max(item.sebelum, item.sesudah, 1)
                    const half = Math.floor(visualW / 2) - 40
                    return new TableRow({
                        children: [
                            tableDataCell(item.indikator, labelW),
                            tableDataCell(fmtNum(item.sebelum), beforeW),
                            tableDataCell(fmtNum(item.sesudah), afterW),
                            new TableCell({
                                borders,
                                width: { size: visualW, type: WidthType.DXA },
                                margins: cellMargins,
                                children: [
                                    new Table({
                                        width: { size: visualW, type: WidthType.DXA },
                                        columnWidths: [half, half],
                                        rows: [
                                            new TableRow({
                                                children: [
                                                    barCell(
                                                        item.sebelum,
                                                        max,
                                                        half,
                                                        'A6A6A6',
                                                        String(item.sebelum).replace('.', ','),
                                                    ),
                                                    barCell(
                                                        item.sesudah,
                                                        max,
                                                        half,
                                                        '2E75B6',
                                                        String(item.sesudah).replace('.', ','),
                                                    ),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    })
                }),
            ],
        }),
        new Paragraph({ spacing: { after: 160 }, children: [] }),
    ]
}

function studiKasusBlocks() {
    const blocks = []
    const air = studiKasus.air_minum
    const kasusSanitasi = studiKasus.sanitasi

    blocks.push(
        body(
            'Studi kasus berikut bersumber dari data operasional Arumanis terbaru (bukan ilustrasi). Dua paket dipilih sebagai contoh pemantauan konstruksi air minum dan sanitasi dengan dokumentasi lapangan terbanyak.',
        ),
    )

    if (air) {
        blocks.push(bagian3('Kasus 1 — Pembangunan SPAM Jaringan Perpipaan'))
        blocks.push(
            body(
                `Paket #${air.id}: ${air.nama_paket}, Desa ${air.desa}, Kecamatan ${air.kecamatan}. Sub-kegiatan: ${air.sub_kegiatan}. Tahun anggaran ${air.tahun_anggaran}, sumber dana ${air.sumber_dana}, pagu ${fmtRp(air.pagu)}${air.kontrak ? `, kontrak ${fmtRp(air.kontrak.nilai_kontrak)} (${air.kontrak.penyedia}, SPK ${air.kontrak.spk})` : ''}.`,
                { indent: 360 },
            ),
        )
        blocks.push(
            body(
                `Sebelum Arumanis: laporan progres dan foto kerja dikirim terpisah (Excel/WhatsApp) tanpa arsip terpusat. Sesudah Arumanis: tercatat ${fmtNum(air.foto_count)} foto dokumentasi terarsip${air.pengawas ? `, pengawas ${air.pengawas} melaporkan melalui ${FITUR_PENGAWASAN}` : ''}. Operator dinas memantau paket ini di ${APLIKASI} bersama ${fmtNum(dash.totalPekerjaan)} pekerjaan lainnya.`,
                { indent: 360 },
            ),
        )
    }

    if (kasusSanitasi) {
        blocks.push(bagian3('Kasus 2 — Pembangunan SPALD/Tangki Septik Perdesaan'))
        blocks.push(
            body(
                `Paket #${kasusSanitasi.id}: ${kasusSanitasi.nama_paket}. Lokasi Desa ${kasusSanitasi.desa}, Kecamatan ${kasusSanitasi.kecamatan}. Tahun anggaran ${kasusSanitasi.tahun_anggaran}, sumber dana ${kasusSanitasi.sumber_dana}, pagu ${fmtRp(kasusSanitasi.pagu)}${kasusSanitasi.kontrak ? `, kontrak ${fmtRp(kasusSanitasi.kontrak.nilai_kontrak)} (${kasusSanitasi.kontrak.penyedia})` : ''}.`,
                { indent: 360 },
            ),
        )
        blocks.push(
            body(
                `Sebelum Arumanis: dokumentasi ratusan titik pembangunan sulit dilacak per desa. Sesudah Arumanis: ${fmtNum(kasusSanitasi.foto_count)} foto dokumentasi terpetakan pada satu paket pekerjaan, ${fmtNum(kasusSanitasi.penerima_count)} penerima manfaat tercatat, dan progres dapat ditelusuri per sub-kegiatan sanitasi—menunjukkan skala adopsi sistem untuk program berbasis masyarakat.`,
                { indent: 360 },
            ),
        )
    }

    return blocks
}

function teknologiTable() {
    const cols = [2200, 2400, 4780]
    const rows = [
        ['Lapisan', 'Teknologi', 'Fungsi dalam Arumanis'],
        [
            'Antarmuka pengguna',
            'React (SPA)',
            'Tampilan ringkasan pekerjaan, data SPAM/sanitasi, peta capaian, dan fitur pengawasan—responsif di komputer maupun telepon genggam',
        ],
        [
            'Layanan data',
            'Laravel REST API',
            'Validasi input, manajemen pengguna, penyimpanan pekerjaan/kontrak/foto, perhitungan capaian SPM, dan integrasi modul',
        ],
        ['Basis data', 'PostgreSQL', 'Penyimpanan terstruktur data program lintas 365 desa dengan relasi antar tabel'],
        [
            'Infrastruktur',
            'Server produksi + HTTPS',
            'Menyediakan aplikasi dan API agar dapat diakses pengguna internal dan halaman informasi publik',
        ],
        [
            'Autentikasi',
            'SSO (Single Sign-On)',
            'Satu akun untuk operator dinas dan pengawas lapangan di Arumanis dan Panel Pengawasan',
        ],
    ]
    return new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: cols,
        rows: rows.map((row, i) =>
            new TableRow({
                children: row.map((cell, j) =>
                    i === 0 ? tableHeaderCell(cell, cols[j]) : tableDataCell(cell, cols[j]),
                ),
            }),
        ),
    })
}

function sumberDanaNarrative() {
    const items = chartData.sumberDana ?? dash.kegiatanPerSumberDana ?? []
    if (items.length === 0) return 'APBD dan transfer pemerintah pusat (DAK/DAU)'
    return items.map((r) => `${r.name} (${fmtNum(r.value)} kegiatan)`).join(', ')
}

function sumberDayaPendukungBlocks() {
    const blocks = []
    blocks.push(
        body(
            'Ketersediaan sumber daya pendukung implementasi inovasi Arumanis diuraikan sesuai ketujuh komponen berikut. Data anggaran program mengacu pada snapshot operasional per ' +
                fetched +
                '.',
        ),
    )

    blocks.push(bagian3('(1) Anggaran'))
    blocks.push(
        body(
            'Sumber anggaran program yang terpetakan dalam Arumanis bersumber dari APBD Kabupaten Cianjur dan transfer pemerintah pusat, dengan rincian kegiatan: ' +
                sumberDanaNarrative() +
                '. Nilai program terintegrasi: air minum ' +
                fmtMilyar(anggaranAirMinum) +
                ', sanitasi ' +
                fmtMilyar(anggaranSanitasi) +
                ', pekerjaan konstruksi ' +
                fmtMilyar(anggaranPekerjaan) +
                ' (' +
                fmtNum(dash.totalKontrak) +
                ' kontrak), pengawasan ' +
                fmtMilyar(anggaranPengawasan) +
                '. Total pagu kegiatan tercatat ' +
                fmtMilyar(Number(dash.totalPagu)) +
                ' pada ' +
                fmtNum(dash.totalKegiatan) +
                ' kegiatan aktif.',
            { indent: 360 },
        ),
    )
    blocks.push(
        body(
            'Pengembangan dan pengoperasian aplikasi Arumanis didukung kombinasi: (a) kontribusi inisiator dan tim pengembang pada tahap perancangan–uji coba (2023–2024); (b) adopsi operasional oleh DPKP Kabupaten Cianjur sejak 2025 melalui anggaran program air minum dan sanitasi; (c) infrastruktur server dan jasa pendukung aplikasi. Tidak memerlukan hibah terpisah untuk kelangsungan operasional harian karena terintegrasi dengan program dinas.',
            { indent: 360 },
        ),
    )

    blocks.push(bagian3('(2) Sumber Daya Manusia'))
    blocks.push(
        body(
            'Tim penyelenggara terdiri atas: (a) Inisiator/koordinator inovasi (Ilham Taufiq)—perancang aplikasi dan koordinasi adopsi; (b) Koordinator program DPKP—penanggung jawab kebijakan dan evaluasi capaian; (c) Operator data (2–4 orang)—kompetensi input dan validasi data SPAM, SPM, pekerjaan, serta kontrak; (d) Tim pengembang (5–7 personil inti)—kompetensi pemeliharaan aplikasi, integrasi data, dan dukungan teknis; (e) Pengawas lapangan (' +
                fmtNum(pengawas.total_pengawas) +
                ' orang di ' +
                fmtNum(pengawas.total_lokasi) +
                ' lokasi)—kompetensi pemantauan progres fisik, dokumentasi foto, dan laporan mingguan; (f) Konsultan/TFL dan kontraktor pelaksana—pelaksanaan fisik dan pengawasan kontrak (' +
                fmtNum(dash.totalKontrak) +
                ' kontrak).',
            { indent: 360 },
        ),
    )

    blocks.push(bagian3('(3) Sarana dan Prasarana'))
    blocks.push(
        body(
            'Perangkat keras: komputer dan jaringan internet di kantor DPKP untuk operator; telepon genggam pengawas lapangan untuk dokumentasi pekerjaan; infrastruktur server produksi untuk menyimpan data program. Perangkat lunak: aplikasi Arumanis diakses melalui peramban pada perangkat yang tersedia—tanpa instalasi khusus di setiap laptop. Infrastruktur pendukung: koneksi internet di kantor dinas dan lokasi lapangan, serta penyimpanan data terpusat agar seluruh unit kerja memakai sumber data yang sama.',
            { indent: 360 },
        ),
    )

    blocks.push(bagian3('(4) Teknologi yang Digunakan'))
    blocks.push(
        body(
            'Arumanis dibangun sebagai inovasi digital berbasis web dengan arsitektur tiga lapisan: (a) antarmuka pengguna (frontend) untuk operator dinas, pengawas lapangan, dan masyarakat; (b) layanan data (backend/API) untuk validasi, penyimpanan, dan integrasi modul; (c) basis data terpusat untuk menjamin satu sumber kebenaran data program air minum dan sanitasi.',
            { indent: 360 },
        ),
    )
    blocks.push(teknologiTable())
    blocks.push(new Paragraph({ spacing: { after: 160 }, children: [] }))
    blocks.push(
        body(
            'Aplikasi diakses melalui peramban web pada https://arumanis.cianjur.space. Layanan data berjalan pada https://apiamis.cianjur.space. Panel Pengawasan Terintegrasi (/pengawasan/) menjadi subsistem khusus pengawas lapangan dengan Single Sign-On (SSO)—pengawas cukup satu akun untuk mengisi progres mingguan, mengunggah foto berkoordinat GPS, dan menyusun laporan RAB tanpa berpindah sistem.',
            { indent: 360 },
        ),
    )
    blocks.push(
        body(
            'Fitur teknologi pendukung implementasi: validasi data di sisi server untuk mencegah kesalahan input; hak akses berbeda per peran dan wilayah kerja; unggah dan pengarsipan foto dokumentasi proyek; ekspor laporan PDF/Excel; peta capaian SPM interaktif untuk akses publik; integrasi data SIMSPAM (' +
                fmtNum(spam.simspam_count) +
                ' unit); serta penandaan tingkat kelengkapan data. Keamanan akses menggunakan autentikasi berbasis sesi melalui koneksi terenkripsi (HTTPS).',
            { indent: 360 },
        ),
    )
    blocks.push(
        body(
            'Kapasitas teknologi saat ini mendukung pemantauan ' +
                fmtNum(dash.totalPekerjaan) +
                ' pekerjaan, ' +
                fmtNum(spam.total_units) +
                ' unit SPAM, ' +
                fmtNum(san.total_count) +
                ' infrastruktur sanitasi, dan ' +
                fmtNum(spam.total_foto_dokumentasi) +
                ' foto dokumentasi. Istilah teknis tambahan dijelaskan pada Glosarium (Lampiran 4).',
            { indent: 360 },
        ),
    )

    blocks.push(bagian3('(5) Bimbingan Teknis (Bimtek) dan Sosialisasi'))
    blocks.push(
        body(
            'Kegiatan bimtek dan sosialisasi dilaksanakan secara berkala: (a) sosialisasi internal operator data saat uji coba 2024; (b) orientasi pengawas lapangan untuk penggunaan fitur pengawasan dan unggah dokumentasi; (c) pendampingan pengelola desa/POKMAS terkait pemahaman capaian SPM; (d) refresher triwulanan bagi operator untuk validasi data dan penanganan kendala input. Materi disesuaikan peran pengguna agar adopsi aplikasi berkelanjutan.',
            { indent: 360 },
        ),
    )

    blocks.push(bagian3('(6) Pedoman Teknis'))
    blocks.push(
        body(
            'Pedoman teknis tersedia dalam bentuk panduan penggunaan langkah demi langkah untuk operator, pengawas, dan pengelola data SPAM/sanitasi—meliputi alur input data, unggah foto, penyusunan laporan, serta pembacaan peta capaian. Panduan disimpan dalam dokumentasi aplikasi dan dapat diperbarui seiring penambahan fitur. Glosarium istilah (Lampiran 4) melengkapi pemahaman istilah operasional.',
            { indent: 360 },
        ),
    )

    blocks.push(bagian3('(7) Kemudahan Akses Informasi Inovasi'))
    blocks.push(
        body(
            'Masyarakat dapat mengakses informasi capaian SPM air minum dan sanitasi per desa melalui halaman peta publik tanpa pendaftaran dan tanpa harus datang ke kantor dinas. Penyelenggara program mengakses ringkasan data melalui aplikasi Arumanis dengan hak akses sesuai peran. Alamat aplikasi dan QR demo tercantum pada Lampiran 3; glosarium pada Lampiran 4. Bukti visual implementasi dilampirkan pada Lampiran Bukti Visual.',
            { indent: 360 },
        ),
    )

    return blocks
}

function statistikBlocks() {
    const blocks = [bagian2('Statistik dan Visualisasi Data')]
    blocks.push(
        body(
            'Visualisasi berikut disusun dari data operasional Arumanis untuk memperjelas tren pelaksanaan dan dampak sistem. Diagram batang disajikan dalam format tabel agar tetap terbaca pada dokumen cetak.',
        ),
    )

    const tahunItems = (chartData.pekerjaanPerTahun ?? []).map((r) => ({
        label: `Tahun ${r.tahun}`,
        value: r.pekerjaan,
        display: `${fmtNum(r.pekerjaan)} paket`,
        color: '2E75B6',
    }))
    if (tahunItems.length > 0) {
        blocks.push(...horizontalBarChart('Grafik 1. Tren pekerjaan konstruksi per tahun anggaran', tahunItems, 'Tahun'))
    }

    const kecItems = (chartData.topKecamatan ?? []).map((r, i) => ({
        label: r.name,
        value: r.value,
        display: `${fmtNum(r.value)} paket`,
        color: ['4472C4', '5B9BD5', '70AD47', 'ED7D31', 'A5A5A5'][i] ?? '4472C4',
    }))
    if (kecItems.length > 0) {
        blocks.push(...horizontalBarChart('Grafik 2. Lima kecamatan dengan pekerjaan terbanyak', kecItems, 'Kecamatan'))
    }

    const danaItems = (chartData.sumberDana ?? []).map((r) => ({
        label: r.name,
        value: r.value,
        display: `${fmtNum(r.value)} kegiatan`,
        color: '548235',
    }))
    if (danaItems.length > 0) {
        blocks.push(...horizontalBarChart('Grafik 3. Kegiatan per sumber dana', danaItems, 'Sumber dana'))
    }

    const dampak = chartData.dampakSistem ?? []
    if (dampak.length > 0) {
        blocks.push(...beforeAfterChart('Grafik 4. Perbandingan dampak sistem (sebelum vs sesudah Arumanis)', dampak))
    }

    blocks.push(
        body(
            `Ringkasan angka kunci per ${fetched}: ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(dash.totalKontrak)} kontrak senilai ${fmtMilyar(dash.totalNilaiKontrak)}, ${fmtNum(spam.total_foto_dokumentasi)} foto dokumentasi, ${fmtNum(pengawas.total_pengawas)} pengawas aktif di ${fmtNum(pengawas.total_lokasi)} lokasi.`,
        ),
    )

    return blocks
}

function timelineTable() {
    const cols = [2200, 1600, 2200, 3380]
    const rows = [
        ['Tahapan', 'Durasi', 'Penanggung Jawab', 'Output'],
        ['Persiapan & perancangan sistem', '2023', 'Tim pengembang Arumanis', 'Rancangan aplikasi, fitur inti, uji konsep awal'],
        ['Uji coba internal & pilot lapangan', '2024', 'Tim pengembang + operator data', 'Uji coba fitur pengawasan lapangan, pengisian data awal'],
        ['Implementasi penuh produksi', '2025 – sekarang', 'DPKP + pengawas + operator', `${fmtNum(dash.totalPekerjaan)} pekerjaan terpantau, ${fmtNum(pengawas.total_pengawas)} pengawas aktif`],
        ['Harmonisasi data historis', `${syncStart} – 2025`, 'Operator data + tim pendukung', `${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} catatan capaian SPAM terhimpun`],
        ['Pemantauan & evaluasi berkelanjutan', 'Berkelanjutan', 'Operator + koordinator program', 'Ringkasan data terkini, laporan SPM, informasi terbuka masyarakat'],
    ]
    return new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: cols,
        rows: rows.map((row, i) =>
            new TableRow({
                children: row.map((cell, j) =>
                    i === 0 ? tableHeaderCell(cell, cols[j]) : tableDataCell(cell, cols[j]),
                ),
            }),
        ),
    })
}

function indicatorTable() {
    const cols = [2400, 1400, 1400, 2180, 2000]
    const rows = [
        ['Indikator', 'Kondisi awal', 'Target', 'Sumber data', 'Frekuensi'],
        [
            'Paket konstruksi SPAM/sanitasi terpantau',
            '0 (manual/terpisah)',
            `${fmtNum(dash.totalPekerjaan)} paket`,
            'Aplikasi Arumanis',
            'Mingguan',
        ],
        [
            `Coverage ${SPM} air minum`,
            'Rekapitulasi manual 5–10 hari',
            `${fmtPct(spam.coverage_percentage)} (${fmtNum(spam.capaian_kk)} KK)`,
            'Data capaian SPAM',
            'Bulanan',
        ],
        [
            `Coverage ${SPM} sanitasi`,
            'Data tidak terintegrasi',
            `${fmtPct(san.coverage_kk_percentage)} (${fmtNum(san.total_pemanfaat_kk)} KK)`,
            'Data sanitasi + peta publik',
            'Bulanan',
        ],
        [
            'Dokumentasi foto progres ber-GPS',
            'Foto tersebar di gawai pengawas',
            `≥90% paket aktif (kondisi awal ${fmtNum(spam.total_foto_dokumentasi)} foto)`,
            'Fitur pengawasan lapangan',
            'Mingguan',
        ],
        [
            'Interval laporan pengawas',
            '2–4 minggu (manual)',
            'Mingguan terstruktur',
            'Fitur pengawasan + statistik kelengkapan',
            'Mingguan',
        ],
        [
            'Akses publik capaian per desa',
            'Hanya jam kerja kantor',
            '365 desa via peta publik tanpa pendaftaran',
            'Aplikasi Arumanis',
            'Langsung (otomatis)',
        ],
    ]
    return new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: cols,
        rows: rows.map((row, i) =>
            new TableRow({
                children: row.map((cell, j) =>
                    i === 0 ? tableHeaderCell(cell, cols[j]) : tableDataCell(cell, cols[j]),
                ),
            }),
        ),
    })
}

const SCREENSHOTS = [
    { file: 'dashboard.png', caption: 'Gambar 1. Tampilan ringkasan pemantauan pekerjaan konstruksi air minum dan sanitasi.' },
    { file: 'capaian-air-minum.png', caption: 'Gambar 2. Peta capaian SPM air minum per desa.' },
    { file: 'capaian-sanitasi.png', caption: 'Gambar 3. Peta capaian SPM sanitasi per desa.' },
    { file: 'pengawas.png', caption: 'Gambar 4. Fitur pengawasan lapangan untuk input progres dan dokumentasi pekerjaan.' },
    { file: 'sign-in.png', caption: 'Gambar 5. Satu akun untuk akses dinas dan pengawasan lapangan.' },
]

function screenshotBlocks() {
    const blocks = []
    for (const shot of SCREENSHOTS) {
        const filePath = path.join(SCREENSHOTS_DIR, shot.file)
        if (!fs.existsSync(filePath)) continue
        blocks.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 60 },
                children: [
                    new ImageRun({
                        type: 'png',
                        data: fs.readFileSync(filePath),
                        transformation: { width: IMG_WIDTH, height: Math.round(IMG_WIDTH * 0.56) },
                        altText: { title: shot.caption, description: shot.caption, name: shot.caption },
                    }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [new TextRun({ text: shot.caption, italics: true, size: 20 })],
            }),
        )
    }
    return blocks
}

const doc = new Document({
    styles: {
        default: {
            document: {
                run: { font: 'Times New Roman', size: 22 },
            },
        },
        paragraphStyles: [
            {
                id: 'bagian1',
                name: 'bagian1',
                basedOn: 'Normal',
                next: 'Normal',
                run: { size: 24, bold: true, font: 'Times New Roman' },
                paragraph: { spacing: { before: 240, after: 120 } },
            },
            {
                id: 'bagian2',
                name: 'bagian2',
                basedOn: 'Normal',
                next: 'Normal',
                run: { size: 22, bold: true, font: 'Times New Roman' },
                paragraph: { spacing: { before: 200, after: 80 } },
            },
            {
                id: 'bagian3',
                name: 'bagian3',
                basedOn: 'bagian2',
                next: 'Normal',
                run: { size: 22, bold: true, font: 'Times New Roman' },
                paragraph: { spacing: { before: 160, after: 60 }, indent: { left: 360 } },
            },
        ],
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
                                new TextRun({ text: 'Proposal Lomba Inovasi Daerah — Arumanis — Hal. ', size: 18 }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                titleLine('PROPOSAL LOMBA INOVASI DAERAH'),
                titleLine('KABUPATEN CIANJUR'),
                titleLine('TAHUN 2026'),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: 'KATEGORI MASYARAKAT UMUM DAN PELAJAR/MAHASISWA',
                            size: 32,
                            highlight: 'yellow',
                        }),
                    ],
                }),

                bagian1('RINGKASAN EKSEKUTIF'),
                body(
                    'Arumanis (Air Minum dan Sanitasi) adalah inovasi digital inisiatif masyarakat yang dikembangkan Ilham Taufiq dan diadopsi Dinas Perumahan dan Kawasan Permukiman (DPKP) Kabupaten Cianjur untuk memantau konstruksi SPAM perdesaan serta sanitasi—khususnya pengelolaan air limbah—di 33 kecamatan dan 365 desa.',
                ),
                body(
                    `Permasalahan: data progres fisik, keuangan, dan dokumentasi lapangan tersebar (Excel, PDF, WhatsApp, berkas fisik) sehingga deviasi proyek terdeteksi terlambat dan rekapitulasi ${SPM} memakan 5–10 hari kerja.`,
                ),
                body(
                    `Solusi: satu aplikasi terintegrasi dengan fitur pengawasan lapangan, peta capaian per desa, dan pembaruan data secara langsung. Bukti adopsi per ${fetched}: ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(pengawas.total_pengawas)} pengawas aktif, ${fmtNum(spam.total_foto_dokumentasi)} foto dokumentasi, ${fmtNum(spam.total_units)} unit SPAM terdata digital.`,
                ),
                body(
                    `Dampak sistem (bukan capaian infrastruktur fisik): rekapitulasi ${SPM} kurang dari 1 hari (dari 5–10 hari), laporan pengawas mingguan terstruktur, masyarakat dapat cek capaian desa kapan saja. Capaian layanan fisik ${SPM} air minum ${fmtPct(spam.coverage_percentage)} dan sanitasi ${fmtPct(san.coverage_kk_percentage)} mencerminkan kondisi wilayah—Arumanis memetakan kekurangan layanan agar intervensi prioritas dapat ditargetkan.`,
                ),
                body('Alamat aplikasi dan QR demo tercantum pada Lampiran Administratif.', { center: true }),
                new Paragraph({ spacing: { after: 280 }, children: [] }),

                bagian1('BAGIAN I :  IDENTITAS INOVASI'),
                identityTable(),
                new Paragraph({ spacing: { after: 200 }, children: [] }),

                bagian1('BAGIAN II :  RANCANG BANGUN INOVASI'),

                bagian2('Catatan Metodologi Data'),
                body(disclaimerSinkronisasi),

                bagian2('Dasar Hukum'),
                body(
                    'Inovasi Arumanis berlandaskan Undang-Undang Nomor 17 Tahun 2019 tentang Sumber Daya Air; Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah; Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik; Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik; serta Undang-Undang Nomor 18 Tahun 2008 tentang Pengelolaan Sampah (kaitan sanitasi lingkungan).',
                ),
                body(
                    'Bidang air minum: Peraturan Pemerintah Nomor 16 Tahun 2005 tentang Pengembangan Sistem Penyediaan Air Minum; Permen PUPR Nomor 18/PRT/M/2007 tentang Pedoman Pengembangan SPAM; Permen PU Nomor 20 Tahun 2006 tentang Persyaratan Teknis Pengembangan SPAM. Bidang sanitasi: Permen PUPR Nomor 14/PRT/M/2014 tentang Penyediaan Air Minum dan Sanitasi Berbasis Masyarakat (PAMSIMAS); Permenkes Nomor 2 Tahun 2023 tentang Standar Pelayanan Minimum Bidang Kesehatan; Permen PUPR Nomor 27/PRT/M/2018 tentang Persyaratan Teknis Pengolahan Air Limbah Domestik.',
                ),
                body(
                    'Tata kelola digital: Permendagri Nomor 59 Tahun 2016 tentang Penerapan SPBE; Permendagri Nomor 108 Tahun 2016 tentang Pedoman Evaluasi SPBE. Tingkat daerah: Perda Kab. Cianjur Nomor 14 Tahun 2021 (Perumdam Tirta Mukti); Perda Nomor 1 Tahun 2021 (penyertaan modal); Perda Nomor 18 Tahun 2021 (susunan perangkat daerah); Perbup Nomor 102 Tahun 2021 (tugas-fungsi DPKP); Perbup Nomor 23 Tahun 2020 (RAD PAMSIMAS 2019–2023); RPJMD 2025–2029; Kajian RISPAM Kabupaten Cianjur.',
                ),

                bagian2('Konteks dan Latar Belakang'),
                body(
                    'Inti inovasi Arumanis adalah aplikasi pemantauan pelaksanaan pekerjaan konstruksi infrastruktur SPAM perdesaan serta pekerjaan sanitasi, khususnya pada bidang pengelolaan air limbah (SPALD-T, SPALD-S, IPLT, dan infrastruktur terkait). Pekerjaan tersebar di 33 kecamatan dan 365 desa/kelurahan Kabupaten Cianjur, dengan pelaksana yang melibatkan dinas, pengawas lapangan, konsultan, kontraktor, dan pengelola desa.',
                ),
                body(
                    'Sebelum Arumanis, pemantauan progres fisik, keuangan, dan dokumentasi lapangan banyak dilakukan secara manual. Laporan konstruksi SPAM dan sanitasi kerap dikirim melalui berkas Excel, dokumen cetak, atau pesan instan tanpa arsip terpusat. Penyimpangan pekerjaan—misalnya keterlambatan progres fisik, ketidaksesuaian hasil, atau kekurangan dokumentasi—baru terdeteksi setelah periode pelaporan berakhir.',
                ),
                body(
                    `Di luar fungsi pemantauan konstruksi, Arumanis menyajikan rekapitulasi capaian ${SPM}, peta per desa, laporan siap unduh, statistik pengawas, dan informasi terbuka bagi masyarakat—diperbarui langsung tanpa menunggu rekap manual. Data terhimpun dari berbagai sumber sejak ${syncStart}; jejak capaian SPAM tertua tahun ${earliestYear} dari arsip historis.`,
                ),

                bagian2('Dampak Sistem versus Capaian Layanan Fisik'),
                body(
                    'Penting dibedakan: (A) capaian layanan fisik air minum dan sanitasi di wilayah—bergantung pada pembangunan infrastruktur dan anggaran jangka panjang; serta (B) capaian sistem Arumanis—kemampuan memantau, merekapitulasi, dan mempublikasikan data secara terukur. Penilaian inovasi LIDA mengacu pada (B), sementara angka (A) menjadi dasar perencanaan intervensi.',
                ),
                body(
                    `Capaian layanan fisik ${SPM} per ${fetched}: air minum ${fmtNum(spam.capaian_kk)} KK / ${fmtNum(spam.capaian_jiwa)} jiwa (${fmtPct(spam.coverage_percentage)} dari target ${fmtNum(spam.total_target)} KK); sanitasi ${fmtNum(san.total_pemanfaat_kk)} KK / ${fmtNum(san.total_pemanfaat_jiwa)} jiwa (${fmtPct(san.coverage_kk_percentage)} dari target ${fmtNum(san.target_kk)} KK).`,
                ),
                body(
                    `Capaian sistem Arumanis per ${fetched}: ${fmtNum(dash.totalPekerjaan)} paket pekerjaan terpantau, rekapitulasi ${SPM} kurang dari 1 hari (sebelumnya 5–10 hari), ${fmtNum(pengawas.total_pengawas)} pengawas aktif dengan laporan mingguan terstruktur, ${fmtNum(spam.total_foto_dokumentasi)} foto dokumentasi terarsip, ${fmtNum(spam.total_units)} unit SPAM terdata digital, peta capaian 365 desa dapat diakses masyarakat tanpa pendaftaran.`,
                ),
                body(
                    `Inventaris terintegrasi: ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(spam.total_units)} unit SPAM, ${fmtNum(san.total_count)} infrastruktur sanitasi. Urgensi gap layanan fisik: ${fmtNum(gapAirMinumKk)} KK belum terlayani air minum; ${fmtNum(gapSanitasiKk)} KK belum memanfaatkan sanitasi layak; ${fmtNum(san.desa_without_infrastruktur)} desa belum berinfrastruktur terpetakan.`,
                ),
                body(
                    `Peta anggaran terhimpun: air minum ${fmtMilyar(anggaranAirMinum)}, sanitasi ${fmtMilyar(anggaranSanitasi)}, pekerjaan ${fmtMilyar(anggaranPekerjaan)} (${fmtNum(dash.totalKontrak)} kontrak), pengawasan ${fmtMilyar(anggaranPengawasan)}.`,
                ),

                bagian2('Rekapitulasi Data Terhimpun'),
                body(
                    `Arumanis telah menghimpun data operasional dari berbagai sumber. Proses sinkronisasi resmi dimulai sejak ${syncStart}, namun impor capaian unit SPAM memuat jejak historis hingga tahun ${earliestYear}.`,
                ),
                body(
                    achYears.length > 0
                        ? `Capaian SPAM per tahun: ${achNarrative}.`
                        : `Tercatat ${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} record capaian SPAM.`,
                ),
                body(
                    pekerjaanAktif.length > 0
                        ? `Pemantauan pekerjaan konstruksi per tahun anggaran: ${pekerjaanNarrative}. Total kumulatif: ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(dash.totalOutput)} hasil fisik, ${fmtNum(dash.totalPenerima)} penerima manfaat, pagu ${fmtMilyar(dash.totalPaguPekerjaan)}.`
                        : `Total kumulatif pekerjaan: ${fmtNum(dash.totalPekerjaan)} paket, ${fmtNum(dash.totalKontrak)} kontrak, pagu ${fmtMilyar(dash.totalPaguPekerjaan)}.`,
                ),

                ...statistikBlocks(),

                bagian2('Permasalahan'),
                body(
                    'Permasalahan makro: Kabupaten Cianjur dengan ' +
                        fmtNum(san.total_penduduk) +
                        ' jiwa penduduk di 33 kecamatan dan 365 desa masih menghadapi gap besar akses air minum layak dan sanitasi. Per ' +
                        fetched +
                        ', capaian ' +
                        SPM +
                        ' air minum ' +
                        fmtPct(spam.coverage_percentage) +
                        ' (' +
                        fmtNum(gapAirMinumKk) +
                        ' KK belum terlayani) dan sanitasi ' +
                        fmtPct(san.coverage_kk_percentage) +
                        ' (' +
                        fmtNum(san.desa_without_infrastruktur) +
                        ' desa belum berinfrastruktur terpetakan).',
                ),
                body(
                    'Permasalahan mikro: pemantauan progres fisik, keuangan, dan dokumentasi lapangan dilakukan manual melalui Excel, PDF, WhatsApp, dan berkas fisik tanpa jejak terpusat. Rekapitulasi capaian SPM lintas 365 desa memakan 5–10 hari kerja. Data historis sejak ' +
                        syncStart +
                        ' tersebar di berbagai format dan belum terharmonisasi.',
                ),

                bagian2('Isu Strategis'),
                body(
                    'Arumanis mendukung SDGs 6 (air bersih dan sanitasi layak), Asta Cita terkait penurunan stunting, serta reformasi birokrasi melalui digitalisasi SPBE. Di tingkat nasional, inovasi selaras RPJMN dan program PAMSIMAS. Di tingkat daerah, inovasi mendukung RPJMD 2025–2029, RISPAM Kabupaten Cianjur, RAD PAMSIMAS, serta prioritas peningkatan cakupan layanan air minum dan sanitasi di 365 desa.',
                ),

                bagian2('Metode Pembaharuan'),
                body(
                    'Metode pembaharuan inovasi dilakukan dengan membandingkan kondisi sebelum dan sesudah penerapan Arumanis. Kondisi sesudah inovasi mengacu pada data operasional Arumanis yang diperbarui secara berkala, dengan catatan bahwa proses sinkronisasi data historis sejak 2017 masih berlangsung sehingga capaian kuantitatif bersifat progresif.',
                ),
                bagian3('Perbandingan Sebelum dan Sesudah'),
                body(
                    'Integrasi data: sebelumnya 4–6 format terpisah (Excel, PDF, WhatsApp, berkas fisik); sesudahnya satu aplikasi Arumanis. Rekapitulasi capaian ' +
                        SPM +
                        ' lintas 365 desa: dari 5–10 hari kerja menjadi kurang dari 1 hari. Unit SPAM terdigitalisasi: ' +
                        fmtNum(spam.total_units) +
                        ' unit dengan ' +
                        fmtNum(scope.totalAchievementRecords ?? spam.achievement_records) +
                        ' record capaian multi-tahun.',
                    { indent: 360 },
                ),
                body(
                    `Pemantauan proyek: sebelumnya tidak seragam per berkas; sesudahnya ${fmtNum(dash.totalPekerjaan)} paket pekerjaan terpantau. Interval laporan pengawas: dari 2–4 minggu menjadi mingguan melalui ${FITUR_PENGAWASAN}. Dokumentasi foto: dari tersebar di gawai pengawas menjadi ${fmtNum(spam.total_foto_dokumentasi)} foto terarsip terpusat dengan lokasi lapangan.`,
                    { indent: 360 },
                ),
                bagian3('Pemantauan Pekerjaan Konstruksi SPAM Perdesaan'),
                body(
                    `Setelah inovasi, pekerjaan konstruksi SPAM dipantau melalui pencatatan paket pekerjaan dan ${FITUR_PENGAWASAN}. Tercatat ${fmtNum(dash.totalPekerjaan)} pekerjaan dengan ${fmtNum(dash.totalKontrak)} kontrak, ${fmtNum(spam.total_foto_dokumentasi)} dokumentasi foto terarsip, dan ${fmtNum(pengawas.total_pengawas)} pengawas aktif di ${fmtNum(pengawas.total_lokasi)} lokasi. Data ${fmtNum(spam.total_units)} unit SPAM menjadi acuan pemantauan layanan pasca-konstruksi.`,
                    { indent: 360 },
                ),
                bagian3('Pemantauan Pekerjaan Sanitasi dan Air Limbah'),
                body(
                    `Setelah inovasi, ${fmtNum(san.total_count)} infrastruktur sanitasi terdata dengan ${fmtNum(san.desa_with_infrastruktur)} desa memiliki infrastruktur terpetakan. Capaian pemanfaat mencapai ${fmtNum(san.total_pemanfaat_kk)} KK dan ${fmtNum(san.total_pemanfaat_jiwa)} jiwa, dengan nilai investasi terkonsolidasi ${fmtMilyar(san.total_investasi)}. Peta capaian publik memungkinkan pemantauan visual per desa.`,
                    { indent: 360 },
                ),
                bagian3('Penyajian Data Langsung'),
                body(
                    `${RINGKASAN_DATA} menampilkan kegiatan, pekerjaan, kontrak, hasil fisik, pagu, distribusi sumber dana (DAK, APBD, DAU, PAD), dan tingkat kelengkapan data tanpa menunggu rekapitulasi manual. Laporan siap cetak dihasilkan dari data yang sama dengan laporan pengawasan lapangan.`,
                    { indent: 360 },
                ),
                bagian3('Integrasi Sumber Data Sejak 2017'),
                body(
                    `Data historis berasal dari arsip Excel/CSV, input operator, capaian unit SPAM, dokumentasi pengawasan, dan kontrak pekerjaan. Hingga tanggal pengambilan data ini, ${fmtNum(spam.achievement_records)} catatan capaian SPAM dan data pekerjaan aktif telah terhimpun.`,
                    { indent: 360 },
                ),

                bagian2('Studi Kasus'),
                ...studiKasusBlocks(),

                bagian2('Keunggulan dan Kebaharuan'),
                body(
                    'Keunggulan utama Arumanis dibanding sistem sejenis terletak pada fokus pemantauan pekerjaan konstruksi SPAM perdesaan dan sanitasi (khususnya air limbah) dalam satu aplikasi, bukan hanya pencatatan aset statis. Sistem konvensional kerap memisahkan data proyek, data SPAM, dan data sanitasi; Arumanis menghubungkan ketiganya.',
                ),
                body(
                    'Kebaharuan meliputi penyajian capaian SPM terbuka per desa, penandaan tingkat kelengkapan data, keterkaitan data unit SPAM nasional SIMSPAM (' +
                        fmtNum(spam.simspam_count) +
                        ' unit), dokumentasi foto berlokasi, hak akses berbeda per peran pengguna, serta penggabungan data historis multi-sumber sejak ' +
                        syncStart +
                        '.',
                ),

                bagian2('Ketersediaan SDM Pengelola'),
                body(
                    `Penyelenggaraan melibatkan koordinator program, operator data, tim pengembang sistem, dan jaringan pengawas lapangan. Bukti adopsi per ${fetched}: ${fmtNum(pengawas.total_pengawas)} pengawas aktif di ${fmtNum(pengawas.total_lokasi)} lokasi; ${fmtNum(dash.totalPekerjaan)} pekerjaan dan ${fmtNum(spam.total_foto_dokumentasi)} dokumentasi foto menandakan sistem dipakai untuk input lapangan.`,
                ),

                bagian2('Risiko dan Mitigasi'),
                body(
                    'Risiko sinkronisasi data: angka antar sumber belum sepenuhnya selaras—mitigasi pemeriksaan triwulanan, penandaan sumber, dan keterbukaan catatan data. Risiko kesalahan input manual: mitigasi formulir terstandar, format impor berkas, dan jejak perubahan data. Risiko kurangnya kebiasaan pengawas: mitigasi alur laporan mingguan, pengingat otomatis, dan pantauan kelengkapan laporan.',
                ),

                bagian2('Tahapan Inovasi'),
                body(
                    '(1) Operator/koordinator dinas membuka aplikasi Arumanis untuk mengelola kegiatan, kontrak, dan data SPAM/sanitasi. (2) Pengawas lapangan menggunakan akun yang sama untuk mengisi progres mingguan, mengunggah foto lokasi, dan laporan anggaran fisik. (3) Masyarakat membuka halaman peta capaian SPM per desa tanpa harus mendaftar. (4) Data langsung tersimpan dan tampilan ringkasan diperbarui untuk evaluasi program.',
                ),

                bagian2('Tujuan dan Manfaat'),
                bagian3('Tujuan'),
                body(
                    'Tujuan inovasi diarahkan pada terwujudnya pemantauan pekerjaan konstruksi SPAM perdesaan dan sanitasi (khususnya air limbah) yang terukur, disertai kemampuan menyajikan data terkini. Target: (1) seluruh paket aktif terpantau (' +
                        fmtNum(dash.totalPekerjaan) +
                        ' pekerjaan tercatat); (2) progres fisik minimal mingguan; (3) dokumentasi foto ≥90% paket aktif; (4) penyelarasan data historis ' +
                        syncStart +
                        '–sekarang selisih antarsumber di bawah 5%; (5) ringkasan capaian 365 desa diperbarui langsung; (6) publikasi capaian SPM dapat diakses masyarakat tanpa pendaftaran.',
                    { indent: 360 },
                ),
                bagian3('Manfaat'),
                body(
                    'Bagi penyelenggara program: deviasi fisik/keuangan teridentifikasi lebih awal; evaluasi ' +
                        SPM +
                        ' air minum (' +
                        fmtPct(spam.coverage_percentage) +
                        ') dan sanitasi (' +
                        fmtPct(san.coverage_kk_percentage) +
                        '); anggaran terpetakan air minum ' +
                        fmtMilyar(anggaranAirMinum) +
                        ', sanitasi ' +
                        fmtMilyar(anggaranSanitasi) +
                        ', pekerjaan ' +
                        fmtMilyar(anggaranPekerjaan) +
                        ' (' +
                        fmtNum(dash.totalKontrak) +
                        ' kontrak). Bagi pengawas: alur kerja terstruktur dalam satu aplikasi. Bagi masyarakat: capaian per desa dapat dicek kapan saja tanpa ke kantor dinas. Manfaat menjangkau ' +
                        fmtNum(san.total_penduduk) +
                        ' jiwa penduduk di 33 kecamatan.',
                    { indent: 360 },
                ),

                bagian1('BAGIAN III :  IMPLEMENTASI DAN KEBERLANJUTAN INOVASI'),

                bagian2('Sumber Daya Pendukung'),
                ...sumberDayaPendukungBlocks(),

                bagian2('Kemitraan dan Kolaborasi (Pentahelix)'),
                body(
                    '(1) Pemerintah: DPKP Kabupaten Cianjur sebagai mitra adopsi dan pengguna utama; pengawas lapangan (' +
                        fmtNum(pengawas.total_pengawas) +
                        ' orang di ' +
                        fmtNum(pengawas.total_lokasi) +
                        ' lokasi); operator data; kontraktor pelaksana ' +
                        fmtNum(dash.totalKontrak) +
                        ' kontrak. (2) Masyarakat: inisiator inovasi (Ilham Taufiq), POKMAS pengelola ' +
                        fmtNum(spam.total_units) +
                        ' unit SPAM, aparatur desa di 365 desa, pengguna peta capaian publik. (3) Akademisi: [NAMA PERGURUAN TINGGI]—validasi metode dan pendampingan dokumentasi inovasi [lengkapi MoU/LoI jika ada]. (4) Swasta: konsultan pengawas/TFL dan penyedia jasa pendukung aplikasi. (5) Media: [MEDIA LOKAL]—sosialisasi capaian program air minum perdesaan [lengkapi jika ada publikasi]. Mekanisme koordinasi: laporan mingguan pengawas melalui aplikasi, pemeriksaan operator, evaluasi bersama melalui tampilan ringkasan data.',
                ),

                bagian2('Testimoni Pengguna'),
                body(
                    'Pengawas lapangan: “[KUTIPAN PENGAWAS—contoh: input progress dan foto dalam satu aplikasi mempercepat laporan mingguan dan mengurangi revisi berulang.]” — [NAMA PENGAWAS], Pengawas Lapangan, Lokasi [NAMA LOKASI].',
                ),
                body(
                    'Pengelola desa/POKMAS: “[KUTIPAN POKMAS—contoh: data capaian desa kami kini dapat diakses masyarakat tanpa harus ke kantor dinas.]” — [NAMA], Ketua POKMAS Desa [NAMA DESA].',
                ),

                bagian2('Rencana Keberlanjutan (Sustainability Plan)'),
                body(
                    '(1) Harmonisasi data historis ' +
                        syncStart +
                        '–2025 dari arsip eksternal. (2) Integrasi penuh pekerjaan konstruksi ke unit SPAM dan infrastruktur sanitasi. (3) Perluasan SIMSPAM dari ' +
                        fmtNum(spam.simspam_count) +
                        ' unit. (4) Penguatan kapasitas SDM melalui pelatihan berkala. (5) Integrasi dengan perencanaan daerah (Renja/RKPD, RISPAM, RAD PAMSIMAS). (6) Penganggaran berkelanjutan melalui APBD program air minum dan sanitasi. Aplikasi sudah berjalan dan terbukti diadopsi ' +
                        fmtNum(dash.totalPekerjaan) +
                        ' pekerjaan serta ' +
                        fmtNum(spam.total_foto_dokumentasi) +
                        ' dokumentasi foto.',
                ),
                bagian2('Rencana Pengembangan 2026–2027'),
                body(
                    `(1) Menyelesaikan harmonisasi data historis ${syncStart}–2023 dari arsip eksternal. (2) Menautkan pekerjaan konstruksi ke unit SPAM dan infrastruktur sanitasi secara menyeluruh. (3) Memperluas keterkaitan data unit SPAM nasional dari ${fmtNum(spam.simspam_count)} unit saat ini. (4) Meningkatkan kelengkapan foto berlokasi menuju target 90% paket aktif. (5) Memperkaya data capaian sanitasi di ${fmtNum(san.desa_without_infrastruktur)} desa yang belum berinfrastruktur terpetakan.`,
                ),

                bagian1('BAGIAN IV :  RENCANA KERJA DAN TARGET'),

                bagian2('Timeline Pelaksanaan'),
                timelineTable(),
                new Paragraph({ spacing: { after: 160 }, children: [] }),

                bagian2('Indikator Keberhasilan'),
                indicatorTable(),
                new Paragraph({ spacing: { after: 200 }, children: [] }),

                bagian1('BAGIAN V :  PENUTUP'),
                bagian2('Hasil Inovasi'),
                body(
                    `Hasil penyelenggaraan inovasi Arumanis per ${fetched} berupa aplikasi digital yang mendukung pemantauan konstruksi dan penyajian data program secara langsung.`,
                ),
                body(
                    `Aplikasi Arumanis meliputi tampilan ringkasan pekerjaan, pencatatan kegiatan dan kontrak, data unit SPAM, penandaan kelengkapan data, pemberitahuan program, dan ${FITUR_PENGAWASAN} bagi pengawas untuk memantau progres konstruksi, mengunggah dokumentasi, serta menyusun laporan mingguan dengan satu akun yang sama.`,
                ),
                body(
                    `Halaman informasi terbuka menampilkan peta capaian SPM dan sanitasi per desa. Data terintegrasi memuat ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(spam.total_units)} unit SPAM, ${fmtNum(san.total_count)} infrastruktur sanitasi, ${fmtNum(spam.total_foto_dokumentasi)} foto dokumentasi, dan ${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} catatan capaian (${earliestYear}–${scope.latestAchievementYear ?? '2026'}).`,
                ),
                body(
                    'Arumanis (Air Minum dan Sanitasi) adalah inovasi digital untuk memantau konstruksi SPAM perdesaan dan sanitasi—khususnya pengelolaan air limbah—serta menyajikan data program secara langsung di Kabupaten Cianjur. Per ' +
                        fetched +
                        ', capaian ' +
                        SPM +
                        ' air minum ' +
                        fmtPct(spam.coverage_percentage) +
                        ' (' +
                        fmtNum(spam.capaian_kk) +
                        ' KK) dan sanitasi ' +
                        fmtPct(san.coverage_kk_percentage) +
                        ' (' +
                        fmtNum(san.total_pemanfaat_kk) +
                        ' KK). Anggaran terpetakan: air minum ' +
                        fmtMilyar(anggaranAirMinum) +
                        ', sanitasi ' +
                        fmtMilyar(anggaranSanitasi) +
                        ', pekerjaan ' +
                        fmtMilyar(anggaranPekerjaan) +
                        ', pengawasan ' +
                        fmtMilyar(anggaranPengawasan) +
                        '.',
                ),
                body(
                    'Inovasi ini memberikan manfaat nyata bagi pemerintah daerah, pengawas lapangan, dan masyarakat melalui transparansi data, percepatan rekapitulasi, serta pemantauan progres konstruksi yang terukur. Komitmen implementasi ditunjukkan oleh adopsi operasional ' +
                        fmtNum(pengawas.total_pengawas) +
                        ' pengawas aktif, surat dukungan DPKP (lampiran), dan dokumentasi ' +
                        fmtNum(spam.total_foto_dokumentasi) +
                        ' foto progres. Arumanis layak untuk diterapkan secara berkelanjutan dan menjadi rujukan monitoring program air minum serta sanitasi di Kabupaten Cianjur.',
                ),

                bagian2('Lampiran Administratif'),
                body(
                    'Lampiran 1: Surat Pernyataan Dukungan Kepala Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur atas inovasi Arumanis [lampirkan PDF/scan bermaterai].',
                ),
                body(
                    'Lampiran 2: Daftar fitur utama aplikasi (ringkasan pekerjaan, data unit SPAM, pengawasan lapangan, peta capaian publik, penandaan kelengkapan data).',
                ),
                body(
                    'Lampiran 3: Alamat aplikasi Arumanis (https://arumanis.cianjur.space) beserta QR code demo—aktif per Juni 2026.',
                ),
                body(
                    'Lampiran 4: Glosarium istilah teknis terpisah (docs/Glosarium_Arumanis_LIDA.docx)—berisi padanan istilah yang disederhanakan di proposal utama beserta penjelasan operasional.',
                ),

                bagian2('Lampiran Bukti Visual'),
                body(
                    'Cuplikan layar aplikasi Arumanis per Juni 2026 sebagai bukti visual implementasi inovasi.',
                ),
                ...screenshotBlocks(),

                new Paragraph({ spacing: { before: 480 }, children: [] }),
                new Paragraph({
                    indent: { left: 4820 },
                    children: [new TextRun({ text: 'Cianjur, 29 Juni 2026', size: 22 })],
                }),
                new Paragraph({
                    indent: { left: 4820 },
                    spacing: { before: 80, after: 480 },
                    children: [new TextRun({ text: 'Inisiator,', size: 22 })],
                }),
                new Paragraph({
                    indent: { left: 4820 },
                    children: [new TextRun({ text: 'ILHAM TAUFIQ', bold: true, size: 22 })],
                }),
            ],
        },
    ],
})

const buffer = await Packer.toBuffer(doc)
try {
    fs.writeFileSync(OUT_PATH, buffer)
    console.log(`✓ Proposal LIDA-MASUM PELMAS tersimpan: ${OUT_PATH}`)
} catch (err) {
    if (err.code === 'EBUSY') {
        const alt = OUT_PATH.replace(/\.docx$/, '_baru.docx')
        fs.writeFileSync(alt, buffer)
        console.log(`⚠ File utama terkunci. Disimpan ke: ${alt}`)
    } else {
        throw err
    }
}