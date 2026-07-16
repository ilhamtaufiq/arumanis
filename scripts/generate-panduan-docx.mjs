/**
 * Generate Panduan Arumanis (DOCX) v5 — format Bahasa Indonesia (id-ID)
 * Run: bun scripts/generate-panduan-docx.mjs
 */
import fs from 'fs';
import path from 'path';
import { buildUserGuideSection, listUserGuideFiles } from './lib/user-guide-docx.mjs';
import {
  buildDocumentStyles,
  buildNumberingConfig,
  bodyPara,
  FONT,
  ID_LANG,
  listPara,
  PAGE_MARGINS,
  PAGE_SIZE,
  SIZE_BODY,
  SIZE_CAPTION,
  SIZE_SMALL,
  tr,
} from './lib/docx-id-styles.mjs';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

const OUT = path.join(
  process.cwd(),
  process.env.PANDUAN_DOCX_OUT || 'docs/Panduan-Arumanis-Lengkap.docx',
);
const SS_DIR = path.join(process.cwd(), 'docs', 'assets', 'screenshots');

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const accent = '1F4E79';
const accent2 = '2E75B6';

let figNo = 0;

function p(text, opts = {}) {
  const isHeading = !!opts.heading;
  return new Paragraph({
    alignment: opts.align ?? (isHeading ? AlignmentType.LEFT : AlignmentType.JUSTIFIED),
    spacing: opts.spacing ?? (isHeading ? { after: 160 } : bodyPara().spacing),
    heading: opts.heading,
    pageBreakBefore: opts.pageBreakBefore,
    children: Array.isArray(text)
      ? text
      : [tr(text, { bold: opts.bold, italics: opts.italics, size: opts.size ?? SIZE_BODY, color: opts.color })],
  });
}

function bullet(ref, text) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    ...listPara({ after: 100 }),
    children: [tr(text)],
  });
}

function h1(text) {
  return p(text, { heading: HeadingLevel.HEADING_1 });
}
function h2(text) {
  return p(text, { heading: HeadingLevel.HEADING_2 });
}
function h3(text) {
  return p(text, { heading: HeadingLevel.HEADING_3 });
}

function spacer(before = 0, after = 200) {
  return new Paragraph({ spacing: { before, after } });
}

function infoBox(title, lines, fill = 'E8F4FC') {
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: 9026, type: WidthType.DXA },
          shading: { fill, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          children: [
            new Paragraph({
              ...bodyPara({ after: 80 }),
              children: [tr(title, { bold: true, color: accent })],
            }),
            ...lines.map((line) =>
              new Paragraph({
                ...bodyPara({ after: 60 }),
                children: [tr(line)],
              }),
            ),
          ],
        }),
      ],
    }),
  ];
  return [
    spacer(120, 80),
    new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: [9026], rows }),
    spacer(0, 160),
  ];
}

function tocRow(no, title, section) {
  return new TableRow({
    children: [
      new TableCell({
        borders: { top: border, bottom: border, left: border, right: { style: BorderStyle.NONE, size: 0 } },
        width: { size: 600, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 120, right: 80 },
        children: [new Paragraph({ ...bodyPara({ after: 0 }), children: [tr(no, { bold: true, color: accent2 })] })],
      }),
      new TableCell({
        borders: { top: border, bottom: border, left: { style: BorderStyle.NONE, size: 0 }, right: border },
        width: { size: 8426, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 80, right: 120 },
        children: [
          new Paragraph({
            ...bodyPara({ after: 0 }),
            children: [
              tr(title, { bold: true }),
              tr(`  ·  ${section}`, { color: '666666', size: SIZE_SMALL }),
            ],
          }),
        ],
      }),
    ],
  });
}

function figure(fileName, caption, width = 520) {
  figNo += 1;
  const id = `gambar-${String(figNo).padStart(2, '0')}`;
  const full = path.join(SS_DIR, fileName);
  const blocks = [];
  const label = `Gambar ${figNo}. ${caption}`;

  if (fs.existsSync(full)) {
    const ext = path.extname(fileName).slice(1).toLowerCase();
    const type = ext === 'jpg' ? 'jpg' : 'png';
    blocks.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            type,
            data: fs.readFileSync(full),
            transformation: { width, height: Math.round(width * 0.56) },
            altText: { title: id, description: label, name: id },
          }),
        ],
      }),
    );
  } else {
    blocks.push(
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [9026],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 9026, type: WidthType.DXA },
                shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
                margins: { top: 240, bottom: 240, left: 200, right: 200 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [tr(`[Belum ada: ${fileName}]`, { bold: true, color: '888888' })],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );
  }

  blocks.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 240, line: 360 },
      children: [tr(label, { italics: true, size: SIZE_CAPTION, color: '444444' })],
    }),
  );
  return blocks;
}

function menuTable(groups) {
  const rows = [
    new TableRow({
      children: ['Grup', 'Menu', 'URL'].map((h, j) =>
        new TableCell({
          borders,
          width: { size: [2000, 4400, 2626][j], type: WidthType.DXA },
          shading: { fill: 'D5E8F0', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ ...bodyPara({ after: 0 }), children: [tr(h, { bold: true })] })],
        }),
      ),
    }),
  ];

  for (const g of groups) {
    g.items.forEach((item, idx) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: 2000, type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ ...bodyPara({ after: 0 }), children: [tr(idx === 0 ? g.label : '')] })],
            }),
            new TableCell({
              borders,
              width: { size: 4400, type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ ...bodyPara({ after: 0 }), children: [tr(item.name)] })],
            }),
            new TableCell({
              borders,
              width: { size: 2626, type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ ...bodyPara({ after: 0 }), children: [tr(item.url, { size: SIZE_SMALL })] })],
            }),
          ],
        }),
      );
    });
  }

  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [2000, 4400, 2626],
    rows,
  });
}

const sidebarGroups = [
  {
    label: 'Dashboard',
    items: [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Dashboard Eksekutif', url: '/executive-dashboard' },
      { name: 'Rekap Progress', url: '/progress_rekap' },
      { name: 'Buat Laporan', url: '/buat-laporan' },
      { name: 'Analisa RAB', url: '/rab-analyzer' },
      { name: 'Penganggaran SIPD', url: '/sipd-renja' },
      { name: 'Tiket & Laporan', url: '/tiket' },
      { name: 'Kanban', url: '/kanban' },
      { name: 'Pusat Notifikasi', url: '/notifications' },
      { name: 'Asisten AI', url: '/asisten-ai' },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { name: 'Program Kegiatan', url: '/kegiatan' },
      { name: 'Master Fase', url: '/master-fase' },
      { name: 'Kecamatan / Desa', url: '/kecamatan, /desa' },
      { name: 'Pekerjaan', url: '/pekerjaan' },
      { name: 'Aset & Capaian SPAM', url: '/spam-unit' },
      { name: 'SPM Sanitasi', url: '/spm-sanitasi' },
      { name: 'Draft Pekerjaan', url: '/draft-pekerjaan' },
      { name: 'Penyedia', url: '/penyedia' },
      { name: 'Kontrak / Addendum', url: '/kontrak, /kontrak-addendums' },
      { name: 'Sync SPSE', url: '/procurement-sync' },
      { name: 'Register Dokumen', url: '/pekerjaan/register' },
      { name: 'Checklist Pekerjaan', url: '/checklist' },
      { name: 'Output / Penerima', url: '/output, /penerima' },
      { name: 'Pengawas / Lokasi', url: '/pengawas, /pengawas-lokasi' },
    ],
  },
  {
    label: 'Dokumentasi',
    items: [
      { name: 'Panduan Pengguna', url: '/panduan' },
      { name: 'Foto', url: '/foto' },
      { name: 'Peta Progress', url: '/map' },
      { name: 'Simulasi Jaringan', url: '/simulation' },
      { name: 'Berkas', url: '/berkas' },
    ],
  },
  {
    label: 'Akses & Pengaturan',
    items: [
      { name: 'Users / Roles / Permissions', url: '/users, /roles, /permissions' },
      { name: 'Route & Menu Permissions', url: '/route-permissions, /menu-permissions' },
      { name: 'Kegiatan Role', url: '/kegiatan-role' },
      { name: 'Pengaturan Aplikasi', url: '/settings' },
      { name: 'Assign Pekerjaan', url: '/user-pekerjaan' },
      { name: 'Audit Trail', url: '/audit-logs' },
    ],
  },
];

function coverPage() {
  return [
    spacer(1800),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [9026],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: {
                top: { style: BorderStyle.SINGLE, size: 6, color: accent },
                bottom: { style: BorderStyle.SINGLE, size: 6, color: accent },
                left: { style: BorderStyle.SINGLE, size: 2, color: accent2 },
                right: { style: BorderStyle.SINGLE, size: 2, color: accent2 },
              },
              shading: { fill: 'F7FBFE', type: ShadingType.CLEAR },
              margins: { top: 480, bottom: 480, left: 400, right: 400 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                  children: [tr('PANDUAN PENGGUNA', { size: SIZE_BODY, color: accent2 })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 160 },
                  children: [tr('ARUMANIS', { bold: true, size: 72, color: accent })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 120 },
                  children: [tr('Air Minum & Sanitasi Kabupaten Cianjur', { size: 28 })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 280 },
                  children: [tr('arumanis.cianjur.space', { size: 24, color: '555555' })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    tr('Edisi Juli 2026 | diverifikasi di produksi', { size: SIZE_BODY, italics: true, color: '666666' }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 120 },
                  children: [tr('Bahasa: Indonesia (Indonesia) | Font: Arial 11 pt | Spasi baris: 1,5', { size: 18, color: '888888' })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    spacer(400),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [3200, 5826],
      rows: [
        ['Audiens', 'Pengunjung publik, staff operasional, admin, pengawas'],
        ['Cakupan', 'Landing, login, screenshot produksi, panduan modul (/panduan), catatan developer'],
        ['Screenshot', 'docs/assets/screenshots/ (18+ tangkapan layar)'],
      ].map(
        ([k, v]) =>
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 3200, type: WidthType.DXA },
                shading: { fill: 'EEF5FA', type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 140, right: 100 },
                children: [new Paragraph({ ...bodyPara({ after: 0 }), children: [tr(k, { bold: true })] })],
              }),
              new TableCell({
                borders,
                width: { size: 5826, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 140 },
                children: [new Paragraph({ ...bodyPara({ after: 0 }), children: [tr(v)] })],
              }),
            ],
          }),
      ),
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function tocPage() {
  const entries = [
    ['A', 'Halaman publik tanpa akun', 'Landing, peta SPM, publikasi'],
    ['A.1', 'Navigasi landing page', 'Menu, hero, ringkasan capaian'],
    ['A.2', 'Peta capaian SPM', 'Tab layer, filter tahun'],
    ['A.3', 'Halaman informasi publik', 'Publikasi, kebijakan, kontak'],
    ['A.4', 'Kapan diminta login', 'Tombol Masuk & Dashboard'],
    ['B', 'Panduan pengguna terdaftar', 'Login, role, sidebar'],
    ['B.1', 'Login & autentikasi', 'Email, Google, reset password'],
    ['B.2', 'Peran pengguna', 'admin, pengawas, staff'],
    ['B.3', 'Navigasi aplikasi utama', 'Header, tahun anggaran, menu'],
    ['B.4', 'Dashboard', 'Tab Lounge sampai Reports'],
    ['B.5', 'Modul admin sering dipakai', 'Kegiatan, kontrak, akses'],
    ['B.6', 'Pengawas & konsultan', 'SSO ke panel /pengawasan/'],
    ['B.7', 'Dokumentasi lapangan', 'Checklist, foto, peta'],
    ['B.8', 'Pemecahan masalah', '403, menu hilang, ekspor kosong'],
    ['D', 'Panduan modul (sinkron /panduan)', 'docs/user-guide/*.md'],
    ['D.1', 'Pendahuluan & navigasi', 'navigasi-global, komponen UI'],
    ['D.2', 'Panduan per modul', 'auth, kegiatan, kontrak, dll.'],
    ['D.3', 'Panduan lintas modul', 'pengawas, skenario, glosarium'],
    ['C', 'Catatan developer', 'Arsitektur, otorisasi, lokal dev'],
    ['C.7', 'Checklist sebelum merge', 'Lint, build, unit test FE & BE'],
  ];

  return [
    h1('Daftar Isi'),
    p('Dokumen dibagi empat bagian. A untuk pengunjung tanpa akun. B ringkasan visual dari produksi. D panduan modul lengkap (sumber sama dengan /panduan). C untuk developer.'),
    spacer(120),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [600, 8426],
      rows: entries.map(([no, title, section]) => tocRow(no, title, section)),
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

const children = [
  ...coverPage(),
  ...tocPage(),

  // ===== BAGIAN A =====
  h1('Bagian A · Halaman Publik'),
  p(
    'Buka https://arumanis.cianjur.space tanpa akun. Anda langsung melihat capaian SPM air minum dan sanitasi Kabupaten Cianjur, plus tautan ke halaman informasi. Tidak ada form login di depan.',
  ),
  p('Angka capaian di landing page diambil live dari database. Per Juli 2026: air minum 59,6% desa, sanitasi 29,9% desa. Angka ini bisa berubah seiring input data baru.'),

  h2('A.1 Navigasi landing page'),
  p('Menu atas memuat CAPAIAN, INFORMASI, TENTANG, PUBLIKASI, dan tombol MASUK. Pojok kanan ada pengganti bahasa ID/EN.'),
  bullet('bullets-a', 'Hero menampilkan judul "Air Minum dan Sanitasi" dengan dua tombol: Lihat Capaian SPM dan Lihat Publikasi.'),
  bullet('bullets-a', 'Di bawah hero ada ringkasan angka capaian per sektor.'),
  bullet('bullets-a', 'Footer berisi form kontak: Nama, Email, Telepon (opsional), Subjek, Pesan.'),
  ...figure('landing-01-hero.png', 'Landing page ARUMANIS: hero, peta capaian, dan menu atas'),

  h2('A.2 Peta capaian SPM'),
  p('Peta di landing page punya dua layer. Tab Air Minum dan Sanitasi mengganti warna desa di peta.'),
  bullet('bullets-a', 'Filter tahun: Terakumulasi, 2026, 2025, 2024, 2023, 2022, 2021, 2020.'),
  bullet('bullets-a', 'Tombol LIHAT DETAIL CAPAIAN membuka halaman capaian per desa jika admin mengaktifkannya.'),
  bullet('bullets-a', 'Legenda warna dan statistik ringkas ada di panel samping peta.'),
  bullet('bullets-a', 'Zoom dan geser peta mengikuti kontrol peta standar.'),
  ...figure('landing-02-kartu-akses.png', 'Bagian "Apa yang Bisa Anda Akses" di landing page'),

  h2('A.3 Halaman informasi publik'),
  p('Beberapa halaman bisa dibuka tanpa login:'),
  bullet('bullets-a', 'Capaian SPM per desa'),
  bullet('bullets-a', 'Publikasi & dokumen (/publikasi)'),
  bullet('bullets-a', 'Tujuan, Manfaat & Hasil (/tujuan-manfaat-hasil)'),
  bullet('bullets-a', 'Latar Belakang (/rancang-bangun-inovasi)'),
  bullet('bullets-a', 'Changelog, Syarat Penggunaan, Kebijakan Privasi'),
  ...figure('public-01-publikasi.png', 'Halaman publikasi dokumen program'),

  ...infoBox('Tip pengunjung', [
    'Kalau tombol MASUK muncul, itu belum berarti Anda wajib login. Banyak halaman informasi tetap terbuka.',
    'Simpan tautan /publikasi kalau Anda butuh dokumen resmi program tanpa masuk dashboard.',
  ]),

  h2('A.4 Kapan diminta login'),
  p('Tombol MASUK atau DASHBOARD mengarah ke /sign-in.'),
  p('Akun publik (bukan staff) setelah login tetap di halaman informasi. Dashboard operasional hanya untuk role staff yang di-assign admin.'),

  new Paragraph({ children: [new PageBreak()] }),

  // ===== BAGIAN B =====
  h1('Bagian B · Panduan Pengguna'),
  p('Setelah login, Anda masuk salah satu dari tiga permukaan: aplikasi staff (/dashboard), Puspen (/puspen), atau Panel Pengawasan (/pengawasan/). Role menentukan tujuan redirect.'),
  p(`Rincian tiap modul (field, langkah, error) ada di Bagian D, diambil dari docs/user-guide/ yang sama dengan menu Panduan Pengguna di aplikasi. Total ${listUserGuideFiles().length} file modul.`),

  h2('B.1 Login'),
  bullet('bullets-b', 'URL: /sign-in'),
  bullet('bullets-b', 'Email + password (minimal 7 karakter), atau tombol GOOGLE.'),
  bullet('bullets-b', 'Link LUPA? untuk reset password lewat admin.'),
  bullet('bullets-b', 'Link PANDUAN PENGGUNAAN di halaman login menuju /panduan di dalam aplikasi.'),
  ...figure('auth-01-sign-in.png', 'Halaman login ARUMANIS'),

  h2('B.2 Peran pengguna'),
  p('Perilaku setelah login bergantung pada slug role di database, bukan hanya label tampilan.'),
  new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [1800, 2600, 4626],
    rows: [
      new TableRow({
        children: ['Role', 'Tugas utama', 'Setelah login'].map((t, j) =>
          new TableCell({
            borders,
            width: { size: [1800, 2600, 4626][j], type: WidthType.DXA },
            shading: { fill: 'D5E8F0', type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ ...bodyPara({ after: 0 }), children: [tr(t, { bold: true })] })],
          }),
        ),
      }),
      ...[
        ['admin', 'Pengelola penuh', 'Semua menu terbuka; bypass route & menu permission; bisa impersonasi user'],
        ['manager', 'Pantauan eksekutif', 'Dashboard eksekutif & fitur P2; tetap di app utama'],
        ['pengawas', 'Pengawasan lapangan', 'Redirect SSO ke /pengawasan/ (kecuali juga admin/manager)'],
        ['konsultan_pengawas', 'Konsultan lapangan', 'Sama dengan pengawas'],
        ['tfl / operator / viewer', 'Input & baca data', 'Menu & route mengikuti aturan di database'],
      ].map((row) =>
        new TableRow({
          children: row.map((cell, j) =>
            new TableCell({
              borders,
              width: { size: [1800, 2600, 4626][j], type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ ...bodyPara({ after: 0 }), children: [tr(cell)] })],
            }),
          ),
        }),
      ),
    ],
  }),
  spacer(200),

  h2('B.3 Navigasi aplikasi utama'),
  p('Sidebar kiri mengelompokkan menu. Header atas berisi:'),
  bullet('bullets-b', 'Switcher tim ARUMANIS ↔ PUSPEN'),
  bullet('bullets-b', 'Breadcrumb (Home / halaman aktif)'),
  bullet('bullets-b', 'Pemilih Tahun Anggaran, misalnya TA 2026'),
  bullet('bullets-b', 'Pencarian (⌘K), toggle tema gelap/terang, notifikasi, profil user'),
  ...figure(
    fs.existsSync(path.join(SS_DIR, 'nav-01-sidebar.png')) ? 'nav-01-sidebar.png' : 'dashboard-01.png',
    'Dashboard dengan sidebar lengkap (akun admin, Juli 2026)',
  ),

  h3('Daftar menu sidebar'),
  p('Tabel di bawah ini dicatat dari produksi Juli 2026. Admin bisa menyembunyikan item lewat Menu Permissions.'),
  menuTable(sidebarGroups),
  spacer(200),

  h2('B.4 Dashboard'),
  p('Halaman /dashboard punya lima tab: Lounge, Overview, Analytics, Calendar, Reports.'),
  bullet('bullets-b', 'Lounge: jadwal dan aktivitas harian.'),
  bullet('bullets-b', 'Overview: ringkasan angka operasional.'),
  bullet('bullets-b', 'Analytics: tren capaian dan performa pekerjaan.'),
  bullet('bullets-b', 'Calendar: kalender kegiatan terjadwal.'),
  bullet('bullets-b', 'Reports: unduh laporan yang sudah disiapkan sistem.'),
  p('Widget contoh di Lounge: Kegiatan Hari Ini, Mendatang, Pengunjung Aktif, Aktivitas Terbaru (termasuk unggahan foto).'),
  ...figure('dashboard-01.png', 'Tab Lounge pada halaman Dashboard'),

  h2('B.5 Modul admin yang sering dipakai'),

  h3('Program Kegiatan & PPTK'),
  p('Satu baris kegiatan = satu sub kegiatan. Field PPTK (nama + NIP) dipakai otomatis saat ekspor dokumen kontrak.'),
  p('Kosongkan field PPTK di kegiatan kalau Anda ingin sistem memakai nilai fallback dari Settings.'),
  ...figure('admin-03-kegiatan-pptk.png', 'Daftar program kegiatan'),
  ...figure('admin-03-kegiatan-form-pptk.png', 'Form kegiatan dengan section PPTK'),

  h3('Pekerjaan & Kontrak'),
  p('Urutan kerja yang umum: Kegiatan → Pekerjaan → Kontrak → Register dokumen → Ekspor ringkasan/SPK/BAP.'),
  ...figure('modul-01-pekerjaan-list.png', 'Daftar pekerjaan'),
  ...figure('admin-04-kontrak-list.png', 'Daftar kontrak'),

  h3('Pengaturan dokumen kontrak'),
  p('Buka Settings → Template Dokumen Kontrak. Di sini Anda mengisi PPK, PPTK fallback, SKPD/DPA, cara pembayaran, masa pemeliharaan, dan mengunggah template Excel.'),
  ...figure('admin-01-settings.png', 'Pengaturan aplikasi & template dokumen kontrak'),

  h3('Manajemen akses'),
  p('Route Permission mengatur halaman mana yang boleh dibuka per role. Menu Permission mengatur item sidebar yang tampil. Keduanya perlu dicek kalau user mengeluh menu hilang.'),
  ...figure('admin-02-users.png', 'Manajemen users dengan fitur impersonasi'),
  ...figure('admin-roles.png', 'Daftar role di sistem'),
  ...figure('admin-02-route-permissions.png', 'Pengaturan route permissions'),

  ...infoBox('Tip admin', [
    'Impersonasi user dari halaman Users cara paling cepat melihat menu pengawas tanpa logout.',
    'Tahun anggaran di header harus dicek sebelum input data. Salah TA, data masuk ke tahun yang lain.',
  ], 'FFF8E8'),

  h2('B.6 Pengawas & konsultan pengawas'),
  p('Panel Pengawasan tidak punya halaman login terpisah. Alurnya:'),
  bullet('bullets-b', 'Login di /sign-in ARUMANIS seperti biasa.'),
  bullet('bullets-b', 'Jika role pengawas atau konsultan_pengawas (tanpa admin/manager), browser diarahkan ke /pengawasan/login?token=...'),
  bullet('bullets-b', 'BFF men-set cookie pengawas_session.'),
  bullet('bullets-b', 'Menu panel: Dashboard, Pekerjaan, Buat Laporan, Tiket, Notifikasi, Panduan, Profil.'),
  p('Admin yang juga punya role pengawas tidak otomatis pindah ke panel. Gunakan impersonasi dari halaman Users untuk melihat tampilan pengawas.'),
  p('Puspen (/puspen) adalah permukaan terpisah untuk tim PUSPEN. Switcher di sidebar ARUMANIS memudahkan pindah tanpa login ulang.'),
  ...figure('puspen-01.png', 'Beranda Puspen (diakses lewat switcher tim di sidebar ARUMANIS)'),

  h2('B.7 Dokumentasi lapangan'),
  p('Empat modul ini dipakai pengawas dan staff untuk mencatat progres di lapangan.'),
  ...figure('modul-checklist.png', 'Checklist pekerjaan'),
  ...figure('modul-foto.png', 'Galeri foto dokumentasi'),
  ...figure('modul-peta.png', 'Peta progress pekerjaan'),
  ...figure('panduan-in-app.png', 'Panduan pengguna di dalam aplikasi (/panduan)'),

  h2('B.8 Pemecahan masalah'),
  bullet('bullets-b', '403 di halaman tertentu: minta admin menambah Route Permission untuk role Anda.'),
  bullet('bullets-b', 'Menu tidak muncul: cek Menu Permissions, bukan cuma nama role.'),
  bullet('bullets-b', 'Pengawas tidak redirect ke panel: kemungkinan akun juga punya role admin atau manager.'),
  bullet('bullets-b', 'Placeholder ekspor kontrak kosong: lengkapi register dokumen plus PPTK di kegiatan atau Settings.'),
  bullet('bullets-b', 'Data masuk tahun salah: ubah TA di header sebelum mengetik.'),

  new Paragraph({ children: [new PageBreak()] }),

  ...buildUserGuideSection({
    h1,
    h2,
    p,
    spacer,
    PageBreak,
    infoBox,
    figure,
  }),

  new Paragraph({ children: [new PageBreak()] }),

  // ===== BAGIAN C =====
  h1('Bagian C · Catatan Developer'),
  p(
    'Bagian ini buat yang menyentuh kode. Repo frontend ada di C:\\laragon\\www\\bun, backend di C:\\laragon\\www\\apiamis. Kalau kamu cuma deploy, baca C.1 dan C.5 dulu. Sisanya untuk yang ngoding fitur baru.',
  ),

  h2('C.1 Alur request'),
  bullet('bullets-c', 'React SPA memanggil /bff/api, lalu BFF Hono/Bun (port 8787) meneruskan ke Laravel APIAMIS.'),
  bullet('bullets-c', 'Auth pakai cookie httpOnly lewat BFF. Token tidak disimpan di localStorage.'),
  bullet('bullets-c', 'Satu HTTP client: src/lib/api-client.ts. Jangan bikin wrapper fetch baru.'),

  h2('C.2 Tiga lapis otorisasi UI'),
  p('Hak akses di UI dicek berlapis. Admin bypass dua lapis pertama, tapi backend Sanctum tetap wajib untuk endpoint sensitif.'),
  bullet('bullets-c', 'Route gate: requireAuthenticatedSession di /_authenticated/*'),
  bullet('bullets-c', 'Route Permission dari DB + ProtectedRoute.tsx'),
  bullet('bullets-c', 'Menu Permission untuk visibility sidebar (menuKey)'),

  h2('C.3 Role hardcoded di frontend'),
  p('Hanya slug berikut yang punya perilaku khusus di kode:'),
  bullet('bullets-c', 'admin: bypass permission UI'),
  bullet('bullets-c', 'manager: fitur MVP tier P2'),
  bullet('bullets-c', 'pengawas / konsultan_pengawas: redirect SSO (src/lib/pengawas-app.ts)'),
  bullet('bullets-c', 'tfl: staff operasional'),
  p('Operator, viewer, dan custom role sepenuhnya dari database. Jangan tebak hak akses dari nama role saja.'),

  h2('C.4 Onboarding kode'),
  bullet('bullets-c', '.agent/README.md: stack & checklist'),
  bullet('bullets-c', '.agent/ARCHITECTURE.md: lapisan aplikasi'),
  bullet('bullets-c', '.agent/SYSTEM_OVERVIEW.md: kontrak API lintas repo'),
  bullet('bullets-c', '.agent/rules.md: konvensi implementasi'),
  bullet('bullets-c', 'docs/user-guide/*.md: panduan modul yang di-load ke /panduan'),

  h2('C.5 Menjalankan lokal'),
  bullet('bullets-c', 'bun run dev menjalankan Vite + BFF bersamaan'),
  bullet('bullets-c', 'APIAMIS_BASE_URL di server/ untuk proxy BFF ke Laravel'),
  bullet('bullets-c', '/pengawasan di-proxy ke repo panel pengawas terpisah'),
  bullet('bullets-c', 'MySQL harus aktif sebelum php artisan migrate di apiamis'),

  h2('C.6 Contoh fitur lintas stack: PPTK per sub kegiatan'),
  p('Fitur ini contoh bagus kalau kamu mau ubah kontrak API: backend dan frontend harus selesai bareng.'),
  bullet('bullets-c', 'Migration menambah nama_pptk dan nip_pptk di tbl_kegiatan'),
  bullet('bullets-c', 'Backend: KontrakDocumentSettingsService::resolvePptk()'),
  bullet('bullets-c', 'Ekspor: KontrakDocumentDataBuilder pakai PPTK kegiatan, fallback ke Settings'),
  bullet('bullets-c', 'Frontend: KegiatanForm.tsx + KontrakPejabatSettings.tsx'),

  h2('C.7 Checklist sebelum merge'),
  p('Urutan minimal sebelum merge ke dev/main:'),
  bullet('bullets-c', 'bun run lint && bun run build'),
  bullet('bullets-c', 'Unit test frontend (Vitest): bun run test, atau file spesifik misalnya bun run test src/features/kegiatan/__tests__/...'),
  bullet('bullets-c', 'Unit test backend (PHPUnit): php artisan test di apiamis kalau Anda ubah controller, service, atau serializer'),
  bullet('bullets-c', 'Perubahan API: verifikasi controller + resource di apiamis, jangan ubah shape response di frontend tanpa cek backend'),
  bullet('bullets-c', 'Route baru: jalankan scripts/audit-route-permissions.mjs'),
  bullet('bullets-c', 'UI authenticated: cek manual di browser setelah build'),
  p('Test frontend ada di src/lib/__tests__/, src/test/, dan src/features/<domain>/__tests__/. Kalau fitur baru, tulis unit test untuk logika yang bisa diuji tanpa browser.'),

  ...infoBox('Regenerasi screenshot', [
    'Screenshot ada di docs/assets/screenshots/',
    'Tangkap ulang lewat scripts/pinchtab-capture-core.ps1 (butuh env ARUMANIS_LOGIN_EMAIL & ARUMANIS_LOGIN_PASSWORD)',
    'Setelah ganti screenshot, jalankan ulang: bun scripts/generate-panduan-docx.mjs',
  ], 'F0F0F0'),

  spacer(200),
  p(`Dokumen ini memuat ${figNo} gambar. Terakhir dibuat otomatis dari skrip generator.`, { italics: true, color: '666666' }),
];

const NUMBERING_REFS = ['bullets-a', 'bullets-b', 'bullets-c', 'bullets-guide', 'bullets-guide-num'];

const doc = new Document({
  styles: buildDocumentStyles(accent, accent2),
  numbering: { config: buildNumberingConfig(NUMBERING_REFS) },
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
              alignment: AlignmentType.LEFT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD', space: 4 } },
              spacing: { after: 80 },
              children: [
                tr('Panduan ARUMANIS', { bold: true, size: SIZE_SMALL, color: accent }),
                tr('  |  arumanis.cianjur.space', { size: SIZE_SMALL, color: '888888' }),
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
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD', space: 4 } },
              spacing: { before: 80 },
              children: [
                tr('Halaman ', { size: SIZE_SMALL, color: '888888' }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT,
                  size: SIZE_SMALL,
                  color: '888888',
                  language: ID_LANG,
                }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
function writeOut(target) {
  fs.writeFileSync(target, buffer);
  console.log(`Written: ${target} (${(buffer.length / 1024).toFixed(1)} KB)`);
}
try {
  writeOut(OUT);
} catch (err) {
  if (err?.code === 'EBUSY' || err?.code === 'EPERM') {
    const alt = OUT.replace(/\.docx$/i, '-new.docx');
    writeOut(alt);
    console.log('File utama sedang terbuka. Tutup Word lalu rename atau jalankan ulang skrip.');
  } else {
    throw err;
  }
}
console.log(`Figures embedded: ${figNo}`);
console.log(`User-guide modules: ${listUserGuideFiles().length}`);
console.log(`Screenshots dir: ${SS_DIR}`);