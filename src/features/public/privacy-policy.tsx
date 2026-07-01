import { Shield } from 'lucide-react'
import {
    LegalCallout,
    LegalList,
    LegalPageLayout,
    LegalSection,
} from './legal-page-layout'

export function PrivacyPolicy() {
    return (
        <LegalPageLayout
            title='Kebijakan Privasi'
            subtitle='Cara Arumanis mengumpulkan, menggunakan, dan melindungi data Anda'
            icon={Shield}
            badge='Perlindungan Data'
            active='privacy'
        >
            <LegalCallout variant='important'>
                Kebijakan ini berlaku untuk Arumanis utama, Panel Pengawasan, dan
                layanan terkait yang menggunakan akun terpadu instansi.
            </LegalCallout>

            <LegalSection id='pendahuluan' title='1. Pendahuluan'>
                <p>
                    Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) menghormati
                    privasi pengguna dan berkomitmen melindungi data pribadi serta data
                    operasional yang diproses dalam sistem.
                </p>
                <p>
                    Dokumen ini menjelaskan jenis data yang dikumpulkan, tujuan
                    pemrosesan, dasar akses, serta hak pengguna sejauh diatur kebijakan
                    instansi dan peraturan yang berlaku di Indonesia.
                </p>
            </LegalSection>

            <LegalSection id='data-dikumpulkan' title='2. Data yang Kami Kumpulkan'>
                <LegalList
                    items={[
                        'Data identitas & akun: nama, email, peran (role), unit kerja, dan metadata login.',
                        'Data otentikasi: token sesi, riwayat masuk, serta informasi SSO saat dialihkan ke Panel Pengawasan.',
                        'Data lokasi (GPS): koordinat perangkat saat dokumentasi foto atau pelaporan lapangan diaktifkan.',
                        'Data operasional: pekerjaan, kontrak, progress, output, berkas, laporan mingguan, tiket, dan komentar.',
                        'Media & dokumen: foto, PDF, spreadsheet, dan berkas lain yang diunggah pengguna.',
                        'Data teknis: jenis perangkat, browser, alamat IP, log aktivitas, dan informasi diagnostik error.',
                        'Data notifikasi: preferensi pemberitahuan, status baca, dan riwayat broadcast sistem.',
                    ]}
                />
            </LegalSection>

            <LegalSection id='tujuan' title='3. Tujuan Pemrosesan Data'>
                <LegalList
                    items={[
                        'Menyediakan autentikasi, otorisasi, dan pengalaman SSO antar aplikasi.',
                        'Mendukung manajemen program air minum & sanitasi secara terintegrasi.',
                        'Memvalidasi dokumentasi lapangan (termasuk watermark lokasi/waktu pada foto bila diaktifkan).',
                        'Menghasilkan laporan monitoring, analisa, dan evaluasi kinerja proyek.',
                        'Mengelola tiket kendala, notifikasi, dan alur tindak lanjut operasional.',
                        'Menjaga keamanan sistem, mencegah penyalahgunaan, dan mendukung audit internal.',
                        'Melakukan pemeliharaan, peningkatan fitur, dan perbaikan kualitas layanan.',
                    ]}
                />
            </LegalSection>

            <LegalSection id='dasar-akses' title='4. Dasar Akses & Pembatasan Peran'>
                <p>
                    Akses data mengikuti prinsip least privilege berbasis peran, wilayah,
                    dan penugasan pekerjaan. Pengguna hanya dapat melihat atau mengubah
                    data sesuai hak yang ditetapkan administrator.
                </p>
                <LegalCallout>
                    Fitur impersonate hanya tersedia untuk peran tertentu, dicatat dalam
                    log sistem, dan tidak boleh digunakan di luar prosedur resmi.
                </LegalCallout>
            </LegalSection>

            <LegalSection id='berbagi' title='5. Berbagi & Pengungkapan Data'>
                <p>
                    Kami tidak menjual data pribadi kepada pihak ketiga. Data dapat
                    dibagikan secara terbatas kepada:
                </p>
                <LegalList
                    items={[
                        'Pejabat atau unit kerja yang berwenang dalam lingkup program terkait.',
                        'Penyedia infrastruktur (hosting, penyimpanan, atau layanan pendukung) dengan perjanjian kerahasiaan.',
                        'Pihak berwenang apabila diwajibkan oleh peraturan perundang-undangan.',
                    ]}
                />
            </LegalSection>

            <LegalSection id='penyimpanan' title='6. Penyimpanan & Retensi'>
                <p>
                    Data disimpan pada infrastruktur yang dikelola atau ditunjuk instansi.
                    Masa penyimpanan mengikuti kebutuhan operasional, kewajiban arsip,
                    dan kebijakan retensi internal.
                </p>
                <p>
                    Data yang tidak lagi diperlukan dapat diarsipkan atau dihapus sesuai
                    prosedur yang berlaku, dengan mempertimbangkan audit dan
                    pertanggungjawaban program.
                </p>
            </LegalSection>

            <LegalSection id='keamanan' title='7. Keamanan Data'>
                <p>
                    Kami menerapkan langkah teknis dan organisatoris untuk melindungi data,
                    termasuk kontrol akses, enkripsi pada saluran komunikasi (HTTPS),
                    pembatasan peran, serta pemantauan aktivitas.
                </p>
                <p>
                    Tidak ada sistem yang sepenuhnya bebas risiko. Pengguna turut
                    berperan menjaga kerahasiaan kredensial dan perangkat yang digunakan.
                </p>
            </LegalSection>

            <LegalSection id='hak-pengguna' title='8. Hak Pengguna'>
                <p>
                    Sesuai kebijakan instansi, pengguna dapat mengajukan permintaan
                    terkait:
                </p>
                <LegalList
                    items={[
                        'Akses atau koreksi data profil yang tidak akurat.',
                        'Penjelasan mengenai pemrosesan data operasional yang menyangkut akun Anda.',
                        'Pembaruan preferensi notifikasi melalui fitur yang tersedia.',
                        'Pelaporan dugaan penyalahgunaan atau insiden keamanan data.',
                    ]}
                />
            </LegalSection>

            <LegalSection id='cookie' title='9. Cookie & Penyimpanan Lokal'>
                <p>
                    Aplikasi menggunakan cookie dan penyimpanan lokal browser untuk
                    menjaga sesi login, preferensi antarmuka, serta informasi versi
                    build agar pembaruan aplikasi dapat diterapkan dengan benar.
                </p>
            </LegalSection>

            <LegalSection id='perubahan' title='10. Perubahan Kebijakan'>
                <p>
                    Kebijakan Privasi dapat diperbarui untuk menyesuaikan perubahan
                    fitur, regulasi, atau praktik pengelolaan data. Versi terbaru akan
                    dipublikasikan di halaman ini dengan tanggal pembaruan.
                </p>
            </LegalSection>

            <LegalSection id='kontak' title='11. Kontak'>
                <p>
                    Untuk pertanyaan privasi atau permintaan terkait data pribadi,
                    hubungi administrator sistem Arumanis melalui unit Bidang Air Minum
                    dan Sanitasi Kabupaten Cianjur.
                </p>
                <p>
                    Lihat juga{' '}
                    <a href='/terms' className='font-black underline underline-offset-2'>
                        Syarat & Ketentuan
                    </a>{' '}
                    untuk ketentuan penggunaan platform.
                </p>
            </LegalSection>
        </LegalPageLayout>
    )
}