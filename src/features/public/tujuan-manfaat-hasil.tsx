import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Target } from 'lucide-react'
import { InnovationLiveBadge } from './components/innovation-live-badge'
import { usePublicInnovationStats } from './hooks/use-public-innovation-stats'
import {
    buildHasilUtamaRows,
    buildManfaatVsHasilRows,
    buildTujuanRows,
    formatCount,
    formatCoverage,
    formatCurrency,
    formatGeneratedAtLabel,
} from './lib/innovation-stats'
import {
    INNOVATION_DOC_UPDATED_AT,
    LegalCallout,
    LegalPageLayout,
    LegalSection,
    LegalSubheading,
    LegalTable,
} from './legal-page-layout'

const TUJUAN_ROWS_FALLBACK: React.ReactNode[][] = [
    [
        'T1',
        'Menyatukan data unit SPAM, capaian SPM, dan proyek air minum–sanitasi dalam satu basis data terintegrasi di seluruh Kabupaten Cianjur',
        'Jumlah unit SPAM terdigitalisasi; jumlah sumber data aktif',
        '≥ 360 unit tercatat pada Des 2026',
        'Fragmentasi data (makro); input ulang data (mikro — operator)',
    ],
    [
        'T2',
        'Meningkatkan akurasi dan kecepatan rekapitulasi capaian Standar Pelayanan Minimum (SPM) air minum per desa',
        'Waktu rekapitulasi lintas desa; selisih data antar laporan',
        'Rekapitulasi < 1 hari kerja; selisih data < 5% pada Jun 2026',
        'Kesenjangan capaian SPM (makro); inkonsistensi SR/KK (mikro — operator)',
    ],
    [
        'T3',
        'Mempercepat monitoring dan pengawasan 426+ paket pekerjaan infrastruktur melalui alur digital lapangan–kantor',
        'Interval pembaruan progres; jumlah foto terindeks GPS',
        'Update progres mingguan; ≥ 90% foto bermetadata GPS pada Des 2026',
        'Keterbatasan monitoring real-time (makro); dokumentasi terpisah (mikro — pengawas)',
    ],
    [
        'T4',
        'Menyediakan akses informasi capaian SPM yang terbuka dan dapat dipertanggungjawabkan kepada masyarakat',
        'Ketersediaan peta publik; jumlah desa divisualisasikan',
        'Peta capaian 365 desa dapat diakses 24/7 tanpa login pada Jun 2026',
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
        '≥ 95% unit profil lengkap dan ≥ 1 achievement periode berjalan pada Des 2026',
        'Data POKMAS tidak terdokumentasi (mikro — unit SPAM desa)',
    ],
]

function ManfaatTable({
    rows,
}: {
    rows: [React.ReactNode, React.ReactNode, React.ReactNode][]
}) {
    return (
        <LegalTable
            headers={['Manfaat', 'Uraian', 'Estimasi / Indikator Terukur']}
            rows={rows}
        />
    )
}

export function TujuanManfaatHasil() {
    const { metrics, isLoading, isLive, refetch } = usePublicInnovationStats()

    const tujuanRows = useMemo(
        () => (metrics ? buildTujuanRows(metrics) : TUJUAN_ROWS_FALLBACK),
        [metrics],
    )

    const hasilUtamaRows = useMemo(
        () =>
            metrics
                ? buildHasilUtamaRows(metrics).map((row) => [
                      row[0],
                      <strong key={row[0]}>{row[1]}</strong>,
                      row[2],
                      row[3],
                  ])
                : [
                      ['H1', <strong key='h1'>Platform Arumanis Utama</strong>, 'Dashboard, pekerjaan, SPAM, users, notifikasi, Ami AI', 'arumanis.cianjur.space'],
                      ['H2', <strong key='h2'>Panel Pengawasan Terintegrasi</strong>, 'Progress, foto GPS, laporan mingguan, tiket; SSO', 'Route /pengawasan/ — satu akun'],
                      ['H3', <strong key='h3'>Backend API (api amis)</strong>, 'REST API Laravel: data, validasi, role/permission', 'apiamis.cianjur.space'],
                      ['H4', <strong key='h4'>Basis Data Terintegrasi SPAM–SPM</strong>, 'Desa, unit SPAM, achievement, anggaran, pekerjaan, foto', '364 unit · 505 achievement · 365 desa'],
                      ['H5', <strong key='h5'>Halaman Publik Capaian SPM</strong>, 'Landing page peta choropleth Kab. Cianjur', 'API publik stats & map-stats'],
                      ['H6', <strong key='h6'>Modul SPAM Unit</strong>, 'CRUD unit, capaian SPM, POKMAS, anggaran, impor CSV/Excel', 'Route /spam-unit'],
                      ['H7', <strong key='h7'>Modul Monitoring Pekerjaan & Puspen</strong>, 'Paket, progress estimasi, sinkronisasi Panel Pengawasan', '426 paket pekerjaan terdata'],
                      ['H8', <strong key='h8'>Repositori Dokumentasi Lapangan</strong>, 'Foto progres berslot dan metadata GPS', '3.866 berkas foto terindeks'],
                      ['H9', <strong key='h9'>Sistem Notifikasi & Tiket</strong>, 'Broadcast pengumuman dan pelacakan kendala', 'Modul notifikasi & tiket berstatus'],
                      ['H10', <strong key='h10'>Dokumentasi Pengguna</strong>, 'Panduan operator, pengawas, dan publik', '/docs/index.html'],
                  ],
        [metrics],
    )

    const manfaatVsHasilRows = useMemo(
        () =>
            metrics
                ? buildManfaatVsHasilRows(metrics)
                : [
                      ['Sifat', 'Perubahan kondisi / dampak yang dirasakan', 'Produk, sistem, atau data yang dihasilkan'],
                      ['Contoh 1', 'Rekapitulasi SPM lebih cepat (< 1 hari)', 'Platform Arumanis + API + database 364 unit'],
                      ['Contoh 2', 'Masyarakat lebih mudah memantau capaian desa', 'Landing + peta choropleth 365 desa'],
                      ['Contoh 3', 'Pengawasan lapangan lebih akuntabel', 'Panel Pengawasan + 3.866 foto GPS + laporan mingguan'],
                      ['Contoh 4', 'Keputusan program berbasis data SPM 13,2%', 'Dashboard KPI + modul SPAM Unit + export laporan'],
                  ],
        [metrics],
    )

    return (
        <LegalPageLayout
            title='Tujuan, Manfaat, dan Hasil'
            subtitle='Bagian III dokumentasi inovasi Arumanis — DPKP Kabupaten Cianjur'
            icon={Target}
            badge='Dokumen Inovasi'
            active='tujuan-manfaat-hasil'
            backTo='/'
            updatedAt={INNOVATION_DOC_UPDATED_AT}
            footerNote='Dokumen inovasi Arumanis — melengkapi panduan operasional dan dokumen hukum.'
        >
            <LegalCallout>
                <strong>Arumanis</strong> (Aplikasi Satu Data Air Minum dan Sanitasi) dikelola{' '}
                <strong>Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur</strong> untuk{' '}
                {metrics
                    ? `${formatCount(metrics.kecamatan)} kecamatan dan ${formatCount(metrics.desaWilayah)} desa/kelurahan`
                    : '33 kecamatan dan 365 desa/kelurahan'}
                . Permasalahan latar diuraikan pada{' '}
                <Link to='/rancang-bangun-inovasi' className='font-black underline underline-offset-2'>
                    Rancang Bangun Inovasi
                </Link>
                .
            </LegalCallout>

            <InnovationLiveBadge
                isLoading={isLoading}
                isLive={isLive}
                generatedAt={metrics?.generatedAt ?? null}
                onRefresh={refetch}
            />

            <LegalSection id='tujuan' title='1. Tujuan'>
                <p>
                    Tujuan inovasi dirumuskan secara spesifik, terukur, dan berjangka waktu, dengan
                    keterkaitan langsung pada permasalahan yang telah diidentifikasi.
                </p>
                <LegalTable
                    compact
                    headers={[
                        'No.',
                        'Tujuan (SMART)',
                        'Indikator Keberhasilan',
                        'Target Waktu',
                        'Permasalahan Terkait',
                    ]}
                    rows={tujuanRows}
                />
                <LegalSubheading>Narasi Tujuan Utama</LegalSubheading>
                <p>
                    Pada 2026, Arumanis bertujuan menjadi satu sumber data (single source of truth)
                    penyelenggaraan air minum dan sanitasi Kabupaten Cianjur — mulai dari aset SPAM
                    dan capaian SPM hingga pelaksanaan serta pengawasan proyek — sehingga
                    perencanaan intervensi per desa, pengawasan lapangan, dan publikasi capaian
                    kepada masyarakat dapat dilakukan secara terukur, terintegrasi, dan
                    berkelanjutan, sejalan SDGs 6, RPJMD 2025–2029, dan RISPAM daerah.
                </p>
            </LegalSection>

            <LegalSection id='manfaat' title='2. Manfaat'>
                <p>
                    Manfaat adalah perubahan atau dampak nyata (outcome) yang dirasakan pihak terkait
                    setelah inovasi digunakan — bukan produk teknisnya. Indikator kuantitatif diambil
                    {metrics?.generatedAt
                        ? ` live dari API pada ${formatGeneratedAtLabel(metrics.generatedAt)}`
                        : ' dari basis data operasional Arumanis'}
                    {' '}
                    dan dievaluasi triwulanan.
                </p>

                <LegalSubheading>2.1 Pemerintah Daerah (DPKP & unit terkait)</LegalSubheading>
                <ManfaatTable
                    rows={[
                        [
                            <strong key='m1'>Pengambilan keputusan lebih cepat dan tepat</strong>,
                            'Dashboard KPI dan peta choropleth memperlihatkan desa prioritas intervensi SPM secara langsung',
                            metrics
                                ? `Waktu bahan rapat evaluasi SPM turun dari 5–10 hari menjadi < 1 hari; ${formatCount(metrics.desaMap)} desa terpetakan`
                                : 'Waktu bahan rapat evaluasi SPM turun dari 5–10 hari menjadi < 1 hari; 365 desa terpetakan',
                        ],
                        [
                            <strong key='m2'>Efisiensi administrasi data</strong>,
                            'Input, impor, dan ekspor terpusat mengurangi duplikasi pekerjaan operator',
                            metrics
                                ? `Impor massal dari 3–5 hari menjadi < 2 jam; ${formatCount(metrics.units)} unit tidak direkapitulasi manual`
                                : 'Impor massal dari 3–5 hari menjadi < 2 jam; 364 unit tidak direkapitulasi manual',
                        ],
                        [
                            <strong key='m3'>Akuntabilitas penggunaan anggaran</strong>,
                            'Nilai kontrak dan progres fisik–keuangan terlacak per paket',
                            metrics
                                ? `${formatCurrency(metrics.kontrak)} nilai kontrak terkonsolidasi; ${formatCount(metrics.pekerjaan)} paket terpantau deviasinya`
                                : 'Rp 90.479.525.404 nilai kontrak terkonsolidasi; 426 paket terpantau deviasinya',
                        ],
                        [
                            <strong key='m4'>Penguatan SPBE dan reformasi birokrasi</strong>,
                            'Satu akun SSO untuk Arumanis utama dan Panel Pengawasan; role-based access',
                            'Koordinasi pengawas–pusat terdokumentasi (notifikasi, tiket, log)',
                        ],
                        [
                            <strong key='m5'>Perencanaan program selaras RPJMD & RISPAM</strong>,
                            metrics
                                ? `Data capaian ${formatCoverage(metrics.coverage)}% terhadap target ${formatCount(metrics.targetKk)} KK menjadi dasar faktual penargetan`
                                : 'Data capaian 13,2% terhadap target 534.952 KK menjadi dasar faktual penargetan',
                            'Gap SPM per kecamatan/desa dihitung otomatis untuk Renja/RKPD',
                        ],
                    ]}
                />

                <LegalSubheading>2.2 Masyarakat dan pemangku kepentingan lokal</LegalSubheading>
                <ManfaatTable
                    rows={[
                        [
                            <strong key='m6'>Transparansi capaian layanan air minum</strong>,
                            'Masyarakat dapat melihat capaian SPM desa tanpa harus ke kantor',
                            'Akses publik 24/7 melalui arumanis.cianjur.space; popup capaian per desa pada peta',
                        ],
                        [
                            <strong key='m7'>Partisipasi pengawasan layanan (POKMAS)</strong>,
                            'Data pengelola dan capaian unit desa terbuka bagi aparatur desa dan POKMAS',
                            metrics
                                ? `${formatCount(metrics.units)} unit dengan repositori pengelola; ${formatCount(metrics.achievements)} record achievement multi-tahun`
                                : '364 unit dengan repositori pengelola; 505 record achievement multi-tahun',
                        ],
                        [
                            <strong key='m8'>Kepercayaan publik terhadap program pembangunan</strong>,
                            'Dokumentasi progres ber-GPS meningkatkan kredibilitas pelaporan fisik proyek',
                            metrics
                                ? `${formatCount(metrics.foto)} dokumentasi foto progres terindeks dengan koordinat lokasi`
                                : '3.866 dokumentasi foto progres terindeks dengan koordinat lokasi',
                        ],
                    ]}
                />

                <LegalSubheading>2.3 Pelaksana teknis (operator, pengawas, TFL/konsultan)</LegalSubheading>
                <ManfaatTable
                    rows={[
                        [
                            <strong key='m9'>Beban kerja administratif berkurang</strong>,
                            'Satu platform menggantikan beberapa lembar Excel dan chat berkas',
                            metrics
                                ? `Filter instan ${formatCount(metrics.kecamatan)} kecamatan × ${formatCount(metrics.desaWilayah)} desa × tahun capaian`
                                : 'Filter instan 33 kecamatan × 365 desa × tahun capaian',
                        ],
                        [
                            <strong key='m10'>Pengawasan lapangan lebih terstruktur</strong>,
                            'Slot foto 0%–100%, laporan mingguan RAB, dan tiket kendala dalam satu alur',
                            'Interval pelaporan dari 2–4 minggu menjadi mingguan; status kendala terlacak',
                        ],
                        [
                            <strong key='m11'>Analisis data tanpa query manual</strong>,
                            'Asisten Ami AI membantu menafsirkan data operasional',
                            'Respons asisten < 1 menit untuk pertanyaan standar paket/progres',
                        ],
                    ]}
                />

                <LegalSubheading>2.4 Sektor dan lingkungan pembangunan</LegalSubheading>
                <ManfaatTable
                    rows={[
                        [
                            <strong key='m12'>Kontribusi pada SDGs 6</strong>,
                            'Pemantauan SR/KK/jiwa terlayani mendukung percepatan akses air minum layak',
                            metrics
                                ? `${formatCount(metrics.srKk)} SR/KK, ${formatCount(metrics.jiwa)} jiwa, ${formatCount(metrics.bjpKk)} BJP KK — dasar evaluasi menuju target RPJMD`
                                : '52.911 SR/KK, 264.557 jiwa, 17.681 BJP KK — dasar evaluasi menuju target RPJMD',
                        ],
                        [
                            <strong key='m13'>Dukungan penurunan stunting</strong>,
                            'Akses air minum layak memperkuat sanitasi rumah tangga',
                            'Intervensi diarahkan ke desa coverage SPM terendah pada peta choropleth',
                        ],
                        [
                            <strong key='m14'>Efisiensi investasi infrastruktur</strong>,
                            'Deteksi dini deviasi proyek mengurangi risiko salah alokasi anggaran',
                            'Identifikasi deviasi fisik/keuangan real-time vs laporan bulanan',
                        ],
                    ]}
                />

                <LegalCallout variant='important'>
                    Manfaat menggambarkan perubahan kondisi setelah inovasi dipakai (lebih cepat,
                    akurat, transparan). Produk yang menghasilkan perubahan tersebut diuraikan pada
                    bagian Hasil di bawah.
                </LegalCallout>
            </LegalSection>

            <LegalSection id='hasil' title='3. Hasil'>
                <p>
                    Hasil adalah produk/output penyelenggaraan inovasi — artefak, sistem, data, atau
                    layanan yang dihasilkan. Hasil bukan dampak jangka panjangnya (manfaat).
                </p>

                <LegalSubheading>3.1 Hasil utama (produk inovasi)</LegalSubheading>
                <LegalTable
                    compact
                    headers={[
                        'No.',
                        'Hasil (Output)',
                        'Deskripsi',
                        metrics?.generatedAt
                            ? `Bukti / Status (${formatGeneratedAtLabel(metrics.generatedAt)})`
                            : 'Bukti / Status',
                    ]}
                    rows={hasilUtamaRows}
                />

                <LegalSubheading>3.2 Hasil penunjang</LegalSubheading>
                <LegalTable
                    compact
                    headers={['No.', 'Hasil (Output)', 'Deskripsi']}
                    rows={[
                        ['H11', 'Template impor data SPAM (CSV/Excel)', 'Format standar migrasi data historis'],
                        ['H12', 'Skema role & permission', 'Admin, operator (wilayah), viewer, pengawas'],
                        ['H13', 'Laporan ekspor PDF/Excel', 'Output cetak/digital dari data terintegrasi'],
                        ['H14', 'Asisten Ami AI', 'Modul interaksi analisis data operasional'],
                        ['H15', 'Dokumen rancang bangun inovasi', '/rancang-bangun-inovasi'],
                    ]}
                />

                <LegalSubheading>3.3 Pembedaan manfaat vs hasil</LegalSubheading>
                <LegalTable
                    headers={['Aspek', 'Manfaat (Outcome)', 'Hasil (Output)']}
                    rows={manfaatVsHasilRows}
                />

                <LegalSubheading>3.4 Target hasil jangka pendek (2026)</LegalSubheading>
                <LegalTable
                    headers={['Hasil', 'Target Akhir 2026']}
                    rows={[
                        ['Kelengkapan data unit SPAM', '≥ 95% unit dengan profil lengkap (desa, kapasitas, SIMSPAM, POKMAS)'],
                        ['Record capaian SPM tahun berjalan', '≥ 1 achievement per unit aktif untuk tahun anggaran berjalan'],
                        ['Cakupan paket pekerjaan terpantau', '100% paket air minum/sanitasi aktif masuk modul pekerjaan'],
                        ['Dokumentasi foto progres', '≥ 90% slot foto wajib terisi pada paket aktif'],
                        ['Ketersediaan layanan publik peta SPM', 'Uptime layanan publik ≥ 99% (monitoring triwulanan)'],
                    ]}
                />
            </LegalSection>

            <LegalSection id='meta' title='Informasi Dokumen'>
                <LegalTable
                    headers={['Keterangan', 'Nilai']}
                    rows={[
                        ['Versi dokumen', '1.0'],
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