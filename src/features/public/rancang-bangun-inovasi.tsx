import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Layers } from 'lucide-react'
import { InnovationSpmScopeCallout } from './components/innovation-spm-scope-callout'
import { trackVisitorEvent } from '@/lib/analytics/visitor-events'
import {
    INNOVATION_DOC_UPDATED_AT,
    INNOVATION_DOC_VERSION_LATAR_BELAKANG,
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

export function RancangBangunInovasi() {
    useEffect(() => {
        void trackVisitorEvent('innovation_page_view', { page: 'rancang-bangun-inovasi' })
    }, [])

    return (
        <LegalPageLayout
            title='Latar Belakang'
            subtitle='Fungsi Arumanis dan tujuan penyelenggaraan satu data air minum–sanitasi — DPKP Kabupaten Cianjur'
            icon={Layers}
            badge='Dokumen Inovasi'
            active='rancang-bangun-inovasi'
            backTo='/'
            updatedAt={INNOVATION_DOC_UPDATED_AT}
            footerNote='Dokumen inovasi Arumanis — melengkapi panduan operasional dan dokumen hukum.'
        >
            <LegalCallout>
                <strong>Arumanis</strong> (Aplikasi Satu Data Air Minum dan Sanitasi) — Dinas
                Perumahan dan Kawasan Permukiman Kabupaten Cianjur ·{' '}
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
                            'Capaian SPM air minum di banyak desa/kecamatan belum terhimpun secara terpadu; tanpa sistem yang menyatukan data, intervensi prioritas desa sulit proporsional.',
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
                        [
                            <strong key='s1'>SDGs 6: Air Bersih dan Sanitasi</strong>,
                            'Target 6.1 (air minum): SR, KK, jiwa terlayani per desa dimonitor dan divisualisasikan. Target 6.2 (sanitasi): peta dan API publik tersedia di landing.',
                        ],
                        [<strong key='s2'>SDGs 9: Infrastruktur & Inovasi</strong>, 'Platform digital memperkuat infrastruktur data pembangunan.'],
                        [<strong key='s3'>SDGs 16: Kelembagaan Kuat</strong>, 'Transparansi capaian publik dan audit trail mendukung akuntabilitas.'],
                    ]}
                />

                <LegalSubheading>Isu Nasional — RPJMN & Asta Cita</LegalSubheading>
                <LegalTable
                    headers={['Isu', 'Keterkaitan']}
                    rows={[
                        [<strong key='n1'>Asta Cita: Pembangunan Merata</strong>, 'Pemetaan SPM air minum dan sanitasi per desa memungkinkan intervensi merata di seluruh Kab. Cianjur.'],
                        [<strong key='n2'>Reformasi Birokrasi</strong>, 'SSO, role-based access, alur kerja digital mengurangi duplikasi.'],
                        [<strong key='n3'>Penurunan Stunting</strong>, 'Akses air minum layak prasyarat sanitasi rumah tangga.'],
                        [<strong key='n4'>Inflasi & efisiensi anggaran</strong>, 'Monitoring progres real-time deteksi dini deviasi anggaran.'],
                    ]}
                />

                <LegalSubheading>Isu Lokal — RPJMD 2025–2029</LegalSubheading>
                <LegalTable
                    headers={['Isu', 'Keterkaitan']}
                    rows={[
                        [
                            <strong key='l1'>Peningkatan akses air minum & sanitasi layak</strong>,
                            'Modul SPAM Unit, peta SPM air minum, dan peta/API SPM sanitasi selaras RPJMD & RISPAM.',
                        ],
                        [
                            <strong key='l2'>Optimalisasi pengawasan proyek</strong>,
                            'Paket pekerjaan, foto ber-lokasi, dan laporan mingguan terstruktur dalam satu platform.',
                        ],
                        [<strong key='l3'>Digitalisasi layanan daerah</strong>, 'Implementasi SPBE melalui platform DPKP.'],
                        [<strong key='l4'>RAD PAMSIMAS 2019–2023</strong>, 'Perbup 23/2020 sebagai landasan operasional perdesaan.'],
                    ]}
                />

                <LegalCallout variant='important'>
                    <strong>Isu strategis utama:</strong> SDGs 6 — Air Bersih dan Sanitasi Layak.
                    Capaian SPM <strong>air minum</strong> dan <strong>sanitasi</strong> direkapitulasi dan
                    divisualisasikan melalui portal informasi publik Arumanis, selaras RPJMD 2025–2029 dan
                    RISPAM. Data sanitasi dapat masih disinkronkan — lihat disclaimer pada peta landing.
                </LegalCallout>

                <LegalSubheading>Ringkasan Capaian SPM</LegalSubheading>
                <p className='mb-4 text-sm leading-relaxed'>
                    Indikator capaian SPM bidang air minum dan sanitasi disajikan secara langsung
                    melalui portal informasi publik (peta dan ringkasan cakupan desa) serta modul
                    operasional Arumanis, tanpa perlu login.
                </p>
            </LegalSection>

            <LegalSection id='metode-pembaharuan' title='D. Metode Pembaharuan'>
                <p>
                    Perbandingan kondisi sebelum (praktik manual) dan sesudah (operasional Arumanis):
                </p>

                <LegalSubheading>1. Integrasi Data Satu Platform</LegalSubheading>
                <BeforeAfterTable
                    rows={[
                        ['Sumber data SPAM & proyek', 'Tersebar (Excel, PDF, WhatsApp, berkas fisik)', 'Satu platform — Arumanis + api amis'],
                        ['Unit SPAM terdigitalisasi', 'Tersebar per kecamatan', 'Unit SPAM dalam satu basis data terpadu'],
                        ['Rekapitulasi SPM air minum per desa', 'Berhari-hari kerja / triwulan', 'Agregasi otomatis dalam hitungan jam'],
                        ['Risiko inkonsistensi data', 'Tinggi (input manual berulang)', 'Rendah — validasi server'],
                    ]}
                />

                <LegalSubheading>2. Monitoring Proyek dan Pengawasan Lapangan</LegalSubheading>
                <BeforeAfterTable
                    rows={[
                        ['Paket pekerjaan terpantau', 'Tidak terstandar / per berkas', 'Paket pekerjaan dalam modul terpusat'],
                        ['Interval update progres', '2–4 minggu (laporan dokumen)', 'Mingguan — Panel Pengawasan + Puspen'],
                        ['Dokumentasi foto terpusat', 'Tersebar di perangkat pengawas', 'Foto terindeks + lokasi'],
                        ['Identifikasi deviasi', 'Setelah laporan bulanan', 'Real-time — dashboard KPI & deviasi'],
                    ]}
                />

                <LegalSubheading>3. Capaian SPM Air Minum dan Visualisasi Geospasial</LegalSubheading>
                <BeforeAfterTable
                    rows={[
                        ['Unit SPAM digital per desa', 'Sebagian kecil desa', 'Unit SPAM terdata dalam satu basis data'],
                        ['Record capaian SPM air minum per tahun', 'Berkas/Excel per unit', 'Record achievement terstruktur'],
                        ['Visualisasi capaian air minum per desa', 'Peta statis / tabel Excel', 'Peta choropleth interaktif per desa'],
                        ['Akses publik capaian SPM air minum', 'Tidak tersedia / berkas fisik', '24/7 di arumanis.cianjur.space'],
                        ['Capaian SPM sanitasi (peta & API publik)', 'Belum terdigitalisasi terpusat', 'Peta choropleth & API publik aktif — data dapat disinkronkan'],
                    ]}
                />

                <LegalSubheading>4. Efisiensi Administrasi dan Pelaporan</LegalSubheading>
                <BeforeAfterTable
                    rows={[
                        ['Impor data SPAM massal', 'Berhari-hari (input manual)', 'Impor CSV/Excel dalam hitungan menit–jam'],
                        ['Nilai kontrak SPAM terkonsolidasi', 'Rekapitulasi manual', 'Terkonsolidasi dalam modul pekerjaan'],
                        ['Laporan ekspor PDF/Excel', '1–2 hari per periode', 'Generate otomatis'],
                        ['Koordinasi pengawas–pusat', 'Telepon/WA tanpa audit trail', 'Terlacak — SSO, notifikasi, tiket'],
                    ]}
                />

                <LegalSubheading>5. Kualitas Layanan Keputusan</LegalSubheading>
                <BeforeAfterTable
                    rows={[
                        ['KPI dashboard SPAM', 'Tidak ada / manual', 'Real-time — unit, KK, dan capaian'],
                        ['Analisis pertanyaan natural', 'Tidak tersedia', 'Asisten Ami AI'],
                        ['Filter kecamatan/desa/tahun', 'Manual pivot tabel', 'Instant filter lintas wilayah & tahun'],
                        ['Status registrasi SIMSPAM', 'Tidak terpantau terpusat', 'Terpantau — SIMSPAM & non-SIMSPAM'],
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
                        ['Visualisasi publik', 'Laporan statis', 'Portal informasi: peta SPM air minum & sanitasi, ringkasan cakupan desa, publikasi'],
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
                        'API publik capaian SPM — endpoint stats & map-stats air minum dan sanitasi untuk landing tanpa autentikasi.',
                        'Peta choropleth Leaflet — visualisasi capaian SR/KK air minum dan infrastruktur sanitasi per desa.',
                        'Ringkasan cakupan desa di hero landing — gabungan indikator air minum (KK > 0) dan sanitasi (infrastruktur terdata).',
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
                <LegalFlowBlock>{`Landing Arumanis (tanpa login) — portal informasi publik
    ↓
Ringkasan cakupan desa air minum & sanitasi (hero)
    ↓
#capaian-spm — peta choropleth air minum / sanitasi
    ↓
Klik desa → popup capaian per desa (SR, KK, jiwa / infrastruktur)
    ↓
#access — publikasi, capaian SPM, Latar Belakang, Tujuan-Manfaat-Hasil
    ↓
/publikasi — dokumen & pembaruan terbuka`}</LegalFlowBlock>

                <LegalSubheading>5. Pemeliharaan berkelanjutan</LegalSubheading>
                <LegalTable
                    headers={['Kegiatan', 'Frekuensi']}
                    rows={[
                        ['Pembaruan data capaian SPM air minum', 'Triwulan / tahunan'],
                        ['Sinkronisasi & pembaruan data SPM sanitasi', 'Berkala — verifikasi terhadap sumber lapangan'],
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
                        ['Versi dokumen', INNOVATION_DOC_VERSION_LATAR_BELAKANG],
                        ['Terakhir diperbarui', INNOVATION_DOC_UPDATED_AT],
                        ['Penanggung jawab', 'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur'],
                    ]}
                />
            </LegalSection>
        </LegalPageLayout>
    )
}
