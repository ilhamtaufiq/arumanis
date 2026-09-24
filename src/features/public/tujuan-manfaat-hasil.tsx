import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Target } from 'lucide-react'
import { InnovationSpmScopeCallout } from './components/innovation-spm-scope-callout'
import { trackVisitorEvent } from '@/lib/analytics/visitor-events'
import {
    INNOVATION_DOC_UPDATED_AT,
    INNOVATION_DOC_VERSION_TUJUAN,
    LegalCallout,
    LegalPageLayout,
    LegalSection,
    LegalSubheading,
    LegalTable,
} from './legal-page-layout'

export function TujuanManfaatHasil() {
    useEffect(() => {
        void trackVisitorEvent('innovation_page_view', { page: 'tujuan-manfaat-hasil' })
    }, [])

    return (
        <LegalPageLayout
            title='Tujuan, Manfaat, dan Hasil'
            subtitle='Tujuan, manfaat, dan hasil penyelenggaraan Arumanis — DPKP Kabupaten Cianjur'
            icon={Target}
            badge='Dokumen Inovasi'
            active='tujuan-manfaat-hasil'
            backTo='/'
            updatedAt={INNOVATION_DOC_UPDATED_AT}
            footerNote='Dokumen inovasi Arumanis — melengkapi panduan operasional dan dokumen hukum.'
        >
            <LegalCallout>
                <strong>Arumanis</strong> (Aplikasi Satu Data Air Minum dan Sanitasi) dikelola{' '}
                <strong>Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur</strong> untuk
                menyatukan data air minum dan sanitasi di seluruh desa/kelurahan dan kecamatan.
                Permasalahan latar diuraikan pada{' '}
                <Link to='/rancang-bangun-inovasi' className='font-black underline underline-offset-2'>
                    Latar Belakang
                </Link>
                .
            </LegalCallout>

            <InnovationSpmScopeCallout />

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
                        'Permasalahan Terkait',
                    ]}
                    rows={[
                        [
                            'T1',
                            'Menyatukan data unit SPAM, capaian SPM, dan proyek air minum–sanitasi dalam satu basis data terintegrasi di seluruh Kabupaten Cianjur',
                            'Unit SPAM terdigitalisasi dan sumber data aktif terkelola dalam satu platform',
                            'Fragmentasi data antar unit (makro); input ulang data (mikro — operator)',
                        ],
                        [
                            'T2',
                            'Meningkatkan akurasi dan kecepatan rekapitulasi capaian Standar Pelayanan Minimum (SPM) air minum per desa',
                            'Waktu rekapitulasi lintas desa lebih cepat; selisih data antar laporan mengecil',
                            'Kesenjangan capaian SPM air minum (makro); inkonsistensi SR/KK (mikro — operator)',
                        ],
                        [
                            'T3',
                            'Mempercepat monitoring dan pengawasan paket pekerjaan infrastruktur melalui alur digital lapangan–kantor',
                            'Pembaruan progres berkala dan dokumentasi lapangan terindeks lokasi',
                            'Keterbatasan monitoring real-time (makro); dokumentasi terpisah (mikro — pengawas)',
                        ],
                        [
                            'T4',
                            'Menyediakan portal informasi capaian SPM air minum dan sanitasi yang terbuka dan dapat dipertanggungjawabkan kepada masyarakat',
                            'Peta publik kedua bidang, ringkasan cakupan desa, dan akses tanpa login',
                            'Tuntutan transparansi publik (makro); akses informasi desa sulit (mikro — masyarakat)',
                        ],
                        [
                            'T5',
                            'Mendukung transformasi digital SPBE pada program air minum dan sanitasi DPKP Cianjur',
                            'Adopsi pengguna aktif dan modul terintegrasi SSO',
                            'Transformasi digital birokrasi (makro); koordinasi manual (mikro — manajer proyek)',
                        ],
                        [
                            'T6',
                            'Menguatkan evaluasi kinerja unit SPAM desa (POKMAS, kapasitas, anggaran, capaian tahunan) secara berkala',
                            'Kelengkapan profil unit dan tersedianya catatan capaian per tahun',
                            'Data POKMAS tidak terdokumentasi (mikro — unit SPAM desa)',
                        ],
                    ]}
                />
                <LegalSubheading>Narasi Tujuan Utama</LegalSubheading>
                <p>
                    Arumanis bertujuan menjadi satu sumber data (single source of truth) penyelenggaraan
                    air minum dan sanitasi Kabupaten Cianjur — mulai dari aset SPAM, capaian SPM air
                    minum dan sanitasi, hingga pelaksanaan serta pengawasan proyek — sehingga
                    perencanaan intervensi per desa, pengawasan lapangan, dan portal informasi capaian
                    kepada masyarakat dapat dilakukan secara terukur, terintegrasi, dan berkelanjutan,
                    sejalan dengan SDGs 6, RPJMD, dan RISPAM daerah.
                </p>
            </LegalSection>

            <LegalSection id='manfaat' title='2. Manfaat'>
                <p>
                    Manfaat adalah perubahan atau dampak nyata (outcome) yang dirasakan pihak terkait
                    setelah inovasi digunakan — bukan produk teknisnya. Manfaat dievaluasi secara berkala
                    pada setiap triwulan.
                </p>

                <LegalSubheading>2.1 Pemerintah Daerah (DPKP & unit terkait)</LegalSubheading>
                <LegalTable
                    headers={['Manfaat', 'Uraian']}
                    rows={[
                        [
                            'Pengambilan keputusan lebih cepat dan tepat',
                            'Dashboard dan peta capaian memperlihatkan desa prioritas intervensi SPM air minum secara langsung',
                        ],
                        [
                            'Efisiensi administrasi data',
                            'Input, impor, dan ekspor terpusat mengurangi duplikasi pekerjaan operator',
                        ],
                        [
                            'Akuntabilitas penggunaan anggaran',
                            'Nilai kontrak dan progres fisik–keuangan terlacak per paket pekerjaan',
                        ],
                        [
                            'Penguatan SPBE dan reformasi birokrasi',
                            'Satu akun SSO untuk Arumanis utama dan Panel Pengawasan dengan kontrol akses berbasis peran',
                        ],
                        [
                            'Perencanaan program selaras RPJMD & RISPAM',
                            'Data capaian per kecamatan/desa menjadi dasar faktual penargetan dan penyusunan Renja/RKPD',
                        ],
                    ]}
                />

                <LegalSubheading>2.2 Masyarakat dan pemangku kepentingan lokal</LegalSubheading>
                <LegalTable
                    headers={['Manfaat', 'Uraian']}
                    rows={[
                        [
                            'Transparansi capaian layanan air minum & sanitasi',
                            'Masyarakat dapat melihat capaian SPM per desa tanpa harus datang ke kantor',
                        ],
                        [
                            'Partisipasi pengawasan layanan (POKMAS)',
                            'Data pengelola dan capaian unit desa terbuka bagi aparatur desa dan POKMAS',
                        ],
                        [
                            'Kepercayaan publik terhadap program pembangunan',
                            'Dokumentasi progres ber-lokasi meningkatkan kredibilitas pelaporan fisik proyek',
                        ],
                    ]}
                />

                <LegalSubheading>2.3 Pelaksana teknis (operator, pengawas, TFL/konsultan)</LegalSubheading>
                <LegalTable
                    headers={['Manfaat', 'Uraian']}
                    rows={[
                        [
                            'Beban kerja administratif berkurang',
                            'Satu platform menggantikan beberapa lembar kerja dan berkas yang tersebar',
                        ],
                        [
                            'Pengawasan lapangan lebih terstruktur',
                            'Dokumentasi slot foto, laporan berkala, dan penanganan kendala dalam satu alur',
                        ],
                        [
                            'Analisis data tanpa query manual',
                            'Asisten Ami AI membantu menafsirkan data operasional secara cepat',
                        ],
                    ]}
                />

                <LegalSubheading>2.4 Sektor dan lingkungan pembangunan</LegalSubheading>
                <LegalTable
                    headers={['Manfaat', 'Uraian']}
                    rows={[
                        [
                            'Kontribusi pada SDGs 6',
                            'Pemantauan SR/KK/jiwa terlayani mendukung percepatan akses air minum layak',
                        ],
                        [
                            'Dukungan penurunan stunting',
                            'Akses air minum layak memperkuat sanitasi rumah tangga',
                        ],
                        [
                            'Efisiensi investasi infrastruktur',
                            'Deteksi dini deviasi proyek mengurangi risiko salah alokasi anggaran',
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
                    headers={['No.', 'Hasil (Output)', 'Deskripsi']}
                    rows={[
                        ['H1', 'Platform Arumanis Utama', 'Dashboard, pekerjaan, SPAM, users, notifikasi, dan asisten Ami AI'],
                        ['H2', 'Panel Pengawasan Terintegrasi', 'Progress, foto ber-lokasi, laporan berkala, tiket; satu akun SSO'],
                        ['H3', 'Backend API (api amis)', 'REST API Laravel: data, validasi, dan kontrol akses/peran'],
                        ['H4', 'Basis Data Terintegrasi SPAM–SPM', 'Desa, unit SPAM, achievement, anggaran, pekerjaan, dan foto dalam satu basis data'],
                        ['H5', 'Portal Informasi Publik Capaian SPM', 'Landing: ringkasan cakupan desa, peta choropleth air minum & sanitasi, publikasi, dan capaian SPM tanpa login'],
                        ['H6', 'Modul SPAM Unit', 'Pengelolaan unit, capaian SPM air minum, POKMAS, anggaran, dan impor data CSV/Excel'],
                        ['H7', 'Modul Monitoring Pekerjaan & Puspen', 'Paket, progress estimasi, dan sinkronisasi Panel Pengawasan'],
                        ['H8', 'Repositori Dokumentasi Lapangan', 'Foto progres berslot dan metadata lokasi'],
                        ['H9', 'Sistem Notifikasi & Tiket', 'Broadcast pengumuman dan pelacakan kendala'],
                        ['H10', 'Dokumentasi Pengguna', 'Panduan operator, pengawas, dan publik'],
                    ]}
                />

                <LegalSubheading>3.2 Hasil penunjang</LegalSubheading>
                <LegalTable
                    compact
                    headers={['No.', 'Hasil (Output)', 'Deskripsi']}
                    rows={[
                        ['H11', 'Template impor data SPAM (CSV/Excel)', 'Format standar migrasi data historis'],
                        ['H12', 'Skema role & permission', 'Admin, operator (wilayah), viewer, dan pengawas'],
                        ['H13', 'Laporan ekspor PDF/Excel', 'Output cetak/digital dari data terintegrasi'],
                        ['H14', 'Asisten Ami AI', 'Modul interaksi analisis data operasional'],
                        ['H15', 'Dokumen Latar Belakang', 'Permasalahan, isu strategis, metode pembaharuan, dan tahapan Arumanis — /rancang-bangun-inovasi'],
                        ['H16', 'Peta & API capaian SPM sanitasi', 'Visualisasi geospasial dan endpoint publik capaian SPM sanitasi'],
                    ]}
                />

                <LegalSubheading>3.3 Pembedaan manfaat vs hasil</LegalSubheading>
                <LegalTable
                    headers={['Aspek', 'Manfaat (Outcome)', 'Hasil (Output)']}
                    rows={[
                        ['Sifat', 'Perubahan kondisi / dampak yang dirasakan', 'Produk, sistem, atau data yang dihasilkan'],
                        ['Contoh 1', 'Rekapitulasi SPM air minum lebih cepat', 'Platform Arumanis, API, dan basis data terintegrasi'],
                        ['Contoh 2', 'Masyarakat lebih mudah memantau capaian layanan per desa tanpa login', 'Portal informasi dengan ringkasan cakupan desa dan peta choropleth'],
                        ['Contoh 3', 'Pengawasan lapangan lebih akuntabel', 'Panel Pengawasan, dokumentasi foto ber-lokasi, dan laporan berkala'],
                        ['Contoh 4', 'Keputusan program berbasis data SPM', 'Dashboard KPI, modul SPAM Unit, dan peta/API publik'],
                    ]}
                />

                <LegalSubheading>3.4 Target hasil jangka pendek</LegalSubheading>
                <LegalTable
                    headers={['Hasil', 'Target']}
                    rows={[
                        ['Kelengkapan data unit SPAM', 'Unit SPAM dengan profil lengkap (desa, kapasitas, SIMSPAM, POKMAS)'],
                        ['Record capaian SPM air minum tahun berjalan', 'Tersedianya achievement per unit aktif untuk tahun anggaran berjalan'],
                        ['Cakupan paket pekerjaan terpantau', 'Paket air minum/sanitasi aktif masuk modul pekerjaan'],
                        ['Dokumentasi foto progres', 'Slot foto wajib terisi pada paket aktif'],
                        ['Ketersediaan portal informasi publik', 'Peta SPM air minum & sanitasi tersedia tanpa login'],
                        ['Kelengkapan sinkronisasi data SPM sanitasi', 'Desa dengan infrastruktur terpetakan akurat pada peta publik'],
                    ]}
                />
            </LegalSection>

            <LegalSection id='meta' title='Informasi Dokumen'>
                <LegalTable
                    headers={['Keterangan', 'Nilai']}
                    rows={[
                        ['Versi dokumen', INNOVATION_DOC_VERSION_TUJUAN],
                        ['Terakhir diperbarui', INNOVATION_DOC_UPDATED_AT],
                        ['Penanggung jawab', 'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur'],
                    ]}
                />
            </LegalSection>
        </LegalPageLayout>
    )
}
