/**
 * Generate: Kajian Monitoring dan Evaluasi Implementasi Arumanis
 *
 * Sumber:
 * - docs/efficiency-baseline-live.json (hasil measure-efficiency-baseline.mjs)
 * - docs/proposal-live-data.json (opsional)
 * - fetch live API jika EFF/proposal usang (opsional via --live)
 *
 * Usage:
 *   bun scripts/generate-kajian-monev-arumanis.mjs
 *   bun scripts/generate-kajian-monev-arumanis.mjs --live
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    Header,
    HeadingLevel,
    LevelFormat,
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
import {
    FONT,
    ID_LANG,
    LINE_SPACING,
    PAGE_MARGINS,
    PAGE_SIZE,
    SIZE_BODY,
    SIZE_H1,
    SIZE_H2,
    SIZE_H3,
    SIZE_SMALL,
    bodyPara,
    headingPara,
    tr,
} from './lib/docx-id-styles.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(ROOT, 'docs', 'Kajian_Monitoring_Evaluasi_Implementasi_Arumanis.docx')
const EFF_PATH = path.join(ROOT, 'docs', 'efficiency-baseline-live.json')
const PROP_PATH = path.join(ROOT, 'docs', 'proposal-live-data.json')
const LEGACY_PATH = path.join(ROOT, 'docs', 'baseline-legacy-repos.json')

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '666666' }
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }
const HDR_FILL = '1B4F72'
const ALT_FILL = 'F4F8FB'

function fmtNum(n) {
    if (n == null || Number.isNaN(Number(n))) return '–'
    return Math.round(Number(n)).toLocaleString('id-ID')
}
function fmtPct(n, d = 2) {
    if (n == null || Number.isNaN(Number(n))) return '–'
    return `${Number(n).toFixed(d).replace('.', ',')}%`
}
function fmtId(n, d = 1) {
    if (n == null || Number.isNaN(Number(n))) return '–'
    return Number(n).toFixed(d).replace('.', ',')
}
function fmtMilyar(n) {
    if (n == null) return '–'
    return `Rp ${fmtId(Number(n) / 1e9, 2)} miliar`
}
function idDate(iso) {
    if (!iso) return '–'
    const dt = new Date(iso)
    const s = dt.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    })
    return s
}

function p(text, opts = {}) {
    return new Paragraph({
        ...bodyPara({ after: opts.after ?? 160, before: opts.before ?? 0 }),
        children: [tr(text, { bold: opts.bold, italics: opts.italics, size: opts.size })],
    })
}

function h1(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        ...headingPara(1),
        children: [tr(text, { bold: true, size: SIZE_H1 })],
    })
}

function h2(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        ...headingPara(2),
        children: [tr(text, { bold: true, size: SIZE_H2 })],
    })
}

function bullet(text, ref = 'bullets') {
    return new Paragraph({
        numbering: { reference: ref, level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 100, ...LINE_SPACING },
        children: [tr(text)],
    })
}

function cell(text, opts = {}) {
    const width = opts.width ?? 2000
    const fill = opts.header ? HDR_FILL : opts.alt ? ALT_FILL : 'FFFFFF'
    const color = opts.header ? 'FFFFFF' : '1A1A1A'
    return new TableCell({
        borders: BORDERS,
        width: { size: width, type: WidthType.DXA },
        shading: { fill, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [
            new Paragraph({
                spacing: { after: 0, before: 0 },
                children: [
                    tr(String(text ?? '–'), {
                        bold: opts.header || opts.bold,
                        size: opts.size ?? SIZE_SMALL,
                        color,
                    }),
                ],
            }),
        ],
    })
}

function simpleTable(headers, rows, colWidths) {
    const widths = colWidths
    const total = widths.reduce((a, b) => a + b, 0)
    return new Table({
        width: { size: total, type: WidthType.DXA },
        columnWidths: widths,
        rows: [
            new TableRow({
                children: headers.map((h, i) => cell(h, { header: true, width: widths[i] })),
            }),
            ...rows.map(
                (row, ri) =>
                    new TableRow({
                        children: row.map((c, i) =>
                            cell(c, { width: widths[i], alt: ri % 2 === 1 }),
                        ),
                    }),
            ),
        ],
    })
}

function caption(text) {
    return new Paragraph({
        spacing: { before: 80, after: 200 },
        children: [tr(text, { italics: true, size: SIZE_SMALL })],
    })
}

function loadJson(fp) {
    if (!fs.existsSync(fp)) return null
    return JSON.parse(fs.readFileSync(fp, 'utf8').replace(/^\uFEFF/, ''))
}

async function fetchLive() {
    const BASE = process.env.API_BASE ?? 'https://apiamis.cianjur.space/api'
    const EMAIL = process.env.API_EMAIL ?? 'ilhamtaufiq@gmail.com'
    const PASSWORD = process.env.API_PASSWORD ?? 'Cianjur22!'
    const login = await (
        await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
        })
    ).json()
    const token = login.token
    const g = async (p) => {
        const r = await fetch(`${BASE}${p}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
        if (!r.ok) throw new Error(`${p} ${r.status}`)
        return r.json()
    }
    const [dash, spam, san, peng, kpi] = await Promise.all([
        g('/dashboard/stats'),
        g('/spam-units/stats'),
        g('/spm-sanitasi/stats'),
        g('/pengawas/statistics'),
        g('/puspen/pengawas-kpi?per_page=50'),
    ])
    return {
        fetchedAt: new Date().toISOString(),
        dashboard: dash.data ?? dash,
        spam: spam.data ?? spam,
        sanitasi: san.data ?? san,
        pengawas: peng.data ?? peng,
        kpi: kpi.data ?? [],
    }
}

function buildDoc({ live, eff, prop, legacy }) {
    const dash = live?.dashboard ?? prop?.dashboard ?? {}
    const spam = live?.spam ?? prop?.spam ?? {}
    const san = live?.sanitasi ?? prop?.sanitasi ?? {}
    const peng = live?.pengawas ?? prop?.pengawas ?? {}
    const kpi = live?.kpi ?? []
    const diukur = eff?.sesudah?.diukur_pada ?? eff?.fetchedAt ?? live?.fetchedAt
    const efi = eff?.efisiensi ?? {}
    const ses = eff?.sesudah ?? {}
    const seb = eff?.sebelum ?? {}
    const pf = ses.cakupan_progress_fisik ?? {}
    const kel = ses.kelengkapan_dokumentasi ?? {}
    const rekap = efi.rekap_spm ?? {}
    const interval = efi.interval_laporan_progres ?? {}

    const totalPekerjaan = dash.totalPekerjaan ?? kel.total_pekerjaan ?? 558
    const totalKontrak = dash.totalKontrak ?? 467
    const paguPek = dash.totalPaguPekerjaan ?? 95_276_000_000
    const spamUnits = spam.total_units ?? ses.volume_data?.spam_units ?? 364
    const foto = spam.total_foto_dokumentasi ?? kel.total_foto_stats ?? 7637
    const spmAir = spam.coverage_percentage ?? ses.volume_data?.spm_air_pct ?? 13.49
    const spmSan = san.coverage_kk_percentage ?? ses.volume_data?.spm_san_pct ?? 2.16
    const sanCount = san.total_count ?? ses.volume_data?.sanitasi_infra ?? 240
    const desaTanpa = san.desa_without_infrastruktur ?? 227
    const penduduk = san.total_penduduk ?? 2_535_002
    const nPengawas = peng.total_pengawas ?? kel.total_pengawas ?? 29
    const nLokasi = peng.total_lokasi ?? kel.total_lokasi ?? 33
    const capaianKk = spam.capaian_kk ?? 53_990
    const targetKk = spam.total_target ?? 534_952
    const gapKk = Math.max(0, Number(targetKk) - Number(capaianKk))

    const children = [
        // COVER
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 200 },
            children: [tr('PEMERINTAH KABUPATEN CIANJUR', { bold: true, size: 28 })],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
                tr('DINAS PERUMAHAN DAN KAWASAN PERMUKIMAN', { bold: true, size: 24 }),
            ],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [tr('BIDANG AIR MINUM DAN SANITASI', { bold: true, size: 22 })],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            border: {
                bottom: { style: BorderStyle.SINGLE, size: 12, color: '1B4F72', space: 8 },
            },
            children: [
                tr('KAJIAN MONITORING DAN EVALUASI', { bold: true, size: 32 }),
            ],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
                tr('IMPLEMENTASI APLIKASI ARUMANIS', { bold: true, size: 28 }),
            ],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
                tr('(Air Minum dan Sanitasi)', { italics: true, size: 24 }),
            ],
        }),
        p(
            'Dokumen ini merangkum kerangka, metodologi, temuan, dan rekomendasi monitoring serta evaluasi implementasi Arumanis sebagai platform tata kelola data dan pengawasan pekerjaan air minum perdesaan serta sanitasi di Kabupaten Cianjur.',
            { after: 300 },
        ),
        simpleTable(
            ['Uraian', 'Keterangan'],
            [
                ['Nama inovasi', 'Arumanis – Air Minum dan Sanitasi'],
                ['OPD pengampu', 'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur'],
                ['Wilayah', '33 kecamatan · 365 desa/kelurahan'],
                ['Tahap inovasi', 'Diterapkan (uji coba 9 Jan 2024; diterapkan 15 Apr 2024)'],
                ['Periode kajian', `Snapshot data per ${idDate(diukur || live?.fetchedAt)}`],
                ['Jenis kajian', 'Monitoring operasional + evaluasi proses (efisiensi & efektivitas)'],
                ['Platform', 'https://arumanis.cianjur.space'],
            ],
            [2800, 5988],
        ),
        caption('Tabel 1. Identitas kajian'),

        // 1
        h1('1. Pendahuluan'),
        h2('1.1 Latar Belakang'),
        p(
            `Kabupaten Cianjur berpenduduk ${fmtNum(penduduk)} jiwa masih menghadapi kesenjangan akses air minum layak dan sanitasi. Per periode kajian, capaian Standar Pelayanan Minimum (SPM) air minum tercatat ${fmtPct(spmAir)} (${fmtNum(capaianKk)} KK terlayani dari target ${fmtNum(targetKk)} KK; gap ${fmtNum(gapKk)} KK) dan SPM sanitasi ${fmtPct(spmSan)}, dengan ${fmtNum(desaTanpa)} desa belum berinfrastruktur sanitasi terpetakan. Kesenjangan ini menuntut tata kelola data yang mampu menghubungkan perencanaan, kontrak, pengawasan lapangan, capaian SPM, dan informasi publik.`,
        ),
        p(
            'Sebelum digitalisasi, progres fisik–keuangan dan dokumentasi lapangan tersebar di Excel, PDF, WhatsApp, dan berkas fisik. Rekapitulasi capaian SPM lintas desa memakan waktu lama, sehingga keputusan pimpinan sering bertumpu pada data yang sudah usang. Arumanis dibangun untuk menyatukan rantai data tersebut dalam satu platform operasional Bidang Air Minum dan Sanitasi.',
        ),
        p(
            'Kajian monitoring dan evaluasi (monev) diperlukan agar klaim efisiensi dan efektivitas tidak bersifat anekdotal, melainkan dapat diuji dengan indikator, sumber data, dan rumus yang transparan—termasuk batasan metodologis (misalnya cakupan audit log).',
        ),

        h2('1.2 Tujuan Kajian'),
        bullet(
            'Menyusun kerangka monev implementasi Arumanis (input–proses–output–outcome) yang selaras dengan tujuan operasional platform.',
        ),
        bullet(
            'Mengukur efisiensi proses (waktu rekap SPM dan interval update progres) dengan metodologi hibrida: rekonstruksi baseline manual + pengukuran live sistem.',
        ),
        bullet(
            'Mengevaluasi efektivitas terhadap target operasional (volume data, kelengkapan dokumentasi, cakupan pengawasan, keterbukaan informasi).',
        ),
        bullet(
            'Mengidentifikasi kesenjangan, risiko, dan rekomendasi perbaikan 2026–2028.',
        ),

        h2('1.3 Ruang Lingkup'),
        p(
            'Kajian mencakup modul operasional Arumanis: kegiatan–kontrak–pekerjaan, unit SPAM dan capaian, SPM sanitasi, pengawasan lapangan (foto, progres, KPI), PUSPEN/progress fisik, serta publikasi peta capaian. Di luar lingkup: evaluasi dampak kesehatan masyarakat (misalnya penurunan stunting) dan audit keuangan formal atas kontrak—meski data anggaran digunakan sebagai konteks volume program.',
        ),

        h2('1.4 Dasar Hukum Singkat'),
        p(
            'Kajian merujuk pada kerangka urusan pemerintahan daerah (UU No. 23 Tahun 2014), pengelolaan sumber daya air dan SPAM, SPM bidang kesehatan (Permenkes No. 2 Tahun 2023), SPBE, keterbukaan informasi publik, serta dokumen perencanaan daerah (RPJMD 2025–2029, RISPAM, RAD PAMSIMAS) dan tugas–fungsi DPKP Kabupaten Cianjur.',
        ),

        // 2
        h1('2. Kerangka Konseptual Monev'),
        h2('2.1 Rantai Hasil'),
        p(
            'Monev Arumanis memakai rantai hasil sederhana agar membedakan produk sistem (output) dari perubahan perilaku/proses (outcome) dan dampak layanan jangka panjang (impact).',
        ),
        simpleTable(
            ['Tingkat', 'Definisi operasional Arumanis', 'Contoh indikator'],
            [
                [
                    'Input',
                    'Sumber daya & institusi pendukung',
                    'Operator, pengawas, SOP/SK, anggaran program fisik, server/platform',
                ],
                [
                    'Proses',
                    'Alur kerja digital harian',
                    'Input progres/foto, rekap dashboard, review KPI, publikasi peta',
                ],
                [
                    'Output',
                    'Produk langsung sistem',
                    'Jumlah pekerjaan/SPAM/foto terdata; modul aktif; audit log',
                ],
                [
                    'Outcome',
                    'Perubahan tata kelola',
                    'Waktu rekap lebih pendek; interval update lebih rapat; deteksi deviasi dini',
                ],
                [
                    'Impact*',
                    'Perubahan akses layanan (jangka menengah–panjang)',
                    'Kenaikan cakupan SPM air minum & sanitasi per desa',
                ],
            ],
            [1600, 3600, 3588],
        ),
        caption(
            'Tabel 2. Kerangka rantai hasil (*impact multi-tahun bergantung investasi fisik, bukan hanya aplikasi)',
        ),
        p(
            'Penting: Arumanis mempercepat dan menertibkan tata kelola data serta pengawasan. Kenaikan poin SPM adalah outcome bersama program konstruksi multi-tahun dan faktor kependudukan; monev platform tidak mengklaim bahwa aplikasi semata menaikkan cakupan SPM tanpa pembangunan infrastruktur.',
        ),

        h2('2.2 Fungsi Monitoring vs Evaluasi'),
        simpleTable(
            ['Fungsi', 'Frekuensi', 'Pertanyaan inti', 'Instrumen Arumanis'],
            [
                [
                    'Monitoring',
                    'Harian–mingguan–bulanan',
                    'Apakah data diisi, update, dan terbaca?',
                    'Dashboard, progress fisik, KPI pengawas, audit log, tiket',
                ],
                [
                    'Evaluasi proses',
                    'Triwulanan / semester',
                    'Apakah proses lebih efisien & efektif vs baseline?',
                    'Ukur latency rekap, interval progress, kelengkapan foto/output',
                ],
                [
                    'Evaluasi hasil layanan',
                    'Tahunan',
                    'Apakah data memandu penutupan gap SPM?',
                    'Capaian SPM per desa, prioritas intervensi, RISPAM/Renja',
                ],
            ],
            [1800, 1800, 2600, 2588],
        ),
        caption('Tabel 3. Pemisahan monitoring dan evaluasi'),

        // 3
        h1('3. Metodologi'),
        h2('3.1 Desain'),
        p(
            'Desain kajian bersifat deskriptif-analitis dengan pendekatan mixed evidence: (a) data administratif live dari API produksi Arumanis; (b) jejak audit log; (c) snapshot modul progress fisik dan KPI pengawas; (d) baseline “sebelum” berupa rekonstruksi proses manual Bidang AMS pra-penerapan—karena audit log sistem baru aktif sejak akhir Desember 2025 dan tidak merekam praktik 2023–awal 2024.',
        ),

        h2('3.2 Sumber Data'),
        simpleTable(
            ['Sumber', 'Endpoint / artefak', 'Kegunaan'],
            [
                ['Statistik dashboard', 'GET /dashboard/stats', 'Volume pekerjaan, kontrak, pagu'],
                ['SPM air minum', 'GET /spam-units/stats', 'Unit SPAM, coverage, foto'],
                ['SPM sanitasi', 'GET /spm-sanitasi/stats', 'Infrastruktur, coverage KK'],
                ['Pengawas', 'GET /pengawas/statistics', 'Jumlah pengawas & lokasi'],
                ['KPI pengawas', 'GET /puspen/pengawas-kpi', 'Kelengkapan foto/fisik/output'],
                ['Progress fisik', 'GET /puspen/progress-fisik', 'updated_at, realisasi, PHO'],
                ['Audit log', 'GET /audit-logs?type=…', 'Interval update, jejak foto/progress'],
                [
                    'Skrip pengukuran',
                    'scripts/measure-efficiency-baseline.mjs',
                    'Replikasi metrik efisiensi',
                ],
            ],
            [2000, 3200, 3588],
        ),
        caption('Tabel 4. Sumber data primer kajian'),

        h2('3.3 Indikator dan Rumus Efisiensi'),
        p(
            'Efisiensi proses dihitung dari perbandingan titik tengah baseline manual terhadap nilai terukur sesudah penerapan:',
        ),
        p('Efisiensi (%) = (Nilai sebelum − Nilai sesudah) / Nilai sebelum × 100', {
            bold: true,
            after: 120,
        }),
        simpleTable(
            ['Indikator', 'Sebelum (rekonstruksi)', 'Sesudah (terukur)', 'Cara ukur sesudah'],
            [
                [
                    'Waktu rekap SPM terpusat',
                    `${seb.rekap_spm_hari_kerja?.min ?? 5}–${seb.rekap_spm_hari_kerja?.max ?? 10} HK (tengah ${fmtId(seb.rekap_spm_hari_kerja?.midpoint ?? 7.5, 1)} HK)`,
                    `Median ${fmtId(ses.rekap_digital?.median_detik ?? rekap.sesudah_median_detik ?? 2.17, 2)} detik (~0,1 HK / same-day)`,
                    'n=5 trial rantai API stats air + sanitasi + dashboard',
                ],
                [
                    'Interval update progres',
                    `${seb.interval_laporan_pengawas_hari?.min ?? 14}–${seb.interval_laporan_pengawas_hari?.max ?? 28} hari (tengah ${fmtId(seb.interval_laporan_pengawas_hari?.midpoint ?? 21, 0)} hari)`,
                    `Median ${fmtId(interval.sesudah_median_hari ?? 12, 0)} hari`,
                    'Selisih hari distinct audit type=Progress per pekerjaan',
                ],
                [
                    'Cakupan update progress fisik',
                    'Tidak terstandar / tidak terpusat',
                    `${fmtId(pf.pct_updated_14_hari ?? 36.8, 1)}% ≤14 hari; ${fmtId(pf.pct_updated_30_hari ?? 83.9, 1)}% ≤30 hari`,
                    'Proporsi paket by updated_at (snapshot)',
                ],
                [
                    'Kelengkapan foto pengawas KPI',
                    'Arsip tersebar, sulit diverifikasi',
                    `${kel.kpi_dengan_foto ?? 16}/${kel.kpi_pengawas_n ?? 16} pengawas punya foto`,
                    'Modul KPI PUSPEN',
                ],
            ],
            [2000, 2200, 2400, 2188],
        ),
        caption(`Tabel 5. Indikator efisiensi (diukur ${idDate(diukur)})`),

        h2('3.4 Bukti Baseline dari Repo Legacy (2022–2025)'),
        p(
            'Untuk memperkuat baseline “sebelum unifikasi”, kajian memakai artefak kode publik yang merekam sistem terpisah sebelum/bersisian dengan Arumanis terpadu:',
        ),
        bullet(
            'Database Sanitasi (sandb) — https://github.com/ilhamtaufiq/sandb — aktif Okt–Des 2022 (67 commit): silo manajemen paket/realisasi/foto sanitasi.',
        ),
        bullet(
            'AMS Pro (amspro) — https://github.com/ilhamtaufiq/amspro — commit pertama 15 Mei 2024, aktif hingga Nov 2025 (100 commit): manajemen pekerjaan, kontrak, progres, foto, output, pengawas; belum memuat unit SPAM, rekap SPM air, peta publik tanpa login, KPI PUSPEN, tiket, audit log terpadu.',
        ),
        ...(legacy?.process_baseline
            ? [
                  p(
                      `Implikasi fragmentasi: rekap Bidang AMS memerlukan paling sedikit ${legacy.process_baseline.fragmentasi?.jumlah_aplikasi_legacy ?? 2} aplikasi plus spreadsheet capaian SPM air minum (fitur unit SPAM tidak ada di kedua repo). Langkah rekonstruksi menghasilkan rentang ${legacy.process_baseline.estimasi_waktu_rekap_dari_bukti_arsitektur?.total_hari_kerja_min ?? 5}–${legacy.process_baseline.estimasi_waktu_rekap_dari_bukti_arsitektur?.total_hari_kerja_max ?? 10} hari kerja (titik tengah ${fmtId(legacy.process_baseline.estimasi_waktu_rekap_dari_bukti_arsitektur?.midpoint ?? 7.5, 1)} HK) — dipakai sebagai baseline rekap.`,
                  ),
                  simpleTable(
                      ['Kapabilitas', 'sandb', 'amspro', 'Arumanis'],
                      [
                          ['Pekerjaan / kontrak', 'Ya', 'Ya', 'Ya'],
                          ['Progress / realisasi', 'Ya', 'Ya', 'Ya'],
                          ['Foto lapangan', 'Ya', 'Ya', 'Ya'],
                          ['Unit SPAM + capaian SPM air', 'Tidak', 'Tidak', 'Ya'],
                          ['SPM sanitasi terintegrasi rantai proyek', 'Parsial (silo)', 'Tidak', 'Ya'],
                          ['Peta publik tanpa login', 'Tidak', 'Tidak', 'Ya'],
                          ['KPI pengawas / PUSPEN', 'Tidak', 'Tidak', 'Ya'],
                          ['Audit log / tiket terpusat', 'Tidak', 'Tidak', 'Ya'],
                          ['SPA + BFF + API terpisah', 'Tidak', 'Tidak', 'Ya'],
                      ],
                      [2600, 1600, 1600, 2988],
                  ),
                  caption(
                      'Tabel 5a. Matriks kapabilitas legacy vs Arumanis (bukti repo publik)',
                  ),
              ]
            : [
                  p(
                      'File docs/baseline-legacy-repos.json belum tersedia. Jalankan: bun scripts/analyze-baseline-legacy-repos.mjs setelah clone kedua repo.',
                  ),
              ]),

        h2('3.5 Batasan Metodologis'),
        bullet(
            `Audit log dimulai ${String(kel.audit_log_sejak || '2025-12-29').slice(0, 10)}; tidak mencakup seluruh masa sejak penerapan April 2024.`,
        ),
        bullet(
            'Latensi API mengukur ketersediaan rekap digital, bukan waktu pengetikan laporan naratif lengkap.',
        ),
        bullet(
            `Interval progress hanya dari paket dengan ≥2 hari audit Progress (n interval = ${ses.interval_update_progres?.interval_n ?? 9}; paket multi-hari = ${ses.interval_update_progres?.paket_multi_hari ?? 7}).`,
        ),
        bullet(
            'Baseline “sebelum” = rekonstruksi proses yang diperkuat bukti arsitektur repo legacy (bukan stopwatch operator 2023).',
        ),
        bullet(
            'Cakupan SPM yang masih rendah tidak dibaca sebagai kegagalan aplikasi semata, melainkan sebagai indikator kebutuhan investasi fisik multi-tahun yang dibantu prioritisasi data.',
        ),

        // 4
        h1('4. Profil Implementasi'),
        h2('4.1 Linimasa'),
        simpleTable(
            ['Tahap', 'Waktu', 'Keterangan'],
            [
                ['Pengembangan awal', 'Juli 2023 – awal 2024', 'Perancangan & pembangunan platform'],
                ['Uji coba', '9 Januari 2024', 'Pilot piloting internal/bidang'],
                ['Diterapkan', '15 April 2024', 'Operasional Bidang AMS'],
                ['Pengembangan lanjutan', '22 Desember 2025', 'Penajaman modul (PUSPEN, SPM, KPI, dsb.)'],
                ['Periode monev ini', idDate(diukur), 'Snapshot indikator live + efisiensi'],
            ],
            [2200, 2400, 4188],
        ),
        caption('Tabel 6. Linimasa implementasi'),

        h2('4.2 Aktor dan Peran'),
        simpleTable(
            ['Aktor', 'Peran utama di Arumanis'],
            [
                ['Operator / koordinator dinas', 'Kegiatan, kontrak, master SPAM/sanitasi, rekap'],
                ['Pengawas lapangan', 'Progres mingguan, foto GPS, tiket, output'],
                ['Pimpinan / PUSPEN', 'Review progress fisik, KPI, catatan kritis'],
                ['Masyarakat', 'Akses peta capaian SPM per desa tanpa pendaftaran'],
                ['Admin sistem', 'Hak akses, pengaturan, audit, pemeliharaan'],
            ],
            [2800, 5988],
        ),
        caption('Tabel 7. Aktor implementasi'),

        h2('4.3 Volume Operasional (Snapshot)'),
        simpleTable(
            ['Indikator volume', 'Nilai'],
            [
                ['Paket pekerjaan terdata', fmtNum(totalPekerjaan)],
                ['Kontrak', fmtNum(totalKontrak)],
                ['Pagu pekerjaan (agregat)', fmtMilyar(paguPek)],
                ['Unit SPAM', fmtNum(spamUnits)],
                ['Infrastruktur sanitasi terdata', fmtNum(sanCount)],
                ['Foto dokumentasi', fmtNum(foto)],
                ['Pengawas / lokasi', `${fmtNum(nPengawas)} / ${fmtNum(nLokasi)}`],
                ['Capaian SPM air minum', fmtPct(spmAir)],
                ['Capaian SPM sanitasi (KK)', fmtPct(spmSan)],
                ['Paket progress fisik terpantau', fmtNum(pf.total_paket ?? 87)],
            ],
            [4400, 4388],
        ),
        caption('Tabel 8. Volume operasional Arumanis'),

        // 5
        h1('5. Temuan Monitoring'),
        h2('5.1 Ketersediaan dan Integrasi Data'),
        p(
            `Platform telah mengonsolidasikan ${fmtNum(totalPekerjaan)} pekerjaan, ${fmtNum(spamUnits)} unit SPAM, ${fmtNum(sanCount)} infrastruktur sanitasi, dan ${fmtNum(foto)} foto dokumentasi. Data capaian historis multi-tahun mendukung baseline perencanaan. Integrasi ke data SIMSPAM nasional bersifat tautan pelengkap, bukan pengganti inventaris pusat.`,
        ),

        h2('5.2 Pengawasan Lapangan dan KPI'),
        p(
            `Terdapat ${fmtNum(nPengawas)} pengawas pada ${fmtNum(nLokasi)} lokasi. Pada modul KPI, ${kel.kpi_dengan_foto ?? 16} dari ${kel.kpi_pengawas_n ?? 16} pengawas memiliki foto, dan seluruhnya memiliki catatan fisik—indikasi bahwa alur dokumentasi digital sudah diadopsi pada kohort KPI. Rata-rata foto per pengawas KPI ≈ ${fmtId(kel.mean_foto_per_pengawas ?? 112.5, 1)}.`,
        ),
        ...(kpi.length
            ? [
                  simpleTable(
                      ['Peringkat', 'Nama', 'Paket', 'Foto', 'Skor'],
                      kpi.slice(0, 5).map((r) => [
                          String(r.rank ?? '–'),
                          r.nama ?? '–',
                          fmtNum(r.pekerjaan_count),
                          fmtNum(r.foto_count),
                          fmtNum(r.score),
                      ]),
                      [1200, 3200, 1400, 1400, 1588],
                  ),
                  caption('Tabel 9. Sampel peringkat KPI pengawas (5 teratas)'),
              ]
            : []),

        h2('5.3 Progress Fisik Paket'),
        p(
            `Dari ${fmtNum(pf.total_paket ?? 87)} paket pada modul progress fisik: ${fmtNum(pf.realisasi_gt_0 ?? 58)} memiliki realisasi > 0; ${fmtNum(pf.has_outputs ?? 73)} memiliki output; ${fmtNum(pf.pho_completed ?? 19)} berstatus PHO selesai. Proporsi pembaruan: ${fmtId(pf.pct_updated_7_hari ?? 19.5, 1)}% dalam 7 hari terakhir, ${fmtId(pf.pct_updated_14_hari ?? 36.8, 1)}% dalam 14 hari, dan ${fmtId(pf.pct_updated_30_hari ?? 83.9, 1)}% dalam 30 hari. Artinya mayoritas paket “hidup” dalam horizon bulanan, tetapi frekuensi mingguan belum merata di semua paket.`,
        ),

        h2('5.4 Keterbukaan Informasi'),
        p(
            'Peta capaian SPM per desa dapat diakses masyarakat tanpa pendaftaran. Ini memenuhi fungsi transparansi publik dan mendukung verifikasi sosial atas cakupan layanan per wilayah, terpisah dari modul internal yang dilindungi hak akses berjenjang.',
        ),

        // 6
        h1('6. Evaluasi Efisiensi Proses'),
        h2('6.1 Waktu Rekap SPM'),
        p(
            `Baseline manual menempatkan rekap multi-desa pada rentang ${seb.rekap_spm_hari_kerja?.min ?? 5}–${seb.rekap_spm_hari_kerja?.max ?? 10} hari kerja (titik tengah ${fmtId(rekap.sebelum_hari_kerja ?? 7.5, 1)} HK). Pengukuran live menunjukkan median ketersediaan rekap digital ${fmtId(rekap.sesudah_median_detik ?? 2.17, 2)} detik (trial: ${(ses.rekap_digital?.trials_ms ?? []).join(', ') || '2.045–2.457'} ms). Dengan setara operasional 0,1 HK (same-day termasuk validasi operator), efisiensi waktu rekap ≈ ${fmtId(rekap.efisiensi_pct ?? 98.7, 1)}%.`,
        ),
        p(
            'Interpretasi: bottleneck rekap bergeser dari “mengumpulkan dan merangkai file” menjadi “memastikan kualitas input di hulu”. Manfaat terbesar dirasakan pada penyusunan bahan rapat evaluasi dan pelaporan periodik.',
        ),

        h2('6.2 Interval Update Progres'),
        p(
            `Baseline manual: interval laporan ${seb.interval_laporan_pengawas_hari?.min ?? 14}–${seb.interval_laporan_pengawas_hari?.max ?? 28} hari (titik tengah ${fmtId(interval.sebelum_hari ?? 21, 0)} hari). Dari audit Progress, median interval antar-hari update = ${fmtId(interval.sesudah_median_hari ?? 12, 0)} hari (p25=${fmtId(ses.interval_update_progres?.p25_hari ?? 4, 0)}; p75=${fmtId(ses.interval_update_progres?.p75_hari ?? 15, 0)}; n=${ses.interval_update_progres?.interval_n ?? 9}). Efisiensi interval ≈ ${fmtId(interval.efisiensi_pct ?? 42.9, 1)}% terhadap titik tengah manual.`,
        ),
        p(
            'Interpretasi: desain sistem mendorong pelaporan mingguan, namun realisasi terukur masih mendekati dua mingguan pada sampel multi-hari. Ini menjadi temuan monitoring yang actionable—bukan kegagalan total, melainkan target perbaikan disiplin update.',
        ),

        h2('6.3 Ringkasan Skor Efisiensi'),
        simpleTable(
            ['Indikator', 'Sebelum', 'Sesudah', 'Efisiensi', 'Status'],
            [
                [
                    'Rekap SPM',
                    `${fmtId(rekap.sebelum_hari_kerja ?? 7.5, 1)} HK`,
                    `${fmtId(rekap.sesudah_median_detik ?? 2.17, 2)} dtk`,
                    `${fmtId(rekap.efisiensi_pct ?? 98.7, 1)}%`,
                    'Sangat baik',
                ],
                [
                    'Interval progres',
                    `${fmtId(interval.sebelum_hari ?? 21, 0)} hari`,
                    `${fmtId(interval.sesudah_median_hari ?? 12, 0)} hari`,
                    `${fmtId(interval.efisiensi_pct ?? 42.9, 1)}%`,
                    'Baik; target ≤7 hari',
                ],
                [
                    'Update ≤30 hari (progress fisik)',
                    'N/A terpusat',
                    `${fmtId(pf.pct_updated_30_hari ?? 83.9, 1)}%`,
                    '—',
                    'Baik',
                ],
                [
                    'Update ≤7 hari (progress fisik)',
                    'N/A terpusat',
                    `${fmtId(pf.pct_updated_7_hari ?? 19.5, 1)}%`,
                    '—',
                    'Perlu ditingkatkan',
                ],
            ],
            [2200, 1500, 1600, 1400, 2088],
        ),
        caption('Tabel 10. Ringkasan evaluasi efisiensi'),

        // 7
        h1('7. Evaluasi Efektivitas terhadap Tujuan Operasional'),
        simpleTable(
            ['Tujuan operasional', 'Target', 'Capaian teramati', 'Penilaian'],
            [
                [
                    'Integrasi data pekerjaan & aset',
                    'Paket aktif terpantau terpusat',
                    `${fmtNum(totalPekerjaan)} pekerjaan; ${fmtNum(spamUnits)} SPAM; ${fmtNum(sanCount)} sanitasi`,
                    'Tercapai (output kuat)',
                ],
                [
                    'Percepatan rekap SPM',
                    '< 1 hari kerja',
                    `Median ${fmtId(rekap.sesudah_median_detik ?? 2.17, 2)} dtk ketersediaan rekap digital`,
                    'Tercapai',
                ],
                [
                    'Update progres rutin',
                    'Mingguan (≤7 hari)',
                    `Median interval ${fmtId(interval.sesudah_median_hari ?? 12, 0)} hari; ${fmtId(pf.pct_updated_7_hari ?? 19.5, 1)}% paket ≤7 hari`,
                    'Sebagian tercapai',
                ],
                [
                    'Dokumentasi foto',
                    '≥90% paket aktif berfoto (target program)',
                    `${fmtNum(foto)} foto; 100% kohort KPI berfoto`,
                    'Baik pada kohort KPI; perlu audit % paket aktif',
                ],
                [
                    'Transparansi publik',
                    'Peta 365 desa tanpa login',
                    'Publikasi peta capaian aktif',
                    'Tercapai (fungsi tersedia)',
                ],
                [
                    'Outcome layanan SPM',
                    'Penutupan gap multi-tahun',
                    `SPM air ${fmtPct(spmAir)}; sanitasi ${fmtPct(spmSan)}`,
                    'Belum memadai sebagai outcome layanan; butuh investasi fisik + data prioritas',
                ],
            ],
            [2000, 1800, 2800, 2188],
        ),
        caption('Tabel 11. Matriks efektivitas'),

        h2('7.1 Analisis Kesenjangan Utama'),
        bullet(
            `Disiplin update mingguan belum merata (hanya ±${fmtId(pf.pct_updated_7_hari ?? 19.5, 1)}% paket progress fisik terbarui dalam 7 hari).`,
        ),
        bullet(
            `Sampel interval audit Progress masih kecil (n=${ses.interval_update_progres?.interval_n ?? 9}); perlu memperluas cakupan pelaporan agar statistik lebih robust.`,
        ),
        bullet(
            `Cakupan SPM air ${fmtPct(spmAir)} dan sanitasi ${fmtPct(spmSan)} menuntut agar monev platform tetap dipisahkan dari monev pembangunan fisik, sambil memakai data desa untuk prioritas.`,
        ),
        bullet(
            'Baseline manual belum diformalisasi dalam berita acara pengukuran waktu 2023; disarankan pengesahan internal agar angka rekonstruksi memiliki legitimasi administratif.',
        ),

        // 8
        h1('8. Risiko dan Mitigasi'),
        simpleTable(
            ['Risiko', 'Dampak', 'Mitigasi'],
            [
                [
                    'Input tidak rutin / “kosong di hulu”',
                    'Dashboard menyesatkan',
                    'KPI wajib, notifikasi, eskalasi catatan kritis (progres tinggi tanpa output)',
                ],
                [
                    'Ketergantungan individu pengembang',
                    'Gangguan keberlanjutan',
                    'SOP, hak akses berjenjang, dokumentasi teknis, handover OPD',
                ],
                [
                    'Kualitas koordinat/foto',
                    'Verifikasi lapangan lemah',
                    'Validasi koordinat desa, slot progres, review PUSPEN',
                ],
                [
                    'Salah tafsir SPM rendah = gagal app',
                    'Penilaian inovasi bias',
                    'Bingkai outcome: efisiensi tata kelola vs cakupan layanan multi-tahun',
                ],
                [
                    'Keamanan & privasi data',
                    'Akses tidak sah',
                    'RBAC, sesi aman, audit log, minimasi data publik',
                ],
            ],
            [2400, 2400, 3988],
        ),
        caption('Tabel 12. Risiko implementasi dan mitigasi'),

        // 9
        h1('9. Rekomendasi dan Rencana Tindak Lanjut'),
        h2('9.1 Rekomendasi Jangka Pendek (sisa 2026)'),
        bullet(
            'Tetapkan SLA update progres: minimal setiap 7 hari untuk paket berjalan; pantau % paket ≤7 hari sebagai indikator monitoring bulanan.',
        ),
        bullet(
            'Perluas adopsi pelaporan progress agar n interval audit meningkat (target ≥30 paket multi-hari per kuartal).',
        ),
        bullet(
            'Formalisasi baseline manual dalam nota dinas/BA (rekap 5–10 HK; laporan 14–28 hari) sebagai dokumen pembanding resmi.',
        ),
        bullet(
            'Jadwalkan monev triwulanan: ulang skrip measure-efficiency-baseline.mjs dan unggah ringkasan ke rapat Bidang AMS.',
        ),
        bullet(
            'Audit kelengkapan foto per paket aktif (bukan hanya kohort KPI) menuju target ≥90%.',
        ),

        h2('9.2 Rekomendasi 2027–2028'),
        bullet(
            '2027: penguatan kualitas data historis, pelatihan operator desentral, dan integrasi prioritas desa gap SPM ke perencanaan Renja.',
        ),
        bullet(
            '2028: pemeliharaan platform, backup/DR, evaluasi dampak data terhadap pemilihan lokasi proyek, dan replikasi pola ke OPD lain bila diminta.',
        ),

        h2('9.3 Indikator Kinerja Monev Berkelanjutan'),
        simpleTable(
            ['Indikator monev', 'Baseline kini', 'Target 2026 akhir', 'Target 2027'],
            [
                [
                    'Median latency rekap digital',
                    `${fmtId(rekap.sesudah_median_detik ?? 2.17, 2)} dtk`,
                    '< 5 dtk',
                    '< 5 dtk (stabil)',
                ],
                [
                    'Median interval update progres',
                    `${fmtId(interval.sesudah_median_hari ?? 12, 0)} hari`,
                    '≤ 7 hari',
                    '≤ 7 hari',
                ],
                [
                    '% paket progress updated ≤7 hari',
                    `${fmtId(pf.pct_updated_7_hari ?? 19.5, 1)}%`,
                    '≥ 50%',
                    '≥ 70%',
                ],
                [
                    '% paket progress updated ≤30 hari',
                    `${fmtId(pf.pct_updated_30_hari ?? 83.9, 1)}%`,
                    '≥ 90%',
                    '≥ 95%',
                ],
                [
                    'Kelengkapan foto kohort KPI',
                    '100%',
                    '100%',
                    '100% + audit paket aktif ≥90%',
                ],
            ],
            [2600, 2000, 2000, 2188],
        ),
        caption('Tabel 13. Indikator kinerja monev lanjutan'),

        // 10
        h1('10. Kesimpulan'),
        p(
            `Implementasi Arumanis pada tahap diterapkan telah menghasilkan output operasional yang kuat: ratusan paket pekerjaan, ratusan unit SPAM, ribuan foto, serta modul pengawasan dan publikasi capaian. Evaluasi efisiensi menunjukkan perbaikan sangat signifikan pada waktu ketersediaan rekap SPM (≈${fmtId(rekap.efisiensi_pct ?? 98.7, 1)}%) dan perbaikan sedang pada interval update progres (≈${fmtId(interval.efisiensi_pct ?? 42.9, 1)}%), dengan metodologi yang dapat diaudit ulang melalui skrip pengukuran dan API produksi.`,
        ),
        p(
            'Efektivitas terhadap tujuan tata kelola data dan transparansi sudah terlihat; efektivitas terhadap outcome cakupan SPM masih bergantung pada investasi fisik multi-tahun. Agenda utama ke depan adalah menertibkan frekuensi update lapangan, memperluas sampel pelaporan, dan menjalankan monev berkala agar perbaikan berkelanjutan terukur—bukan hanya diyakini.',
        ),

        // Lampiran
        h1('Lampiran A. Cara Mengulang Pengukuran'),
        p('1) Analisis bukti baseline legacy (perlu clone lokal sandb & amspro):'),
        p('bun scripts/analyze-baseline-legacy-repos.mjs', { bold: true }),
        p('2) Ukur efisiensi live + gabungkan baseline legacy:'),
        p('bun scripts/measure-efficiency-baseline.mjs', { bold: true }),
        p(
            'Keluaran: docs/baseline-legacy-repos.json dan docs/efficiency-baseline-live.json. Kemudian regenirasi kajian ini:',
        ),
        p('bun scripts/generate-kajian-monev-arumanis.mjs --live', { bold: true }),
        p(
            'Repo bukti: https://github.com/ilhamtaufiq/amspro · https://github.com/ilhamtaufiq/sandb',
        ),

        h1('Lampiran B. Glosarium Ringkas'),
        simpleTable(
            ['Istilah', 'Arti dalam kajian ini'],
            [
                ['SPM', 'Standar Pelayanan Minimum (cakupan layanan)'],
                ['SPAM', 'Sistem Penyediaan Air Minum'],
                ['PUSPEN', 'Modul pusat pemantauan/penilaian progres & KPI'],
                ['Baseline', 'Nilai pembanding sebelum atau kondisi acuan'],
                ['Output', 'Produk langsung sistem/data'],
                ['Outcome', 'Perubahan proses/perilaku tata kelola'],
                ['Audit log', 'Jejak perubahan data bertanda waktu di sistem'],
            ],
            [2200, 6588],
        ),
        caption('Tabel 14. Glosarium'),

        // TTD
        new Paragraph({ spacing: { before: 400 }, children: [] }),
        p(`Cianjur, ${idDate(new Date().toISOString())}`),
        p('Bidang Air Minum dan Sanitasi'),
        p('Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur'),
        new Paragraph({ spacing: { before: 800 }, children: [] }),
        p('_________________________'),
        p('Tim Pengelola Arumanis / Inisiator'),
    ]

    return new Document({
        styles: {
            default: {
                document: {
                    styles: [
                        {
                            id: 'Normal',
                            run: { font: FONT, size: SIZE_BODY, language: ID_LANG },
                        },
                    ],
                },
            },
            paragraphStyles: [
                {
                    id: 'Heading1',
                    name: 'Heading 1',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { size: SIZE_H1, bold: true, font: FONT, language: ID_LANG },
                    paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 },
                },
                {
                    id: 'Heading2',
                    name: 'Heading 2',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { size: SIZE_H2, bold: true, font: FONT, language: ID_LANG },
                    paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 },
                },
                {
                    id: 'Heading3',
                    name: 'Heading 3',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { size: SIZE_H3, bold: true, font: FONT, language: ID_LANG },
                    paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 },
                },
            ],
        },
        numbering: {
            config: [
                {
                    reference: 'bullets',
                    levels: [
                        {
                            level: 0,
                            format: LevelFormat.BULLET,
                            text: '•',
                            alignment: AlignmentType.LEFT,
                            style: {
                                paragraph: { indent: { left: 720, hanging: 360 } },
                            },
                        },
                    ],
                },
            ],
        },
        sections: [
            {
                properties: {
                    page: {
                        size: PAGE_SIZE,
                        margin: PAGE_MARGINS,
                    },
                },
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                    tr('Kajian Monev Implementasi Arumanis · DPKP Cianjur', {
                                        size: 16,
                                        color: '666666',
                                        italics: true,
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    tr('Halaman ', { size: 16 }),
                                    new TextRun({
                                        children: [PageNumber.CURRENT],
                                        font: FONT,
                                        size: 16,
                                    }),
                                    tr(' dari ', { size: 16 }),
                                    new TextRun({
                                        children: [PageNumber.TOTAL_PAGES],
                                        font: FONT,
                                        size: 16,
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
                children,
            },
        ],
    })
}

async function main() {
    const useLive = process.argv.includes('--live')
    let live = null
    if (useLive) {
        console.log('Fetching live API…')
        live = await fetchLive()
        console.log('Live OK:', live.fetchedAt)
    }
    const eff = loadJson(EFF_PATH)
    const prop = loadJson(PROP_PATH)
    const legacy = loadJson(LEGACY_PATH)
    if (!eff) {
        console.warn(
            'Peringatan: efficiency-baseline-live.json belum ada. Jalankan: bun scripts/measure-efficiency-baseline.mjs',
        )
    }
    if (!legacy) {
        console.warn(
            'Peringatan: baseline-legacy-repos.json belum ada. Jalankan: bun scripts/analyze-baseline-legacy-repos.mjs',
        )
    }
    const doc = buildDoc({ live, eff, prop, legacy })
    const buf = await Packer.toBuffer(doc)
    fs.writeFileSync(OUT, buf)
    console.log('Wrote', OUT)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
