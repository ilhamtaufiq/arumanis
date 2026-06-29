import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Layers } from 'lucide-react'
import { InnovationCapaianTable } from './components/innovation-capaian-table'
import { InnovationLiveBadge } from './components/innovation-live-badge'
import { InnovationSpmScopeCallout } from './components/innovation-spm-scope-callout'
import { usePublicInnovationStats } from './hooks/use-public-innovation-stats'
import {
    buildAdminSesudahRows,
    buildDecisionSesudahRows,
    buildIntegrasiSesudahRows,
    buildMonitoringSesudahRows,
    buildSpmSesudahRows,
    formatCount,
    formatCoverage,
    formatGeneratedAtLabel,
    type InnovationMetrics,
} from './lib/innovation-stats'
import { trackVisitorEvent } from '@/lib/analytics/visitor-events'
import {
    INNOVATION_DOC_UPDATED_AT,
    LegalCallout,
    LegalFlowBlock,
    LegalList,
    LegalOrderedList,
    LegalPageLayout,
    LegalSection,
    LegalSubheading,
    LegalTable,
} from './legal-page-layout'

function BeforeAfterTable({ rows }: { rows: [string, string, string][] }) {
    return (
        <LegalTable
            headers={['Indikator', 'Sebelum Inovasi', 'Sesudah Inovasi']}
            rows={rows}
        />
    )
}

function SesudahTable({
    metrics,
    isLoading,
    buildRows,
    fallbackRows,
}: {
    metrics: InnovationMetrics | null
    isLoading: boolean
    buildRows: (m: InnovationMetrics) => [string, string, string][]
    fallbackRows: [string, string, string][]
}) {
    const rows = metrics && !isLoading ? buildRows(metrics) : fallbackRows
    return <BeforeAfterTable rows={rows} />
}

export function RancangBangunInovasi() {
    const { metrics, isLoading, isLive, refetch } = usePublicInnovationStats()

    useEffect(() => {
        void trackVisitorEvent('innovation_page_view', { page: 'rancang-bangun-inovasi' })
    }, [])

    return (
        <LegalPageLayout
            title='Rancang Bangun Inovasi'
            subtitle='Dokumentasi penyusunan Arumanis — DPKP Kabupaten Cianjur'
            icon={Layers}
            badge='Dokumen Inovasi'
            active='rancang-bangun-inovasi'
            backTo='/'
            updatedAt={INNOVATION_DOC_UPDATED_AT}
            footerNote='Dokumen inovasi Arumanis — melengkapi panduan operasional dan dokumen hukum.'
        >
            <LegalCallout>
                <strong>Arumanis</strong> (Aplikasi Satu Data Air Minum dan Sanitasi) — Dinas
                Perumahan dan Kawasan Permukiman Kabupaten Cianjur · 33 kecamatan, 365
                desa/kelurahan ·{' '}
                <a
                    href='https://arumanis.cianjur.space'
                    className='font-black underline underline-offset-2'
                >
                    arumanis.cianjur.space
                </a>
                . Tujuan dan hasil inovasi:{' '}
                <Link to='/tujuan-manfaat-hasil' className='font-black underline underline-offset-2'>
                    Tujuan, Manfaat, dan Hasil
                </Link>
                .
            </LegalCallout>

            <InnovationLiveBadge
                isLoading={isLoading}
                isLive={isLive}
                generatedAt={metrics?.generatedAt ?? null}
                onRefresh={refetch}
            />

            <InnovationSpmScopeCallout />

            <LegalSection id='dasar-hukum' title='A. Dasar Hukum'>
                <p>
                    Inovasi Arumanis disusun dan dioperasikan berlandaskan regulasi yang sah,
                    sebagai berikut:
                </p>

                <LegalSubheading>Undang-Undang</LegalSubheading>
                <LegalTable
                    compact
                    headers={['No.', 'Regulasi', 'Keterkaitan']}
                    rows={[
                        ['1', 'UU No. 17 Tahun 2019 tentang Sumber Daya Air', 'Pengelolaan sumber daya air dan penyediaan air minum'],
                        ['2', 'UU No. 23 Tahun 2014 tentang Pemerintahan Daerah', 'Kewenangan daerah dalam pembangunan dan pelayanan publik'],
                        ['3', 'UU No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik', 'Legalitas data dan transaksi elektronik dalam sistem'],
                        ['4', 'UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik', 'Keterbukaan capaian layanan air minum kepada masyarakat'],
                    ]}
                />

                <LegalSubheading>Peraturan Pemerintah dan Peraturan Menteri</LegalSubheading>
                <LegalTable
                    compact
                    headers={['No.', 'Regulasi', 'Keterkaitan']}
                    rows={[
                        ['1', 'PP No. 16 Tahun 2005 tentang Pengembangan SPAM', 'Standar pengembangan SPAM di tingkat daerah'],
                        ['2', 'Permen PUPR No. 18/PRT/M/2007 tentang Pedoman Pengembangan SPAM', 'Pedoman teknis unit SPAM dan capaian layanan'],
                        ['3', 'Permendagri No. 59 Tahun 2016 tentang Penerapan SPBE', 'Arsitektur dan tata kelola sistem elektronik daerah'],
                        ['4', 'Permendagri No. 108 Tahun 2016 tentang Pedoman Evaluasi SPBE', 'Evaluasi kualitas layanan sistem elektronik'],
                        ['5', 'Permen PUPR terkait SPM bidang air minum', 'Acuan capaian SR, KK, dan jiwa terlayani'],
                    ]}
                />

                <LegalSubheading>NSPK Kementerian/Lembaga</LegalSubheading>
                <LegalTable
                    compact
                    headers={['No.', 'Regulasi', 'Keterkaitan']}
                    rows={[
                        ['1', 'Permen PU No. 20 Tahun 2006 tentang Persyaratan Teknis SPAM', 'Standar teknis data aset SPAM'],
                        ['2', 'Pedoman SIMSPAM Kementerian PUPR', 'Integrasi status registrasi unit SPAM'],
                        ['3', 'SE Mendagri terkait Reformasi Birokrasi dan transformasi digital', 'Penguatan layanan digital terintegrasi'],
                    ]}
                />

                <LegalSubheading>Peraturan Daerah dan Peraturan Kepala Daerah</LegalSubheading>
                <LegalTable
                    compact
                    headers={['No.', 'Regulasi', 'Keterkaitan']}
                    rows={[
                        ['1', 'Perda Kab. Cianjur No. 14 Tahun 2021 tentang Perumdam Air Minum Tirta Mukti', 'Penyelenggaraan air minum melalui Perumdam daerah'],
                        ['2', 'Perda Kab. Cianjur No. 1 Tahun 2021 tentang Penyertaan Modal Perumdam', 'Pengawasan dan penanaman modal penyediaan air minum'],
                        ['3', 'Perda Kab. Cianjur No. 18 Tahun 2021 tentang Pembentukan Perangkat Daerah', 'Kedudukan DPKP sebagai pemilik program'],
                        ['4', 'Perbup Kab. Cianjur No. 102 Tahun 2021 tentang Tata Kerja DPKP', 'Unit pelaksana teknis data SPAM/SPM dan monitoring proyek'],
                        ['5', 'Perbup Kab. Cianjur No. 23 Tahun 2020 tentang RAD PAMSIMAS 2019–2023', 'Peta aksi peningkatan akses air minum perdesaan'],
                        ['6', 'RPJMD Kabupaten Cianjur Tahun 2025–2029', 'Arah strategis akses air minum layak dan infrastruktur permukiman'],
                        ['7', 'Kajian RISPAM Kabupaten Cianjur (BAPPERIDA)', 'Perencanaan jaringan dan prioritas intervensi SPAM'],
                    ]}
                />
            </LegalSection>

            <LegalSection id='permasalahan' title='B. Permasalahan'>
                <LegalSubheading>1. Permasalahan Makro</LegalSubheading>
                <LegalTable
                    headers={['Aspek', 'Uraian Permasalahan']}
                    rows={[
                        [
                            <strong key='p1'>Fragmentasi data</strong>,
                            'Data SPAM, SPM, progres pekerjaan, dan dokumentasi lapangan tersebar (Excel, berkas fisik, WhatsApp, laporan manual) — sulit dihimpun sebagai single source of truth.',
                        ],
                        [
                            <strong key='p2'>Keterbatasan monitoring real-time</strong>,
                            'Pengawasan proyek bergantung laporan dokumen; deviasi fisik/keuangan baru teridentifikasi setelah keterlambatan signifikan.',
                        ],
                        [
                            <strong key='p3'>Kesenjangan capaian SPM air minum</strong>,
                            metrics
                                ? `${formatCount(metrics.desaWilayah)} desa, ${formatCount(metrics.kecamatan)} kecamatan, ${formatCount(metrics.units)} unit SPAM; target ${formatCount(metrics.targetKk)} KK, capaian ${formatCoverage(metrics.coverage)}% — tanpa sistem terpadu, intervensi prioritas desa sulit proporsional.`
                                : '365 desa, 33 kecamatan, 364 unit SPAM; target 534.952 KK, capaian 13,2% — tanpa sistem terpadu, intervensi prioritas desa sulit proporsional.',
                        ],
                        [
                            <strong key='p4'>Tuntutan transparansi publik</strong>,
                            'Masyarakat menuntut akses informasi capaian yang dapat dipertanggungjawabkan; publikasi data masih ad hoc.',
                        ],
                        [
                            <strong key='p5'>Transformasi digital birokrasi</strong>,
                            'Belum tersedia platform yang menggabungkan aset SPAM, pelaksanaan pekerjaan, dan pengawasan lapangan dalam satu ekosistem.',
                        ],
                    ]}
                />

                <LegalSubheading>2. Permasalahan Mikro</LegalSubheading>
                <LegalTable
                    headers={['Pelaku', 'Permasalahan Spesifik']}
                    rows={[
                        [<strong key='m1'>Operator data kantor</strong>, 'Input ulang data; inkonsistensi SR/KK antar laporan; impor capaian memakan berhari-hari.'],
                        [<strong key='m2'>Pengawas/konsultan lapangan</strong>, 'Foto progres terpisah; koordinat tidak tercatat; laporan mingguan RAB manual dan sulit diverifikasi.'],
                        [<strong key='m3'>Manajer proyek / TFL</strong>, 'Tidak ada dashboard rencana vs realisasi lintas paket; tiket kendala tidak terlacak.'],
                        [<strong key='m4'>Masyarakat sasaran</strong>, 'Capaian layanan desa sulit diakses; partisipasi POKMAS terbatas karena kurangnya data terbuka.'],
                        [<strong key='m5'>Unit SPAM desa</strong>, 'Data POKMAS, kapasitas, dan capaian tahunan tidak terdokumentasi digital.'],
                    ]}
                />
            </LegalSection>

            <LegalSection id='isu-strategis' title='C. Isu Strategis'>
                <LegalSubheading>Isu Global — SDGs</LegalSubheading>
                <LegalTable
                    headers={['SDGs', 'Keterkaitan Arumanis']}
                    rows={[
                        [<strong key='s1'>SDGs 6: Air Bersih dan Sanitasi</strong>, 'Target 6.1 (air minum): SR, KK, jiwa terlayani per desa sudah dimonitor. Target 6.2 (sanitasi): capaian SPM sanitasi dalam pengembangan.'],
                        [<strong key='s2'>SDGs 9: Infrastruktur & Inovasi</strong>, 'Platform digital memperkuat infrastruktur data pembangunan.'],
                        [<strong key='s3'>SDGs 16: Kelembagaan Kuat</strong>, 'Transparansi capaian publik dan audit trail mendukung akuntabilitas.'],
                    ]}
                />

                <LegalSubheading>Isu Nasional — RPJMN & Asta Cita</LegalSubheading>
                <LegalTable
                    headers={['Isu', 'Keterkaitan']}
                    rows={[
                        [<strong key='n1'>Asta Cita: Pembangunan Merata</strong>, 'Pemetaan SPM air minum per desa memungkinkan intervensi merata di seluruh Kab. Cianjur (SPM sanitasi menyusul).'],
                        [<strong key='n2'>Reformasi Birokrasi</strong>, 'SSO, role-based access, alur kerja digital mengurangi duplikasi.'],
                        [<strong key='n3'>Penurunan Stunting</strong>, 'Akses air minum layak prasyarat sanitasi rumah tangga.'],
                        [<strong key='n4'>Inflasi & efisiensi anggaran</strong>, 'Monitoring progres real-time deteksi dini deviasi anggaran.'],
                    ]}
                />

                <LegalSubheading>Isu Lokal — RPJMD 2025–2029</LegalSubheading>
                <LegalTable
                    headers={['Isu', 'Keterkaitan']}
                    rows={[
                        [<strong key='l1'>Peningkatan akses air minum layak</strong>, 'Modul SPAM Unit dan peta SPM air minum selaras RISPAM; capaian SPM sanitasi dalam pengembangan.'],
                        [
                            <strong key='l2'>Optimalisasi pengawasan proyek</strong>,
                            metrics
                                ? `${formatCount(metrics.pekerjaan)} paket, ${formatCount(metrics.foto)} foto GPS, laporan mingguan terstruktur.`
                                : '426 paket, 3.866 foto GPS, laporan mingguan terstruktur.',
                        ],
                        [<strong key='l3'>Digitalisasi layanan daerah</strong>, 'Implementasi SPBE melalui platform DPKP.'],
                        [<strong key='l4'>RAD PAMSIMAS 2019–2023</strong>, 'Perbup 23/2020 sebagai landasan operasional perdesaan.'],
                    ]}
                />

                <LegalCallout variant='important'>
                    <strong>Isu strategis utama:</strong> SDGs 6 — Air Bersih dan Sanitasi Layak.
                    Capaian SPM <strong>air minum</strong> sudah direkapitulasi dan divisualisasikan; capaian SPM{' '}
                    <strong>sanitasi</strong> masih <strong>dalam pengembangan</strong>, selaras RPJMD 2025–2029
                    dan RISPAM.
                </LegalCallout>

                <LegalSubheading>Ringkasan Data Capaian SPM Air Minum Terkini</LegalSubheading>
                <p className='mb-4 text-sm leading-relaxed'>
                    Tabel berikut memuat indikator SPM bidang air minum dari basis data operasional. Capaian
                    SPM sanitasi belum dimasukkan karena modul dan indikatornya masih dalam pengembangan.
                </p>
                <InnovationCapaianTable metrics={metrics} isLoading={isLoading} />
            </LegalSection>

            <LegalSection id='metode-pembaharuan' title='D. Metode Pembaharuan'>
                <p>
                    Perbandingan kondisi sebelum (praktik manual) dan sesudah (data operasional Arumanis
                    {metrics?.generatedAt
                        ? ` per ${formatGeneratedAtLabel(metrics.generatedAt)}`
                        : ' terbaru'}
                    ):
                </p>

                <LegalSubheading>1. Integrasi Data Satu Platform</LegalSubheading>
                <SesudahTable
                    metrics={metrics}
                    isLoading={isLoading}
                    buildRows={buildIntegrasiSesudahRows}
                    fallbackRows={[
                        ['Sumber data SPAM & proyek', '4–6 format (Excel, PDF, WA, berkas fisik)', '1 platform — Arumanis + api amis'],
                        ['Unit SPAM terdigitalisasi', 'Tersebar per kecamatan', '364 unit dalam satu basis data'],
                        ['Rekapitulasi SPM air minum 365 desa', '5–10 hari kerja / triwulan', '< 1 hari — agregasi otomatis (coverage 13,2%)'],
                        ['Risiko inkonsistensi data', 'Tinggi (input manual berulang)', 'Rendah — validasi server'],
                    ]}
                />

                <LegalSubheading>2. Monitoring Proyek dan Pengawasan Lapangan</LegalSubheading>
                <SesudahTable
                    metrics={metrics}
                    isLoading={isLoading}
                    buildRows={buildMonitoringSesudahRows}
                    fallbackRows={[
                        ['Paket pekerjaan terpantau', 'Tidak terstandar / per berkas', '426 paket dalam modul pekerjaan'],
                        ['Interval update progres', '2–4 minggu (laporan dokumen)', 'Mingguan — Panel Pengawasan + Puspen'],
                        ['Dokumentasi foto terpusat', 'Tersebar di perangkat pengawas', '3.866 foto terindeks + GPS'],
                        ['Identifikasi deviasi', 'Setelah laporan bulanan', 'Real-time — dashboard KPI & deviasi'],
                    ]}
                />

                <LegalSubheading>3. Capaian SPM Air Minum dan Visualisasi Geospasial</LegalSubheading>
                <SesudahTable
                    metrics={metrics}
                    isLoading={isLoading}
                    buildRows={buildSpmSesudahRows}
                    fallbackRows={[
                        ['Unit SPAM digital per desa', 'Estimasi < 50% desa', '364 unit / 365 wilayah (≈ 99,7%)'],
                        ['Record capaian SPM air minum per tahun', 'Berkas/Excel per unit', '505 record achievement terstruktur'],
                        ['Visualisasi capaian air minum per desa', 'Peta statis / tabel Excel', 'Peta choropleth interaktif 365 desa'],
                        ['Akses publik capaian SPM air minum', 'Tidak tersedia / berkas fisik', '24/7 di arumanis.cianjur.space'],
                        ['Capaian SPM sanitasi', 'Belum terdigitalisasi terpusat', 'Dalam pengembangan — modul & peta menyusul'],
                    ]}
                />

                <LegalSubheading>4. Efisiensi Administrasi dan Pelaporan</LegalSubheading>
                <SesudahTable
                    metrics={metrics}
                    isLoading={isLoading}
                    buildRows={buildAdminSesudahRows}
                    fallbackRows={[
                        ['Impor data SPAM massal', '3–5 hari (input manual)', '< 2 jam — impor CSV'],
                        ['Nilai kontrak SPAM terkonsolidasi', 'Rekapitulasi manual', 'Rp 90.479.525.404 terdata'],
                        ['Laporan ekspor PDF/Excel', '1–2 hari per periode', '< 30 menit — generate otomatis'],
                        ['Koordinasi pengawas–pusat', 'Telepon/WA tanpa audit trail', 'Terlacak — SSO, notifikasi, tiket'],
                    ]}
                />

                <LegalSubheading>5. Kualitas Layanan Keputusan</LegalSubheading>
                <SesudahTable
                    metrics={metrics}
                    isLoading={isLoading}
                    buildRows={buildDecisionSesudahRows}
                    fallbackRows={[
                        ['KPI dashboard SPAM', 'Tidak ada / manual', 'Real-time: 364 unit · 52.911 KK · goal 13,2%'],
                        ['Analisis pertanyaan natural', 'Tidak tersedia', 'Asisten Ami AI'],
                        ['Filter kecamatan/desa/tahun', 'Manual pivot tabel', 'Instant — 33 kecamatan, 365 desa'],
                        ['Status registrasi SIMSPAM', 'Tidak terpantau terpusat', '18 SIMSPAM · 346 non-SIMSPAM'],
                    ]}
                />
            </LegalSection>

            <LegalSection id='keunggulan' title='E. Keunggulan dan Kebaharuan'>
                <LegalSubheading>Keunggulan dibanding sistem sejenis</LegalSubheading>
                <LegalTable
                    compact
                    headers={['Aspek', 'Sistem Konvensional', 'Arumanis']}
                    rows={[
                        ['Cakupan fungsi', 'Fokus tunggal (SPAM atau monitoring saja)', 'Satu data: SPAM, proyek, pengawasan lapangan'],
                        ['Arsitektur', 'Monolith / spreadsheet', 'React frontend + Laravel API'],
                        ['Pengawasan lapangan', 'Aplikasi terpisah tanpa SSO', 'Panel Pengawasan terintegrasi SSO'],
                        ['Visualisasi publik', 'Laporan statis', 'Peta capaian SPM air minum di landing (SPM sanitasi dalam pengembangan)'],
                        ['Dokumentasi progres', 'Foto tanpa metadata', 'Slot 0%–100% + GPS + sinkronisasi pusat'],
                        ['Manajemen kendala', 'Komunikasi informal', 'Sistem tiket + notifikasi broadcast'],
                        ['Keamanan akses', 'Password bersama', 'Role & permission granular'],
                        ['Analisis data', 'Manual', 'Ami AI'],
                    ]}
                />

                <LegalSubheading>Unsur pembaruan (update/upgrade)</LegalSubheading>
                <LegalOrderedList
                    items={[
                        'Modul SPAM Unit terdigitalisasi — CRUD unit, capaian SPM air minum, POKMAS, anggaran, validasi server-side.',
                        'Impor data massal — migrasi historis Excel/CSV ke database terstruktur.',
                        'API publik capaian SPM air minum — endpoint stats & map-stats untuk landing tanpa autentikasi.',
                        'Peta choropleth Leaflet — visualisasi capaian SR/KK air minum per desa dengan animasi dan popup.',
                        'Rencana modul capaian SPM sanitasi — skema indikator, rekapitulasi, dan visualisasi (dalam pengembangan).',
                        'Sinkronisasi progres estimasi — Panel Pengawasan ↔ modul Puspen dua arah.',
                        'SSO Panel Pengawasan — satu akun untuk dua aplikasi.',
                        'Pelaporan error terkontrol — halaman publik graceful degradation.',
                        'Role-based wilayah — operator hanya mengelola data wilayah kerjanya.',
                    ]}
                />
            </LegalSection>

            <LegalSection id='tahapan' title='F. Tahapan Inovasi'>
                <LegalSubheading>1. Tahap persiapan dan penciptaan produk</LegalSubheading>
                <LegalTable
                    headers={['Tahap', 'Kegiatan']}
                    rows={[
                        [<strong key='t1'>Analisis kebutuhan</strong>, 'Identifikasi permasalahan data SPAM, proyek, dan pengawasan lapangan.'],
                        [<strong key='t2'>Perancangan sistem</strong>, 'Arsitektur Arumanis + api amis, skema database, alur SSO Panel Pengawasan.'],
                        [<strong key='t3'>Pengembangan modul</strong>, 'Pekerjaan, SPAM unit, dashboard, panel pengawasan, notifikasi, peta, landing publik.'],
                        [<strong key='t4'>Migrasi data</strong>, 'Impor unit SPAM dan capaian historis via template CSV/Excel.'],
                        [<strong key='t5'>Uji coba terbatas</strong>, 'Pilot operator kantor dan pengawas terpilih.'],
                        [<strong key='t6'>Go-live</strong>, 'Deploy arumanis.cianjur.space & apiamis.cianjur.space; sosialisasi pengguna.'],
                    ]}
                />

                <LegalSubheading>2. Pemanfaatan — Arumanis Utama</LegalSubheading>
                <LegalFlowBlock>{`Login (/sign-in)
    ↓
Dashboard — ringkasan KPI fisik, keuangan, dan SPAM
    ↓
Modul sesuai peran:
    • Pekerjaan & Kegiatan
    • SPAM Unit (/spam-unit)
    • Users & Akses
    • Notifikasi
    ↓
Ekspor laporan PDF/Excel`}</LegalFlowBlock>
                <LegalList
                    items={[
                        'Buka Aset & Capaian SPAM (/spam-unit), filter kecamatan/desa/tahun.',
                        'Tambah/edit unit — desa, kapasitas, POKMAS, status SIMSPAM.',
                        'Detail unit → tab Achievements: capaian SR, KK, jiwa per tahun.',
                        'Tab Budgets: rencana anggaran dan sumber dana.',
                        'Alternatif: Import data massal CSV/Excel.',
                    ]}
                />

                <LegalSubheading>3. Pemanfaatan — Panel Pengawasan</LegalSubheading>
                <LegalFlowBlock>{`Login via Arumanis (/sign-in) — SSO otomatis
    ↓
Panel Pengawasan (/pengawasan/)
    ↓
Dashboard — KPI paket, deviasi, status foto
    ↓
Detail pekerjaan: Output, Foto GPS, Progress, Tiket
    ↓
Laporan Mingguan — RAB rencana & realisasi
    ↓
Notifikasi — lonceng header`}</LegalFlowBlock>
                <LegalCallout>
                    Pengawas tidak memiliki form login terpisah. Jika sesi habis (401), gunakan
                    Masuk ulang via Arumanis.
                </LegalCallout>

                <LegalSubheading>4. Pemanfaatan — Masyarakat/Publik</LegalSubheading>
                <LegalFlowBlock>{`Landing Arumanis (tanpa login)
    ↓
Bagian Capaian SPM Air Minum
    ↓
Peta choropleth Kabupaten Cianjur
    ↓
Klik desa → popup SR, KK, jiwa, target, unit SPAM
    ↓
(SPM sanitasi — dalam pengembangan)
    ↓
Panduan di /publikasi atau pusat bantuan`}</LegalFlowBlock>

                <LegalSubheading>5. Pemeliharaan berkelanjutan</LegalSubheading>
                <LegalTable
                    headers={['Kegiatan', 'Frekuensi']}
                    rows={[
                        ['Pembaruan data capaian SPM air minum', 'Triwulan / tahunan'],
                        ['Pengembangan modul capaian SPM sanitasi', 'Sesuai roadmap — tahap penyusunan indikator & integrasi data'],
                        ['Evaluasi KPI sistem (uptime, akurasi, adopsi)', 'Triwulan'],
                        ['Penambahan fitur operasional', 'Sesuai roadmap'],
                        ['Pelatihan pengguna baru', 'Setiap perubahan signifikan'],
                        ['Backup database dan audit keamanan', 'Berkala'],
                    ]}
                />
            </LegalSection>

            <LegalSection id='meta' title='Informasi Dokumen'>
                <LegalTable
                    headers={['Keterangan', 'Nilai']}
                    rows={[
                        ['Versi dokumen', '1.1'],
                        ['Terakhir diperbarui', '26 Juni 2026'],
                        [
                            'Sumber data kuantitatif',
                            metrics?.generatedAt
                                ? `API publik /public/spam-units/stats (${formatGeneratedAtLabel(metrics.generatedAt)})`
                                : 'Basis data operasional api amis',
                        ],
                        ['Penanggung jawab', 'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur'],
                    ]}
                />
            </LegalSection>
        </LegalPageLayout>
    )
}