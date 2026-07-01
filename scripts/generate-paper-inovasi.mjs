import fs from 'node:fs'
import path from 'node:path'
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
import {
    SCREENSHOTS,
    SCREENSHOTS_DIR,
    IMG_WIDTH,
    SPM,
    achNarrative,
    anggaranAirMinum,
    anggaranKontrak,
    anggaranPekerjaan,
    anggaranPengawasan,
    anggaranSanitasi,
    dash,
    disclaimerSinkronisasi,
    earliestYear,
    fetched,
    fmtMilyar,
    fmtNum,
    fmtPct,
    gapAirMinumKk,
    gapSanitasiKk,
    pekerjaanNarrative,
    pengawas,
    ROOT,
    san,
    scope,
    spam,
    syncStart,
} from './proposal-data.mjs'

const OUT_PATH = path.join(ROOT, 'docs', 'Paper_Inovasi_Arumanis.docx')

const FONT = 'Times New Roman'
const BODY = 24 // 12pt
const LINE = 480 // double spacing

function title(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, line: LINE },
        children: [new TextRun({ text, bold: true, size: 28, font: FONT })],
    })
}

function authorLine(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120, line: LINE },
        children: [new TextRun({ text, size: BODY, font: FONT })],
    })
}

function section(num, text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 280, after: 200, line: LINE },
        children: [new TextRun({ text: `${num}. ${text}`, bold: true, size: 26, font: FONT })],
    })
}

function subsection(num, text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 160, line: LINE },
        children: [new TextRun({ text: `${num} ${text}`, bold: true, size: BODY, font: FONT })],
    })
}

function label(text) {
    return new Paragraph({
        spacing: { before: 240, after: 120, line: LINE },
        children: [new TextRun({ text, bold: true, size: BODY, font: FONT })],
    })
}

function p(text, opts = {}) {
    return new Paragraph({
        spacing: { after: 0, line: LINE },
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
        indent: opts.hanging ? { left: 720, hanging: 360 } : undefined,
        children: [
            new TextRun({
                text,
                bold: !!opts.bold,
                italics: !!opts.italics,
                size: BODY,
                font: FONT,
            }),
        ],
    })
}

function ref(text) {
    return new Paragraph({
        spacing: { after: 0, line: LINE },
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 720, hanging: 360 },
        children: [new TextRun({ text, size: BODY, font: FONT })],
    })
}

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

function figCaption(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240, line: LINE },
        children: [new TextRun({ text, italics: true, size: 20, font: FONT })],
    })
}

function buildFigures() {
    const blocks = []
    for (const shot of SCREENSHOTS) {
        const paragraph = img(shot.file, shot.caption)
        if (paragraph) blocks.push(paragraph, figCaption(shot.caption))
    }
    return blocks
}

const abstractText =
    `Penyelenggaraan air minum perdesaan dan sanitasi di Kabupaten Cianjur menghadapi fragmentasi data, keterbatasan monitoring konstruksi, dan rendahnya transparansi capaian ${SPM}. Penelitian ini mendeskripsikan Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) sebagai platform monitoring pekerjaan konstruksi SPAM perdesaan dan sanitasi—khususnya pengelolaan air limbah—serta pengolahan data real-time. Data operasional per ${fetched} menunjukkan capaian ${SPM} air minum ${fmtPct(spam.coverage_percentage)} (${fmtNum(spam.capaian_kk)} KK dari ${fmtNum(spam.total_target)} KK) dan sanitasi ${fmtPct(san.coverage_kk_percentage)} (${fmtNum(san.total_pemanfaat_kk)} KK dari ${fmtNum(san.target_kk)} KK). Sistem menghimpun ${fmtNum(dash.totalPekerjaan)} pekerjaan, ${fmtNum(spam.total_units)} unit SPAM, ${fmtNum(san.total_count)} infrastruktur sanitasi, dan ${fmtNum(spam.total_foto_dokumentasi)} foto dokumentasi. Anggaran terpetakan: air minum ${fmtMilyar(anggaranAirMinum)}, sanitasi ${fmtMilyar(anggaranSanitasi)}. Metode pembaharuan membandingkan kondisi sebelum dan sesudah penerapan sistem. Hasil menunjukkan percepatan rekapitulasi lintas 365 desa, pelaporan pengawas mingguan, serta akses publik peta capaian 24 jam. Data masih dalam tahap sinkronisasi sejak ${syncStart} dan mungkin mengandung kesalahan.`

const doc = new Document({
    styles: {
        default: { document: { run: { font: FONT, size: BODY } } },
        paragraphStyles: [
            {
                id: 'Heading1',
                name: 'Heading 1',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: 26, bold: true, font: FONT },
                paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 0 },
            },
            {
                id: 'Heading2',
                name: 'Heading 2',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: BODY, bold: true, font: FONT },
                paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 1 },
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
                                new TextRun({ text: 'Paper Inovasi Arumanis — ', size: 18, font: FONT }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18, font: FONT }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                title(
                    'ARUMANIS: Platform Monitoring Konstruksi SPAM Perdesaan dan Sanitasi Berbasis Satu Data di Kabupaten Cianjur',
                ),
                authorLine('Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur'),
                authorLine('Kabupaten Cianjur, Jawa Barat, Indonesia'),
                authorLine(`Tahun: 2026 · Snapshot data: ${fetched}`),
                new Paragraph({ spacing: { after: 200 } }),

                label('Abstrak'),
                p(abstractText),
                p(
                    `Kata kunci: monitoring konstruksi; SPAM perdesaan; sanitasi; ${SPM}; satu data; Kabupaten Cianjur; SPBE`,
                    { italics: true },
                ),
                new Paragraph({ spacing: { after: 280 } }),

                section('1', 'PENDAHULUAN'),
                subsection('1.1', 'Latar Belakang'),
                p(
                    `Kabupaten Cianjur (33 kecamatan, 365 desa/kelurahan) menyelenggarakan program air minum perdesaan dan sanitasi—termasuk pengelolaan air limbah (SPALD-T, SPALD-S, IPLT)—yang memerlukan pemantauan konstruksi dan rekapitulasi capaian ${SPM} secara terpadu. Sebelum digitalisasi, pelaporan progres fisik, keuangan, dan dokumentasi lapangan dilakukan melalui Excel, dokumen cetak, dan pesan instan tanpa jejak terpusat.`,
                ),
                p(
                    `Arumanis dikembangkan sebagai respons terhadap tuntutan SPBE, transparansi publik, SDGs 6, RPJMD 2025–2029, RISPAM, dan RAD PAMSIMAS. Platform ini memfokuskan monitoring pekerjaan konstruksi sebagai inti inovasi, dilengkapi pengolahan data real-time dan publikasi capaian per desa.`,
                ),

                subsection('1.2', 'Rumusan Masalah'),
                p(
                    `(1) Bagaimana kondisi pemantauan konstruksi SPAM dan sanitasi sebelum dan sesudah penerapan Arumanis? (2) Berapa capaian ${SPM} air minum dan sanitasi yang telah dihimpun sistem? (3) Bagaimana pemetaan anggaran dan data historis yang tersedia? (4) Apa manfaat, keterbatasan, dan risiko pada tahap sinkronisasi data?`,
                ),

                subsection('1.3', 'Tujuan Penelitian'),
                p(
                    `Mendeskripsikan rancang bangun Arumanis, menganalisis data terhimpun per ${fetched}, membandingkan indikator sebelum dan sesudah inovasi, serta mengevaluasi manfaat penyelenggaraan program air minum dan sanitasi di Kabupaten Cianjur.`,
                ),

                section('2', 'TINJAUAN PUSTAKA DAN LANDASAN HUKUM'),
                subsection('2.1', 'Landasan Teoritis'),
                p(
                    `Konsep ${SPM} menjadi acuan pengukuran layanan air minum dan sanitasi. Single source of truth dan integrasi data SPBE (Permendagri 59/2016) menjadi kerangka tata kelola informasi daerah. Monitoring proyek infrastruktur sosial memerlukan penghubungan aset (unit SPAM, infrastruktur sanitasi), pelaksanaan konstruksi (pekerjaan, kontrak), dan capaian layanan (achievement multi-tahun).`,
                ),

                subsection('2.2', 'Landasan Hukum'),
                p(
                    'Undang-Undang Nomor 17 Tahun 2019 (Sumber Daya Air); UU 23 Tahun 2014 (Pemerintahan Daerah); UU 11 Tahun 2008 (ITE); UU 14 Tahun 2008 (KIP); UU 18 Tahun 2008 (Pengelolaan Sampah). Air minum: PP 16 Tahun 2005; Permen PUPR 18/PRT/M/2007; Permen PU 20 Tahun 2006. Sanitasi: Permen PUPR 14/PRT/M/2014 (PAMSIMAS); Permenkes 2 Tahun 2023 (SPM Kesehatan); Permen PUPR 27/PRT/M/2018 (air limbah domestik). Daerah: Perda Cianjur 14, 1, 18 Tahun 2021; Perbup 102/2021; Perbup 23/2020; RPJMD 2025–2029; RISPAM.',
                ),

                subsection('2.3', 'Penelitian dan Praktik Terkait'),
                p(
                    'Sistem konvensional kerap memisahkan modul proyek, SPAM, dan sanitasi. Arumanis memadukan keduanya dalam satu platform dengan Panel Pengawasan terintegrasi (SSO), API publik capaian, peta choropleth, indikator kualitas data, integrasi SIMSPAM, dan asisten Ami AI untuk penafsiran data operasional.',
                ),

                section('3', 'METODE'),
                subsection('3.1', 'Desain Sistem'),
                p(
                    'Arumanis terdiri atas frontend (arumanis.cianjur.space), backend api amis (apiamis.cianjur.space), Panel Pengawasan (/pengawasan/), dan halaman publik capaian SPM. Modul inti: pekerjaan, kontrak, SPAM Unit, sanitasi, dashboard, notifikasi. Puspen (/puspen) berfungsi sebagai alat tambahan (arsip PDF, TTD digital, progress fisik, media sharing, statistik pengawas), bukan inti platform.',
                ),

                subsection('3.2', 'Sumber dan Pengumpulan Data'),
                p(
                    `Data diambil dari basis operasional Arumanis per ${fetched} melalui API terautentikasi. Sumber meliputi impor Excel/CSV sejak ${syncStart}, input operator, capaian unit SPAM (jejak tertua ${earliestYear}), modul pekerjaan, dokumentasi Panel Pengawasan, dan modul sanitasi. Capaian SPAM per tahun dihitung dari ${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} record achievement: ${achNarrative}.`,
                ),

                subsection('3.3', 'Metode Pembaharuan'),
                p(
                    'Penelitian ini menggunakan metode perbandingan kondisi sebelum dan sesudah inovasi pada indikator terukur: waktu rekapitulasi, interval pelaporan pengawas, jumlah paket terpantau, dokumentasi foto, akses publik, dan waktu pembuatan laporan. Kolom "sebelum" mengacu pada estimasi praktik manual; kolom "sesudah" pada snapshot data Arumanis.',
                ),

                section('4', 'HASIL DAN PEMBAHASAN'),
                subsection('4.1', 'Profil Data Terhimpun'),
                p(
                    `Sistem mencatat ${fmtNum(dash.totalPekerjaan)} pekerjaan konstruksi (kumulatif), ${fmtNum(dash.totalKontrak)} kontrak, ${fmtNum(spam.total_units)} unit SPAM (${fmtNum(spam.simspam_count)} SIMSPAM), ${fmtNum(san.total_count)} infrastruktur sanitasi di ${fmtNum(san.desa_with_infrastruktur)} desa, ${fmtNum(pengawas.total_pengawas)} pengawas di ${fmtNum(pengawas.total_lokasi)} lokasi, dan ${fmtNum(spam.total_foto_dokumentasi)} foto dokumentasi. Pekerjaan per tahun anggaran: ${pekerjaanNarrative || 'data sedang dihimpun'}.`,
                ),

                subsection('4.2', `Capaian ${SPM} Air Minum dan Sanitasi`),
                p(
                    `Air minum: ${fmtNum(spam.capaian_kk)} KK / ${fmtNum(spam.capaian_jiwa)} jiwa (${fmtPct(spam.coverage_percentage)} dari target ${fmtNum(spam.total_target)} KK); gap ${fmtNum(gapAirMinumKk)} KK. Sanitasi: ${fmtNum(san.total_pemanfaat_kk)} KK / ${fmtNum(san.total_pemanfaat_jiwa)} jiwa (${fmtPct(san.coverage_kk_percentage)} dari target ${fmtNum(san.target_kk)} KK); gap ${fmtNum(gapSanitasiKk)} KK. Terdapat ${fmtNum(san.desa_without_infrastruktur)} desa tanpa infrastruktur terpetakan dibanding ${fmtNum(san.desa_with_infrastruktur)} desa yang sudah.`,
                ),
                p(
                    `Rendahnya coverage sanitasi (${fmtPct(san.coverage_kk_percentage)}) dibanding air minum (${fmtPct(spam.coverage_percentage)}) mengindikasikan prioritas intervensi jangka menengah pada desa tanpa SPALD-T/SPALD-S/IPLT. Capaian air minum didukung ${fmtNum(scope.totalAchievementRecords ?? spam.achievement_records)} record multi-tahun (${earliestYear}–${scope.latestAchievementYear ?? '2026'}).`,
                ),

                subsection('4.3', 'Pemetaan Anggaran'),
                p(
                    `Anggaran terhimpun (snapshot): air minum ${fmtMilyar(anggaranAirMinum)}; sanitasi ${fmtMilyar(anggaranSanitasi)}; pekerjaan konstruksi pagu ${fmtMilyar(anggaranPekerjaan)}, kontrak ${fmtMilyar(anggaranKontrak)}; pengawasan ${fmtMilyar(anggaranPengawasan)}. Total investasi air minum + sanitasi ~${fmtMilyar(anggaranAirMinum + anggaranSanitasi)}. Pemetaan seimbang kedua bidang mendukung akuntabilitas program lintas DAK/APBD.`,
                ),

                subsection('4.4', 'Perbandingan Sebelum dan Sesudah'),
                p(
                    `Rekapitulasi ${SPM} lintas 365 desa: 5–10 hari → < 1 hari. Paket terpantau: tidak terstandar → ${fmtNum(dash.totalPekerjaan)} pekerjaan. Laporan pengawas: 2–4 minggu → mingguan. Dokumentasi foto: tersebar → ${fmtNum(spam.total_foto_dokumentasi)} terindeks ber-GPS. Akses publik capaian: tidak tersedia → 24 jam via peta choropleth. Impor data SPAM: 3–5 hari → < 2 jam. Laporan PDF/Excel: 1–2 hari → < 30 menit.`,
                ),

                subsection('4.5', 'Manfaat bagi Penyelenggara dan Masyarakat'),
                p(
                    `Penyelenggara memperoleh monitoring terpusat SPAM dan sanitasi, evaluasi ${SPM} real-time, serta anggaran terpetakan tanpa rekapitulasi manual. Masyarakat mengakses capaian per desa tanpa login. Dari ${fmtNum(san.total_penduduk)} jiwa penduduk, ${fmtNum(spam.capaian_jiwa)} jiwa terlayani air minum dan ${fmtNum(san.total_pemanfaat_jiwa)} jiwa memanfaatkan sanitasi—selaras SDGs 6 dan upaya penurunan stunting.`,
                ),

                subsection('4.6', 'Risiko, Keterbatasan, dan Rencana Pengembangan'),
                p(
                    `${disclaimerSinkronisasi} Contoh ketidakselarasan: penghitungan jenis infrastruktur SPALD-S antar modul masih diverifikasi. Mitigasi: validasi triwulanan, indikator kualitas data, pelatihan operator, SSO Panel Pengawasan. Rencana 2026–2027: harmonisasi data ${syncStart}–2023, penautan pekerjaan–unit SPAM–sanitasi, perluasan SIMSPAM, peningkatan metadata GPS/foto, dan pengayaan data ${fmtNum(san.desa_without_infrastruktur)} desa gap sanitasi.`,
                ),

                section('5', 'KESIMPULAN DAN SARAN'),
                p(
                    `Arumanis terbukti menghimpun data operasional air minum dan sanitasi dalam satu platform monitoring konstruksi. Capaian ${SPM} air minum ${fmtPct(spam.coverage_percentage)} dan sanitasi ${fmtPct(san.coverage_kk_percentage)} menjadi dasar evaluasi program, dengan gap signifikan yang memerlukan intervensi berkelanjutan. Metode pembaharuan menunjukkan peningkatan terukur pada kecepatan rekapitulasi, frekuensi pelaporan, dan transparansi publik.`,
                ),
                p(
                    'Disarankan: (1) menyelesaikan sinkronisasi data historis; (2) memprioritaskan desa gap tertinggi pada peta capaian; (3) meningkatkan adopsi pengawas melalui pelatihan berkala; (4) memperkuat validasi silang antar modul agar kesalahan data minimal; (5) mempertahankan publikasi capaian SPM sebagai instrumen akuntabilitas publik.',
                ),

                label('Daftar Pustaka'),
                ref('Peraturan Pemerintah Republik Indonesia Nomor 16 Tahun 2005 tentang Pengembangan Sistem Penyediaan Air Minum.'),
                ref('Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat Nomor 18/PRT/M/2007 tentang Pedoman Pengembangan Sistem Penyediaan Air Minum.'),
                ref('Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat Nomor 14/PRT/M/2014 tentang Penyediaan Air Minum dan Sanitasi Berbasis Masyarakat.'),
                ref('Peraturan Menteri Dalam Negeri Republik Indonesia Nomor 59 Tahun 2016 tentang Penerapan SPBE.'),
                ref('Peraturan Menteri Kesehatan Republik Indonesia Nomor 2 Tahun 2023 tentang Standar Pelayanan Minimum Bidang Kesehatan.'),
                ref('Peraturan Bupati Kabupaten Cianjur Nomor 23 Tahun 2020 tentang Rencana Aksi Daerah PAMSIMAS 2019–2023.'),
                ref('Data operasional Arumanis (apiamis.cianjur.space), snapshot ' + fetched + '.'),

                section('6', 'LAMPIRAN'),
                p('Cuplikan layar lingkungan produksi arumanis.cianjur.space, Juni 2026.'),
                ...buildFigures(),
                p(disclaimerSinkronisasi, { italics: true }),
            ],
        },
    ],
})

const buffer = await Packer.toBuffer(doc)
try {
    fs.writeFileSync(OUT_PATH, buffer)
    console.log(`✓ Paper tersimpan: ${OUT_PATH}`)
} catch (err) {
    if (err.code === 'EBUSY') {
        const alt = OUT_PATH.replace(/\.docx$/, '_baru.docx')
        fs.writeFileSync(alt, buffer)
        console.log(`⚠ File terkunci. Disimpan ke: ${alt}`)
    } else {
        throw err
    }
}