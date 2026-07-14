#!/usr/bin/env node
/**
 * Dokumen Kemanfaatan Inovasi Arumanis (live data)
 * Run: node scripts/fetch-kemanfaatan-live-data.mjs && node scripts/generate-kemanfaatan-inovasi-docx.mjs
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
import {
  buildDocumentStyles,
  buildNumberingConfig,
  bodyPara,
  PAGE_MARGINS,
  PAGE_SIZE,
  SIZE_SMALL,
  tr,
} from './lib/docx-id-styles.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_PATH = path.join(ROOT, 'docs', 'kemanfaatan-live-data.json')
const OUT = path.join(ROOT, 'docs', 'Kemanfaatan-Inovasi-Arumanis.docx')
const IMG_AIR = path.join(ROOT, 'docs', 'assets', 'screenshots', 'spm-air-minum.png')
const IMG_SAN = path.join(ROOT, 'docs', 'assets', 'screenshots', 'spm-sanitasi.png')

const CONTENT_W = PAGE_SIZE.width - PAGE_MARGINS.left - PAGE_MARGINS.right
const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: border, bottom: border, left: border, right: border }

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8').replace(/^\uFEFF/, ''))
const spam = data.spam ?? {}
const san = data.sanitasi ?? {}
const dash = data.dashboard ?? {}
const pengawas = data.pengawas ?? {}
const kpiP = data.kpi?.pengawas ?? {}
const kpiK = data.kpi?.konsultan_pengawas ?? {}
const roles = data.roleCounts ?? {}
const studi = data.studiKasus ?? {}
const ach = data.achievementPerTahun ?? []
const pekerjaanTahun = data.pekerjaanPerTahun ?? []

const fetched = new Date(data.fetchedAt).toLocaleString('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const fmt = (n) => new Intl.NumberFormat('id-ID').format(Math.round(Number(n) || 0))
const fmtPct = (n) => `${Number(n).toFixed(1).replace('.', ',')}%`
const fmtMilyar = (n) => {
  const v = Number(n) / 1_000_000_000
  return `Rp ${v.toFixed(2).replace('.', ',')} miliar`
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: opts.spacing ?? bodyPara().spacing,
    heading: opts.heading,
    children: [tr(text, { bold: opts.bold, italics: opts.italics, size: opts.size, color: opts.color })],
  })
}

function h1(t) {
  return p(t, { heading: HeadingLevel.HEADING_1 })
}
function h2(t) {
  return p(t, { heading: HeadingLevel.HEADING_2 })
}
function h3(t) {
  return p(t, { heading: HeadingLevel.HEADING_3 })
}

function bullet(text, ref = 'bullets-kmf') {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100, line: 360, lineRule: 'auto' },
    children: [tr(text)],
  })
}

function tableFromRows(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0)
  const mk = (cells, ri) =>
    new TableRow({
      children: cells.map((cell, ci) =>
        new TableCell({
          borders,
          width: { size: colWidths[ci], type: WidthType.DXA },
          shading: ri === 0 ? { fill: 'D5E8F0', type: ShadingType.CLEAR } : undefined,
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [
            new Paragraph({
              ...bodyPara({ after: 0 }),
              children: [tr(String(cell ?? ''), { bold: ri === 0, size: SIZE_SMALL })],
            }),
          ],
        }),
      ),
    })
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [mk(headers, 0), ...rows.map((r) => mk(r, 1))],
  })
}

function screenshot(pathImg, captionText, width = 520) {
  if (!fs.existsSync(pathImg)) return []
  const buf = fs.readFileSync(pathImg)
  const height = Math.round(width * 0.52)
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100, line: 360, lineRule: 'auto' },
      children: [
        new ImageRun({
          type: 'png',
          data: buf,
          transformation: { width, height },
          altText: { title: captionText, description: captionText, name: path.basename(pathImg) },
        }),
      ],
    }),
    p(captionText, { center: true, italics: true, spacing: bodyPara({ after: 280 }).spacing }),
  ]
}

function kpiRow(item) {
  return [
    item.nama ?? '-',
    fmt(item.pekerjaan_count),
    fmt(item.foto_count),
    fmt(item.penerima_count),
    String(item.score ?? '-'),
  ]
}

const disclaimer =
  'Catatan: angka diambil dari API produksi Arumanis per tanggal di bawah. Data masih dalam proses harmonisasi multi-sumber; dipakai sebagai gambaran kondisi terkini, bukan pernyataan final audit.'

const doc = new Document({
  styles: buildDocumentStyles(),
  numbering: { config: buildNumberingConfig(['bullets-kmf']) },
  sections: [
    {
      properties: { page: { size: PAGE_SIZE, margin: PAGE_MARGINS } },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 0 },
              children: [tr('Kemanfaatan Inovasi Arumanis', { size: SIZE_SMALL, color: '666666' })],
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
                tr('Halaman ', { size: SIZE_SMALL }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: SIZE_SMALL }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120, line: 360, lineRule: 'auto' },
          children: [tr('DOKUMEN KEMANFAATAN INOVASI', { bold: true, size: 36, color: '1F4E79' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400, line: 360, lineRule: 'auto' },
          children: [
            tr('Platform Arumanis — Monitoring SPAM Perdesaan & Sanitasi Air Limbah', {
              size: 28,
              color: '2E75B6',
            }),
          ],
        }),
        p(`Sumber data live: apiamis.cianjur.space · Diambil ${fetched}`, { center: true }),
        p('Kabupaten Cianjur · 32 kecamatan, 6 kelurahan, 354 desa', {
          center: true,
          spacing: bodyPara({ after: 400 }).spacing,
        }),

        h1('1. Ringkasan'),
        p(
          `Arumanis menggabungkan monitoring konstruksi, capaian Standar Pelayanan Minimum (SPM) air minum dan sanitasi, serta pelaporan lapangan dalam satu platform. Per ${fetched}, sistem mencatat ${fmt(dash.totalPekerjaan)} pekerjaan, ${fmt(spam.total_units)} unit SPAM, ${fmt(san.total_count)} infrastruktur sanitasi, dan ${fmt(spam.total_foto_dokumentasi)} foto dokumentasi terindeks.`,
        ),
        p(disclaimer, { italics: true, spacing: bodyPara({ after: 280 }).spacing }),

        h1('2. Capaian SPM Air Minum'),
        p(
          `Ringkasan agregat air minum (${spam.target_year ?? 'terakumulasi'}) menunjukkan cakupan ${fmtPct(spam.coverage_percentage)} dari target ${fmt(spam.total_target)} KK. Jiwa terlayani ${fmt(spam.capaian_jiwa)} jiwa pada ${fmt(spam.capaian_sr)} sambungan rumah (SR).`,
        ),
        tableFromRows(
          ['Indikator', 'Nilai'],
          [
            ['Cakupan SPM', `${fmtPct(spam.coverage_percentage)} (${fmt(spam.capaian_kk)} / ${fmt(spam.total_target)} KK)`],
            ['Jiwa terlayani', `${fmt(spam.capaian_jiwa)} jiwa · ${fmt(spam.capaian_sr)} SR`],
            ['Unit SPM', `${fmt(spam.total_units)} unit (${fmt(spam.simspam_count)} SIMSPAM · ${fmt(spam.non_simspam_count)} non-SIMSPAM)`],
            ['BJP (KK)', `${fmt(spam.total_bjp_kk)} KK · ${fmt(spam.total_bjp_jiwa)} jiwa BJP`],
            ['Record capaian tahunan', `${fmt(spam.achievement_records)} record · ${fmt(spam.wilayah_total_kecamatan)} kecamatan`],
            ['Nilai kontrak terkonsolidasi', fmtMilyar(spam.capaian_nilai_kontrak)],
            ['Integrasi pekerjaan 2026+', `${fmt(spam.capaian_integrasi_kk)} KK · ${fmt(spam.capaian_integrasi_jiwa)} jiwa`],
            ['Paket air minum tertaut ke unit', `${fmt(spam.linked_pekerjaan_count)} dari ${fmt(spam.pekerjaan_air_minum_count)} paket`],
          ],
          [4200, CONTENT_W - 4200],
        ),
        p(' ', { spacing: bodyPara({ after: 120 }).spacing }),
        ...screenshot(IMG_AIR, 'Gambar 1. Ringkasan agregat SPM air minum pada portal Arumanis (live).'),
        h3('Tren capaian tahunan air minum'),
        tableFromRows(
          ['Tahun', 'Record', 'Unit', 'KK', 'Jiwa', 'SR'],
          ach.map((r) => [r.tahun, fmt(r.records), fmt(r.units), fmt(r.kk), fmt(r.jiwa), fmt(r.sr)]),
          [1200, 1200, 1200, 1500, 1500, CONTENT_W - 6600],
        ),

        h1('3. Capaian SPM Sanitasi'),
        p(
          `Sanitasi mencatat ${fmt(san.total_count)} infrastruktur (${fmt(san.berfungsi_count)} berfungsi) di ${fmt(san.desa_with_infrastruktur)} desa. Cakupan pemanfaat ${fmtPct(san.coverage_percentage)} (${fmt(san.total_pemanfaat_kk)} KK dari target ${fmt(san.target_kk)} KK), setara ${fmt(san.total_pemanfaat_jiwa)} jiwa pemanfaat.`,
        ),
        tableFromRows(
          ['Indikator', 'Nilai'],
          [
            ['Cakupan jiwa/KK', `${fmtPct(san.coverage_percentage)} · ${fmt(san.total_pemanfaat_kk)} / ${fmt(san.target_kk)} KK`],
            ['Jiwa pemanfaat', `${fmt(san.total_pemanfaat_jiwa)} jiwa`],
            ['Infrastruktur', `${fmt(san.total_count)} unit (${fmt(san.berfungsi_count)} berfungsi)`],
            ['SPALD-T / SPALD-S / IPLT', `${fmt(san.spaldt_count)} / ${fmt(san.spalds_count)} / ${fmt(san.iplt_count)}`],
            ['Capaian SPM desa', `${fmt(san.desa_with_infrastruktur)} / ${fmt(san.total_desa)} desa`],
            ['Desa belum ada infrastruktur', fmt(san.desa_without_infrastruktur)],
            ['Investasi terkonsolidasi', fmtMilyar(san.total_investasi)],
            ['Wilayah', `${fmt(spam.wilayah_total_kecamatan ?? 32)} kecamatan`],
          ],
          [4200, CONTENT_W - 4200],
        ),
        p(' ', { spacing: bodyPara({ after: 120 }).spacing }),
        ...screenshot(IMG_SAN, 'Gambar 2. Ringkasan agregat SPM sanitasi pada portal Arumanis (live).'),

        h1('4. Kemanfaatan bagi Pengguna Lapangan'),
        p(
          `Tiga peran di bawah ini memakai sumber data APIAMIS yang sama, dengan cakupan berbeda. Pengawas (${fmt(roles.pengawas ?? 0)} akun) menangani seluruh paket yang ditugaskan. Konsultan pengawasan (${fmt(roles.konsultan_pengawas ?? 0)} akun) berperan serupa dengan fokus verifikasi dan KPI terpisah. TFL (${fmt(roles.tfl ?? 0)} akun terdaftar) mengikuti pola konsultan, tetapi khusus pada kegiatan Sanitasi sumber Dana Alokasi Khusus (DAK).`,
        ),

        h2('4.1 Pengawas'),
        p(
          `Setelah login, pengawas diarahkan ke Panel Pengawasan (/pengawasan) atau aplikasi mobile Arumanis Pengawasan. Mereka hanya melihat pekerjaan sesuai assignment user-pekerjaan.`,
        ),
        tableFromRows(
          ['Aspek', 'Penyajian di Arumanis'],
          [
            ['Dashboard KPI', `Skor rata-rata ${kpiP.aggregate?.avg_score ?? '-'} · ${fmt(kpiP.aggregate?.total_pekerjaan)} pekerjaan · ${fmt(kpiP.aggregate?.total_foto)} foto (${data.tahun})`],
            ['Input lapangan', 'Foto + koordinat GPS, progress fisik/keuangan, tiket'],
            ['Presence', 'Heartbeat lokasi → panel Pengguna Online & Lokasi Pengawas di portal'],
            ['Notifikasi', 'Reverb realtime + push mobile'],
            ['Capaian SPM', 'Membaca konteks desa/kecamatan paket yang ditugaskan (integrasi SPAM/sanitasi)'],
          ],
          [2800, CONTENT_W - 2800],
        ),
        p('Contoh KPI pengawas teratas (tahun berjalan):', { bold: true }),
        tableFromRows(
          ['Nama', 'Pekerjaan', 'Foto', 'Penerima', 'Skor'],
          (kpiP.top5 ?? []).map(kpiRow),
          [2600, 1200, 1200, 1400, CONTENT_W - 6400],
        ),

        h2('4.2 Konsultan Pengawasan'),
        p(
          'Konsultan pengawasan memakai panel yang sama dengan pengawas, tetapi KPI dihitung terpisah (peran konsultan_pengawas). Cakupannya lintas bidang (air minum dan sanitasi, berbagai sumber dana). TFL pada bagian 4.3 adalah varian konsultan yang dipersempit ke Sanitasi DAK saja.',
        ),
        tableFromRows(
          ['Aspek', 'Penyajian di Arumanis'],
          [
            ['Dashboard KPI', `Skor rata-rata ${kpiK.aggregate?.avg_score ?? '-'} · ${fmt(kpiK.aggregate?.total_pekerjaan)} pekerjaan · ${fmt(kpiK.aggregate?.total_foto)} foto`],
            ['Verifikasi output', 'Review catatan puspen, kelengkapan foto, dan deviasi progress'],
            ['Cakupan', `${fmt(kpiK.summary?.total_pengawas ?? roles.konsultan_pengawas)} akun konsultan aktif`],
            ['Laporan', 'Statistik pengawas (/pengawas) untuk evaluasi tim lapangan'],
          ],
          [2800, CONTENT_W - 2800],
        ),
        p('Contoh KPI konsultan teratas:', { bold: true }),
        tableFromRows(
          ['Nama', 'Pekerjaan', 'Foto', 'Penerima', 'Skor'],
          (kpiK.top5 ?? []).map(kpiRow),
          [2600, 1200, 1200, 1400, CONTENT_W - 6400],
        ),

        h2('4.3 TFL (Tim Fasilitator Lapangan — Sanitasi DAK)'),
        p(
          `TFL berperan seperti konsultan pengawasan: memfasilitasi pelaksanaan di lapangan, memverifikasi kelengkapan dokumentasi, dan mengejar capaian output. Bedanya, lingkup TFL dibatasi pada paket kegiatan Sanitasi dengan sumber dana DAK. Di portal, TFL mengakses modul yang sama dengan konsultan (Panel Pengawasan bila ditugaskan, plus modul SPM Sanitasi dan integrasi pekerjaan–infrastruktur di portal utama).`,
        ),
        ...(data.tfl?.dak_sanitasi
          ? [
              tableFromRows(
                ['Indikator Sanitasi DAK (live)', 'Nilai'],
                [
                  ['Paket pekerjaan Sanitasi DAK', fmt(data.tfl.dak_sanitasi.total_pekerjaan)],
                  ['Kegiatan DAK terkait', fmt(data.tfl.dak_sanitasi.kegiatan_dak_count)],
                  ['Pagu paket', fmtMilyar(data.tfl.dak_sanitasi.total_pagu)],
                  ['Foto dokumentasi', fmt(data.tfl.dak_sanitasi.total_foto)],
                  ['Paket berkontrak', fmt(data.tfl.dak_sanitasi.total_kontrak)],
                ],
                [4200, CONTENT_W - 4200],
              ),
              p(' ', { spacing: bodyPara({ after: 120 }).spacing }),
            ]
          : []),
        tableFromRows(
          ['Aspek', 'Penyajian untuk TFL'],
          [
            ['Lingkup tugas', 'Hanya pekerjaan Sanitasi DAK (SPALD, MCK, septik) sesuai assignment user-pekerjaan'],
            ['Modul utama', 'SPM Sanitasi, integrasi paket–infrastruktur, capaian desa, puspen review'],
            ['Alur lapangan', 'Sama konsultan: foto GPS, progress, tiket, notifikasi kelengkapan'],
            ['Capaian SPM', 'Ringkasan agregat sanitasi (Gambar 2) dan drill-down per desa'],
            ['Koordinasi', 'Pengingat ke pengawas paket DAK, tagging pekerjaan ke infrastruktur SPM'],
          ],
          [2800, CONTENT_W - 2800],
        ),
        ...((data.tfl?.dak_sanitasi?.per_tahun?.length ?? 0) > 0
          ? [
              p('Sebaran paket Sanitasi DAK per tahun anggaran:', { bold: true }),
              tableFromRows(
                ['Tahun', 'Pekerjaan', 'Pagu', 'Foto', 'Kontrak'],
                data.tfl.dak_sanitasi.per_tahun.map((r) => [
                  r.tahun,
                  fmt(r.pekerjaan),
                  fmtMilyar(r.pagu),
                  fmt(r.foto),
                  fmt(r.kontrak),
                ]),
                [1200, 1400, 2200, 1400, CONTENT_W - 6200],
              ),
            ]
          : []),
        ...((data.tfl?.dak_sanitasi?.top5_foto?.length ?? 0) > 0
          ? [
              p('Contoh paket Sanitasi DAK dengan dokumentasi terbanyak:', { bold: true, spacing: bodyPara({ after: 120 }).spacing }),
              tableFromRows(
                ['ID', 'Desa', 'Tahun', 'Foto', 'Pagu'],
                data.tfl.dak_sanitasi.top5_foto.map((r) => [
                  String(r.id),
                  `${r.desa ?? '-'} (${r.kecamatan ?? '-'})`,
                  String(r.tahun_anggaran ?? '-'),
                  fmt(r.foto_count),
                  fmtMilyar(r.pagu),
                ]),
                [900, 3600, 1000, 1000, CONTENT_W - 6500],
              ),
            ]
          : []),
        bullet('TFL tidak menangani paket air minum atau kegiatan non-DAK; filter sumber dana dan sub bidang sanitasi menjadi batas wewenang data.'),
        bullet('Rekapitulasi capaian SPM sanitasi (1,9% / 9.719 KK) mengakumulasi infrastruktur hasil program DAK dan sumber lain yang sudah terdata.'),

        h1('5. Manfaat terukur platform'),
        tableFromRows(
          ['Indikator', 'Nilai live', 'Kemanfaatan'],
          [
            ['Pekerjaan terpantau', fmt(dash.totalPekerjaan), 'Satu daftar lintas tahun dan sumber dana'],
            ['Foto dokumentasi', fmt(spam.total_foto_dokumentasi), 'Bukti fisik terindeks, bisa dilacak GPS'],
            ['Pengawas aktif', `${fmt(pengawas.total_pengawas)} orang · ${fmt(pengawas.total_lokasi)} lokasi`, 'Pelaporan mingguan terstruktur'],
            ['Pagu pengawasan', fmtMilyar(pengawas.total_pagu), 'Transparansi biaya pengawasan'],
            ['Pekerjaan 2024–2026', pekerjaanTahun.filter((t) => Number(t.tahun) >= 2024).map((t) => `${t.tahun}:${t.pekerjaan}`).join(', '), 'Tren aktivitas konstruksi terbaru'],
          ],
          [2400, 2200, CONTENT_W - 4600],
        ),

        h1('6. Studi kasus lapangan (live)'),
        ...(studi.air_minum
          ? [
              h3('Air minum'),
              p(
                `Paket #${studi.air_minum.id} — ${studi.air_minum.nama_paket} (${studi.air_minum.desa}, ${studi.air_minum.kecamatan}). Foto: ${fmt(studi.air_minum.foto_count)}, pagu ${fmtMilyar(studi.air_minum.pagu)}, tahun ${studi.air_minum.tahun_anggaran}.`,
              ),
            ]
          : []),
        ...(studi.sanitasi
          ? [
              h3('Sanitasi'),
              p(
                `Paket #${studi.sanitasi.id} — ${studi.sanitasi.desa}, ${studi.sanitasi.kecamatan}. Foto: ${fmt(studi.sanitasi.foto_count)}, kontrak ${studi.sanitasi.kontrak?.spk ?? '-'}, ${fmt(studi.sanitasi.penerima_count)} penerima.`,
              ),
            ]
          : []),

        h1('7. Kesimpulan'),
        p(
          'Arumanis memberi manfaat operasional nyata: pengawas dan konsultan memperoleh alur input lapangan terstandar, TFL memperoleh peta data integrasi SPM–pekerjaan, dan pimpinan memperoleh ringkasan agregat air minum serta sanitasi yang diperbarui dari data live. Screenshot pada Gambar 1 dan 2 memperlihatkan tampilan aktual di produksi per tanggal pengambilan data.',
        ),
        p(disclaimer, { italics: true, spacing: bodyPara({ after: 0 }).spacing }),
      ],
    },
  ],
})

const buffer = await Packer.toBuffer(doc)
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, buffer)
console.log('Written:', OUT)