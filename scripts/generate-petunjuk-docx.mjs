import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    AlignmentType,
    Document,
    Footer,
    HeadingLevel,
    ImageRun,
    LevelFormat,
    Packer,
    PageNumber,
    Paragraph,
    TextRun,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_PATH = path.join(ROOT, 'docs', 'Petunjuk_Teknis_Aplikasi_Arumanis.docx')
const SCREENSHOTS_DIR = path.join(ROOT, 'docs', 'screenshots')
const IMG_WIDTH = 500

const SCREENSHOTS = [
    { file: 'sign-in.png', caption: 'Gambar 1. Halaman masuk (Sign In) — /sign-in' },
    { file: 'dashboard.png', caption: 'Gambar 2. Dashboard — ringkasan metrik program' },
    { file: 'kegiatan.png', caption: 'Gambar 3. Program Kegiatan — /kegiatan' },
    { file: 'pekerjaan.png', caption: 'Gambar 4. Daftar Pekerjaan — /pekerjaan' },
    { file: 'kontrak.png', caption: 'Gambar 5. Pengelolaan Kontrak — /kontrak' },
    { file: 'spam-unit.png', caption: 'Gambar 6. Aset & Capaian SPAM — /spam-unit' },
    { file: 'capaian-sanitasi.png', caption: 'Gambar 7. SPM Sanitasi — /spm-sanitasi' },
    { file: 'capaian-air-minum.png', caption: 'Gambar 8. Peta Progress — /map' },
    { file: 'foto.png', caption: 'Gambar 9. Galeri Foto — /foto' },
    { file: 'berkas.png', caption: 'Gambar 10. Manajemen Berkas — /berkas' },
    { file: 'pengawas.png', caption: 'Gambar 11. Panel Pengawasan — Dashboard (impersonate FITRI ANITA, role user pengawas)' },
    { file: 'pengawas-pekerjaan.png', caption: 'Gambar 12. Panel Pengawasan — Daftar Pekerjaan (/pengawasan/pekerjaan)' },
    { file: 'pengawas-detail.png', caption: 'Gambar 13. Panel Pengawasan — Detail Pekerjaan, tab Ringkasan' },
    { file: 'pengawas-foto.png', caption: 'Gambar 14. Panel Pengawasan — Tab Foto (slot 0%–100% ber-GPS)' },
    { file: 'pengawas-buat-laporan.png', caption: 'Gambar 15. Panel Pengawasan — Buat Laporan mingguan' },
    { file: 'pengawas-tiket.png', caption: 'Gambar 16. Panel Pengawasan — Tiket kendala lapangan' },
    { file: 'tiket.png', caption: 'Gambar 17. Tiket & Laporan Arumanis Utama — /tiket' },
    { file: 'users.png', caption: 'Gambar 18. Manajemen User & tombol Impersonate — /users (admin)' },
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
        if (paragraph) blocks.push(paragraph, caption(shot.caption))
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
                                    text: 'Petunjuk Teknis Aplikasi Arumanis — Halaman ',
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
                    children: [
                        new TextRun({ text: 'PETUNJUK TEKNIS PENGGUNAAN', bold: true, size: 34 }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [new TextRun({ text: 'APLIKASI ARUMANIS', bold: true, size: 38 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [
                        new TextRun({
                            text: 'Air Minum & Sanitasi Kabupaten Cianjur',
                            size: 26,
                        }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 360 },
                    children: [
                        new TextRun({
                            text: 'Dokumen Panduan Operasional untuk Admin, Operator, Viewer, dan Pengawas',
                            italics: true,
                            size: 22,
                        }),
                    ],
                }),
                p('Versi dokumen: 1.0 · Juni 2026'),
                p('URL produksi: https://arumanis.cianjur.space'),
                p('API backend: https://apiamis.cianjur.space'),
                p(
                    'Sumber referensi internal: docs/user-guide/ · Panduan publik: /docs/index.html',
                    { italics: true },
                ),

                h1('BAB I  PENDAHULUAN'),
                h2('1.1  Tentang Aplikasi'),
                p(
                    'ARUMANIS (Air Minum & Sanitasi Cianjur) adalah sistem informasi manajemen program air minum dan sanitasi untuk Kabupaten Cianjur. Aplikasi digunakan untuk perencanaan kegiatan, pelaksanaan pekerjaan, pengelolaan kontrak, dokumentasi lapangan, pelaporan progress, capaian Standar Pelayanan Minimum (SPM), dan pemantauan oleh pengawas.',
                ),
                p('Aplikasi terdiri dari dua bagian utama:'),
                bullet('bullets', 'Arumanis Utama (/) — kantor pusat: master data, dashboard, kontrak, berkas, administrasi akses'),
                bullet('bullets', 'Panel Pengawasan (/pengawasan/) — aplikasi lapangan untuk pengawas dan konsultan pengawas'),

                h2('1.2  Persyaratan Sistem'),
                bullet('numbers', 'Browser: Google Chrome, Mozilla Firefox, atau Microsoft Edge versi terbaru'),
                bullet('numbers', 'Koneksi internet stabil'),
                bullet('numbers', 'Akun apiamis aktif (email dan password dari administrator)'),
                bullet('numbers', 'Perangkat mobile/desktop dengan resolusi layar minimal 1280×720 (disarankan)'),

                h2('1.3  Cara Mengakses'),
                bullet('numbers', 'Buka browser dan kunjungi https://arumanis.cianjur.space'),
                bullet('numbers', 'Halaman Sign In (/sign-in) akan tampil jika belum login'),
                bullet('numbers', 'Masukkan email dan password, lalu klik SIGN IN'),
                bullet('numbers', 'Alternatif: tombol GOOGLE untuk login OAuth (jika diaktifkan admin)'),
                bullet('numbers', 'Setelah berhasil, pengguna diarahkan ke Dashboard atau Panel Pengawasan sesuai role'),

                h1('BAB II  NAVIGASI DAN ANTARMUKA'),
                h2('2.1  Tata Letak Halaman'),
                p(
                    'Setelah login, tampilan Arumanis Utama terdiri dari Header (atas), Sidebar (kiri), dan Area Konten Utama. Header berisi logo, pemilih tahun anggaran (Fiscal Year), pencarian global (Ctrl+K), toggle tema terang/gelap, notifikasi, dan menu pengguna. Sidebar menampilkan modul sesuai hak akses role.',
                ),

                h2('2.2  Menu Sidebar (Arumanis Utama)'),
                h3('Dashboard & Layanan'),
                bullet('bullets', 'Dashboard (/dashboard) — ringkasan metrik dan grafik'),
                bullet('bullets', 'Rekap Progress (/progress_rekap) — progress pekerjaan'),
                bullet('bullets', 'Tiket & Laporan (/tiket) — pelaporan masalah'),
                bullet('bullets', 'Pusat Notifikasi (/notifications)'),
                bullet('bullets', 'Asisten AI (/chat) — Ami AI untuk penafsiran data'),

                h3('Master Data'),
                bullet('bullets', 'Program Kegiatan (/kegiatan)'),
                bullet('bullets', 'Kecamatan (/kecamatan) · Desa (/desa)'),
                bullet('bullets', 'Pekerjaan (/pekerjaan) · Draft Pekerjaan (/draft-pekerjaan)'),
                bullet('bullets', 'Aset & Capaian SPAM (/spam-unit) · SPM Sanitasi (/spm-sanitasi)'),
                bullet('bullets', 'Penyedia (/penyedia) · Kontrak (/kontrak) · Addendum (/kontrak-addendums)'),
                bullet('bullets', 'Output (/output) · Penerima (/penerima) · Pengawas (/pengawas)'),

                h3('Dokumentasi & Visualisasi'),
                bullet('bullets', 'Foto (/foto) · Berkas (/berkas)'),
                bullet('bullets', 'Peta Progress (/map) — peta sebaran pekerjaan'),
                bullet('bullets', 'Simulasi Jaringan (/simulation)'),
                bullet('bullets', 'Manajemen Publikasi (/manajemen-publikasi)'),

                h3('Akses & Pengaturan (Admin)'),
                bullet('bullets', 'Users, Roles, Permissions, Route Permissions, Menu Permissions'),
                bullet('bullets', 'Audit Trail, Settings, Assign Pekerjaan, Broadcast Notifikasi, WhatsApp'),

                h2('2.3  Komponen UI Dasar'),
                p(
                    'Gunakan tombol primary untuk aksi utama (Simpan, Tambah), destructive untuk hapus, dan dialog konfirmasi sebelum aksi tidak dapat dibatalkan. Tabel mendukung sorting (klik header), pagination, dan filter. Form memakai validasi real-time; pesan error tampil di bawah field atau sebagai toast di pojok kanan atas.',
                ),

                h1('BAB III  MODUL UTAMA'),
                h2('3.1  Dashboard (/dashboard)'),
                p(
                    'Dashboard menampilkan statistik kegiatan, pekerjaan, kontrak, output, penerima, dan indikator kualitas data. Pilih tahun anggaran di header untuk memfilter seluruh widget. Tab tersedia: Lounge, Overview, Analytics, Calendar, Reports.',
                ),
                bullet('bullets', 'KegiatanStats: total kegiatan, pagu, pekerjaan, kontrak, output, penerima'),
                bullet('bullets', 'Grafik: kegiatan per tahun, sumber dana, pekerjaan per kecamatan/desa'),
                bullet('bullets', 'Data Quality Stats: pekerjaan tanpa koordinat, foto, atau kontrak'),

                h2('3.2  Program Kegiatan (/kegiatan)'),
                p('Kegiatan adalah program induk dengan pagu anggaran dan sumber dana (APBD, APBN, lainnya).'),
                bullet('numbers', 'Klik Tambah Kegiatan → isi nama, kode (unik), sumber dana, pagu, tahun'),
                bullet('numbers', 'Simpan → kegiatan dapat ditautkan ke pekerjaan'),
                bullet('numbers', 'Edit/Hapus via ikon di baris tabel (hapus diblokir jika masih memiliki pekerjaan terkait)'),

                h2('3.3  Pekerjaan & Output'),
                p('Pekerjaan (/pekerjaan) adalah proyek turunan kegiatan di tingkat kecamatan/desa.'),
                bullet('numbers', 'Tambah Pekerjaan: pilih kegiatan, kecamatan, desa, isi kode unik, pagu, tahun'),
                bullet('numbers', 'Output (/output): catat hasil fisik per pekerjaan (volume, satuan, realisasi)'),
                bullet('numbers', 'Draft Pekerjaan: pekerjaan belum final → publikasikan menjadi aktif'),

                h2('3.4  Kontrak & Penyedia'),
                p('Kontrak (/kontrak) menghubungkan pekerjaan dengan penyedia/vendor.'),
                bullet('numbers', 'Pastikan pekerjaan dan penyedia sudah terdaftar'),
                bullet('numbers', 'Tambah Kontrak: nomor unik, nilai, tanggal mulai/selesai, status'),
                bullet('numbers', 'Addendum (/kontrak-addendums): perubahan nilai, waktu, atau ruang lingkup'),

                h2('3.5  Penerima Manfaat (/penerima)'),
                p(
                    'Kelola data penerima individu atau komunal. Filter berdasarkan kecamatan/desa atau cari via NIK/nama. Klik baris untuk melihat detail lengkap.',
                ),

                h2('3.6  SPAM Unit (/spam-unit)'),
                p(
                    'Modul unit Sarana Penyediaan Air Minum perdesaan. Mencatat kapasitas, pengelola (POKMAS), capaian SR/KK/jiwa, integrasi SIMSPAM, dan rencana anggaran. Mendukung impor data massal CSV/Excel.',
                ),

                h2('3.7  SPM Sanitasi (/spm-sanitasi)'),
                p(
                    'Pemantauan infrastruktur sanitasi (SPALD-T, SPALD-S, IPLT) dan capaian pemanfaat per desa. Gunakan filter kecamatan, desa, dan tahun untuk evaluasi program air limbah.',
                ),

                h2('3.8  Berkas & Foto'),
                p('Berkas (/berkas): unggah dokumen PDF, DOC, XLS terkait pekerjaan (kontrak, laporan, RAB).'),
                p('Foto (/foto): galeri dokumentasi umum per pekerjaan (JPG, PNG, WebP).'),
                p(
                    'Catatan: pengawas lapangan mengunggah foto progress ber-slot (0%–100%) dan ber-GPS melalui Panel Pengawasan, bukan modul /foto utama.',
                ),

                h2('3.9  Peta Progress (/map)'),
                p(
                    'Visualisasi geografis sebaran pekerjaan dan progress di peta digital. Gunakan untuk review spasial lintas 33 kecamatan dan 365 desa/kelurahan.',
                ),

                h2('3.10  Halaman Publik'),
                p(
                    'Landing page (/) menampilkan capaian SPM air minum dan sanitasi per desa tanpa login — peta choropleth interaktif di bagian #capaian-spm. Publikasi tersedia di /publikasi.',
                ),

                h1('BAB IV  PANEL PENGAWASAN'),
                h2('4.1  Akses dan SSO'),
                p(
                    'Panel Pengawasan tidak memiliki form login terpisah. Pengguna dengan role pengawas atau konsultan_pengawas login di /sign-in Arumanis, lalu diarahkan otomatis ke /pengawasan/ via SSO (token handoff → cookie pengawas_session).',
                ),
                p(
                    'Admin dan manager tetap di Arumanis utama. Admin dapat impersonate pengawas dari halaman Users (tombol Impersonate pada baris user) untuk meninjau tampilan lapangan — browser diarahkan ke /pengawasan/login?code=... lalu masuk dashboard panel atas nama pengawas tersebut.',
                ),
                p(
                    'Cuplikan layar Panel Pengawasan dalam Lampiran A diambil dengan impersonate akun FITRI ANITA (beatrix3181@gmail.com, role user pengawas) dari akun admin.',
                ),

                h2('4.2  Menu Panel Pengawasan'),
                bullet('bullets', 'Dashboard — KPI dan paket perlu perhatian'),
                bullet('bullets', 'Pekerjaan — daftar paket yang ditugaskan'),
                bullet('bullets', 'Buat Laporan — input rencana dan realisasi mingguan (RAB)'),
                bullet('bullets', 'Tiket — laporan kendala lapangan'),
                bullet('bullets', 'Notifikasi · Panduan · Profil'),

                h2('4.3  Detail Pekerjaan (6 Tab)'),
                bullet('bullets', 'Ringkasan — kegiatan, lokasi, pagu, status foto'),
                bullet('bullets', 'Output — komponen pekerjaan'),
                bullet('bullets', 'Penerima — data individu/komunal, NIK, jiwa'),
                bullet('bullets', 'Foto — matriks output × slot 0%, 25%, 50%, 75%, 100% (GPS wajib)'),
                bullet('bullets', 'Progress — estimasi fisik dan keuangan mingguan'),
                bullet('bullets', 'Tiket — kendala terkait paket'),

                h2('4.4  Alur Kerja Pengawas Mingguan'),
                bullet('numbers', 'Login → masuk Panel Pengawasan'),
                bullet('numbers', 'Buka pekerjaan → tab Foto → unggah slot progress yang kosong'),
                bullet('numbers', 'Tab Progress / Buat Laporan → isi rencana dan realisasi minggu ini'),
                bullet('numbers', 'Jika ada kendala → buat Tiket'),
                bullet('numbers', 'Verifikasi status paket: Belum ada foto / Belum Selesai / Selesai'),

                h1('BAB V  MANAJEMEN AKSES'),
                h2('5.1  Peran Pengguna'),
                bullet('bullets', 'Admin — akses penuh, kelola user/role, impersonasi, bypass route permission'),
                bullet('bullets', 'Operator — tambah/edit data di wilayah tugas, upload berkas/foto'),
                bullet('bullets', 'Viewer — hanya melihat data'),
                bullet('bullets', 'Pengawas / Konsultan Pengawas — Panel Pengawasan via SSO'),

                h2('5.2  Route Permission'),
                p(
                    'Admin dapat membatasi akses route per role di menu Route Permissions. Admin selalu bypass. Jika menu tidak muncul di sidebar, kemungkinan route permission atau menu permission membatasi role Anda — hubungi administrator.',
                ),

                h2('5.3  Logout'),
                bullet('numbers', 'Klik avatar/nama di header → Logout'),
                bullet('numbers', 'Session berakhir → otomatis kembali ke /sign-in'),
                bullet('numbers', 'Panel Pengawasan: logout sidebar → kembali ke /sign-in Arumanis'),

                h1('BAB VI  SKENARIO PENGGUNAAN'),
                h2('6.1  Input Kegiatan Baru + Pekerjaan + Dokumentasi'),
                bullet('numbers', 'Login → Dashboard'),
                bullet('numbers', 'Kegiatan → Tambah (nama, kode, sumber dana, pagu)'),
                bullet('numbers', 'Pekerjaan → Tambah (kegiatan, kecamatan, desa)'),
                bullet('numbers', 'Output → Tambah hasil fisik'),
                bullet('numbers', 'Berkas/Foto → unggah dokumentasi'),
                bullet('numbers', 'Dashboard → verifikasi metrik terupdate'),

                h2('6.2  Kontrak Baru'),
                bullet('numbers', 'Pastikan pekerjaan dan penyedia terdaftar'),
                bullet('numbers', 'Kontrak → Tambah → isi nomor, nilai, tanggal'),
                bullet('numbers', 'Addendum bila ada perubahan kontrak'),

                h2('6.3  Review Progress'),
                bullet('numbers', 'Dashboard → pilih tahun anggaran'),
                bullet('numbers', 'Rekap Progress / Peta Progress / modul Foto'),
                bullet('numbers', 'Perbaiki gap dari Data Quality Stats'),

                h2('6.4  Manajemen User (Admin)'),
                bullet('numbers', 'Roles → pastikan role tersedia'),
                bullet('numbers', 'Route Permissions → atur akses'),
                bullet('numbers', 'Users → Tambah akun (nama, email, password, role)'),
                bullet('numbers', 'Assign Pekerjaan (opsional)'),

                h1('BAB VII  PEMECAHAN MASALAH'),
                h2('7.1  Masalah Login'),
                bullet('bullets', 'Invalid email or password — periksa kredensial'),
                bullet('bullets', 'Session expired / 401 — login ulang'),
                bullet('bullets', 'Account inactive — hubungi admin'),

                h2('7.2  Error Akses'),
                bullet('bullets', '403 Forbidden — role tidak memiliki izin; hubungi admin'),
                bullet('bullets', '404 Not Found — periksa URL atau data sudah dihapus'),

                h2('7.3  Upload Gagal'),
                bullet('bullets', 'File terlalu besar — kompres (batas umum 5–10 MB)'),
                bullet('bullets', 'Tipe tidak didukung — gunakan JPG/PNG/PDF/DOC/XLS'),
                bullet('bullets', 'Gagal upload — cek koneksi, coba refresh'),

                h2('7.4  Panel Pengawasan'),
                bullet('bullets', 'Loop redirect token — pastikan build terbaru; masuk lewat /sign-in Arumanis'),
                bullet('bullets', '401 di panel — klik Masuk ulang'),
                bullet('bullets', 'GPS gagal — izinkan lokasi browser atau isi koordinat manual'),
                bullet('bullets', 'Progress tidak tersimpan — pastikan ada perubahan Rencana/Realisasi'),

                h2('7.5  Langkah Umum'),
                bullet('numbers', 'Refresh halaman (F5)'),
                bullet('numbers', 'Logout → login ulang'),
                bullet('numbers', 'Coba browser lain atau mode incognito'),
                bullet('numbers', 'Hubungi administrator sistem'),

                h1('LAMPIRAN A  CUPLIKAN LAYAR'),
                p(
                    'Gambar berikut diambil otomatis dari lingkungan produksi https://arumanis.cianjur.space per Juni 2026 menggunakan PinchTab. Modul Arumanis Utama diambil dengan akun admin; Panel Pengawasan (Gambar 11–16) diambil setelah admin melakukan Impersonate pada user FITRI ANITA (role pengawas).',
                ),
                ...buildScreenshotBlocks(),

                h1('LAMPIRAN B  GLOSARIUM SINGKAT'),
                bullet('bullets', 'ARUMANIS — Air Minum & Sanitasi Cianjur'),
                bullet('bullets', 'SPAM — Sarana Penyediaan Air Minum'),
                bullet('bullets', 'SPM — Standar Pelayanan Minimum'),
                bullet('bullets', 'SPALD-T/S — Sistem Pengolahan Air Limbah Domestik'),
                bullet('bullets', 'POKMAS — Kelompok masyarakat pengelola unit SPAM'),
                bullet('bullets', 'Pagu — Anggaran program (Rupiah)'),
                bullet('bullets', 'Fiscal Year — Tahun anggaran yang dipilih di header'),
                bullet('bullets', 'SSO — Single Sign-On ke Panel Pengawasan'),
                bullet('bullets', 'RBAC — Role-Based Access Control'),

                p(
                    'Dokumen ini disusun dari docs/user-guide/. Regenerasi: bun run proposal:guide',
                    { italics: true },
                ),
            ],
        },
    ],
})

const buffer = await Packer.toBuffer(doc)
try {
    fs.writeFileSync(OUT_PATH, buffer)
    console.log(`✓ Petunjuk aplikasi tersimpan: ${OUT_PATH}`)
} catch (err) {
    if (err.code === 'EBUSY') {
        const alt = OUT_PATH.replace(/\.docx$/, '_baru.docx')
        fs.writeFileSync(alt, buffer)
        console.log(`⚠ File terkunci. Disimpan ke: ${alt}`)
    } else {
        throw err
    }
}