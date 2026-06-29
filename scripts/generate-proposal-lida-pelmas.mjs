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

const earliestYear = scope.earliestAchievementYear ?? achYears[0]?.tahun ?? '2017'
const syncStart = scope.syncStartYear ?? 2017
const SPM = 'Standar Pelayanan Minimum (SPM)'
const anggaranAirMinum = Number(spam.capaian_nilai_kontrak) || 0
const anggaranSanitasi = Number(san.total_investasi) || 0
const anggaranPekerjaan = Number(dash.totalPaguPekerjaan) || 0
const anggaranKontrak = Number(dash.totalNilaiKontrak) || 0
const anggaranPengawasan = Number(pengawas.total_pagu) || 0
const gapAirMinumKk = Math.max(0, Number(spam.total_target) - Number(spam.capaian_kk))
const gapSanitasiKk = Math.max(0, Number(san.target_kk) - Number(san.total_pemanfaat_kk))

const disclaimerSinkronisasi =
    'Catatan: seluruh angka bersumber dari data Arumanis yang masih disinkronkan dari berbagai sumber sejak 2017. Proses harmonisasi belum selesai sepenuhnya sehingga dapat terdapat ketidaksesuaian. Angka diposisikan sebagai gambaran kondisi terkini, bukan pernyataan final.'

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
        children: [
            new TextRun({
                text,
                bold: !!opts.bold,
                italics: !!opts.italics,
                size: 22,
                font: 'Times New Roman',
            }),
        ],
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
            identityRow('Jenis Inovasi', ['(x) Digital', '( ) Non-Digital'], true),
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
                children: [new TextRun({ text, bold: true, size: 20, font: 'Times New Roman' })],
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
                children: [new TextRun({ text, size: 20, font: 'Times New Roman' })],
            }),
        ],
    })
}

function timelineTable() {
    const cols = [2200, 1600, 2200, 3380]
    const rows = [
        ['Tahapan', 'Durasi', 'Penanggung Jawab', 'Output'],
        ['Persiapan & perancangan sistem', '2023', 'Tim pengembang Arumanis', 'Arsitektur platform, modul inti, prototype'],
        ['Uji coba internal & pilot lapangan', '2024', 'Tim pengembang + operator data', 'Panel Pengawasan beta, impor data awal'],
        ['Implementasi penuh produksi', '2025 – sekarang', 'DPKP + pengawas + operator', `${fmtNum(dash.totalPekerjaan)} pekerjaan terpantau, ${fmtNum(pengawas.total_pengawas)} pengawas aktif`],
        ['Harmonisasi data historis', `${syncStart} – 2025`, 'Operator data + tim IT', `${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} record capaian SPAM terhimpun`],
        ['Monitoring & evaluasi berkelanjutan', 'Berkelanjutan', 'Operator + koordinator program', 'Dashboard real-time, laporan SPM, publikasi masyarakat'],
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
        ['Indikator', 'Baseline', 'Target', 'Sumber Data', 'Frekuensi'],
        [
            'Paket konstruksi SPAM/sanitasi terpantau',
            '0 (manual/terpisah)',
            `${fmtNum(dash.totalPekerjaan)} paket`,
            'Dashboard Arumanis',
            'Mingguan',
        ],
        [
            `Coverage ${SPM} air minum`,
            'Rekapitulasi manual 5–10 hari',
            `${fmtPct(spam.coverage_percentage)} (${fmtNum(spam.capaian_kk)} KK)`,
            'Modul capaian SPAM',
            'Bulanan',
        ],
        [
            `Coverage ${SPM} sanitasi`,
            'Data tidak terintegrasi',
            `${fmtPct(san.coverage_kk_percentage)} (${fmtNum(san.total_pemanfaat_kk)} KK)`,
            'Modul sanitasi + peta publik',
            'Bulanan',
        ],
        [
            'Dokumentasi foto progres ber-GPS',
            'Foto tersebar di perangkat pengawas',
            `≥90% paket aktif (baseline ${fmtNum(spam.total_foto_dokumentasi)} foto)`,
            'Panel Pengawasan',
            'Mingguan',
        ],
        [
            'Interval laporan pengawas',
            '2–4 minggu (manual)',
            'Mingguan terstruktur',
            'Panel Pengawasan + statistik kelengkapan',
            'Mingguan',
        ],
        [
            'Akses publik capaian per desa',
            'Tidak tersedia 24 jam',
            '365 desa via peta publik tanpa login',
            'arumanis.cianjur.space',
            'Real-time',
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
    { file: 'dashboard.png', caption: 'Gambar 1. Dashboard monitoring pekerjaan konstruksi.' },
    { file: 'capaian-air-minum.png', caption: 'Gambar 2. Peta capaian SPM air minum per desa.' },
    { file: 'capaian-sanitasi.png', caption: 'Gambar 3. Peta capaian SPM sanitasi per desa.' },
    { file: 'pengawas.png', caption: 'Gambar 4. Panel Pengawasan terintegrasi.' },
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
                    spacing: { after: 360 },
                    children: [
                        new TextRun({
                            text: 'KATEGORI MASYARAKAT UMUM DAN PELAJAR/MAHASISWA',
                            size: 32,
                            highlight: 'yellow',
                        }),
                    ],
                }),

                bagian1('BAGIAN I :  IDENTITAS INOVASI'),
                identityTable(),
                new Paragraph({ spacing: { after: 200 }, children: [] }),

                bagian1('BAGIAN II :  RANCANG BANGUN INOVASI'),

                bagian2('Dasar Hukum'),
                body(
                    'Inovasi Arumanis berlandaskan Undang-Undang Nomor 17 Tahun 2019 tentang Sumber Daya Air; Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah; Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik; Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik; serta Undang-Undang Nomor 18 Tahun 2008 tentang Pengelolaan Sampah.',
                ),
                body(
                    'Bidang air minum: Peraturan Pemerintah Nomor 16 Tahun 2005 tentang Pengembangan Sistem Penyediaan Air Minum; Permen PUPR Nomor 18/PRT/M/2007 tentang Pedoman Pengembangan SPAM; Permen PU Nomor 20 Tahun 2006 tentang Persyaratan Teknis Pengembangan SPAM. Bidang sanitasi: Permen PUPR Nomor 14/PRT/M/2014 tentang PAMSIMAS; Permenkes Nomor 2 Tahun 2023 tentang SPM Bidang Kesehatan; Permen PUPR Nomor 27/PRT/M/2018 tentang Pengolahan Air Limbah Domestik.',
                ),
                body(
                    'Tata kelola digital: Permendagri Nomor 59 Tahun 2016 tentang Penerapan SPBE; Permendagri Nomor 108 Tahun 2016 tentang Pedoman Evaluasi SPBE. Tingkat daerah: Perda Kab. Cianjur Nomor 14 Tahun 2021 (Perumdam Tirta Mukti); Perbup Nomor 102 Tahun 2021 (tugas-fungsi DPKP); Perbup Nomor 23 Tahun 2020 (RAD PAMSIMAS 2019–2023); RPJMD 2025–2029; Kajian RISPAM Kabupaten Cianjur.',
                ),

                bagian2('Permasalahan'),
                body(
                    'Permasalahan makro: Kabupaten Cianjur dengan 2.535.002 jiwa penduduk di 33 kecamatan dan 365 desa masih menghadapi gap besar akses air minum layak dan sanitasi. Per ' +
                        fetched +
                        ', capaian ' +
                        SPM +
                        ' air minum baru ' +
                        fmtPct(spam.coverage_percentage) +
                        ' (' +
                        fmtNum(gapAirMinumKk) +
                        ' KK belum terlayani) dan sanitasi ' +
                        fmtPct(san.coverage_kk_percentage) +
                        ' (' +
                        fmtNum(san.desa_without_infrastruktur) +
                        ' desa belum berinfrastruktur terpetakan). Program pembangunan SPAM perdesaan dan infrastruktur air limbah (SPALD-T, SPALD-S, IPLT) membutuhkan pemantauan terpusat yang andal.',
                ),
                body(
                    'Permasalahan mikro: Sebelum Arumanis, pemantauan progres fisik, keuangan, dan dokumentasi lapangan dilakukan manual melalui Excel, PDF, WhatsApp, dan berkas fisik tanpa jejak terpusat. Deviasi pekerjaan konstruksi baru terdeteksi setelah periode pelaporan berakhir. Rekapitulasi capaian SPM lintas 365 desa memakan 5–10 hari kerja. Data historis sejak ' +
                        syncStart +
                        ' tersebar di berbagai format dan belum terharmonisasi.',
                ),

                bagian2('Isu Strategis'),
                body(
                    'Arumanis mendukung SDGs 6 (air bersih dan sanitasi layak), Asta Cita terkait penurunan stunting, serta reformasi birokrasi melalui digitalisasi SPBE. Di tingkat nasional, inovasi selaras RPJMN dan program PAMSIMAS. Di tingkat daerah, inovasi mendukung RPJMD 2025–2029, RISPAM Kabupaten Cianjur, RAD PAMSIMAS, serta prioritas peningkatan coverage air minum dan sanitasi di 365 desa.',
                ),

                bagian2('Metode Pembaharuan'),
                body(
                    'Metode pembaharuan dilakukan dengan membandingkan kondisi sebelum dan sesudah penerapan Arumanis. Sebelum inovasi: 4–6 format data terpisah, laporan pengawas 2–4 minggu, rekapitulasi SPM manual 5–10 hari, foto progres tersebar di perangkat individu. Sesudah inovasi: satu platform terintegrasi (arumanis.cianjur.space + apiamis.cianjur.space), ' +
                        fmtNum(dash.totalPekerjaan) +
                        ' paket pekerjaan terpantau, laporan mingguan via Panel Pengawasan, ' +
                        fmtNum(spam.total_foto_dokumentasi) +
                        ' foto terindeks ber-GPS, rekapitulasi capaian kurang dari 1 hari.',
                ),
                body(
                    'Monitoring SPAM: ' +
                        fmtNum(spam.total_units) +
                        ' unit terdigitalisasi dengan ' +
                        fmtNum(scope.totalAchievementRecords ?? spam.achievement_records) +
                        ' record capaian (' +
                        earliestYear +
                        '–' +
                        (scope.latestAchievementYear ?? '2026') +
                        '). Monitoring sanitasi: ' +
                        fmtNum(san.total_count) +
                        ' infrastruktur di ' +
                        fmtNum(san.desa_with_infrastruktur) +
                        ' desa, pemanfaat ' +
                        fmtNum(san.total_pemanfaat_kk) +
                        ' KK. Pengolahan data real-time melalui dashboard KPI, filter 33 kecamatan × 365 desa × tahun, peta choropleth publik, dan ekspor laporan PDF/Excel.',
                ),

                bagian2('Keunggulan dan Kebaharuan'),
                body(
                    'Keunggulan utama: fokus monitoring konstruksi SPAM perdesaan dan sanitasi (khususnya air limbah) dalam satu platform, bukan sekadar pencatatan aset statis. Arumanis menghubungkan modul pekerjaan, unit SPAM, dan infrastruktur sanitasi sehingga progress pembangunan, capaian layanan, dan dokumentasi lapangan dibaca dalam satu konteks.',
                ),
                body(
                    'Kebaharuan teknis: API publik capaian SPM, modul indikator kualitas data, integrasi SIMSPAM (' +
                        fmtNum(spam.simspam_count) +
                        ' unit), sinkronisasi progres dua arah, slot foto ber-GPS, role-based access per wilayah, asisten Ami AI, serta pipeline sinkronisasi data historis multi-sumber sejak ' +
                        syncStart +
                        '. Upgrade dari praktik manual menjadi sistem kerja digital yang menghubungkan lapangan dan kantor pusat.',
                ),

                bagian2('Tahapan Inovasi'),
                body(
                    '(1) Operator/koordinator login ke arumanis.cianjur.space untuk mengelola kegiatan, kontrak, dan data SPAM/sanitasi. (2) Pengawas mengakses Panel Pengawasan terintegrasi (/pengawasan/) dengan akun yang sama (SSO) untuk mengisi progress mingguan, unggah foto ber-GPS, dan laporan RAB. (3) Masyarakat mengakses peta capaian SPM per desa tanpa login 24 jam. (4) Backend apiamis.cianjur.space memvalidasi dan menyimpan data; dashboard memperbarui capaian secara real-time.',
                ),

                bagian2('Tujuan dan Manfaat'),
                bagian3('Tujuan'),
                body(
                    'Terwujudnya pemantauan pekerjaan konstruksi SPAM perdesaan dan sanitasi (khususnya air limbah) yang terukur, disertai kemampuan olah data real-time. Target: (1) seluruh paket aktif terpantau (' +
                        fmtNum(dash.totalPekerjaan) +
                        ' pekerjaan tercatat); (2) progres fisik minimal mingguan; (3) dokumentasi foto ≥90% paket aktif; (4) sinkronisasi data historis ' +
                        syncStart +
                        '–sekarang selisih antarsumber <5%; (5) dashboard 365 desa real-time; (6) publikasi capaian SPM tanpa login.',
                    { indent: 360 },
                ),
                bagian3('Manfaat'),
                body(
                    'Bagi pemerintah daerah: deviasi fisik/keuangan teridentifikasi lebih awal, evaluasi ' +
                        SPM +
                        ' terpusat (air minum ' +
                        fmtPct(spam.coverage_percentage) +
                        ', sanitasi ' +
                        fmtPct(san.coverage_kk_percentage) +
                        '), anggaran terpetakan ' +
                        fmtMilyar(anggaranAirMinum + anggaranSanitasi + anggaranPekerjaan) +
                        ' tanpa rekapitulasi manual. Bagi pengawas: alur kerja terstruktur dalam satu sistem. Bagi masyarakat: akses capaian per desa 24 jam, verifikasi unit SPAM dan infrastruktur sanitasi tanpa ke kantor dinas. Manfaat menjangkau ' +
                        fmtNum(san.total_penduduk) +
                        ' jiwa penduduk di 33 kecamatan.',
                    { indent: 360 },
                ),

                bagian1('BAGIAN III :  IMPLEMENTASI DAN KEBERLANJUTAN INOVASI'),

                bagian2('Sumber Daya Pendukung'),
                body(
                    '(1) Anggaran: air minum ' +
                        fmtMilyar(anggaranAirMinum) +
                        ', sanitasi ' +
                        fmtMilyar(anggaranSanitasi) +
                        ', pekerjaan konstruksi ' +
                        fmtMilyar(anggaranPekerjaan) +
                        ' (' +
                        fmtNum(dash.totalKontrak) +
                        ' kontrak), pengawasan ' +
                        fmtMilyar(anggaranPengawasan) +
                        '. (2) SDM: ' +
                        fmtNum(pengawas.total_pengawas) +
                        ' pengawas aktif, operator data, tim pengembang (5–7 personil inti), koordinator program, konsultan/TFL. (3) Sarpras: server produksi (arumanis.cianjur.space, apiamis.cianjur.space), perangkat pengawas lapangan. (4) Teknologi: React SPA, Laravel API, PostgreSQL, Panel Pengawasan SSO. (5) Bimtek/sosialisasi berkala. (6) Pedoman teknis docs/user-guide. (7) Akses informasi publik 24 jam.',
                ),

                bagian2('Kemitraan dan Kolaborasi'),
                body(
                    'Internal: DPKP Kabupaten Cianjur sebagai pengguna utama, pengawas lapangan (' +
                        fmtNum(pengawas.total_pengawas) +
                        ' orang di ' +
                        fmtNum(pengawas.total_lokasi) +
                        ' lokasi), operator data, kontraktor pelaksana ' +
                        fmtNum(dash.totalKontrak) +
                        ' kontrak. Eksternal: POKMAS pengelola ' +
                        fmtNum(spam.total_units) +
                        ' unit SPAM, aparatur desa di 365 desa, konsultan pengawas, masyarakat sebagai pengguna peta publik. Mekanisme koordinasi: input mingguan via Panel Pengawasan, validasi operator, dashboard real-time untuk evaluasi bersama.',
                ),

                bagian2('Rencana Keberlanjutan (Sustainability Plan)'),
                body(
                    '(1) Harmonisasi data historis ' +
                        syncStart +
                        '–2025 dari arsip eksternal. (2) Integrasi penuh pekerjaan konstruksi ke unit SPAM dan infrastruktur sanitasi. (3) Perluasan SIMSPAM dari ' +
                        fmtNum(spam.simspam_count) +
                        ' unit. (4) Penguatan kapasitas SDM melalui pelatihan berkala. (5) Integrasi dengan perencanaan daerah (Renja/RKPD, RISPAM, RAD PAMSIMAS). (6) Penganggaran berkelanjutan melalui APBD program air minum dan sanitasi. Platform produksi sudah berjalan dan terbukti diadopsi ' +
                        fmtNum(dash.totalPekerjaan) +
                        ' pekerjaan serta ' +
                        fmtNum(spam.total_foto_dokumentasi) +
                        ' dokumentasi foto.',
                ),

                bagian1('BAGIAN IV :  RENCANA KERJA DAN TARGET'),

                bagian2('Timeline Pelaksanaan'),
                timelineTable(),
                new Paragraph({ spacing: { after: 160 }, children: [] }),

                bagian2('Indikator Keberhasilan'),
                indicatorTable(),
                new Paragraph({ spacing: { after: 200 }, children: [] }),

                bagian1('BAGIAN V :  PENUTUP'),
                body(
                    'Arumanis (Air Minum dan Sanitasi) adalah platform digital monitoring konstruksi SPAM perdesaan dan sanitasi—khususnya pengelolaan air limbah—serta pengolahan data real-time di Kabupaten Cianjur. Per ' +
                        fetched +
                        ', sistem telah memantau ' +
                        fmtNum(dash.totalPekerjaan) +
                        ' pekerjaan, ' +
                        fmtNum(spam.total_units) +
                        ' unit SPAM, ' +
                        fmtNum(san.total_count) +
                        ' infrastruktur sanitasi, dengan capaian ' +
                        SPM +
                        ' air minum ' +
                        fmtPct(spam.coverage_percentage) +
                        ' dan sanitasi ' +
                        fmtPct(san.coverage_kk_percentage) +
                        '.',
                ),
                body(
                    'Inovasi ini memberikan manfaat nyata bagi pemerintah daerah, pengawas lapangan, dan masyarakat melalui transparansi data, percepatan rekapitulasi, serta pemantauan progress konstruksi yang terukur. Komitmen implementasi ditunjukkan oleh adopsi operasional ' +
                        fmtNum(pengawas.total_pengawas) +
                        ' pengawas aktif dan dokumentasi ' +
                        fmtNum(spam.total_foto_dokumentasi) +
                        ' foto progres. Arumanis layak untuk diterapkan secara berkelanjutan dan menjadi rujukan monitoring program air minum serta sanitasi di Kabupaten Cianjur.',
                ),
                body(disclaimerSinkronisasi, { italics: true }),

                bagian2('Lampiran Bukti Visual'),
                body(
                    'Cuplikan layar dari lingkungan produksi arumanis.cianjur.space per Juni 2026 sebagai bukti visual implementasi inovasi.',
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