#!/usr/bin/env node
/**
 * Generate Dokumen Integrasi Platform Arumanis (.docx)
 * Run: bun scripts/generate-integrasi-docx.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TableOfContents,
  TextRun,
  WidthType,
} from 'docx';
import {
  buildDocumentStyles,
  buildNumberingConfig,
  bodyPara,
  PAGE_MARGINS,
  PAGE_SIZE,
  SIZE_SMALL,
  tr,
} from './lib/docx-id-styles.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'Integrasi-Platform-Arumanis.docx');

const CONTENT_W = PAGE_SIZE.width - PAGE_MARGINS.left - PAGE_MARGINS.right;
const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: opts.spacing ?? bodyPara().spacing,
    heading: opts.heading,
    children: [tr(text, { bold: opts.bold, italics: opts.italics, size: opts.size, color: opts.color })],
  });
}

function h1(t) {
  return p(t, { heading: HeadingLevel.HEADING_1 });
}
function h2(t) {
  return p(t, { heading: HeadingLevel.HEADING_2 });
}
function h3(t) {
  return p(t, { heading: HeadingLevel.HEADING_3 });
}

function bullet(text, ref = 'bullets-int') {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100, line: 360, lineRule: 'auto' },
    children: [tr(text)],
  });
}

function numbered(text, ref = 'steps-int-num') {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100, line: 360, lineRule: 'auto' },
    children: [tr(text)],
  });
}

function monoBlock(lines) {
  return lines.map(
    (line) =>
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 40, line: 276, lineRule: 'auto' },
        children: [tr(line, { font: 'Consolas', size: SIZE_SMALL })],
      }),
  );
}

function tableFromRows(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
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
              children: [tr(cell, { bold: ri === 0 })],
            }),
          ],
        }),
      ),
    });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [mk(headers, 0), ...rows.map((r) => mk(r, 1))],
  });
}

const numberingRefs = ['bullets-int', 'steps-int-num'];
const doc = new Document({
  styles: buildDocumentStyles(),
  numbering: { config: buildNumberingConfig(numberingRefs) },
  sections: [
    {
      properties: {
        page: { size: PAGE_SIZE, margin: PAGE_MARGINS },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 0 },
              children: [tr('Dokumen Integrasi Platform Arumanis', { size: SIZE_SMALL, color: '666666' })],
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
          children: [tr('DOKUMEN INTEGRASI PLATFORM', { bold: true, size: 36, color: '1F4E79' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400, line: 360, lineRule: 'auto' },
          children: [tr('Arumanis — SPSE, SIPD, Panel Pengawasan, Mobile', { size: 28, color: '2E75B6' })],
        }),
        p('Versi: 1.0 (8 Juli 2026)', { center: true }),
        p('Lingkup: Portal operasional www/bun, layanan SIPD, SPSE, panel pengawasan web, dan aplikasi mobile pengawas.', {
          center: true,
          spacing: bodyPara({ after: 400 }).spacing,
        }),

        new TableOfContents('Daftar Isi', { hyperlink: true, headingStyleRange: '1-3' }),
        p(' ', { spacing: bodyPara({ after: 200 }).spacing }),

        h1('1. Apa yang sudah terhubung'),
        p(
          'Arumanis di C:\\laragon\\www\\bun bukan aplikasi tunggal. Portal ini jadi pintu masuk operator Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur, lalu data mengalir ke beberapa sistem lain.',
        ),
        tableFromRows(
          ['Sistem', 'Peran', 'Cara sambung'],
          [
            ['APIAMIS (Laravel)', 'Sumber data bisnis, auth, RBAC', 'BFF /bff/api/*'],
            ['SPSE (LPSE Kab. Cianjur)', 'Paket pengadaan, dokumen, push kontrak', 'APIAMIS + UI Sync SPSE'],
            ['SIPD (sipd-lite.cianjur.space)', 'Cache Renja & rincian anggaran', 'Proxy BFF /bff/sipd/*'],
            ['Panel Pengawasan (www/pengawas)', 'Dashboard pengawas di /pengawasan', 'SSO handoff sekali pakai'],
            ['Mobile Pengawasan (apps/mobile)', 'Foto GPS, progress, tiket lapangan', 'Langsung ke APIAMIS'],
          ],
          [2200, 3200, CONTENT_W - 5400],
        ),
        p(
          'Backend tetap di C:\\laragon\\www\\apiamis. Frontend Arumanis dan panel pengawasan hanya menampilkan dan memproksi; aturan bisnis tidak diduplikasi di sisi UI.',
          { spacing: bodyPara({ after: 280 }).spacing },
        ),

        h1('2. Gambaran alur data'),
        ...monoBlock([
          'Arumanis (www/bun) — React SPA + BFF Bun (Hono)',
          '    │ /bff/api/*          │ /bff/sipd/*',
          '    ▼                     ▼',
          ' APIAMIS (Laravel)    SIPD Lite (FastAPI)',
          '    │',
          '    ├── procurement/spse ──► SPSE inaproc (session cookie)',
          '    ├── auth/handoff ──────► www/pengawas (/pengawasan)',
          '    └── REST API ──────────► apps/mobile (Bearer token)',
        ]),
        p(
          'Operator kantor biasanya hanya membuka domain Arumanis. Pengawas bisa masuk lewat portal yang sama (lalu dialihkan), lewat /pengawasan langsung, atau lewat APK mobile.',
        ),

        h1('3. Arumanis utama (www/bun)'),
        h2('3.1 BFF sebagai satu pintu API'),
        p(
          'Browser tidak memanggil APIAMIS secara langsung. Semua request terautentikasi lewat cookie arumanis_session (httpOnly) ke BFF, lalu diteruskan dengan header Authorization: Bearer <token>.',
        ),
        h3('Endpoint auth penting'),
        bullet('POST /bff/auth/login — login operator'),
        bullet('GET /bff/auth/me — profil dan role'),
        bullet('POST /bff/auth/handoff — kode sekali pakai untuk SSO ke panel pengawasan'),
        p(
          'Proxy APIAMIS: app.all(\'/bff/api/*\', ...) di server/index.ts. Operasi SPSE yang berat (sync paket, push kontrak) memakai timeout hingga 180 detik.',
        ),
        h2('3.2 Realtime'),
        p(
          'Portal memakai Laravel Reverb untuk notifikasi dan presence. Mobile dan panel pengawasan berlangganan channel yang sama lewat apiamis.cianjur.space (konfigurasi VITE_REVERB_* / EXPO_PUBLIC_REVERB_*).',
        ),
        p('Di dashboard Arumanis, panel Pengguna Online membedakan app portal dan pengawasan, termasuk koordinat terakhir dari mobile.'),

        h1('4. Integrasi SPSE'),
        p('SPSE dipakai untuk menarik data paket LPSE dan, pada paket tertentu, mengirim balik data kontrak dari Arumanis ke formulir SPSE.'),
        h2('4.1 Lokasi di UI'),
        bullet('Menu Sync SPSE → route /procurement-sync'),
        bullet('Tombol Push ke SPSE di detail kontrak, aktif bila session SPSE terhubung'),
        h2('4.2 API (melalui BFF → APIAMIS)'),
        p('Prefix: /bff/api/procurement/spse (client memanggil /procurement/spse via api-client).'),
        tableFromRows(
          ['Endpoint (relatif)', 'Fungsi'],
          [
            ['GET /status', 'Cek session SPSE aktif'],
            ['POST /session', 'Simpan cookie setelah login manual di SPSE'],
            ['DELETE /session', 'Cabut session'],
            ['POST /sync', 'Tarik paket dari SPSE ke staging'],
            ['GET /staging', 'Daftar hasil sync'],
            ['POST /staging/apply', 'Terapkan staging ke master pekerjaan'],
            ['POST /staging/map', 'Petakan manual staging ke pekerjaan'],
            ['GET /packages/{kode}/documents', 'Daftar dokumen paket SPSE'],
            ['POST /packages/import-documents', 'Import dokumen ke pekerjaan Arumanis'],
            ['POST /kontrak/push', 'Push kontrak Arumanis ke form SPSE'],
          ],
          [3600, CONTENT_W - 3600],
        ),
        p('LPSE target: https://spse.inaproc.id/cianjurkab'),
        h2('4.3 Cara kerja session SPSE'),
        p(
          'SPSE tidak punya OAuth terbuka untuk integrasi pihak ketiga. Operator login manual di SPSE (termasuk CAPTCHA), lalu menyalin document.cookie dari DevTools ke form Sync SPSE di Arumanis. Cookie disimpan di server APIAMIS dan dipakai ulang untuk sync serta push.',
        ),
        p(
          'Field kontrak yang sudah dilacak: kode_paket, sppbj, tgl_sppbj, spk, nilai_kontrak, penyedia, tgl_selesai. Setelah push berhasil, kontrak menyimpan spse_pushed_at, spse_sppbj_id, spse_spk_id, dan nama paket SPSE.',
        ),
        h2('4.4 Alur operator'),
        numbered('Buka SPSE, login, salin cookie.'),
        numbered('Di Arumanis: Sync SPSE → tempel cookie → Sync sekarang.'),
        numbered('Review staging, apply atau map ke pekerjaan yang sudah ada.'),
        numbered('Lengkapi kontrak di Arumanis, lalu Push ke SPSE dari halaman detail kontrak.'),
        p('Skrip bantu rekaman jaringan SPSE: scripts/spse-network-recorder.mjs'),

        h1('5. Integrasi SIPD'),
        p(
          'SIPD dipakai untuk membaca Renja dan rincian belanja yang sudah di-cache di layanan Python terpisah. Arumanis tidak menulis balik ke SIPD; sinkronisasi sumber dilakukan manual di UI SIPD Web.',
        ),
        h2('5.1 Lokasi di UI'),
        bullet('Renja SIPD → /sipd-renja'),
        bullet('Detail rincian sub BL → /sipd-renja/$idSubBl'),
        bullet('Tombol Sync di SIPD Web → VITE_SIPD_WEB_URL (produksi: https://sipd-lite.cianjur.space)'),
        h2('5.2 Proxy BFF'),
        tableFromRows(
          ['BFF', 'Upstream SIPD'],
          [
            ['/bff/sipd/status', '/api/status'],
            ['/bff/sipd/renja?tahun=', '/api/cache/renja'],
            ['/bff/sipd/rincian/{id}', '/api/cache/rincian/{id}'],
          ],
          [4200, CONTENT_W - 4200],
        ),
        p(
          'Sebelum proxy, BFF memverifikasi sesi Arumanis. Ke upstream SIPD, BFF mengirim SIPD_SERVICE_TOKEN (production wajib sama di kedua service).',
        ),
        h2('5.3 Variabel lingkungan'),
        tableFromRows(
          ['Variabel', 'Lokasi', 'Keterangan'],
          [
            ['SIPD_BASE_URL', 'BFF server', 'URL layanan Python'],
            ['SIPD_SERVICE_TOKEN', 'BFF + service SIPD', 'Token shared secret'],
            ['VITE_SIPD_WEB_URL', 'Build frontend', 'Link UI sync manual'],
            ['SIPD_PROXY_TIMEOUT_MS', 'BFF', 'Default 30 detik'],
          ],
          [2600, 2200, CONTENT_W - 4800],
        ),

        h1('6. Panel Pengawasan web (www/pengawas)'),
        p(
          'Repositori terpisah di C:\\laragon\\www\\pengawas. Di produksi di-mount sebagai subpath /pengawasan pada domain yang sama dengan Arumanis (arumanis.cianjur.space/pengawasan).',
        ),
        h2('6.1 Arsitektur'),
        p(
          'Sama seperti Arumanis: React + Vite di browser, BFF Bun (Hono) di server/index.ts, upstream APIAMIS_BASE_URL. Token user disimpan httpOnly.',
        ),
        h2('6.2 SSO dari Arumanis'),
        ...monoBlock([
          '1. User sudah login di Arumanis (cookie sesi aktif)',
          '2. Frontend Arumanis: POST /bff/auth/handoff',
          '3. APIAMIS mengeluarkan kode sekali pakai',
          '4. Browser redirect ke {VITE_PENGAWAS_APP_BASE_URL}/login?code=...',
          '5. BFF pengawasan menukar kode menjadi sesi cookie panel pengawasan',
        ]),
        p('Implementasi: src/lib/auth-handoff.ts, src/lib/pengawas-app.ts'),
        p(
          'Role yang otomatis diarahkan ke panel setelah login (bila bukan admin/manager): pengawas, pengawasan, konsultan_pengawas. Admin bisa impersonate pengawas dari daftar user Arumanis.',
        ),
        h2('6.3 Fitur yang bergantung pada APIAMIS'),
        bullet('Daftar pekerjaan sesuai assignment user-pekerjaan'),
        bullet('Upload foto, progress fisik/keuangan, tiket'),
        bullet('Statistik KPI pengawas'),
        bullet('Echo/Reverb untuk notifikasi realtime'),
        p('Service worker Arumanis sengaja tidak mengintercept path /pengawasan.'),
        h2('6.4 Konfigurasi produksi'),
        tableFromRows(
          ['Variabel', 'Contoh produksi'],
          [
            ['VITE_PENGAWAS_APP_BASE_URL (Arumanis)', 'https://arumanis.cianjur.space/pengawasan'],
            ['APIAMIS_BASE_URL (pengawasan)', 'https://apiamis.cianjur.space/api'],
            ['PUBLIC_BASE (pengawasan)', '/pengawasan'],
          ],
          [4800, CONTENT_W - 4800],
        ),

        h1('7. Aplikasi mobile (www/pengawas/apps/mobile)'),
        p(
          'Aplikasi Arumanis Pengawasan (Expo/React Native, package space.cianjur.pengawas) ditujukan untuk pengawas di lapangan. Mobile langsung ke APIAMIS, tanpa BFF www/pengawas.',
        ),
        h2('7.1 Koneksi API'),
        bullet('Dev: http://apiamis.test/api (HP fisik: ganti hostname dengan IP LAN)'),
        bullet('Prod: https://apiamis.cianjur.space/api'),
        bullet('Env: EXPO_PUBLIC_APIAMIS_BASE_URL'),
        p('Auth: Bearer token disimpan aman di perangkat (SecureStore), bukan cookie browser.'),
        h2('7.2 OAuth dan login'),
        bullet('Login email/password sama dengan akun APIAMIS'),
        bullet('Google SSO opsional'),
        bullet('Callback native: pengawas://oauth-callback'),
        h2('7.3 Fitur lapangan terhubung ke portal'),
        tableFromRows(
          ['Fitur mobile', 'Mekanisme', 'Tampil di Arumanis'],
          [
            ['Upload foto + GPS', 'API foto pekerjaan', 'Indeks foto, peta, executive dashboard'],
            ['Progress estimasi', 'API progress', 'Deviasi di dashboard'],
            ['Tiket', 'API tiket', 'Modul tiket operator'],
            ['Presence heartbeat', 'POST /presence/heartbeat app=pengawasan', 'Pengguna Online, Lokasi Pengawas'],
            ['Notifikasi broadcast', 'Reverb + local notification', 'Mobile dan web'],
            ['Antrean upload offline', 'Queue lokal, retry otomatis', 'Data masuk setelah online'],
          ],
          [2400, 3000, CONTENT_W - 5400],
        ),
        p('GPS background (Android) mengirim koordinat berkala; portal menampilkan titik terakhir di fitur Lokasi Pengawas.'),
        h2('7.4 OTA dan build'),
        p('Pembaruan JavaScript lewat EAS Update. Build native: scripts/build-android.sh. Reverb production mengarah ke apiamis.cianjur.space.'),

        h1('8. Matriks autentikasi'),
        tableFromRows(
          ['Klien', 'Sesi', 'Menuju APIAMIS'],
          [
            ['Arumanis web', 'Cookie via BFF Arumanis', 'Bearer dari cookie BFF'],
            ['Panel pengawasan web', 'Cookie via BFF pengawasan', 'Bearer dari cookie BFF'],
            ['Mobile pengawas', 'Token di SecureStore', 'Bearer langsung'],
            ['SIPD proxy', 'Sesi Arumanis + service token', 'Ke SIPD Python'],
            ['SPSE sync', 'Session cookie SPSE di server', 'Via modul procurement APIAMIS'],
          ],
          [2800, 2800, CONTENT_W - 5600],
        ),
        p('Satu akun APIAMIS bisa dipakai di ketiga klien selama role dan assignment mengizinkan.'),

        h1('9. Checklist deploy dan troubleshooting'),
        p('SPSE: Session kedaluwarsa setelah logout SPSE. Gejala: sync gagal atau push kontrak ditolak. Ulangi simpan cookie di Sync SPSE.', { bold: true }),
        p('SIPD: Error SIPD_SERVICE_TOKEN_MISSING berarti token belum diset di Coolify BFF Arumanis. Pastikan nilai sama di container SIPD Python.', { bold: true }),
        p('Pengawasan: Jika redirect SSO gagal, cek VITE_PENGAWAS_APP_BASE_URL saat build Arumanis dan PUBLIC_BASE di container pengawasan.', { bold: true }),
        p('Mobile: Jika foto tidak naik, cek assignment pekerjaan di modul user-pekerjaan Arumanis.', { bold: true }),
        p('CORS dan path: /pengawasan harus di-exclude dari rewrite SPA utama dan dari service worker PWA Arumanis.', { bold: true }),

        h1('10. Referensi kode'),
        tableFromRows(
          ['Topik', 'Berkas utama'],
          [
            ['BFF Arumanis', 'server/index.ts, server/sipd-proxy.ts'],
            ['Client SPSE', 'src/features/procurement-sync/'],
            ['Client SIPD', 'src/features/sipd-renja/, src/lib/sipd-client.ts'],
            ['SSO pengawasan', 'src/lib/auth-handoff.ts, src/lib/pengawas-app.ts'],
            ['BFF pengawasan', 'C:\\laragon\\www\\pengawas\\server\\index.ts'],
            ['Mobile API', 'C:\\laragon\\www\\pengawas\\apps\\mobile\\lib\\api-endpoints.ts'],
            ['Presence mobile', 'C:\\laragon\\www\\pengawas\\apps\\mobile\\lib\\presence.ts'],
            ['Env contoh', '.env.example'],
          ],
          [3200, CONTENT_W - 3200],
        ),
        p(
          'Dokumen ini disusun dari kode aktual di repositori per Juli 2026. Jika endpoint APIAMIS berubah, verifikasi di C:\\laragon\\www\\apiamis\\routes\\api.php sebelum mengandalkan daftar endpoint di atas.',
          { italics: true, spacing: bodyPara({ after: 0 }).spacing },
        ),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, buffer);
console.log('Written:', OUT);