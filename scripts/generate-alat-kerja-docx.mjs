#!/usr/bin/env node
/**
 * Dokumen Alat Kerja Arumanis — mockup poster & Android
 * Run: node scripts/generate-alat-kerja-docx.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  PageBreak,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
} from 'docx'
import {
  buildDocumentStyles,
  bodyPara,
  PAGE_MARGINS,
  PAGE_SIZE,
  SIZE_SMALL,
  tr,
} from './lib/docx-id-styles.mjs'
import { wrapAndroidMockup, wrapPosterMockup } from './lib/mockup-wrap.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'docs', 'alat-kerja')
const MOCK = path.join(SRC, 'mockups')
const OUT = path.join(ROOT, 'docs', 'Alat-Kerja-Arumanis.docx')

const WEB_PAGES = [
  {
    src: 'halaman landing page.png',
    mock: 'poster-landing.png',
    title: 'Portal Publik Arumanis',
    subtitle: 'Capaian SPM air minum & sanitasi · peta interaktif per desa',
    desc:
      'Halaman informasi terbuka untuk masyarakat dan pemangku kepentingan. Menampilkan peta capaian, ringkasan indikator, dan tautan publikasi tanpa perlu login.',
  },
  {
    src: 'halaman login arumanis.png',
    mock: 'poster-login.png',
    title: 'Halaman Masuk',
    subtitle: 'Satu pintu akses operator, TFL, dan admin',
    desc:
      'Autentikasi terpusat ke APIAMIS melalui BFF Arumanis. Mendukung email/password dan Google SSO. Sesi disimpan sebagai cookie httpOnly.',
  },
  {
    src: 'halaman dashboard arumanis.png',
    mock: 'poster-dashboard.png',
    title: 'Dashboard Operator',
    subtitle: 'Ringkasan TA, kualitas data, dan anggaran',
    desc:
      'Pusat kontrol harian operator dinas: indikator pekerjaan tanpa koordinat/foto, total kegiatan, kontrak, pagu, dan penyaluran anggaran tahun berjalan.',
  },
  {
    src: 'halaman detail spm.png',
    mock: 'poster-spm.png',
    title: 'Detail Capaian SPM',
    subtitle: 'Drill-down air minum & sanitasi per desa',
    desc:
      'Visualisasi agregat dan tren tahunan capaian Standar Pelayanan Minimum. Operator dan TFL memakai layar ini untuk evaluasi gap wilayah.',
  },
  {
    src: 'halaman panduan pengguna.png',
    mock: 'poster-panduan.png',
    title: 'Panduan Pengguna',
    subtitle: 'Dokumentasi fitur terintegrasi di dalam aplikasi',
    desc:
      'Buku panduan digital per modul (dashboard, pekerjaan, SPAM, sanitasi, pengawasan) agar onboarding pengguna baru tidak bergantung pada file terpisah.',
  },
  {
    src: 'halaman panel pengawasan.png',
    mock: 'poster-pengawasan-web.png',
    title: 'Panel Pengawasan Web',
    subtitle: 'Ringkasan paket diawasi · progress · deviasi · foto',
    desc:
      'Antarmuka /pengawasan untuk pengawas, konsultan, dan TFL (Sanitasi DAK). Menampilkan paket assignment, progress fisik/keuangan, deviasi, dan kelengkapan foto.',
  },
]

const MOBILE_PAGE = {
  src: 'tampilan arumanis pengawasn versi mobile.jpeg',
  mock: 'android-pengawasan.png',
  title: 'Arumanis Pengawasan',
  subtitle: 'Aplikasi mobile Android · input lapangan',
  desc:
    'APK Expo (space.cianjur.pengawas) untuk pengawas dan konsultan di lapangan: dashboard paket, upload foto + GPS, tiket, notifikasi, dan antrean offline.',
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: opts.spacing ?? bodyPara().spacing,
    heading: opts.heading,
    children: [tr(text, { bold: opts.bold, italics: opts.italics, size: opts.size })],
  })
}

function h1(t) {
  return p(t, { heading: HeadingLevel.HEADING_1 })
}
function h2(t) {
  return p(t, { heading: HeadingLevel.HEADING_2 })
}

function mockupImage(filePath, docWidth = 520) {
  if (!fs.existsSync(filePath)) return null
  const buf = fs.readFileSync(filePath)
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 120, line: 360, lineRule: 'auto' },
    children: [
      new ImageRun({
        type: 'png',
        data: buf,
        transformation: {
          width: docWidth,
          height: Math.round(docWidth * 1.25),
        },
        altText: {
          title: path.basename(filePath),
          description: path.basename(filePath),
          name: path.basename(filePath, path.extname(filePath)),
        },
      }),
    ],
  })
}

async function buildMockups() {
  console.log('Generating mockups...')
  for (const page of WEB_PAGES) {
    const input = path.join(SRC, page.src)
    const output = path.join(MOCK, page.mock)
    if (!fs.existsSync(input)) {
      console.warn('Skip missing:', input)
      continue
    }
    await wrapPosterMockup({
      inputPath: input,
      outputPath: output,
      title: page.title,
      subtitle: page.subtitle,
    })
    console.log('  poster:', page.mock)
  }

  const mobileIn = path.join(SRC, MOBILE_PAGE.src)
  const mobileOut = path.join(MOCK, MOBILE_PAGE.mock)
  if (fs.existsSync(mobileIn)) {
    await wrapAndroidMockup({
      inputPath: mobileIn,
      outputPath: mobileOut,
      title: MOBILE_PAGE.title,
      subtitle: MOBILE_PAGE.subtitle,
    })
    console.log('  android:', MOBILE_PAGE.mock)
  }
}

function pageSection(children) {
  return {
    properties: { page: { size: PAGE_SIZE, margin: PAGE_MARGINS } },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [tr('Alat Kerja Arumanis', { size: SIZE_SMALL, color: '666666' })],
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
    children,
  }
}

async function main() {
  await buildMockups()

  const cover = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 200, line: 360, lineRule: 'auto' },
      children: [tr('ALAT KERJA', { bold: true, size: 48, color: '1F4E79' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, line: 360, lineRule: 'auto' },
      children: [tr('Platform Arumanis', { size: 36, color: '2E75B6' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400, line: 360, lineRule: 'auto' },
      children: [
        tr('Monitoring SPAM Perdesaan & Sanitasi Air Limbah', { size: 24, color: '444444' }),
      ],
    }),
    p('Dinas Perumahan dan Kawasan Permukiman · Kabupaten Cianjur', { center: true }),
    p('Pamphlet visual fitur utama · arumanis.cianjur.space', {
      center: true,
      italics: true,
      spacing: bodyPara({ after: 0 }).spacing,
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ]

  const intro = [
    h1('Pengantar'),
    p(
      'Dokumen ini memperkenalkan alat kerja digital Arumanis dalam format visual mirip pamflet. Setiap tangkapan layar dibungkus mockup poster (versi web) atau mockup perangkat Android (aplikasi pengawasan).',
    ),
    p(
      'Arumanis terdiri dari portal operator (web), panel pengawasan (/pengawasan), dan aplikasi mobile pengawas. Ketiganya terhubung ke APIAMIS sebagai sumber data tunggal.',
    ),
    new Paragraph({ children: [new PageBreak()] }),
  ]

  const webBlocks = []
  webBlocks.push(h1('1. Portal Arumanis (Web)'))
  for (const page of WEB_PAGES) {
    const mockPath = path.join(MOCK, page.mock)
    webBlocks.push(h2(page.title))
    webBlocks.push(p(page.desc))
    const img = mockupImage(mockPath)
    if (img) webBlocks.push(img)
    webBlocks.push(
      p(`Gambar: ${page.title} — ${page.subtitle}`, {
        center: true,
        italics: true,
        spacing: bodyPara({ after: 320 }).spacing,
      }),
    )
  }

  const mobileImg = mockupImage(path.join(MOCK, MOBILE_PAGE.mock), 400)
  const mobileBlocks = [
    new Paragraph({ children: [new PageBreak()] }),
    h1('2. Arumanis Pengawasan (Mobile Android)'),
    p(MOBILE_PAGE.desc),
    ...(mobileImg ? [mobileImg] : []),
    p(`Gambar: ${MOBILE_PAGE.title} — mockup Android`, {
      center: true,
      italics: true,
      spacing: bodyPara({ after: 200 }).spacing,
    }),
    h2('Peran pengguna'),
    p(
      'Pengawas: input progress dan foto paket yang ditugaskan. Konsultan pengawasan: verifikasi kelengkapan lintas bidang. TFL: fasilitasi khusus paket Sanitasi DAK dengan alur yang sama di mobile.',
    ),
    new Paragraph({ children: [new PageBreak()] }),
    h1('3. Ringkasan Alat Kerja'),
    p('Portal publik → transparansi capaian SPM kepada masyarakat.'),
    p('Dashboard operator → kendali kualitas data dan anggaran TA.'),
    p('Modul SPM → rekapitulasi air minum dan sanitasi per desa.'),
    p('Panel pengawasan web + mobile → pelaporan lapangan terstruktur.'),
    p('Panduan terintegrasi → onboarding tanpa dokumen terpisah.'),
    p('Sumber tangkapan layar: folder docs/alat-kerja · Mockup dibuat otomatis saat generate.', {
      italics: true,
      spacing: bodyPara({ after: 0 }).spacing,
    }),
  ]

  const doc = new Document({
    styles: buildDocumentStyles(),
    sections: [pageSection([...cover, ...intro, ...webBlocks, ...mobileBlocks])],
  })

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(OUT, buffer)
  console.log('Written:', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})