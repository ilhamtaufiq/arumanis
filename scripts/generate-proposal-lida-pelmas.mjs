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
    { file: 'dashboard.png', caption: 'Gambar 1. Dashboard monitoring pekerjaan konstruksi air minum dan sanitasi.' },
    { file: 'capaian-air-minum.png', caption: 'Gambar 2. Peta capaian SPM air minum per desa.' },
    { file: 'capaian-sanitasi.png', caption: 'Gambar 3. Peta capaian SPM sanitasi per desa.' },
    { file: 'pengawas.png', caption: 'Gambar 4. Panel Pengawasan terintegrasi untuk input progress dan dokumentasi lapangan.' },
    { file: 'sign-in.png', caption: 'Gambar 5. Akses terintegrasi (SSO) ke Arumanis dan Panel Pengawasan dengan satu akun.' },
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
                    'Inti inovasi Arumanis adalah platform pemantauan pelaksanaan pekerjaan konstruksi infrastruktur SPAM perdesaan serta pekerjaan sanitasi, khususnya pada bidang pengelolaan air limbah (SPALD-T, SPALD-S, IPLT, dan infrastruktur terkait). Pekerjaan tersebar di 33 kecamatan dan 365 desa/kelurahan Kabupaten Cianjur, dengan pelaksana yang melibatkan dinas, pengawas lapangan, konsultan, kontraktor, dan pengelola desa.',
                ),
                body(
                    'Sebelum Arumanis, pemantauan progres fisik, keuangan, dan dokumentasi lapangan banyak dilakukan secara manual. Laporan konstruksi SPAM dan sanitasi kerap dikirim melalui berkas Excel, dokumen cetak, atau pesan instan tanpa jejak terpusat. Deviasi pekerjaan—misalnya keterlambatan progress fisik, ketidaksesuaian output, atau kekurangan dokumentasi—baru terdeteksi setelah periode pelaporan berakhir.',
                ),
                body(
                    `Di luar fungsi monitoring konstruksi, Arumanis mengolah data secara real-time: dashboard, rekapitulasi capaian ${SPM}, peta per desa, ekspor laporan, statistik pengawas, dan publikasi kepada masyarakat. Basis data masih dalam proses sinkronisasi dari berbagai sumber sejak ${syncStart}; jejak capaian SPAM tertua tahun ${earliestYear} dari impor arsip historis. ${disclaimerSinkronisasi}`,
                ),
                body(
                    `Capaian ${SPM} per ${fetched}: air minum ${fmtNum(spam.capaian_kk)} KK / ${fmtNum(spam.capaian_jiwa)} jiwa (${fmtPct(spam.coverage_percentage)} dari target ${fmtNum(spam.total_target)} KK); sanitasi ${fmtNum(san.total_pemanfaat_kk)} KK / ${fmtNum(san.total_pemanfaat_jiwa)} jiwa (${fmtPct(san.coverage_kk_percentage)} dari target ${fmtNum(san.target_kk)} KK). Inventaris: ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(spam.total_units)} unit SPAM, ${fmtNum(san.total_count)} infrastruktur sanitasi, ${fmtNum(spam.total_foto_dokumentasi)} foto dokumentasi.`,
                ),
                body(
                    `Urgensi gap: ${fmtNum(gapAirMinumKk)} KK belum tercapai untuk ${SPM} air minum; ${fmtNum(gapSanitasiKk)} KK belum memanfaatkan sanitasi layak, dengan ${fmtNum(san.desa_without_infrastruktur)} desa tanpa infrastruktur terpetakan. Peta anggaran terhimpun: air minum ${fmtMilyar(anggaranAirMinum)}, sanitasi ${fmtMilyar(anggaranSanitasi)}, pekerjaan ${fmtMilyar(anggaranPekerjaan)} (${fmtNum(dash.totalKontrak)} kontrak), pengawasan ${fmtMilyar(anggaranPengawasan)}.`,
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
                        ? `Monitoring pekerjaan konstruksi per tahun anggaran: ${pekerjaanNarrative}. Total kumulatif: ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(dash.totalOutput)} output fisik, ${fmtNum(dash.totalPenerima)} penerima manfaat, pagu ${fmtMilyar(dash.totalPaguPekerjaan)}.`
                        : `Total kumulatif pekerjaan: ${fmtNum(dash.totalPekerjaan)} paket, ${fmtNum(dash.totalKontrak)} kontrak, pagu ${fmtMilyar(dash.totalPaguPekerjaan)}.`,
                ),

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
                    'Arumanis mendukung SDGs 6 (air bersih dan sanitasi layak), Asta Cita terkait penurunan stunting, serta reformasi birokrasi melalui digitalisasi SPBE. Di tingkat nasional, inovasi selaras RPJMN dan program PAMSIMAS. Di tingkat daerah, inovasi mendukung RPJMD 2025–2029, RISPAM Kabupaten Cianjur, RAD PAMSIMAS, serta prioritas peningkatan coverage air minum dan sanitasi di 365 desa.',
                ),

                bagian2('Metode Pembaharuan'),
                body(
                    'Metode pembaharuan inovasi dilakukan dengan membandingkan kondisi sebelum dan sesudah penerapan Arumanis. Kondisi sesudah inovasi mengacu pada data operasional Arumanis yang diperbarui secara berkala, dengan catatan bahwa proses sinkronisasi data historis sejak 2017 masih berlangsung sehingga capaian kuantitatif bersifat progresif.',
                ),
                bagian3('Perbandingan Sebelum dan Sesudah'),
                body(
                    'Integrasi data: sebelumnya 4–6 format terpisah (Excel, PDF, WhatsApp, berkas fisik); sesudahnya satu platform Arumanis + apiamis. Rekapitulasi capaian ' +
                        SPM +
                        ' lintas 365 desa: dari 5–10 hari kerja menjadi kurang dari 1 hari. Unit SPAM terdigitalisasi: ' +
                        fmtNum(spam.total_units) +
                        ' unit dengan ' +
                        fmtNum(scope.totalAchievementRecords ?? spam.achievement_records) +
                        ' record capaian multi-tahun.',
                    { indent: 360 },
                ),
                body(
                    `Monitoring proyek: sebelumnya tidak terstandar per berkas; sesudahnya ${fmtNum(dash.totalPekerjaan)} paket pekerjaan terpantau. Interval laporan pengawas: dari 2–4 minggu menjadi mingguan via Panel Pengawasan. Dokumentasi foto: dari tersebar di perangkat pengawas menjadi ${fmtNum(spam.total_foto_dokumentasi)} foto terindeks ber-slot dan ber-GPS.`,
                    { indent: 360 },
                ),
                bagian3('Monitoring Pekerjaan Konstruksi SPAM Perdesaan'),
                body(
                    `Setelah inovasi, pekerjaan konstruksi SPAM dipantau melalui modul pekerjaan dan Panel Pengawasan terintegrasi. Tercatat ${fmtNum(dash.totalPekerjaan)} pekerjaan dengan ${fmtNum(dash.totalKontrak)} kontrak, ${fmtNum(spam.total_foto_dokumentasi)} dokumentasi foto terindeks, dan ${fmtNum(pengawas.total_pengawas)} pengawas aktif di ${fmtNum(pengawas.total_lokasi)} lokasi. Modul SPAM Unit (${fmtNum(spam.total_units)} unit) menjadi acuan monitoring layanan pasca-konstruksi.`,
                    { indent: 360 },
                ),
                bagian3('Monitoring Pekerjaan Sanitasi dan Air Limbah'),
                body(
                    `Setelah inovasi, ${fmtNum(san.total_count)} infrastruktur sanitasi terdata dengan ${fmtNum(san.desa_with_infrastruktur)} desa memiliki infrastruktur terpetakan. Capaian pemanfaat mencapai ${fmtNum(san.total_pemanfaat_kk)} KK dan ${fmtNum(san.total_pemanfaat_jiwa)} jiwa, dengan nilai investasi terkonsolidasi ${fmtMilyar(san.total_investasi)}. Peta capaian publik memungkinkan pemantauan visual per desa.`,
                    { indent: 360 },
                ),
                bagian3('Pengolahan Data Real-Time'),
                body(
                    'Dashboard menampilkan ringkasan kegiatan, pekerjaan, kontrak, output, pagu, distribusi sumber dana (DAK, APBD, DAU, PAD), dan indikator kualitas data tanpa menunggu rekapitulasi manual. Asisten Ami AI membantu penafsiran data operasional; laporan PDF/Excel dihasilkan dari data yang sama dengan Panel Pengawasan. Puspen (/puspen) merupakan alat tambahan operasional pendukung—bukan inti platform.',
                    { indent: 360 },
                ),
                bagian3('Integrasi Sumber Data Sejak 2017'),
                body(
                    `Data historis berasal dari arsip Excel/CSV, input operator, capaian unit SPAM, dokumentasi pengawasan, dan kontrak pekerjaan. Hingga snapshot ini, ${fmtNum(spam.achievement_records)} record capaian SPAM dan data pekerjaan aktif telah terhimpun. ${disclaimerSinkronisasi}`,
                    { indent: 360 },
                ),

                bagian2('Keunggulan dan Kebaharuan'),
                body(
                    'Keunggulan utama Arumanis dibanding sistem sejenis terletak pada fokus monitoring pekerjaan konstruksi SPAM perdesaan dan sanitasi (khususnya air limbah) dalam satu platform, bukan hanya pencatatan aset statis. Sistem konvensional kerap memisahkan modul proyek, modul SPAM, dan modul sanitasi; Arumanis menghubungkan ketiganya.',
                ),
                body(
                    'Kebaharuan teknis meliputi API publik capaian SPM, modul indikator kualitas data, integrasi SIMSPAM (' +
                        fmtNum(spam.simspam_count) +
                        ' unit), sinkronisasi progres estimasi dua arah, slot foto ber-GPS, role-based access per wilayah, asisten Ami AI, serta pipeline sinkronisasi data historis multi-sumber sejak ' +
                        syncStart +
                        '.',
                ),

                bagian2('Ketersediaan SDM Pengelola'),
                body(
                    `Penyelenggaraan melibatkan koordinator program, operator data, tim pengembang sistem, dan jaringan pengawas lapangan. Bukti adopsi per ${fetched}: ${fmtNum(pengawas.total_pengawas)} pengawas aktif di ${fmtNum(pengawas.total_lokasi)} lokasi; ${fmtNum(dash.totalPekerjaan)} pekerjaan dan ${fmtNum(spam.total_foto_dokumentasi)} dokumentasi foto menandakan sistem dipakai untuk input lapangan.`,
                ),

                bagian2('Risiko dan Mitigasi'),
                body(
                    'Risiko sinkronisasi data: angka antar sumber belum 100% selaras—mitigasi validasi triwulanan, penandaan sumber, modul indikator kualitas data, dan disclaimer transparan. Risiko kesalahan input manual: mitigasi validasi server-side, template impor CSV/Excel, dan audit log. Risiko adopsi pengawas: mitigasi integrasi alur kerja mingguan, notifikasi broadcast, dan statistik kelengkapan input (Puspen KPI).',
                ),

                bagian2('Tahapan Inovasi'),
                body(
                    '(1) Operator/koordinator login ke arumanis.cianjur.space untuk mengelola kegiatan, kontrak, dan data SPAM/sanitasi. (2) Pengawas mengakses Panel Pengawasan terintegrasi (/pengawasan/) dengan akun yang sama (SSO) untuk mengisi progress mingguan, unggah foto ber-GPS, dan laporan RAB. (3) Masyarakat mengakses peta capaian SPM per desa tanpa login 24 jam. (4) Backend apiamis.cianjur.space memvalidasi dan menyimpan data; dashboard memperbarui capaian secara real-time.',
                ),

                bagian2('Tujuan dan Manfaat'),
                bagian3('Tujuan'),
                body(
                    'Tujuan inovasi diarahkan pada terwujudnya pemantauan pekerjaan konstruksi SPAM perdesaan dan sanitasi (khususnya air limbah) yang terukur, disertai kemampuan olah data real-time. Target: (1) seluruh paket aktif terpantau (' +
                        fmtNum(dash.totalPekerjaan) +
                        ' pekerjaan tercatat); (2) progres fisik minimal mingguan; (3) dokumentasi foto ≥90% paket aktif; (4) sinkronisasi data historis ' +
                        syncStart +
                        '–sekarang selisih antarsumber <5%; (5) dashboard 365 desa real-time; (6) publikasi capaian SPM tanpa login.',
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
                        ' kontrak). Bagi pengawas: alur kerja terstruktur dalam satu sistem. Bagi masyarakat: akses capaian per desa 24 jam tanpa ke kantor dinas. Manfaat menjangkau ' +
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
                bagian2('Rencana Pengembangan 2026–2027'),
                body(
                    `(1) Menyelesaikan harmonisasi data historis ${syncStart}–2023 dari arsip eksternal. (2) Menautkan pekerjaan konstruksi ke unit SPAM dan infrastruktur sanitasi secara menyeluruh. (3) Memperluas integrasi SIMSPAM dari ${fmtNum(spam.simspam_count)} unit saat ini. (4) Meningkatkan kelengkapan metadata GPS/foto menuju target 90% paket aktif. (5) Memperkaya data capaian sanitasi di ${fmtNum(san.desa_without_infrastruktur)} desa yang belum berinfrastruktur terpetakan.`,
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
                    `Hasil penyelenggaraan inovasi Arumanis per ${fetched} berupa produk digital yang mendukung monitoring konstruksi dan pengolahan data real-time.`,
                ),
                body(
                    'Platform Arumanis Utama (arumanis.cianjur.space) meliputi dashboard monitoring pekerjaan, modul kegiatan dan kontrak, SPAM Unit, indikator kualitas data, notifikasi, dan asisten Ami AI. Panel Pengawasan Terintegrasi (/pengawasan/) menjadi sarana utama pengawas memantau progress konstruksi, mengunggah dokumentasi, dan menyusun laporan mingguan dengan SSO dari akun yang sama.',
                ),
                body(
                    `Backend api amis (apiamis.cianjur.space) menjadi pusat penyimpanan dan validasi data. Halaman publik menampilkan peta capaian SPM dan sanitasi per desa. Basis data terintegrasi memuat ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(spam.total_units)} unit SPAM, ${fmtNum(san.total_count)} infrastruktur sanitasi, ${fmtNum(spam.total_foto_dokumentasi)} foto, dan ${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} record capaian (${earliestYear}–${scope.latestAchievementYear ?? '2026'}).`,
                ),
                body(
                    'Arumanis (Air Minum dan Sanitasi) adalah platform digital monitoring konstruksi SPAM perdesaan dan sanitasi—khususnya pengelolaan air limbah—serta pengolahan data real-time di Kabupaten Cianjur. Per ' +
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