import { formatCurrency } from '@/lib/format'
import type { UnitSpamStats } from '@/features/spam-unit/types'

export type InnovationMetrics = {
    units: number
    simspam: number
    nonSimspam: number
    desaWilayah: number
    desaMap: number
    kecamatan: number
    targetKk: number
    srKk: number
    jiwa: number
    bjpKk: number
    coverage: number
    achievements: number
    kontrak: number
    pekerjaan: number
    foto: number
    scopeLabel: string
    generatedAt: Date | null
}

export function formatCount(value: number) {
    return value.toLocaleString('id-ID')
}

export function formatCoverage(value: number) {
    return value.toLocaleString('id-ID', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })
}

export function buildInnovationMetrics(
    stats?: UnitSpamStats | null,
    mapDesaCount?: number | null,
): InnovationMetrics | null {
    if (!stats) return null

    return {
        units: stats.total_units,
        simspam: stats.simspam_count,
        nonSimspam: stats.non_simspam_count,
        desaWilayah: stats.wilayah_total_desa ?? 0,
        desaMap: mapDesaCount ?? stats.wilayah_total_desa ?? 0,
        kecamatan: stats.wilayah_total_kecamatan ?? 0,
        targetKk: stats.ringkasan?.spm?.target_kk ?? stats.total_target,
        srKk: stats.ringkasan?.capaian.kk ?? stats.capaian_kk ?? stats.total_kk,
        jiwa: stats.ringkasan?.capaian.jiwa ?? stats.capaian_jiwa ?? stats.total_jiwa,
        bjpKk: stats.total_bjp_kk,
        coverage: stats.ringkasan?.spm?.coverage_percentage ?? stats.coverage_percentage,
        achievements: stats.achievement_records ?? 0,
        kontrak: stats.manual_nilai_kontrak ?? 0,
        pekerjaan: stats.total_pekerjaan_all ?? stats.total_pekerjaan ?? 0,
        foto: stats.total_foto_dokumentasi ?? 0,
        scopeLabel: stats.ringkasan?.scope_label ?? stats.manual_scope_label ?? stats.target_year,
        generatedAt: stats.stats_generated_at ? new Date(stats.stats_generated_at) : null,
    }
}

export function buildCapaianTableRows(metrics: InnovationMetrics): [string, string][] {
    return [
        [
            'Unit SPAM terdata',
            `${formatCount(metrics.units)} unit (${formatCount(metrics.simspam)} SIMSPAM, ${formatCount(metrics.nonSimspam)} non-SIMSPAM)`,
        ],
        ['Desa dengan data peta SPM air minum', `${formatCount(metrics.desaMap)} desa`],
        ['Wilayah administrasi', `${formatCount(metrics.kecamatan)} kecamatan · ${formatCount(metrics.desaWilayah)} desa/kelurahan`],
        ['Target KK (master desa)', `${formatCount(metrics.targetKk)} KK`],
        [`Capaian SR / KK (${metrics.scopeLabel})`, formatCount(metrics.srKk)],
        ['Capaian jiwa terlayani', `${formatCount(metrics.jiwa)} jiwa`],
        ['Capaian BJP (KK)', `${formatCount(metrics.bjpKk)} KK`],
        ['Persentase capaian SPM air minum', `${formatCoverage(metrics.coverage)}%`],
        ['Capaian SPM sanitasi', 'Dalam pengembangan — indikator & visualisasi menyusul'],
        ['Record capaian tahunan (achievement)', `${formatCount(metrics.achievements)} entri`],
        ['Nilai kontrak SPAM terdata', formatCurrency(metrics.kontrak)],
        ['Paket pekerjaan terpantau', `${formatCount(metrics.pekerjaan)} paket`],
        ['Dokumentasi foto progres', `${formatCount(metrics.foto)} berkas`],
    ]
}

export function formatGeneratedAtLabel(date: Date | null) {
    if (!date) return null
    return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function buildIntegrasiSesudahRows(m: InnovationMetrics): [string, string, string][] {
    return [
        ['Sumber data SPAM & proyek', '4–6 format (Excel, PDF, WA, berkas fisik)', '1 platform — Arumanis + api amis'],
        ['Unit SPAM terdigitalisasi', 'Tersebar per kecamatan', `${formatCount(m.units)} unit dalam satu basis data`],
        [
            `Rekapitulasi SPM air minum ${formatCount(m.desaWilayah)} desa`,
            '5–10 hari kerja / triwulan',
            `< 1 hari — agregasi otomatis (${formatCount(m.srKk)} SR/KK, ${formatCount(m.jiwa)} jiwa, coverage ${formatCoverage(m.coverage)}%)`,
        ],
        ['Risiko inkonsistensi data', 'Tinggi (input manual berulang)', 'Rendah — validasi server'],
    ]
}

export function buildMonitoringSesudahRows(m: InnovationMetrics): [string, string, string][] {
    return [
        ['Paket pekerjaan terpantau', 'Tidak terstandar / per berkas', `${formatCount(m.pekerjaan)} paket dalam modul pekerjaan`],
        ['Interval update progres', '2–4 minggu (laporan dokumen)', 'Mingguan — Panel Pengawasan + Puspen'],
        ['Dokumentasi foto terpusat', 'Tersebar di perangkat pengawas', `${formatCount(m.foto)} foto terindeks + GPS`],
        ['Identifikasi deviasi', 'Setelah laporan bulanan', 'Real-time — dashboard KPI & deviasi'],
    ]
}

export function buildSpmSesudahRows(m: InnovationMetrics): [string, string, string][] {
    const desaCoverage =
        m.desaWilayah > 0 ? ((m.units / m.desaWilayah) * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 }) : '0'
    return [
        [
            'Unit SPAM digital per desa',
            'Estimasi < 50% desa',
            `${formatCount(m.units)} unit / ${formatCount(m.desaWilayah)} wilayah (≈ ${desaCoverage}%)`,
        ],
        ['Record capaian SPM air minum per tahun', 'Berkas/Excel per unit', `${formatCount(m.achievements)} record achievement terstruktur`],
        ['Visualisasi capaian air minum per desa', 'Peta statis / tabel Excel', `Peta choropleth interaktif ${formatCount(m.desaMap)} desa`],
        ['Akses publik capaian SPM air minum', 'Tidak tersedia / berkas fisik', '24/7 di arumanis.cianjur.space'],
        ['Capaian SPM sanitasi', 'Belum terdigitalisasi terpusat', 'Dalam pengembangan — modul & peta menyusul'],
    ]
}

export function buildAdminSesudahRows(m: InnovationMetrics): [string, string, string][] {
    return [
        ['Impor data SPAM massal', '3–5 hari (input manual)', '< 2 jam — impor CSV'],
        ['Nilai kontrak SPAM terkonsolidasi', 'Rekapitulasi manual', `${formatCurrency(m.kontrak)} terdata`],
        ['Laporan ekspor PDF/Excel', '1–2 hari per periode', '< 30 menit — generate otomatis'],
        ['Koordinasi pengawas–pusat', 'Telepon/WA tanpa audit trail', 'Terlacak — SSO, notifikasi, tiket'],
    ]
}

export function buildTujuanRows(m: InnovationMetrics): [string, string, string, string, string][] {
    return [
        [
            'T1',
            'Menyatukan data unit SPAM, capaian SPM, dan proyek air minum–sanitasi dalam satu basis data terintegrasi di seluruh Kabupaten Cianjur',
            'Jumlah unit SPAM terdigitalisasi; jumlah sumber data aktif',
            `Saat ini ${formatCount(m.units)} unit tercatat (target ≥ 360 unit Des 2026)`,
            'Fragmentasi data (makro); input ulang data (mikro — operator)',
        ],
        [
            'T2',
            'Meningkatkan akurasi dan kecepatan rekapitulasi capaian SPM air minum per desa',
            'Waktu rekapitulasi lintas desa; selisih data antar laporan',
            `Rekapitulasi < 1 hari; capaian ${formatCoverage(m.coverage)}% dari ${formatCount(m.targetKk)} KK target`,
            'Kesenjangan capaian SPM (makro); inkonsistensi SR/KK (mikro — operator)',
        ],
        [
            'T3',
            `Mempercepat monitoring dan pengawasan ${formatCount(m.pekerjaan)} paket pekerjaan infrastruktur melalui alur digital lapangan–kantor`,
            'Interval pembaruan progres; jumlah foto terindeks GPS',
            `Update progres mingguan; ${formatCount(m.foto)} foto terindeks (target ≥ 90% bermetadata GPS Des 2026)`,
            'Keterbatasan monitoring real-time (makro); dokumentasi terpisah (mikro — pengawas)',
        ],
        [
            'T4',
            'Menyediakan akses informasi capaian SPM air minum yang terbuka dan dapat dipertanggungjawabkan kepada masyarakat',
            'Ketersediaan peta publik; jumlah desa divisualisasikan',
            `Peta capaian air minum ${formatCount(m.desaMap)} desa dapat diakses 24/7 tanpa login (SPM sanitasi dalam pengembangan)`,
            'Tuntutan transparansi publik (makro); akses informasi desa sulit (mikro — masyarakat)',
        ],
        [
            'T5',
            'Mendukung transformasi digital SPBE pada program air minum dan sanitasi DPKP Cianjur',
            'Adopsi pengguna aktif; modul terintegrasi SSO',
            '≥ 80% operator/pengawas target menggunakan sistem sebagai sumber utama data pada Des 2026',
            'Transformasi digital birokrasi (makro); koordinasi manual (mikro — manajer proyek)',
        ],
        [
            'T6',
            'Menguatkan evaluasi kinerja unit SPAM desa (POKMAS, kapasitas, anggaran, capaian tahunan) secara berkala',
            'Kelengkapan profil unit; record capaian per tahun',
            `${formatCount(m.units)} unit · ${formatCount(m.achievements)} achievement (target ≥ 95% profil lengkap Des 2026)`,
            'Data POKMAS tidak terdokumentasi (mikro — unit SPAM desa)',
        ],
    ]
}

export function buildHasilUtamaRows(m: InnovationMetrics): [string, string, string, string][] {
    return [
        ['H1', 'Platform Arumanis Utama', 'Dashboard, pekerjaan, SPAM, users, notifikasi, Ami AI', 'arumanis.cianjur.space'],
        ['H2', 'Panel Pengawasan Terintegrasi', 'Progress, foto GPS, laporan mingguan, tiket; SSO', 'Route /pengawasan/ — satu akun'],
        ['H3', 'Backend API (api amis)', 'REST API Laravel: data, validasi, role/permission', 'apiamis.cianjur.space'],
        [
            'H4',
            'Basis Data Terintegrasi SPAM–SPM',
            'Desa, unit SPAM, achievement, anggaran, pekerjaan, foto',
            `${formatCount(m.units)} unit · ${formatCount(m.achievements)} achievement · ${formatCount(m.desaWilayah)} desa`,
        ],
        ['H5', 'Halaman Publik Capaian SPM Air Minum', 'Landing page peta choropleth Kab. Cianjur (SPM sanitasi dalam pengembangan)', 'API publik stats & map-stats'],
        ['H6', 'Modul SPAM Unit', 'CRUD unit, capaian SPM air minum, POKMAS, anggaran, impor CSV/Excel', 'Route /spam-unit'],
        ['H7', 'Modul Monitoring Pekerjaan & Puspen', 'Paket, progress estimasi, sinkronisasi Panel Pengawasan', `${formatCount(m.pekerjaan)} paket pekerjaan terdata`],
        ['H8', 'Repositori Dokumentasi Lapangan', 'Foto progres berslot dan metadata GPS', `${formatCount(m.foto)} berkas foto terindeks`],
        ['H9', 'Sistem Notifikasi & Tiket', 'Broadcast pengumuman dan pelacakan kendala', 'Modul notifikasi & tiket berstatus'],
        ['H10', 'Dokumentasi Pengguna', 'Panduan operator, pengawas, dan publik', '/docs/index.html'],
    ]
}

export function buildManfaatVsHasilRows(m: InnovationMetrics): [string, string, string][] {
    return [
        ['Sifat', 'Perubahan kondisi / dampak yang dirasakan', 'Produk, sistem, atau data yang dihasilkan'],
        ['Contoh 1', 'Rekapitulasi SPM air minum lebih cepat (< 1 hari)', `Platform Arumanis + API + database ${formatCount(m.units)} unit`],
        ['Contoh 2', 'Masyarakat lebih mudah memantau capaian air minum desa', `Landing + peta choropleth ${formatCount(m.desaMap)} desa`],
        ['Contoh 3', 'Pengawasan lapangan lebih akuntabel', `Panel Pengawasan + ${formatCount(m.foto)} foto GPS + laporan mingguan`],
        ['Contoh 4', `Keputusan program berbasis data SPM air minum ${formatCoverage(m.coverage)}%`, 'Dashboard KPI + modul SPAM Unit + export laporan (SPM sanitasi menyusul)'],
    ]
}

export function buildDecisionSesudahRows(m: InnovationMetrics): [string, string, string][] {
    return [
        [
            'KPI dashboard SPAM',
            'Tidak ada / manual',
            `Real-time: ${formatCount(m.units)} unit · ${formatCount(m.srKk)} KK · goal ${formatCoverage(m.coverage)}%`,
        ],
        ['Analisis pertanyaan natural', 'Tidak tersedia', 'Asisten Ami AI'],
        [
            'Filter kecamatan/desa/tahun',
            'Manual pivot tabel',
            `Instant — ${formatCount(m.kecamatan)} kecamatan, ${formatCount(m.desaWilayah)} desa`,
        ],
        [
            'Status registrasi SIMSPAM',
            'Tidak terpantau terpusat',
            `${formatCount(m.simspam)} SIMSPAM · ${formatCount(m.nonSimspam)} non-SIMSPAM`,
        ],
    ]
}