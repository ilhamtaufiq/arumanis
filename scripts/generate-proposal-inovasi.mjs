import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    AlignmentType,
    Document,
    Footer,
    HeadingLevel,
    ImageRun,
    Packer,
    PageNumber,
    Paragraph,
    TextRun,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_PATH = path.join(ROOT, 'docs', 'proposal-live-data.json')
const OUT_PATH = path.join(ROOT, 'docs', 'Proposal_Inovasi_Arumanis.docx')
const SCREENSHOTS_DIR = path.join(ROOT, 'docs', 'screenshots')
const IMG_WIDTH = 520

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
            `tahun ${r.tahun} (${fmtNum(r.records)} record capaian, ${fmtNum(r.units)} unit, ${fmtNum(r.kk)} KK / ${fmtNum(r.jiwa)} jiwa)`,
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

const disclaimerSinkronisasi =
    'Catatan penting: seluruh angka dalam dokumen ini bersumber dari data yang telah dihimpun Arumanis dan masih dalam tahap sinkronisasi dari berbagai sumber. Proses harmonisasi belum selesai sepenuhnya sehingga dapat terdapat ketidaksesuaian, duplikasi, atau kesalahan data. Angka diposisikan sebagai gambaran kondisi terkini, bukan pernyataan final.'

const gapAirMinumKk = Math.max(0, Number(spam.total_target) - Number(spam.capaian_kk))
const gapSanitasiKk = Math.max(0, Number(san.target_kk) - Number(san.total_pemanfaat_kk))

const SCREENSHOTS = [
    { file: 'dashboard.png', caption: 'Gambar 1. Dashboard monitoring pekerjaan konstruksi air minum dan sanitasi (arumanis.cianjur.space).' },
    { file: 'capaian-air-minum.png', caption: 'Gambar 2. Peta capaian Standar Pelayanan Minimum (SPM) air minum per desa.' },
    { file: 'capaian-sanitasi.png', caption: 'Gambar 3. Peta capaian SPM sanitasi dan air limbah per desa.' },
    { file: 'pengawas.png', caption: 'Gambar 4. Panel Pengawasan terintegrasi untuk input progress dan dokumentasi lapangan.' },
    { file: 'sign-in.png', caption: 'Gambar 5. Akses terintegrasi (SSO) ke Arumanis dan Panel Pengawasan dengan satu akun.' },
]

function img(filename, altTitle) {
    const filePath = path.join(SCREENSHOTS_DIR, filename)
    if (!fs.existsSync(filePath)) return null
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 80 },
        children: [
            new ImageRun({
                type: 'png',
                data: fs.readFileSync(filePath),
                transformation: { width: IMG_WIDTH, height: Math.round(IMG_WIDTH * 0.56) },
                altText: { title: altTitle, description: altTitle, name: altTitle },
            }),
        ],
    })
}

function caption(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text, italics: true, size: 20 })],
    })
}

function buildScreenshotBlocks() {
    const blocks = []
    for (const shot of SCREENSHOTS) {
        const paragraph = img(shot.file, shot.caption)
        if (paragraph) {
            blocks.push(paragraph, caption(shot.caption))
        }
    }
    return blocks
}

function h1(text) {
    return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] })
}
function h2(text) {
    return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] })
}
function h3(text) {
    return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] })
}
function p(text, opts = {}) {
    return new Paragraph({
        spacing: { after: 200, line: 360 },
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
        children: [new TextRun({ text, bold: !!opts.bold, italics: !!opts.italics, size: 22 })],
    })
}

const doc = new Document({
    styles: {
        default: { document: { run: { font: 'Arial', size: 22 } } },
        paragraphStyles: [
            {
                id: 'Heading1',
                name: 'Heading 1',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: 32, bold: true, font: 'Arial' },
                paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 0 },
            },
            {
                id: 'Heading2',
                name: 'Heading 2',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: 28, bold: true, font: 'Arial' },
                paragraph: { spacing: { before: 220, after: 160 }, outlineLevel: 1 },
            },
            {
                id: 'Heading3',
                name: 'Heading 3',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: 24, bold: true, font: 'Arial' },
                paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2 },
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
                                new TextRun({
                                    text: 'Proposal Inovasi Arumanis (Umum) — Halaman ',
                                    size: 18,
                                }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 160 },
                    children: [new TextRun({ text: 'PROPOSAL INOVASI DAERAH', bold: true, size: 34 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [new TextRun({ text: 'ARUMANIS', bold: true, size: 38 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [
                        new TextRun({
                            text: 'Aplikasi Satu Data Air Minum dan Sanitasi',
                            size: 26,
                        }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [new TextRun({ text: 'Kabupaten Cianjur', size: 24 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 360 },
                    children: [
                        new TextRun({
                            text: '(Dokumen Umum — Bukan Penandatanganan Pejabat)',
                            italics: true,
                            size: 20,
                        }),
                    ],
                }),
                p('Tahun penyusunan: 2026'),
                p('Layanan produksi: arumanis.cianjur.space · apiamis.cianjur.space'),
                p(`Snapshot data operasional: ${fetched}`),
                p(disclaimerSinkronisasi, { italics: true }),

                h2('RINGKASAN EKSEKUTIF'),
                p(
                    `Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) adalah platform monitoring pekerjaan konstruksi SPAM perdesaan dan sanitasi—khususnya pengelolaan air limbah—serta pengolahan data real-time di 33 kecamatan dan 365 desa Kabupaten Cianjur. Inti inovasi: memantau progress konstruksi, dokumentasi lapangan ber-GPS, dan rekapitulasi capaian ${SPM} dalam satu sistem terintegrasi.`,
                ),
                p(
                    `Per ${fetched}, data terhimpun mencatat capaian ${SPM} air minum ${fmtPct(spam.coverage_percentage)} (${fmtNum(spam.capaian_kk)} KK dari ${fmtNum(spam.total_target)} KK) dan sanitasi ${fmtPct(san.coverage_kk_percentage)} (${fmtNum(san.total_pemanfaat_kk)} KK dari ${fmtNum(san.target_kk)} KK). Anggaran terpetakan: air minum ${fmtMilyar(anggaranAirMinum)}, sanitasi ${fmtMilyar(anggaranSanitasi)}, pekerjaan konstruksi ${fmtMilyar(anggaranPekerjaan)}. Terdapat ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(spam.total_units)} unit SPAM, ${fmtNum(san.total_count)} infrastruktur sanitasi, dan ${fmtNum(pengawas.total_pengawas)} pengawas aktif.`,
                ),
                p(
                    `Gap intervensi: ${fmtNum(gapAirMinumKk)} KK belum terlayani air minum dan ${fmtNum(san.desa_without_infrastruktur)} desa belum memiliki infrastruktur sanitasi terpetakan (${fmtNum(san.desa_with_infrastruktur)} desa sudah). Data masih disinkronkan sejak ${syncStart} dan mungkin mengandung kesalahan—angka bersifat progresif, bukan final.`,
                ),

                h1('BAB I  LATAR BELAKANG'),

                h2('1.0  Landasan Hukum'),
                p(
                    'Inovasi Arumanis berlandaskan Undang-Undang Nomor 17 Tahun 2019 tentang Sumber Daya Air; Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah; Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik; Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik; serta Undang-Undang Nomor 18 Tahun 2008 tentang Pengelolaan Sampah (kaitan sanitasi lingkungan).',
                ),
                p(
                    `Bidang air minum: Peraturan Pemerintah Nomor 16 Tahun 2005 tentang Pengembangan Sistem Penyediaan Air Minum; Permen PUPR Nomor 18/PRT/M/2007 tentang Pedoman Pengembangan SPAM; Permen PU Nomor 20 Tahun 2006 tentang Persyaratan Teknis Pengembangan SPAM. Bidang sanitasi: Permen PUPR Nomor 14/PRT/M/2014 tentang Penyediaan Air Minum dan Sanitasi Berbasis Masyarakat (PAMSIMAS); Permenkes Nomor 2 Tahun 2023 tentang Standar Pelayanan Minimum Bidang Kesehatan; Permen PUPR Nomor 27/PRT/M/2018 tentang Persyaratan Teknis Pengolahan Air Limbah Domestik.`,
                ),
                p(
                    'Tata kelola digital: Permendagri Nomor 59 Tahun 2016 tentang Penerapan SPBE; Permendagri Nomor 108 Tahun 2016 tentang Pedoman Evaluasi SPBE. Tingkat daerah: Perda Kab. Cianjur Nomor 14 Tahun 2021 (Perumdam Tirta Mukti); Perda Nomor 1 Tahun 2021 (penyertaan modal); Perda Nomor 18 Tahun 2021 (susunan perangkat daerah); Perbup Nomor 102 Tahun 2021 (tugas-fungsi DPKP); Perbup Nomor 23 Tahun 2020 (RAD PAMSIMAS 2019–2023); RPJMD 2025–2029; Kajian RISPAM Kabupaten Cianjur.',
                ),
                p(
                    'Inti inovasi Arumanis adalah platform pemantauan (monitoring) pelaksanaan pekerjaan konstruksi infrastruktur SPAM perdesaan serta pekerjaan sanitasi, khususnya pada bidang pengelolaan air limbah (SPALD-T, SPALD-S, IPLT, dan infrastruktur terkait). Pekerjaan-pekerjaan ini tersebar di 33 kecamatan dan 365 desa/kelurahan Kabupaten Cianjur, dengan pelaksana yang melibatkan dinas, pengawas lapangan, konsultan, kontraktor, dan pengelola desa.',
                ),
                p(
                    'Sebelum hadirnya Arumanis, pemantauan progres fisik, keuangan, dan dokumentasi lapangan banyak dilakukan secara manual. Laporan konstruksi SPAM dan sanitasi kerap dikirim melalui berkas Excel, dokumen cetak, atau pesan instan tanpa jejak terpusat. Akibatnya, deviasi pekerjaan—misalnya keterlambatan progress fisik, ketidaksesuaian output, atau kekurangan dokumentasi—baru terdeteksi setelah periode pelaporan berakhir.',
                ),
                p(
                    `Di luar fungsi monitoring konstruksi, Arumanis mengolah data secara real-time: dashboard, rekapitulasi capaian ${SPM}, peta per desa, ekspor laporan, statistik pengawas, dan publikasi kepada masyarakat. Arumanis bukan sekadar repositori arsip, melainkan sistem kerja yang menghubungkan lapangan dan kantor pusat.`,
                ),
                p(
                    `Basis data masih dalam proses sinkronisasi dari berbagai sumber sejak ${syncStart}. Scan ulang menemukan jejak capaian SPAM tertua tahun ${earliestYear} dari impor arsip historis. Data dihimpun dari Excel/CSV, input operator, modul pekerjaan, capaian unit SPAM, dokumentasi Panel Pengawasan, dan sumber lain—belum seluruhnya harmonis. ${disclaimerSinkronisasi}`,
                ),
                p(
                    `Capaian ${SPM} yang telah dihimpun per ${fetched}: bidang air minum ${fmtNum(spam.capaian_kk)} KK / ${fmtNum(spam.capaian_jiwa)} jiwa (${fmtPct(spam.coverage_percentage)} dari target ${fmtNum(spam.total_target)} KK); bidang sanitasi ${fmtNum(san.total_pemanfaat_kk)} KK / ${fmtNum(san.total_pemanfaat_jiwa)} jiwa (${fmtPct(san.coverage_kk_percentage)} dari target ${fmtNum(san.target_kk)} KK).`,
                ),
                p(
                    `Inventaris terkumpul: ${fmtNum(dash.totalPekerjaan)} pekerjaan konstruksi (kumulatif), ${fmtNum(dash.totalKontrak)} kontrak; ${fmtNum(spam.total_units)} unit SPAM (${fmtNum(spam.simspam_count)} SIMSPAM); ${fmtNum(san.total_count)} infrastruktur sanitasi (${fmtNum(san.spaldt_count)} SPALD-T, ${fmtNum(san.spalds_count)} SPALD-S, ${fmtNum(san.iplt_count)} IPLT) di ${fmtNum(san.desa_with_infrastruktur)} desa; ${fmtNum(spam.achievement_records)} record capaian tahunan; ${fmtNum(spam.total_foto_dokumentasi)} foto dokumentasi.`,
                ),
                p(
                    `Urgensi gap: ${fmtNum(gapAirMinumKk)} KK (${fmtPct(100 - Number(spam.coverage_percentage))} populasi target) belum tercapai untuk ${SPM} air minum; ${fmtNum(gapSanitasiKk)} KK (${fmtPct(100 - Number(san.coverage_kk_percentage))} target) belum memanfaatkan sanitasi layak, dengan ${fmtNum(san.desa_without_infrastruktur)} desa tanpa infrastruktur terpetakan.`,
                ),
                p(
                    `Peta anggaran terhimpun (snapshot, dapat berubah saat sinkronisasi): air minum—nilai kontrak/unit SPAM ${fmtMilyar(anggaranAirMinum)}; sanitasi—investasi infrastruktur ${fmtMilyar(anggaranSanitasi)}; pekerjaan konstruksi lintas bidang—pagu ${fmtMilyar(anggaranPekerjaan)}, kontrak ${fmtMilyar(anggaranKontrak)}; pengawasan—${fmtMilyar(anggaranPengawasan)}. Total investasi air minum + sanitasi ~${fmtMilyar(anggaranAirMinum + anggaranSanitasi)}. Contoh ketidakselarasan data yang sedang diverifikasi: penghitungan jenis infrastruktur SPALD-S antar modul masih berbeda selama proses sinkronisasi.`,
                ),

                h2('1.1  Rekapitulasi Data yang Telah Dihimpun Arumanis'),
                p(
                    `Arumanis telah menghimpun data operasional dari berbagai sumber. Proses sinkronisasi resmi dimulai sejak ${syncStart}, namun impor capaian unit SPAM memuat jejak historis hingga tahun ${earliestYear}. Berikut ringkasan data terkumpul per ${fetched}.`,
                ),
                p(
                    `Capaian SPAM per tahun (dari ${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} record achievement): ${achNarrative}. Rekaman ini mencerminkan perkembangan pelaporan capaian layanan dari unit-unit SPAM perdesaan lintas periode, bukan sekadar data tahun berjalan.`,
                ),
                p(
                    pekerjaanAktif.length > 0
                        ? `Monitoring pekerjaan konstruksi per tahun anggaran: ${pekerjaanNarrative}. Total kumulatif seluruh tahun: ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(dash.totalOutput)} output fisik, ${fmtNum(dash.totalPenerima)} penerima manfaat, pagu pekerjaan ${fmtMilyar(dash.totalPaguPekerjaan)}. Modul kegiatan aktif mencakup tahun ${(scope.availableKegiatanYears ?? dash.availableYears ?? []).join(', ')}.`
                        : `Total kumulatif pekerjaan: ${fmtNum(dash.totalPekerjaan)} paket, ${fmtNum(dash.totalKontrak)} kontrak, pagu ${fmtMilyar(dash.totalPaguPekerjaan)}.`,
                ),
                p(
                    `Capaian ${SPM} per bidang: air minum ${fmtPct(spam.coverage_percentage)} (${fmtNum(spam.capaian_kk)} dari ${fmtNum(spam.total_target)} KK target); sanitasi ${fmtPct(san.coverage_kk_percentage)} (${fmtNum(san.total_pemanfaat_kk)} dari ${fmtNum(san.target_kk)} KK target). Anggaran: air minum ${fmtMilyar(anggaranAirMinum)}, sanitasi ${fmtMilyar(anggaranSanitasi)}, pengawasan ${fmtMilyar(anggaranPengawasan)}. Data tahun 2017–2023 dari arsip eksternal masih diharmonisasi—angka dapat berubah atau mengandung kesalahan.`,
                ),
                p(
                    'Kebutuhan akan platform semacam ini semakin mendesak seiring tuntutan SPBE, transparansi publik, dan program peningkatan akses air minum serta sanitasi layak yang selaras SDGs 6, RPJMD 2025–2029, RISPAM, dan RAD PAMSIMAS. Arumanis hadir untuk menjawab kebutuhan monitoring konstruksi yang terukur, disertai kemampuan olah data real-time bagi berbagai keperluan pengambilan keputusan.',
                ),

                h1('BAB II  RANCANG BANGUN'),

                h2('2.1  Metode Pembaharuan'),
                p(
                    'Metode pembaharuan inovasi dilakukan dengan membandingkan kondisi sebelum dan sesudah penerapan Arumanis. Kondisi sebelum inovasi menggambarkan praktik pemantauan pekerjaan konstruksi SPAM dan sanitasi yang masih berbasis dokumen terpisah. Kondisi sesudah inovasi mengacu pada data operasional Arumanis yang diperbarui secara berkala, dengan catatan bahwa proses sinkronisasi data historis sejak 2017 masih berlangsung sehingga capaian kuantitatif bersifat progresif.',
                ),

                h3('Perbandingan Sebelum dan Sesudah (Terukur)'),
                p(
                    'Integrasi data: sebelumnya 4–6 format terpisah (Excel, PDF, WhatsApp, berkas fisik); sesudahnya satu platform Arumanis + api amis. Rekapitulasi capaian ' +
                        SPM +
                        ' lintas 365 desa: dari 5–10 hari kerja menjadi kurang dari 1 hari. Unit SPAM terdigitalisasi: ' +
                        fmtNum(spam.total_units) +
                        ' unit dengan ' +
                        fmtNum(scope.totalAchievementRecords ?? spam.achievement_records) +
                        ' record capaian multi-tahun.',
                ),
                p(
                    `Monitoring proyek: sebelumnya tidak terstandar per berkas; sesudahnya ${fmtNum(dash.totalPekerjaan)} paket pekerjaan terpantau. Interval laporan pengawas: dari 2–4 minggu menjadi mingguan via Panel Pengawasan. Dokumentasi foto: dari tersebar di perangkat pengawas menjadi ${fmtNum(spam.total_foto_dokumentasi)} foto terindeks ber-slot dan ber-GPS.`,
                ),
                p(
                    `Capaian ${SPM}: sebelumnya rekaman per unit di Excel terpisah; sesudahnya air minum ${fmtPct(spam.coverage_percentage)} (${fmtNum(spam.capaian_kk)} KK) dan sanitasi ${fmtPct(san.coverage_kk_percentage)} (${fmtNum(san.total_pemanfaat_kk)} KK) divisualisasikan peta choropleth 365 desa, dapat diakses publik 24 jam. Impor data massal SPAM: dari 3–5 hari menjadi kurang dari 2 jam. Laporan PDF/Excel: dari 1–2 hari menjadi kurang dari 30 menit.`,
                ),
                p(
                    `Pengambilan keputusan: sebelumnya manual pivot tabel; sesudahnya dashboard KPI real-time, filter 33 kecamatan × 365 desa × tahun, indikator kualitas data, integrasi SIMSPAM (${fmtNum(spam.simspam_count)} unit), dan asisten Ami AI untuk penafsiran data operasional (bukan pengganti keputusan pejabat).`,
                ),

                h3('Monitoring Pekerjaan Konstruksi SPAM Perdesaan'),
                p(
                    'Sebelum inovasi, progres fisik pembangunan, rehabilitasi, dan operasional SPAM perdesaan sulit dipantau secara terpusat. Pengawas mengirim foto dan laporan secara terpisah, sementara kantor pusat menyusun rekapitulasi manual lintas kecamatan.',
                ),
                p(
                    `Setelah inovasi, pekerjaan konstruksi SPAM dipantau melalui modul pekerjaan dan Panel Pengawasan terintegrasi. Tercatat ${fmtNum(dash.totalPekerjaan)} pekerjaan dengan ${fmtNum(dash.totalKontrak)} kontrak, ${fmtNum(spam.total_foto_dokumentasi)} dokumentasi foto terindeks, dan ${fmtNum(pengawas.total_pengawas)} pengawas aktif di ${fmtNum(pengawas.total_lokasi)} lokasi. Progress fisik diisi mingguan melalui slot foto 0%–100% berkoordinat GPS; deviasi terhadap rencana terlihat di dashboard. Modul SPAM Unit (${fmtNum(spam.total_units)} unit, ${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} record capaian multi-tahun) menjadi acuan monitoring layanan pasca-konstruksi.`,
                ),

                h3('Monitoring Pekerjaan Sanitasi dan Air Limbah'),
                p(
                    'Pada bidang sanitasi, fokus Arumanis terutama pada pengawasan pekerjaan dan operasional infrastruktur pengelolaan air limbah perdesaan—meliputi pembangunan dan pemanfaatan SPALD-T, SPALD-S, IPLT, serta unit terkait. Sebelum inovasi, data pemanfaat dan status infrastruktur air limbah belum terhubung dengan pemantauan progres konstruksi.',
                ),
                p(
                    `Setelah inovasi, ${fmtNum(san.total_count)} infrastruktur sanitasi terdata dengan ${fmtNum(san.desa_with_infrastruktur)} desa memiliki infrastruktur terpetakan. Capaian pemanfaat mencapai ${fmtNum(san.total_pemanfaat_kk)} KK dan ${fmtNum(san.total_pemanfaat_jiwa)} jiwa, dengan nilai investasi terkonsolidasi ${fmtMilyar(san.total_investasi)}. Peta capaian publik memungkinkan pemantauan visual per desa untuk keperluan evaluasi program air limbah dan sanitasi. Sebagian data historis sanitasi masih dalam tahap penyelarasan dengan sumber laporan 2017 ke atas.`,
                ),

                h3('Pengolahan Data Real-Time untuk Keperluan Operasional'),
                p(
                    'Keunggulan pembaharuan berikutnya adalah kemampuan Arumanis mengolah data secara real-time sesuai kebutuhan pengguna. Dashboard menampilkan ringkasan kegiatan, pekerjaan, kontrak, output, pagu, distribusi sumber dana (DAK, APBD, DAU, PAD), dan indikator kualitas data tanpa menunggu rekapitulasi manual. Asisten Ami AI membantu penafsiran data operasional; laporan PDF/Excel dihasilkan dari data yang sama dengan Panel Pengawasan.',
                ),
                p(
                    'Puspen (/puspen) merupakan kumpulan alat tambahan untuk keperluan operasional pendukung—bukan inti platform—meliputi pengelolaan arsip PDF, tanda tangan digital, input progress fisik, berbagi media, dan statistik kelengkapan input pengawas. Fungsi monitoring konstruksi utama tetap berada pada modul pekerjaan dan Panel Pengawasan.',
                ),
                p(
                    `Contoh keperluan real-time: memantau ${fmtNum(dash.totalPekerjaan)} pekerjaan dan ${fmtNum(dash.totalOutput)} output, melacak ${fmtNum(dash.totalPenerima)} penerima manfaat, mengecek kelengkapan koordinat/foto, menyiapkan evaluasi SPM (${fmtNum(spam.capaian_kk)} KK), serta mempublikasikan capaian melalui peta publik 365 desa. Data historis capaian SPAM (${earliestYear}–${scope.latestAchievementYear ?? '2026'}) dan pekerjaan tahun 2024–2026 telah terhimpun; sumber eksternal 2017–2023 masih disinkronkan bertahap.`,
                ),

                h3('Integrasi Sumber Data Sejak 2017'),
                p(
                    'Proses sinkronisasi data merupakan bagian penting rancang bangun Arumanis. Data historis berasal dari berbagai sumber: arsip Excel/CSV periode 2017 ke atas, input operator, capaian unit SPAM, dokumentasi pengawasan, kontrak pekerjaan, dan integrasi modul sanitasi. Harmoniasi antarsumber dilakukan agar monitoring konstruksi dan capaian SPM tidak lagi terpisah-pisah.',
                ),
                p(
                    `Hingga snapshot ini, ${fmtNum(spam.achievement_records)} record capaian SPAM dan data pekerjaan aktif telah terhimpun. Capaian ${SPM} air minum ${fmtPct(spam.coverage_percentage)} dan sanitasi ${fmtPct(san.coverage_kk_percentage)} akan terus diperbarui seiring sinkronisasi. ${disclaimerSinkronisasi}`,
                ),

                h2('2.2  Keunggulan Inovasi'),
                p(
                    'Keunggulan utama Arumanis dibanding sistem sejenis terletak pada fokus monitoring pekerjaan konstruksi SPAM perdesaan dan sanitasi (khususnya air limbah) dalam satu platform, bukan hanya pencatatan aset statis. Sistem konvensional kerap memisahkan modul proyek, modul SPAM, dan modul sanitasi. Arumanis menghubungkan ketiganya sehingga progress pembangunan, capaian layanan, dan dokumentasi lapangan dapat dibaca dalam satu konteks.',
                ),
                p(
                    'Arumanis juga unggul dalam pengolahan data real-time: dashboard KPI, peta choropleth 365 desa, filter per kecamatan/desa/tahun, ekspor laporan, dan Panel Pengawasan dengan SSO terpadu. Pengawas tidak perlu aplikasi terpisah; foto progres, laporan mingguan, dan tiket kendala tercatat dalam sistem yang sama dengan data kantor pusat.',
                ),
                p(
                    'Kebaharuan teknis meliputi API publik capaian SPM air minum dan sanitasi, modul indikator kualitas data (kelengkapan koordinat, foto, metadata), integrasi SIMSPAM, sinkronisasi progres estimasi dua arah (Puspen ↔ Panel Pengawasan), slot foto ber-GPS, role-based access per wilayah, asisten Ami AI, serta pipeline sinkronisasi data historis multi-sumber.',
                ),

                h2('2.3  Ketersediaan SDM Pengelola Inovasi Daerah'),
                p(
                    'Penyelenggaraan Arumanis melibatkan SDM fungsional, bukan penunjukan pejabat penandatangan tunggal. Peran utama meliputi koordinator program air minum dan sanitasi yang memvalidasi prioritas pekerjaan konstruksi, operator data yang memelihara kualitas rekaman SPAM dan sanitasi, tim pengembang sistem yang mengelola platform dan proses sinkronisasi data, serta jaringan pengawas lapangan.',
                ),
                p(
                    `Bukti adopsi operasional per ${fetched}: ${fmtNum(pengawas.total_pengawas)} pengawas aktif di ${fmtNum(pengawas.total_lokasi)} lokasi (pagu pengawasan ${fmtMilyar(anggaranPengawasan)}); ${fmtNum(dash.totalPekerjaan)} pekerjaan dan ${fmtNum(spam.total_foto_dokumentasi)} dokumentasi foto menandakan sistem dipakai untuk input lapangan, bukan sekadar repositori kosong. Konsultan pengawas dan TFL memverifikasi output. Di desa, pengelola ${fmtNum(spam.total_units)} unit SPAM dan POKMAS melaporkan capaian. Personil inti kantor (estimasi 5–7 orang) mengoordinasikan input data dan harmonisasi sumber historis.`,
                ),

                h2('2.4  Risiko dan Mitigasi'),
                p(
                    'Risiko sinkronisasi data: angka antar sumber belum 100% selaras. Mitigasi: validasi triwulanan operator, penandaan data sumber, modul indikator kualitas data, dan disclaimer transparan pada setiap laporan. Risiko kesalahan input manual: mitigasi validasi server-side, template impor CSV/Excel, dan audit log perubahan.',
                ),
                p(
                    'Risiko ketergantungan operator dan konektivitas lapangan: mitigasi pelatihan berkala, dokumentasi pengguna (docs/user-guide), Panel Pengawasan dengan SSO, serta dukungan teknis personil inti. Risiko rendahnya adopsi pengawas: mitigasi integrasi alur kerja mingguan, notifikasi broadcast, dan statistik kelengkapan input (Puspen KPI).',
                ),

                h2('2.5  Rencana Pengembangan 2026–2027'),
                p(
                    `(1) Menyelesaikan harmonisasi data historis ${syncStart}–2023 dari arsip eksternal. (2) Menautkan pekerjaan konstruksi ke unit SPAM dan infrastruktur sanitasi secara menyeluruh. (3) Memperluas integrasi SIMSPAM dari ${fmtNum(spam.simspam_count)} unit saat ini. (4) Meningkatkan kelengkapan metadata GPS/foto menuju target 90% paket aktif. (5) Memperkaya data capaian sanitasi di ${fmtNum(san.desa_without_infrastruktur)} desa yang belum berinfrastruktur terpetakan.`,
                ),

                h1('BAB III  TUJUAN INOVASI'),

                h2('3.1  Target Capaian Penyelenggaraan Inovasi Daerah'),
                p(
                    'Tujuan inovasi Arumanis diarahkan pada terwujudnya pemantauan pekerjaan konstruksi SPAM perdesaan dan sanitasi (khususnya air limbah) yang terukur, disertai kemampuan olah data real-time untuk berbagai keperluan operasional.',
                ),
                p(
                    `Target capaiannya antara lain: (1) seluruh paket konstruksi SPAM dan sanitasi aktif terpantau melalui sistem, saat ini ${fmtNum(dash.totalPekerjaan)} pekerjaan tercatat; (2) pembaruan progres fisik minimal mingguan melalui Panel Pengawasan; (3) dokumentasi foto progres bermetadata GPS minimal 90% paket aktif, dari baseline ${fmtNum(spam.total_foto_dokumentasi)} foto terindeks; (4) penyelesaian sinkronisasi data historis ${syncStart}–sekarang dengan selisih antarsumber di bawah 5%; (5) dashboard dan peta capaian ${fmtNum(spam.wilayah_total_desa)} desa dapat diakses real-time; (6) publikasi capaian SPM dan sanitasi kepada masyarakat tanpa login.`,
                ),
                p(
                    `Secara substantif, Arumanis ditargetkan menjadi sistem monitoring konstruksi dan capaian layanan yang menjadi rujukan bersama—dari progress pembangunan SPAM perdesaan, pengelolaan air limbah, hingga rekapitulasi ${fmtNum(spam.capaian_kk)} KK terlayani air minum dan ${fmtNum(san.total_pemanfaat_kk)} KK pemanfaat sanitasi—dengan data yang terus diselaraskan dari berbagai sumber sejak 2017.`,
                ),

                h1('BAB IV  MANFAAT INOVASI'),

                h2('4.1  Manfaat yang Diperoleh dari Penerapan Inovasi Daerah'),
                p(
                    'Bagi penyelenggara program, manfaat utama adalah terpantauinya progress konstruksi SPAM dan sanitasi secara terpusat. Deviasi fisik maupun keuangan teridentifikasi lebih awal. Evaluasi capaian ' +
                        SPM +
                        ' air minum (' +
                        fmtPct(spam.coverage_percentage) +
                        ') dan sanitasi (' +
                        fmtPct(san.coverage_kk_percentage) +
                        ') serta anggaran terpetakan—air minum ' +
                        fmtMilyar(anggaranAirMinum) +
                        ', sanitasi ' +
                        fmtMilyar(anggaranSanitasi) +
                        ', pekerjaan ' +
                        fmtMilyar(anggaranPekerjaan) +
                        ` (${fmtNum(dash.totalKontrak)} kontrak)—tanpa rekapitulasi manual.`,
                ),
                p(
                    `Bagi pengawas dan pelaksana lapangan, alur kerja terstruktur: unggah foto ber-GPS, isi progress mingguan, laporan RAB, dan tiket kendala dalam satu sistem. Data lapangan langsung menjadi bahan dashboard kantor pusat.`,
                ),

                h3('Manfaat bagi Bidang Air Minum dan Sanitasi'),
                p(
                    `Kedua bidang memperoleh single source of truth capaian ${SPM} di ${fmtNum(spam.wilayah_total_desa)} desa. Air minum: target ${fmtNum(spam.total_target)} KK, capaian ${fmtNum(spam.capaian_kk)} KK / ${fmtNum(spam.capaian_jiwa)} jiwa (${fmtPct(spam.coverage_percentage)}), meliputi ${fmtNum(spam.capaian_baseline_kk)} KK acuan s/d ${spam.baseline_cap_tahun ?? '2025'} plus integrasi ${fmtNum(spam.capaian_integrasi_kk)} KK tahun ${spam.accumulation_start_tahun ?? '2026'}. Sanitasi: target ${fmtNum(san.target_kk)} KK, pemanfaat ${fmtNum(san.total_pemanfaat_kk)} KK / ${fmtNum(san.total_pemanfaat_jiwa)} jiwa (${fmtPct(san.coverage_kk_percentage)}), tersebar di ${fmtNum(san.desa_with_infrastruktur)} desa berinfrastruktur (${fmtNum(san.spaldt_count)} SPALD-T, ${fmtNum(san.spalds_count)} SPALD-S, ${fmtNum(san.iplt_count)} IPLT).`,
                ),
                p(
                    `Profil ${fmtNum(spam.total_units)} unit SPAM (POKMAS, kapasitas, anggaran) dan ${fmtNum(san.total_count)} infrastruktur sanitasi terdigitalisasi. Air minum: ${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} record capaian multi-tahun (${earliestYear}–${scope.latestAchievementYear ?? '2026'}). Rekapitulasi lintas 33 kecamatan dari 5–10 hari menjadi kurang dari satu hari via filter kecamatan/desa/tahun.`,
                ),
                p(
                    `Akuntabilitas anggaran terpetakan seimbang: air minum nilai kontrak/unit ${fmtMilyar(anggaranAirMinum)}; sanitasi investasi infrastruktur ${fmtMilyar(anggaranSanitasi)}; pekerjaan konstruksi (lintas bidang) pagu ${fmtMilyar(anggaranPekerjaan)} dan kontrak ${fmtMilyar(anggaranKontrak)}; pengawasan ${fmtMilyar(anggaranPengawasan)}. Monitoring ${fmtNum(dash.totalPekerjaan)} paket (${pekerjaanNarrative || 'data per tahun dihimpun'}) menghubungkan progress konstruksi SPAM dan sanitasi dengan capaian layanan pasca-operasional.`,
                ),
                p(
                    `Peta choropleth dan API publik capaian ${SPM} menjadi dasar penargetan Renja/RKPD, evaluasi RISPAM, dan RAD PAMSIMAS—baik untuk desa prioritas air minum (coverage ${fmtPct(spam.coverage_percentage)}) maupun sanitasi (coverage ${fmtPct(san.coverage_kk_percentage)}). ${disclaimerSinkronisasi}`,
                ),

                h3('Manfaat bagi Masyarakat'),
                p(
                    `Masyarakat memperoleh akses capaian ${SPM} air minum dan sanitasi per desa tanpa login (arumanis.cianjur.space, 24 jam). Dari ${fmtNum(san.total_penduduk)} jiwa penduduk: air minum ${fmtNum(spam.capaian_jiwa)} jiwa terlayani (${fmtPct(spam.coverage_percentage)}), sisa gap ${fmtNum(gapAirMinumKk)} KK; sanitasi ${fmtNum(san.total_pemanfaat_jiwa)} jiwa pemanfaat (${fmtPct(san.coverage_kk_percentage)}) di ${fmtNum(san.desa_with_infrastruktur)} desa, sementara ${fmtNum(san.desa_without_infrastruktur)} desa belum berinfrastruktur terpetakan.`,
                ),
                p(
                    `Warga dapat memverifikasi unit SPAM, persentase capaian ${SPM} air minum, serta infrastruktur SPALD-T/SPALD-S/IPLT di desanya—tanpa ke kantor dinas. Dokumentasi ${fmtNum(spam.total_foto_dokumentasi)} foto progres ber-GPS memperkuat kredibilitas pelaporan konstruksi air minum maupun sanitasi.`,
                ),
                p(
                    'Aparatur desa, POKMAS, dan pengelola unit memperoleh dasar data bersama evaluasi kinerja layanan. Manfaat jangka panjang: percepatan akses air minum layak dan sanitasi/air limbah—selaras SDGs 6 dan penurunan stunting. Investasi terpetakan: air minum ' +
                        fmtMilyar(anggaranAirMinum) +
                        ', sanitasi ' +
                        fmtMilyar(anggaranSanitasi) +
                        `—dapat dipertanggungjawabkan karena progress konstruksi terlacak hingga operasional. ${disclaimerSinkronisasi}`,
                ),

                h2('4.2  Penerima Manfaat Inovasi'),
                p(
                    `Penerima manfaat langsung: masyarakat di 33 kecamatan dan 365 desa. Capaian ${SPM} air minum ${fmtNum(spam.capaian_kk)} KK (${fmtNum(spam.capaian_jiwa)} jiwa, ${fmtPct(spam.coverage_percentage)}); sanitasi ${fmtNum(san.total_pemanfaat_kk)} KK (${fmtNum(san.total_pemanfaat_jiwa)} jiwa, ${fmtPct(san.coverage_kk_percentage)}) di ${fmtNum(san.desa_with_infrastruktur)} desa.`,
                ),
                p(
                    `Pengawas (${fmtNum(pengawas.total_pengawas)} orang), konsultan, kontraktor, operator, pengelola ${fmtNum(spam.total_units)} unit SPAM, dan POKMAS merupakan penerima manfaat operasional. Publik akses capaian ${SPM} 24 jam. Manfaat menjangkau ${fmtNum(san.total_penduduk)} jiwa penduduk; prioritas intervensi di desa coverage air minum dan sanitasi terendah.`,
                ),

                h1('BAB V  HASIL INOVASI'),
                p(
                    `Hasil penyelenggaraan inovasi Arumanis per ${fetched} berupa produk digital yang mendukung monitoring konstruksi dan pengolahan data real-time, sebagai berikut.`,
                ),
                p(
                    'Platform Arumanis Utama (arumanis.cianjur.space) meliputi dashboard monitoring pekerjaan, modul kegiatan dan kontrak, SPAM Unit, indikator kualitas data, notifikasi, dan asisten Ami AI. Panel Pengawasan Terintegrasi (/pengawasan/) menjadi sarana utama pengawas memantau progress konstruksi, mengunggah dokumentasi, dan menyusun laporan mingguan dengan SSO dari akun yang sama.',
                ),
                p(
                    `Backend api amis (apiamis.cianjur.space) menjadi pusat penyimpanan dan validasi data. Puspen tersedia sebagai alat tambahan (arsip PDF, TTD digital, progress fisik, media sharing, statistik pengawas) untuk keperluan operasional pendukung. Halaman publik menampilkan peta capaian SPM dan sanitasi per desa. Basis data terintegrasi memuat ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(spam.total_units)} unit SPAM, ${fmtNum(san.total_count)} infrastruktur sanitasi, ${fmtNum(spam.total_foto_dokumentasi)} foto, dan ${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} record capaian (${earliestYear}–${scope.latestAchievementYear ?? '2026'})—sinkronisasi data sejak ${syncStart} masih berlangsung.`,
                ),
                p(
                    `Ringkasan hasil per ${fetched}: ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(dash.totalKontrak)} kontrak, ${fmtNum(pengawas.total_pengawas)} pengawas. Capaian ${SPM} air minum ${fmtNum(spam.capaian_kk)} KK (${fmtPct(spam.coverage_percentage)}); sanitasi ${fmtNum(san.total_pemanfaat_kk)} KK (${fmtPct(san.coverage_kk_percentage)}). Anggaran: air minum ${fmtMilyar(anggaranAirMinum)}, sanitasi ${fmtMilyar(anggaranSanitasi)}, pekerjaan ${fmtMilyar(anggaranPekerjaan)}, pengawasan ${fmtMilyar(anggaranPengawasan)}.`,
                ),
                p(disclaimerSinkronisasi, { italics: true }),
                p(
                    'Dokumen umum ini menggambarkan Arumanis sebagai inovasi monitoring konstruksi SPAM perdesaan dan sanitasi (khususnya air limbah), dilengkapi pengolahan data real-time. Dokumen diperbarui seiring sinkronisasi data.',
                    { italics: true },
                ),

                h1('LAMPIRAN  Bukti Visual Platform'),
                p(
                    'Cuplikan layar berikut diambil dari lingkungan produksi arumanis.cianjur.space per Juni 2026 sebagai bukti visual implementasi inovasi. Gambar melengkapi narasi monitoring konstruksi dan capaian SPM air minum serta sanitasi.',
                ),
                ...buildScreenshotBlocks(),
                p(disclaimerSinkronisasi, { italics: true }),
            ],
        },
    ],
})

const buffer = await Packer.toBuffer(doc)
try {
    fs.writeFileSync(OUT_PATH, buffer)
    console.log(`✓ Proposal tersimpan: ${OUT_PATH}`)
} catch (err) {
    if (err.code === 'EBUSY') {
        const alt = OUT_PATH.replace(/\.docx$/, '_baru.docx')
        fs.writeFileSync(alt, buffer)
        console.log(`⚠ File utama terkunci (mungkin dibuka di Word). Disimpan ke: ${alt}`)
    } else {
        throw err
    }
}