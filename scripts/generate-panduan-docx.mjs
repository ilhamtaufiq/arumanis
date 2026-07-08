/**
 * Generate Panduan Arumanis (DOCX) v2 — dengan screenshot dari produksi.
 * Run: bun scripts/generate-panduan-docx.mjs
 */
import fs from 'fs';
import path from 'path';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
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

const OUT = path.join(process.cwd(), 'docs', 'Panduan-Arumanis-Lengkap.docx');
const SS_DIR = path.join(process.cwd(), 'docs', 'assets', 'screenshots');

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

function p(text, opts = {}) {
  return new Paragraph({
    spacing: opts.spacing ?? { after: 120 },
    heading: opts.heading,
    pageBreakBefore: opts.pageBreakBefore,
    children: Array.isArray(text)
      ? text
      : [new TextRun({ text, bold: opts.bold, italics: opts.italics, size: opts.size })],
  });
}

function bullet(ref, text) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    children: [new TextRun(text)],
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

/** Embed PNG/JPG if exists; else placeholder box */
function figure(fileName, id, caption, width = 520) {
  const full = path.join(SS_DIR, fileName);
  const blocks = [];

  if (fs.existsSync(full)) {
    const ext = path.extname(fileName).slice(1).toLowerCase();
    const type = ext === 'jpg' ? 'jpg' : 'png';
    blocks.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 80 },
        children: [
          new ImageRun({
            type,
            data: fs.readFileSync(full),
            transformation: { width, height: Math.round(width * 0.56) },
            altText: { title: id, description: caption, name: id },
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
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `[SCREENSHOT: ${id}]`, bold: true, color: '666666' })],
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
      spacing: { after: 200 },
      children: [new TextRun({ text: caption, italics: true, size: 20, color: '555555' })],
    }),
  );
  return blocks;
}

function menuTable(groups) {
  const rows = [
    new TableRow({
      children: ['Grup Menu', 'Item', 'URL'].map((h, j) =>
        new TableCell({
          borders,
          width: { size: [2200, 4200, 2626][j], type: WidthType.DXA },
          shading: { fill: 'D5E8F0', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
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
              width: { size: 2200, type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun(idx === 0 ? g.label : '')] })],
            }),
            new TableCell({
              borders,
              width: { size: 4200, type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun(item.name)] })],
            }),
            new TableCell({
              borders,
              width: { size: 2626, type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun(item.url)] })],
            }),
          ],
        }),
      );
    });
  }

  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [2200, 4200, 2626],
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
      { name: 'Renja SIPD', url: '/sipd-renja' },
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

const children = [
  new Paragraph({ spacing: { before: 2200 } }),
  p('PANDUAN ARUMANIS', { bold: true, size: 56 }),
  p('Air Minum & Sanitasi Kabupaten Cianjur', { size: 28 }),
  p('Sumber: https://arumanis.cianjur.space'),
  p('Edisi Juli 2026 — diverifikasi di lingkungan produksi'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('Daftar Isi'),
  p('Bagian A — Pengunjung & halaman publik'),
  p('Bagian B — Panduan pengguna (admin, pengawas, konsultan_pengawas, staff)'),
  p('Bagian C — Panduan developer'),
  new Paragraph({ children: [new PageBreak()] }),

  // ===== A =====
  h1('Bagian A — Pengunjung & Halaman Publik'),
  p(
    'Anda tidak perlu akun untuk membaca informasi program. Buka https://arumanis.cianjur.space dan Anda akan melihat landing page dengan capaian SPM, publikasi, dan tautan informasi.',
  ),

  h2('A.1 Navigasi landing page'),
  bullet('bullets-a', 'Menu atas: CAPAIAN, INFORMASI, TENTANG, PUBLIKASI, tombol MASUK.'),
  bullet('bullets-a', 'Pengganti bahasa ID / EN di pojok kanan.'),
  bullet('bullets-a', 'Hero: judul "Air Minum dan Sanitasi" dengan tombol Lihat Capaian SPM dan Lihat Publikasi.'),
  bullet('bullets-a', 'Ringkasan capaian: Air minum 59,6% desa dan Sanitasi 29,9% desa (angka live dari produksi).'),
  ...figure('landing-01-hero.png', 'landing-01-hero', 'Gambar 1 — Landing page ARUMANIS (hero + peta capaian SPM)'),

  h2('A.2 Peta capaian SPM'),
  bullet('bullets-a', 'Tab Air Minum dan Sanitasi untuk mengganti layer peta.'),
  bullet('bullets-a', 'Filter tahun: Terakumulasi, 2026, 2025, … 2020.'),
  bullet('bullets-a', 'Tombol LIHAT DETAIL CAPAIAN menuju halaman capaian per desa (jika diaktifkan admin).'),
  bullet('bullets-a', 'Statistik capaian dan legenda peta dapat dibuka dari tombol di panel peta.'),
  ...figure('landing-02-kartu-akses.png', 'landing-02-kartu-akses', 'Gambar 2 — Bagian "Apa yang Bisa Anda Akses"'),

  h2('A.3 Halaman publik tanpa login'),
  bullet('bullets-a', 'Capaian SPM per desa'),
  bullet('bullets-a', 'Publikasi & dokumen (/publikasi)'),
  bullet('bullets-a', 'Tujuan, Manfaat & Hasil (/tujuan-manfaat-hasil)'),
  bullet('bullets-a', 'Latar Belakang (/rancang-bangun-inovasi)'),
  bullet('bullets-a', 'Changelog, Syarat Penggunaan, Kebijakan Privasi'),
  bullet('bullets-a', 'Form kontak di footer landing: Nama, Email, Telepon (opsional), Subjek, Pesan'),
  ...figure('public-01-publikasi.png', 'public-01-publikasi', 'Gambar 3 — Halaman publikasi'),

  h2('A.4 Kapan diarahkan ke login'),
  p('Tombol MASUK atau DASHBOARD membuka /sign-in. Pengguna dengan akun publik (bukan staff) setelah login tetap di halaman informasi, tidak masuk dashboard operasional.'),

  new Paragraph({ children: [new PageBreak()] }),

  // ===== B =====
  h1('Bagian B — Panduan Pengguna'),
  p('ARUMANIS punya tiga permukaan utama: aplikasi staff (/dashboard), Puspen (/puspen), dan Panel Pengawasan (/pengawasan/).'),

  h2('B.1 Login'),
  bullet('bullets-b', 'URL: /sign-in'),
  bullet('bullets-b', 'Email + password (min. 7 karakter) atau tombol GOOGLE'),
  bullet('bullets-b', 'Link LUPA? untuk reset password via admin'),
  bullet('bullets-b', 'Link PANDUAN PENGGUNAAN di halaman login'),
  ...figure('auth-01-sign-in.png', 'auth-01-sign-in', 'Gambar 4 — Halaman login'),

  h2('B.2 Role dan perilaku setelah login'),
  new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [2000, 2800, 4226],
    rows: [
      new TableRow({
        children: ['Role', 'Tujuan', 'Perilaku'].map((t, j) =>
          new TableCell({
            borders,
            width: { size: [2000, 2800, 4226][j], type: WidthType.DXA },
            shading: { fill: 'D5E8F0', type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })],
          }),
        ),
      }),
      ...[
        ['admin', 'Pengelola penuh', 'Semua menu; bypass route/menu permission; impersonasi'],
        ['manager', 'Eksekutif', 'Dashboard eksekutif & fitur P2; tetap di app utama'],
        ['pengawas', 'Lapangan', 'Redirect SSO ke /pengawasan/ (kecuali juga admin/manager)'],
        ['konsultan_pengawas', 'Konsultan lapangan', 'Sama dengan pengawas'],
        ['tfl / operator / viewer', 'Operasional', 'Menu & route sesuai aturan DB'],
      ].map((row) =>
        new TableRow({
          children: row.map((cell, j) =>
            new TableCell({
              borders,
              width: { size: [2000, 2800, 4226][j], type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun(cell)] })],
            }),
          ),
        }),
      ),
    ],
  }),
  new Paragraph({ spacing: { before: 200 } }),

  h2('B.3 Navigasi aplikasi utama (staff)'),
  p('Setelah login staff, sidebar kiri menampilkan menu berkelompok. Header berisi:'),
  bullet('bullets-b', 'Switcher tim ARUMANIS ↔ PUSPEN'),
  bullet('bullets-b', 'Breadcrumb (Home / halaman aktif)'),
  bullet('bullets-b', 'Pemilih Tahun Anggaran (contoh: TA 2026)'),
  bullet('bullets-b', 'Search (⌘K), toggle tema, notifikasi, profil user'),
  ...figure(
    fs.existsSync(path.join(SS_DIR, 'nav-01-sidebar.png')) ? 'nav-01-sidebar.png' : 'dashboard-01.png',
    'nav-01-sidebar',
    'Gambar 5 — Dashboard dengan sidebar lengkap (role admin)',
  ),

  h3('Daftar menu sidebar (produksi Juli 2026)'),
  menuTable(sidebarGroups),

  h2('B.4 Dashboard — tab utama'),
  p('Halaman /dashboard memiliki tab:'),
  bullet('bullets-b', 'Lounge — jadwal & aktivitas harian'),
  bullet('bullets-b', 'Overview — ringkasan data'),
  bullet('bullets-b', 'Analytics — tren & performa'),
  bullet('bullets-b', 'Calendar — kalender kegiatan'),
  bullet('bullets-b', 'Reports — unduh laporan'),
  p('Widget contoh: Kegiatan Hari Ini, Mendatang, Pengunjung Aktif, Aktivitas Terbaru (unggahan foto, dll.).'),

  h2('B.5 Admin — modul yang sering dipakai'),
  h3('Program Kegiatan & PPTK'),
  p('Setiap baris kegiatan = satu sub kegiatan. Field PPTK (nama + NIP) dipakai otomatis saat ekspor dokumen kontrak. Kosongkan untuk fallback Settings.'),
  ...figure('admin-03-kegiatan-pptk.png', 'admin-03-kegiatan-list', 'Gambar 6 — Daftar kegiatan'),
  ...figure('admin-03-kegiatan-form-pptk.png', 'admin-03-kegiatan-form', 'Gambar 7 — Form kegiatan dengan section PPTK'),

  h3('Pekerjaan & Kontrak'),
  p('Alur: Kegiatan → Pekerjaan → Kontrak → Register dokumen → Ekspor ringkasan/SPK/BAP.'),
  ...figure('modul-01-pekerjaan-list.png', 'modul-pekerjaan', 'Gambar 8 — Daftar pekerjaan'),
  ...figure('admin-04-kontrak-list.png', 'modul-kontrak', 'Gambar 9 — Daftar kontrak'),

  h3('Pengaturan dokumen kontrak'),
  p('Menu Settings → Template Dokumen Kontrak: PPK, PPTK fallback, SKPD/DPA, cara pembayaran, masa pemeliharaan, upload template Excel.'),
  ...figure('admin-01-settings.png', 'admin-settings', 'Gambar 10 — Pengaturan aplikasi & dokumen kontrak'),

  h3('Manajemen akses'),
  ...figure('admin-02-users.png', 'admin-users', 'Gambar 11 — Manajemen users (impersonasi)'),
  ...figure('admin-roles.png', 'admin-roles', 'Gambar 12 — Daftar roles'),
  ...figure('admin-02-route-permissions.png', 'admin-route-perm', 'Gambar 13 — Route permissions'),

  h2('B.6 Pengawas & Konsultan Pengawas'),
  p('Tidak ada login terpisah di /pengawasan/. Alur:'),
  bullet('bullets-b', '1. Login di /sign-in Arumanis'),
  bullet('bullets-b', '2. Jika role pengawas/konsultan_pengawas (tanpa admin/manager), redirect ke /pengawasan/login?token=...'),
  bullet('bullets-b', '3. Cookie pengawas_session diset via BFF'),
  bullet('bullets-b', '4. Menu panel: Dashboard, Pekerjaan, Buat Laporan, Tiket, Notifikasi, Panduan, Profil'),
  p('Admin yang juga punya role pengawas tetap di app utama. Gunakan impersonasi dari Users untuk melihat tampilan pengawas.'),
  ...figure('puspen-01.png', 'puspen-home', 'Gambar 14 — Puspen (switcher tim di sidebar ARUMANIS → /puspen)'),

  h2('B.7 Modul dokumentasi lapangan'),
  ...figure('modul-checklist.png', 'modul-checklist', 'Gambar 15 — Checklist pekerjaan'),
  ...figure('modul-foto.png', 'modul-foto', 'Gambar 16 — Galeri foto dokumentasi'),
  ...figure('modul-peta.png', 'modul-peta', 'Gambar 17 — Peta progress'),

  h2('B.8 Pemecahan masalah'),
  bullet('bullets-b', '403 di halaman tertentu: minta admin tambah Route Permission untuk role Anda.'),
  bullet('bullets-b', 'Menu tidak muncul: cek Menu Permissions, bukan hanya nama role.'),
  bullet('bullets-b', 'Pengawas tidak redirect: mungkin juga punya role admin/manager.'),
  bullet('bullets-b', 'Ekspor kontrak placeholder kosong: lengkapi register dokumen + PPTK di kegiatan atau Settings.'),
  bullet('bullets-b', 'Tahun anggaran salah: ubah TA di header sebelum input data.'),

  new Paragraph({ children: [new PageBreak()] }),

  // ===== C Developer =====
  h1('Bagian C — Panduan Developer'),
  p(
    'Bagian ini untuk yang menyentuh kode. Repo frontend di C:\\laragon\\www\\bun, backend di C:\\laragon\\www\\apiamis. Kalau Anda cuma deploy, baca C.1 dan C.5. Sisanya untuk yang ngoding.',
  ),

  h2('C.1 Arsitektur request'),
  bullet('bullets-c', 'React SPA → /bff/api → BFF Hono/Bun (port 8787) → Laravel APIAMIS'),
  bullet('bullets-c', 'Auth: cookie httpOnly via BFF, bukan token di localStorage'),
  bullet('bullets-c', 'Satu HTTP client: src/lib/api-client.ts'),

  h2('C.2 Tiga lapis otorisasi UI'),
  bullet('bullets-c', '1. Route gate: requireAuthenticatedSession di /_authenticated/*'),
  bullet('bullets-c', '2. Route Permission (DB) + ProtectedRoute.tsx'),
  bullet('bullets-c', '3. Menu Permission (sidebar visibility via menuKey)'),
  p('Admin bypass dua lapis UI. Backend Sanctum tetap wajib untuk endpoint sensitif.'),

  h2('C.3 Role hardcoded di frontend'),
  p('Hanya slug berikut punya perilaku khusus di kode:'),
  bullet('bullets-c', 'admin — bypass permission UI'),
  bullet('bullets-c', 'manager — fitur MVP tier P2'),
  bullet('bullets-c', 'pengawas / konsultan_pengawas — redirect SSO (src/lib/pengawas-app.ts)'),
  bullet('bullets-c', 'tfl — staff operasional'),
  p('Operator, viewer, custom role: sepenuhnya dari DB. Jangan asumsikan hak akses dari nama role saja.'),

  h2('C.4 Onboarding kode'),
  bullet('bullets-c', '.agent/README.md → stack & checklist'),
  bullet('bullets-c', '.agent/ARCHITECTURE.md → lapisan aplikasi'),
  bullet('bullets-c', '.agent/SYSTEM_OVERVIEW.md → kontrak API lintas repo'),
  bullet('bullets-c', '.agent/rules.md → konvensi implementasi'),
  bullet('bullets-c', 'docs/user-guide/*.md → panduan modul (di-load ke /panduan)'),

  h2('C.5 Menjalankan lokal'),
  bullet('bullets-c', 'bun run dev — Vite + BFF'),
  bullet('bullets-c', 'APIAMIS_BASE_URL di server/ untuk proxy BFF'),
  bullet('bullets-c', '/pengawasan di-proxy ke repo panel pengawas terpisah'),
  bullet('bullets-c', 'MySQL aktif sebelum php artisan migrate di apiamis'),

  h2('C.6 Contoh fitur lintas stack: PPTK per sub kegiatan'),
  bullet('bullets-c', 'Migration: nama_pptk, nip_pptk di tbl_kegiatan'),
  bullet('bullets-c', 'Backend: KontrakDocumentSettingsService::resolvePptk()'),
  bullet('bullets-c', 'Ekspor: KontrakDocumentDataBuilder memakai PPTK kegiatan, fallback Settings'),
  bullet('bullets-c', 'Frontend: KegiatanForm.tsx + KontrakPejabatSettings.tsx'),

  h2('C.7 Checklist sebelum merge'),
  bullet('bullets-c', 'bun run lint && bun run build'),
  bullet('bullets-c', 'bun run test (modul terkait)'),
  bullet('bullets-c', 'Perubahan API: verifikasi controller + resource di apiamis'),
  bullet('bullets-c', 'Route baru: pertimbangkan scripts/audit-route-permissions.mjs'),
  bullet('bullets-c', 'UI authenticated: cek manual di browser'),

  new Paragraph({ spacing: { before: 300 } }),
  p('Lampiran screenshot: docs/assets/screenshots/ — regenerasi via scripts/pinchtab-capture-core.ps1', { italics: true }),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: '1F4E79' },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial' },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: ['bullets-a', 'bullets-b', 'bullets-c'].map((ref) => ({
      reference: ref,
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    })),
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({ children: [new TextRun({ text: 'Panduan ARUMANIS — arumanis.cianjur.space', size: 18, color: '888888' })] })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Halaman ', size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 })],
        })],
      }),
    },
    children,
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUT, buffer);
console.log(`Written: ${OUT} (${buffer.length} bytes)`);
console.log(`Screenshots used from: ${SS_DIR}`);