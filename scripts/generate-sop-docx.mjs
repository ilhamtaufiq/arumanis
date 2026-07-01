import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_PATH = path.join(ROOT, 'docs', 'SOP_PENGGUNAAN_ARUMANIS.docx')

const CONTENT_WIDTH = 9026 // A4, margin 1"

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: border, bottom: border, left: border, right: border }
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 }

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
        children: [
            new TextRun({
                text,
                bold: !!opts.bold,
                italics: !!opts.italics,
                size: 22,
            }),
        ],
    })
}
function bullet(ref, text) {
    return new Paragraph({
        numbering: { reference: ref, level: 0 },
        spacing: { after: 120, line: 360 },
        children: [new TextRun({ text, size: 22 })],
    })
}
function spacer() {
    return new Paragraph({ spacing: { after: 120 }, children: [] })
}

function table(headers, rows, colWidths) {
    const total = colWidths.reduce((a, b) => a + b, 0)
    const headerRow = new TableRow({
        children: headers.map(
            (h, i) =>
                new TableCell({
                    borders,
                    width: { size: colWidths[i], type: WidthType.DXA },
                    shading: { fill: 'D5E8F0', type: ShadingType.CLEAR },
                    margins: cellMargins,
                    children: [
                        new Paragraph({
                            children: [new TextRun({ text: h, bold: true, size: 20 })],
                        }),
                    ],
                }),
        ),
    })
    const dataRows = rows.map(
        (row) =>
            new TableRow({
                children: row.map(
                    (cell, i) =>
                        new TableCell({
                            borders,
                            width: { size: colWidths[i], type: WidthType.DXA },
                            margins: cellMargins,
                            children: [
                                new Paragraph({
                                    children: [new TextRun({ text: String(cell), size: 20 })],
                                }),
                            ],
                        }),
                ),
            }),
    )
    return new Table({
        width: { size: total, type: WidthType.DXA },
        columnWidths: colWidths,
        rows: [headerRow, ...dataRows],
    })
}

/** Diagram alur sebagai rangkaian langkah dengan panah */
function flowDiagram(title, steps) {
    return [
        h3(title),
        p(steps.join('  →  '), { italics: true }),
        spacer(),
    ]
}

const doc = new Document({
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
                        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                    },
                ],
            },
            {
                reference: 'numbers',
                levels: [
                    {
                        level: 0,
                        format: LevelFormat.DECIMAL,
                        text: '%1.',
                        alignment: AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                    },
                ],
            },
        ],
    },
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
                                    text: 'SOP Penggunaan Arumanis & Panel Pengawasan — Halaman ',
                                    size: 18,
                                }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                // === SAMPUL ===
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [new TextRun({ text: 'STANDAR OPERASIONAL PROSEDUR', bold: true, size: 32 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 160 },
                    children: [
                        new TextRun({ text: 'PENGGUNAAN APLIKASI ARUMANIS', bold: true, size: 36 }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [
                        new TextRun({ text: 'dan PANEL PENGAWASAN', bold: true, size: 30 }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 360 },
                    children: [
                        new TextRun({
                            text: 'Air Minum & Sanitasi Kabupaten Cianjur',
                            size: 26,
                        }),
                    ],
                }),
                table(
                    ['Item', 'Nilai'],
                    [
                        ['Versi dokumen', '1.0'],
                        ['Tanggal', '1 Juli 2026'],
                        ['Platform', 'Arumanis v0.5.0'],
                        ['URL produksi', 'https://arumanis.cianjurkab.go.id'],
                        ['Panel pengawasan', 'https://arumanis.cianjurkab.go.id/pengawasan'],
                        ['Maintainer', 'ilhamtaufiq'],
                    ],
                    [3200, 5826],
                ),
                spacer(),
                p('Dokumen ini mengatur prosedur operasional penggunaan Arumanis Utama (kantor) dan Panel Pengawasan (lapangan). Sumber Markdown: docs/SOP-PENGGUNAAN-ARUMANIS.md'),

                // === 1. RUANG LINGKUP ===
                h1('1. Ruang Lingkup'),
                table(
                    ['Aplikasi', 'Repo lokal', 'URL', 'Pengguna utama'],
                    [
                        ['Arumanis Utama', 'www/bun', 'arumanis.cianjurkab.go.id', 'Admin, operator, viewer'],
                        [
                            'Panel Pengawasan',
                            'www/pengawas',
                            '.../pengawasan',
                            'Pengawas, konsultan pengawas',
                        ],
                    ],
                    [2200, 1600, 2626, 2600],
                ),
                spacer(),
                p(
                    'Kedua aplikasi memakai akun APIAMIS yang sama. Panel Pengawasan masuk melalui SSO dari Arumanis — tidak ada pendaftaran akun terpisah.',
                ),

                // === 2. DEFINISI & PERAN ===
                h1('2. Definisi & Peran'),
                h2('2.1 Matriks Peran'),
                table(
                    ['Peran', 'Aplikasi', 'Hak utama', 'Keterbatasan'],
                    [
                        ['Admin', 'Arumanis', 'Semua modul, user, impersonate', '—'],
                        ['Operator', 'Arumanis', 'Input/edit sesuai permission', 'Tidak ubah role'],
                        ['Viewer', 'Arumanis', 'Lihat data saja', 'Tidak CRUD'],
                        ['Pengawas', 'Pengawasan', 'Foto, progress, tiket', 'Hanya paket di-assign'],
                        ['Konsultan Pengawas', 'Pengawasan', 'Sama pengawas', 'Sama pengawas'],
                    ],
                    [1800, 1600, 3200, 2426],
                ),
                spacer(),
                h2('2.2 Routing Setelah Login'),
                table(
                    ['Kondisi role', 'Tujuan setelah login'],
                    [
                        ['Admin / Operator / Viewer', 'Dashboard Arumanis (/dashboard)'],
                        ['Pengawas / Konsultan (tanpa admin)', 'SSO → Panel Pengawasan (/pengawasan/)'],
                        ['Admin impersonate pengawas', 'Panel Pengawasan + banner kuning'],
                    ],
                    [4500, 4526],
                ),

                // === 3. PETA APLIKASI ===
                h1('3. Peta Aplikasi'),
                h2('3.1 Diagram Arsitektur Integrasi'),
                ...flowDiagram('Alur data platform', [
                    'Browser Arumanis',
                    'BFF Arumanis (session cookie)',
                    'APIAMIS',
                    'BFF Pengawasan (pengawas_session)',
                    'Browser Panel Pengawasan',
                ]),
                p('SSO: Arumanis mengirim token ke /pengawasan/login saat role pengawas login.'),

                h2('3.2 Diagram Login & Routing'),
                ...flowDiagram('Flow autentikasi', [
                    'Buka URL Arumanis',
                    '/sign-in',
                    'Login berhasil?',
                    'Peran admin/operator → Dashboard',
                    'Peran pengawas → SSO token',
                    'Sinkron cookie sesi',
                    'Dashboard Pengawasan',
                ]),

                h2('3.3 Menu Arumanis Utama'),
                table(
                    ['Grup', 'Modul', 'URL', 'SOP'],
                    [
                        ['Dashboard', 'Ringkasan', '/dashboard', '§5.1'],
                        ['Dashboard', 'Rekap Progress', '/progress_rekap', '§5.6'],
                        ['Dashboard', 'Tiket', '/tiket', '§5.8'],
                        ['Master Data', 'Kegiatan', '/kegiatan', '§5.2'],
                        ['Master Data', 'Pekerjaan', '/pekerjaan', '§5.2'],
                        ['Master Data', 'Kontrak', '/kontrak', '§5.3'],
                        ['Master Data', 'Output/Penerima', '/output, /penerima', '§5.2'],
                        ['Master Data', 'Assign Pekerjaan', '/user-pekerjaan', '§7.1'],
                        ['Dokumentasi', 'Berkas/Foto', '/berkas, /foto', '§5.4'],
                        ['Akses', 'Users/Roles', '/users, /roles', '§5.7'],
                        ['Pengaturan', 'Settings', '/settings', '§5.9'],
                    ],
                    [1400, 2200, 2200, 3226],
                ),
                spacer(),
                h2('3.4 Menu Panel Pengawasan'),
                table(
                    ['Menu', 'URL', 'SOP'],
                    [
                        ['Dashboard', '/pengawasan/', '§6.1'],
                        ['Pekerjaan', '/pengawasan/pekerjaan', '§6.2'],
                        ['Buat Laporan', '/pengawasan/buat-laporan', '§6.4'],
                        ['Tiket', '/pengawasan/tiket', '§6.5'],
                        ['Notifikasi', '/pengawasan/notifikasi', '§6.6'],
                        ['Profil', '/pengawasan/profile', '§6.7'],
                    ],
                    [2800, 3600, 2626],
                ),

                // === 4. SOP AKSES ===
                h1('4. SOP Akses & Autentikasi'),
                h2('4.1 Login Arumanis Utama'),
                table(
                    ['No', 'Langkah', 'Input/Aksi', 'Output', 'PIC'],
                    [
                        ['1', 'Buka browser terbaru', 'URL dari admin', '/sign-in tampil', 'Semua user'],
                        ['2', 'Isi email', 'Akun APIAMIS', 'Field valid', 'Semua user'],
                        ['3', 'Isi password', 'Min. 7 karakter', 'Field valid', 'Semua user'],
                        ['4', 'Klik Sign In', '—', 'Toast selamat datang', 'Semua user'],
                        ['5', 'Verifikasi tujuan', '—', 'Dashboard sesuai peran', 'Semua user'],
                    ],
                    [600, 2000, 2200, 2200, 2026],
                ),
                spacer(),
                h2('4.2 Logout'),
                table(
                    ['No', 'Langkah', 'Aplikasi', 'Output'],
                    [
                        ['1', 'Klik avatar di header', 'Arumanis', 'Dropdown menu'],
                        ['2', 'Pilih Logout', 'Keduanya', 'Redirect /sign-in'],
                        ['3', 'Tutup tab (perangkat publik)', '—', 'Sesi bersih'],
                    ],
                    [600, 3200, 2200, 3026],
                ),
                spacer(),
                h2('4.3 Sesi Habis (401)'),
                table(
                    ['Gejala', 'Tindakan', 'Aplikasi'],
                    [
                        ['Sesi tidak valid', 'Klik Masuk ulang', 'Pengawasan'],
                        ['Redirect login', 'Login ulang /sign-in', 'Arumanis'],
                        ['Data tidak termuat', 'Refresh setelah login', 'Keduanya'],
                    ],
                    [3000, 3500, 2526],
                ),

                // === 5. SOP ARUMANIS ===
                h1('5. SOP Arumanis Utama (Kantor/Admin)'),
                h2('5.1 Dashboard & Monitoring'),
                table(
                    ['No', 'Prosedur', 'Langkah', 'Frekuensi', 'Output'],
                    [
                        ['1', 'Buka ringkasan', 'Login → /dashboard', 'Harian', 'KPI tampil'],
                        ['2', 'Filter TA', 'Pilih tahun di header', 'Per sesi', 'Data sesuai TA'],
                        ['3', 'Cek kualitas data', 'Data Quality Stats', 'Mingguan', 'Daftar perbaikan'],
                        ['4', 'Drill-down', 'Klik widget → modul', 'Sesuai kebutuhan', 'Detail data'],
                    ],
                    [600, 2000, 2800, 1400, 2226],
                ),
                spacer(),
                ...flowDiagram('Flow monitoring dashboard', [
                    'Dashboard',
                    'Data quality OK?',
                    'Ya → lanjut operasional',
                    'Tidak → perbaiki modul sumber',
                    'Kegiatan / Pekerjaan / Kontrak / Foto',
                    'Kembali ke Dashboard',
                ]),

                h2('5.2 Input Program Baru'),
                p('Tujuan: mencatat kegiatan, pekerjaan, output, dan dokumentasi awal.'),
                table(
                    ['No', 'Modul', 'Langkah', 'Field wajib', 'Verifikasi'],
                    [
                        ['1', '/kegiatan', 'Tambah → Simpan', 'Nama, kode, dana, pagu, TA', 'Muncul di daftar'],
                        ['2', '/pekerjaan', 'Tambah lokasi', 'Paket, kecamatan, desa, pagu', 'Terhubung kegiatan'],
                        ['3', '/output', 'Tambah komponen', 'Komponen, satuan, volume', 'Di detail pekerjaan'],
                        ['4', '/penerima', 'Tambah penerima', 'Nama, tipe', 'Count bertambah'],
                        ['5', '/berkas', 'Upload dokumen', 'Pekerjaan, tipe, file', 'Dapat diunduh'],
                        ['6', '/foto', 'Upload foto (opsional)', 'Gambar, koordinat', 'Thumbnail tampil'],
                        ['7', 'Dashboard', 'Refresh', '—', 'Metrik terupdate'],
                    ],
                    [600, 1400, 2200, 2400, 2426],
                ),
                spacer(),
                ...flowDiagram('Flow input program baru', [
                    'Kegiatan baru',
                    'Pekerjaan baru',
                    'Output + Penerima + Berkas + Foto',
                    'Verifikasi Dashboard',
                ]),

                h2('5.3 Kontrak & Penyedia'),
                table(
                    ['No', 'Prosedur', 'Langkah', 'Prasyarat', 'Output'],
                    [
                        ['1', 'Daftar penyedia', '/penyedia → Tambah', '—', 'Master vendor'],
                        ['2', 'Buat kontrak', '/kontrak', 'Pekerjaan & penyedia ada', 'Kontrak aktif'],
                        ['3', 'Addendum', '/kontrak-addendums', 'Kontrak induk', 'Nilai terupdate'],
                        ['4', 'Register dokumen', '/pekerjaan/register', 'Pekerjaan ada', 'Register sinkron'],
                    ],
                    [600, 1800, 2800, 2000, 1826],
                ),
                spacer(),
                h2('5.4 Dokumentasi Berkas & Foto'),
                table(
                    ['No', 'Jenis', 'Langkah', 'Aturan', 'Verifikasi'],
                    [
                        ['1', 'Berkas kontrak/RAB', '/berkas → Upload', 'Tipe dokumen benar', 'Preview OK'],
                        ['2', 'Foto kantor', '/foto → Upload', 'Koordinat dalam desa', 'Geo-fencing hijau'],
                        ['3', 'Drive 3-zona', 'Menu Drive', 'Puspen/Pekerjaan/Users', 'Folder benar'],
                        ['4', 'Sort & tampilan', 'Grid/list, sort', '—', 'Urutan sesuai'],
                    ],
                    [600, 1800, 2400, 2200, 2026],
                ),
                spacer(),
                h2('5.6 Review Progress'),
                table(
                    ['No', 'Langkah', 'Modul', 'Output'],
                    [
                        ['1', 'Buka rekap', '/progress_rekap', 'Grafik & tabel'],
                        ['2', 'Filter tahun', 'Fiscal year selector', 'Data TA benar'],
                        ['3', 'Identifikasi deviasi', 'Kolom selisih', 'Daftar deviasi'],
                        ['4', 'Sinkron Puspen', 'Modul PUSPEN', 'Estimasi sinkron'],
                        ['5', 'Tindak lanjut', 'Notifikasi/tiket', 'Progress mingguan terisi'],
                    ],
                    [600, 2800, 2800, 2826],
                ),
                spacer(),
                h2('5.7 Manajemen Akses'),
                table(
                    ['No', 'Prosedur', 'URL', 'Urutan'],
                    [
                        ['1', 'Buat role', '/roles', 'Admin only'],
                        ['2', 'Atur permission', '/permissions', 'Setelah role'],
                        ['3', 'Route & menu', '/route-permissions', 'Sesuai modul'],
                        ['4', 'Buat user', '/users', 'Assign ≥1 role'],
                        ['5', 'Batasi kegiatan', '/kegiatan-role', 'Opsional'],
                        ['6', 'Assign pekerjaan', '/user-pekerjaan', 'Wajib pengawas'],
                        ['7', 'Uji login', 'Login user baru', 'Menu sesuai'],
                    ],
                    [600, 2200, 3200, 3026],
                ),
                spacer(),
                ...flowDiagram('Flow manajemen akses', [
                    'Roles',
                    'Permissions',
                    'Route & Menu Permissions',
                    'Users',
                    'Assign Pekerjaan',
                    'Uji login',
                ]),
                h2('5.8 Tiket & Notifikasi'),
                table(
                    ['No', 'Aksi', 'Lokasi', 'Keterangan'],
                    [
                        ['1', 'Lihat tiket', '/tiket', 'Filter status'],
                        ['2', 'Tanggapi', 'Detail tiket', 'Koordinasi pengawas'],
                        ['3', 'Broadcast', '/notifications/broadcast', 'Admin only'],
                        ['4', 'Pantau', '/notifications', 'Semua user'],
                    ],
                    [600, 2200, 2800, 3426],
                ),
                spacer(),
                h2('5.9 Pengaturan Aplikasi'),
                table(
                    ['No', 'Pengaturan', 'URL', 'PIC'],
                    [
                        ['1', 'Brand & SMTP', '/settings', 'Admin'],
                        ['2', 'Template kontrak', '/settings/kontrak-templates', 'Admin'],
                        ['3', 'Visibilitas SPM publik', 'Settings toggle', 'Admin'],
                        ['4', 'Audit trail', '/audit-logs', 'Admin'],
                    ],
                    [600, 2800, 3200, 2426],
                ),

                // === 6. SOP PENGAWASAN ===
                h1('6. SOP Panel Pengawasan (Lapangan)'),
                h2('6.1 Pemantauan Harian'),
                table(
                    ['No', 'Langkah', 'Layar', 'Indikator'],
                    [
                        ['1', 'Login SSO', '/pengawasan/', '—'],
                        ['2', 'Baca 4 KPI', 'Dashboard', 'Progress, deviasi, foto'],
                        ['3', 'Filter/search', 'Toolbar', '—'],
                        ['4', 'Paket perlu perhatian', 'Section bawah', 'Maks. 8 paket'],
                        ['5', 'Buka detail', '/pekerjaan/:id', '—'],
                    ],
                    [600, 2400, 2800, 3226],
                ),
                spacer(),
                ...flowDiagram('Flow pemantauan harian pengawas', [
                    'Login SSO',
                    'Dashboard',
                    'Ada paket bermasalah?',
                    'Tidak → selesai',
                    'Ya → detail pekerjaan',
                    'Tab Foto / Progress / Penerima / Tiket',
                ]),

                h2('6.2 Detail Pekerjaan — Tab'),
                table(
                    ['Tab', 'Fungsi', 'Input utama', 'Simpan'],
                    [
                        ['Ringkasan', 'Info paket & kontrak', 'Read-only', '—'],
                        ['Output', 'CRUD komponen', 'Komponen, volume, satuan', 'Tambah/Simpan'],
                        ['Penerima', 'CRUD penerima', 'Nama, NIK, jiwa, komunal', 'CRUD'],
                        ['Foto', 'Matriks slot 0–100%', 'Gambar + GPS', 'Unggah/slot'],
                        ['Progress', 'Estimasi mingguan', 'Rencana & realisasi', 'Simpan'],
                        ['Tiket', 'Isu paket', 'Komentar', 'Simpan komentar'],
                    ],
                    [1600, 2800, 2800, 1826],
                ),
                spacer(),
                h2('6.3 Upload Foto Lapangan'),
                table(
                    ['No', 'Langkah', 'Detail', 'Validasi'],
                    [
                        ['1', 'Tab Foto', 'Detail pekerjaan', 'Matriks tampil'],
                        ['2', 'Klik slot kosong', '0/25/50/75/100%', 'Modal upload'],
                        ['3', 'Koordinat GPS', 'Tombol GPS / manual', 'Koordinat terisi'],
                        ['4', 'Pilih file', 'EXIF diekstrak', 'Preview OK'],
                        ['5', 'Unggah foto', '—', 'Thumbnail slot'],
                        ['6', 'Lengkapi semua slot', 'Per output', 'Status Selesai'],
                        ['7', 'Cetak PDF (opsional)', 'Cetak Foto', 'Izinkan popup'],
                    ],
                    [600, 2200, 3000, 3226],
                ),
                spacer(),
                table(
                    ['Status foto', 'Kondisi'],
                    [
                        ['Belum ada foto', 'Tidak ada unggahan'],
                        ['Belum Selesai', 'Slot wajib belum penuh'],
                        ['Selesai', 'Semua slot terpenuhi'],
                    ],
                    [3500, 5526],
                ),
                spacer(),
                ...flowDiagram('Flow upload foto', [
                    'Tab Foto',
                    'Matriks output × slot',
                    'Slot kosong?',
                    'Upload GPS + file',
                    'Valid?',
                    'Slot terisi',
                    'Semua slot OK → Status Selesai',
                ]),

                h2('6.4 Input Progress & Laporan'),
                table(
                    ['No', 'Langkah', 'Tab/Menu', 'Catatan'],
                    [
                        ['1', 'Buka detail', 'Progress / Buat Laporan', '—'],
                        ['2', 'Pilih minggu', 'Dropdown', 'Default minggu ini'],
                        ['3', 'Isi Rencana', 'Kolom rencana', 'Target volume'],
                        ['4', 'Isi Realisasi', 'Kolom realisasi', 'Volume aktual'],
                        ['5', 'Simpan', 'Tombol Simpan', 'Badge Tersimpan'],
                        ['6', 'Cek KPI', 'Deviasi', 'Negatif = tindak lanjut'],
                    ],
                    [600, 2200, 2800, 3426],
                ),
                spacer(),
                h2('6.5 Tiket Lapangan'),
                table(
                    ['No', 'Prosedur', 'Langkah', 'Output'],
                    [
                        ['1', 'Identifikasi kendala', 'Lapangan', 'Keputusan tiket'],
                        ['2', 'Buat tiket', '/pengawasan/tiket', 'Status Menunggu'],
                        ['3', 'Isi subjek', 'Kategori lapangan', 'Tercatat'],
                        ['4', 'Pantau status', 'Daftar tiket', 'Diproses/Selesai'],
                        ['5', 'Komentar', 'Panel kanan', 'Thread update'],
                        ['6', 'Eskalasi', 'Admin di /tiket', 'Ditutup'],
                    ],
                    [600, 2200, 3000, 3226],
                ),
                spacer(),
                h2('6.6 Notifikasi'),
                table(
                    ['No', 'Langkah', 'Lokasi', 'Tindakan'],
                    [
                        ['1', 'Lonceng header', 'Semua halaman', 'Badge unread'],
                        ['2', 'Daftar lengkap', '/pengawasan/notifikasi', 'Tandai dibaca'],
                        ['3', 'Klik action', 'Link pekerjaan/tiket', 'Ke konteks'],
                    ],
                    [600, 2800, 3200, 2426],
                ),
                spacer(),
                h2('6.7 Profil & Validasi'),
                table(
                    ['No', 'Cek', 'Lokasi', 'Jika bermasalah'],
                    [
                        ['1', 'Nama & email', '/pengawasan/profile', 'Admin ubah /users'],
                        ['2', 'NIP cocok', 'Data pengawas', 'Admin perbaiki /pengawas'],
                        ['3', 'Role', 'Badge profil', 'Admin sesuaikan role'],
                    ],
                    [600, 2200, 2800, 3426],
                ),

                // === 7. INTEGRASI ===
                h1('7. SOP Integrasi Admin ↔ Pengawas'),
                h2('7.1 Penugasan Pengawas'),
                table(
                    ['No', 'PIC', 'Langkah (Arumanis)', 'Verifikasi (Pengawasan)'],
                    [
                        ['1', 'Admin', '/pengawas → master & NIP', '—'],
                        ['2', 'Admin', '/users → role pengawas', 'SSO berhasil'],
                        ['3', 'Admin', '/user-pekerjaan → assign', 'Paket di dashboard'],
                        ['4', 'Pengawas', 'Login → dashboard', 'KPI > 0'],
                        ['5', 'Pengawas', 'Buka 1 paket', 'Output/penerima ada'],
                    ],
                    [600, 1200, 3600, 3626],
                ),
                spacer(),
                ...flowDiagram('Sequence penugasan & sinkronisasi data', [
                    'Admin: master + user + assign',
                    'Pengawas login /sign-in',
                    'SSO token → /pengawasan/login',
                    'GET pekerjaan (filtered)',
                    'Upload foto / simpan progress',
                    'Data tampil di Arumanis',
                ]),
                h2('7.2 Impersonate (Admin)'),
                table(
                    ['No', 'Langkah', 'Output'],
                    [
                        ['1', '/users → Impersonate pengawas', 'Banner kuning'],
                        ['2', 'Sistem buka Panel Pengawasan', 'Sesi atas nama pengawas'],
                        ['3', 'Review alur lapangan', 'Validasi UX & data'],
                        ['4', 'Stop Impersonate', 'Kembali dashboard admin'],
                    ],
                    [600, 5000, 3426],
                ),

                // === 8. TROUBLESHOOTING ===
                h1('8. SOP Eskalasi & Troubleshooting'),
                h2('8.1 Matriks Masalah Umum'),
                table(
                    ['No', 'Gejala', 'Aplikasi', 'Penyebab', 'Solusi'],
                    [
                        ['1', 'Login gagal', 'Arumanis', 'Kredensial salah', 'Reset via admin'],
                        ['2', 'Loop ?token=', 'Pengawasan', 'Token invalid', 'Clear cache; login Arumanis'],
                        ['3', 'Pekerjaan kosong', 'Pengawasan', 'Belum assign', '/user-pekerjaan'],
                        ['4', '403 ditolak', 'Keduanya', 'Role kurang', 'Route/menu permission'],
                        ['5', 'GPS gagal', 'Pengawasan', 'Izin lokasi', 'Input manual'],
                        ['6', 'Foto ditolak', 'Keduanya', 'Koordinat luar desa', 'Foto di lokasi'],
                        ['7', 'Progress tidak simpan', 'Pengawasan', 'Tidak ada perubahan', 'Edit field dulu'],
                        ['8', 'Popup diblokir', 'Pengawasan', 'Browser block', 'Izinkan popup'],
                        ['9', '502 / error API', 'Keduanya', 'Backend down', 'Hubungi IT'],
                    ],
                    [500, 1600, 1400, 2200, 3326],
                ),
                spacer(),
                ...flowDiagram('Flow eskalasi', [
                    'User laporkan masalah',
                    'Coba troubleshooting §8.1',
                    'Selesai / Operator admin unit',
                    'Perlu server/API → IT',
                    'Perbaikan data di Arumanis',
                ]),
                h2('8.2 Level Eskalasi'),
                table(
                    ['Level', 'PIC', 'Cakupan'],
                    [
                        ['L1', 'User / Pengawas', 'Reset sesi, assign, izin browser'],
                        ['L2', 'Operator / Admin unit', 'Data master, penugasan, tiket'],
                        ['L3', 'Admin sistem / IT', 'Server, APIAMIS, deploy'],
                    ],
                    [1200, 3200, 4626],
                ),

                // === 9. CHECKLIST ===
                h1('9. Checklist Operasional'),
                h2('9.1 Admin — Mingguan'),
                table(
                    ['☐', 'Item'],
                    [
                        ['☐', 'Cek dashboard & data quality stats'],
                        ['☐', 'Review tiket terbuka'],
                        ['☐', 'Verifikasi penugasan pengawas (/user-pekerjaan)'],
                        ['☐', 'Kontrak & register dokumen lengkap'],
                        ['☐', 'Broadcast notifikasi deadline laporan'],
                    ],
                    [800, 8226],
                ),
                spacer(),
                h2('9.2 Pengawas — Harian/Mingguan'),
                table(
                    ['☐', 'Item', 'Frekuensi'],
                    [
                        ['☐', 'Login & cek dashboard KPI', 'Harian'],
                        ['☐', 'Tindaklanjuti paket perlu perhatian', 'Harian'],
                        ['☐', 'Upload foto slot kosong', 'Per kunjungan'],
                        ['☐', 'Isi progress minggu aktif', 'Mingguan (sebelum Jumat)'],
                        ['☐', 'Buat tiket jika kendala', 'Sesuai kejadian'],
                        ['☐', 'Cek notifikasi kantor', 'Harian'],
                    ],
                    [800, 5226, 3000],
                ),
                spacer(),
                h2('9.3 Operator — Input Data'),
                table(
                    ['☐', 'Item'],
                    [
                        ['☐', 'Kegiatan & pekerjaan baru lengkap'],
                        ['☐', 'Output & penerima sinkron RAB'],
                        ['☐', 'Berkas kontrak terupload'],
                        ['☐', 'Koordinat desa valid untuk geo-fencing'],
                    ],
                    [800, 8226],
                ),

                // === LAMPIRAN ===
                h1('Lampiran — Referensi Dokumen'),
                table(
                    ['Dokumen', 'Lokasi'],
                    [
                        ['SOP (Markdown)', 'docs/SOP-PENGGUNAAN-ARUMANIS.md'],
                        ['Panduan modul', 'docs/user-guide/'],
                        ['Panel pengawasan', 'docs/user-guide/pengawas-panel.md'],
                        ['Petunjuk teknis Word', 'docs/Petunjuk_Teknis_Aplikasi_Arumanis.docx'],
                        ['Changelog publik', 'arumanis.cianjurkab.go.id/changelog'],
                        ['Lineage platform', 'LINEAGE.md'],
                    ],
                    [3500, 5526],
                ),
                spacer(),
                p(
                    'Regenerasi dokumen Word: bun run docs:sop · Sumber kebenaran fitur: CHANGELOG.md v0.5.0',
                    { italics: true },
                ),
            ],
        },
    ],
})

const buffer = await Packer.toBuffer(doc)
try {
    fs.writeFileSync(OUT_PATH, buffer)
    console.log(`✓ SOP Word tersimpan: ${OUT_PATH}`)
} catch (err) {
    if (err.code === 'EBUSY') {
        const alt = OUT_PATH.replace(/\.docx$/, '_baru.docx')
        fs.writeFileSync(alt, buffer)
        console.log(`⚠ File terkunci. Disimpan ke: ${alt}`)
    } else {
        throw err
    }
}