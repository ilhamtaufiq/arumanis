import { Scale } from 'lucide-react'
import {
    LegalCallout,
    LegalList,
    LegalPageLayout,
    LegalSection,
} from './legal-page-layout'

export function Terms() {
    return (
        <LegalPageLayout
            title='Syarat & Ketentuan'
            subtitle='Ketentuan penggunaan platform Arumanis dan Panel Pengawasan'
            icon={Scale}
            badge='Dokumen Hukum'
            active='terms'
        >
            <LegalCallout variant='important'>
                Dengan mengakses atau menggunakan Arumanis, Anda menyatakan telah
                membaca, memahami, dan menyetujui Syarat & Ketentuan ini beserta{' '}
                <a href='/privacy-policy' className='font-black underline underline-offset-2'>
                    Kebijakan Privasi
                </a>
                .
            </LegalCallout>

            <LegalSection id='pendahuluan' title='1. Pendahuluan'>
                <p>
                    Arumanis (Aplikasi Satu Data Air Minum dan Sanitasi) adalah
                    platform digital yang dikelola Bidang Air Minum dan Sanitasi
                    Pemerintah Kabupaten Cianjur untuk mendukung perencanaan,
                    pelaksanaan, pemantauan, dan pelaporan program air minum serta
                    sanitasi.
                </p>
                <p>
                    Platform ini mencakup aplikasi utama Arumanis dan Panel
                    Pengawasan (<code className='rounded border border-[#111111]/20 bg-[#FFF4DF] px-1 py-0.5 text-xs'>/pengawasan</code>
                    ) yang terhubung melalui akun terpadu (SSO).
                </p>
            </LegalSection>

            <LegalSection id='definisi' title='2. Definisi'>
                <LegalList
                    items={[
                        'Pengguna: individu yang diberi akun dan hak akses resmi untuk menggunakan sistem.',
                        'Administrator: pengguna dengan wewenang mengelola data master, pengguna, dan konfigurasi sistem.',
                        'Pengawas: pengguna lapangan yang memantau progres, dokumentasi foto, dan pelaporan melalui Panel Pengawasan.',
                        'Data operasional: informasi pekerjaan, kontrak, progress, berkas, foto, tiket, dan laporan terkait program.',
                        'Konten pengguna: data, dokumen, foto, komentar, atau unggahan yang dibuat pengguna dalam sistem.',
                    ]}
                />
            </LegalSection>

            <LegalSection id='akun' title='3. Akun & Keamanan'>
                <p>
                    Setiap pengguna wajib menggunakan akun pribadi yang dikeluarkan
                    instansi. Dilarang membagikan kredensial login, token sesi, atau
                    akses impersonate kepada pihak lain.
                </p>
                <LegalList
                    items={[
                        'Anda bertanggung jawab atas seluruh aktivitas yang terjadi melalui akun Anda.',
                        'Segera laporkan kepada administrator jika menduga akun disalahgunakan atau terjadi kebocoran akses.',
                        'Sesi yang berakhir (misalnya error 401) harus diperbarui melalui halaman masuk resmi Arumanis.',
                        'Fitur impersonate hanya boleh digunakan administrator sesuai prosedur internal dan audit yang berlaku.',
                    ]}
                />
            </LegalSection>

            <LegalSection id='penggunaan' title='4. Penggunaan yang Diperbolehkan'>
                <p>
                    Sistem hanya digunakan untuk kepentingan operasional resmi program
                    air minum dan sanitasi. Pengguna wajib memasukkan data yang akurat,
                    dapat dipertanggungjawabkan, dan sesuai kewenangan peran.
                </p>
                <LegalList
                    items={[
                        'Mengunggah dokumentasi foto dan berkas sesuai ketentuan teknis yang berlaku.',
                        'Mencatat progress, laporan mingguan, tiket kendala, dan data monitoring secara jujur.',
                        'Menghormati pembatasan akses berdasarkan peran, wilayah, atau penugasan pekerjaan.',
                        'Menggunakan fitur analisa, notifikasi, dan integrasi lain sesuai tujuan operasional.',
                    ]}
                />
            </LegalSection>

            <LegalSection id='larangan' title='5. Larangan'>
                <LegalList
                    items={[
                        'Mengakses, mengubah, atau menghapus data di luar kewenangan yang diberikan.',
                        'Mengunggah konten yang melanggar hukum, menyesatkan, atau tidak relevan dengan pekerjaan.',
                        'Mencoba membongkar, mengganggu, atau mengeksploitasi keamanan sistem.',
                        'Menggunakan data dari sistem untuk kepentingan komersial pihak ketiga tanpa persetujuan tertulis.',
                        'Menyalin atau mengekspor data sensitif tanpa otorisasi sesuai kebijakan instansi.',
                    ]}
                />
            </LegalSection>

            <LegalSection id='data' title='6. Data & Konten'>
                <p>
                    Data yang diinput ke dalam Arumanis menjadi bagian dari repositori
                    operasional instansi. Hak cipta atas dokumen resmi mengikuti
                    ketentuan peraturan yang berlaku.
                </p>
                <p>
                    Pengguna memberikan izin kepada sistem untuk memproses, menyimpan,
                    menampilkan, dan menganalisis konten yang diunggah sejauh diperlukan
                    untuk pelaksanaan tugas, termasuk metadata lokasi pada dokumentasi
                    foto lapangan.
                </p>
            </LegalSection>

            <LegalSection id='ketersediaan' title='7. Ketersediaan Layanan'>
                <p>
                    Kami berupaya menjaga ketersediaan dan kinerja sistem, namun tidak
                    menjamin layanan bebas gangguan. Pemeliharaan, pembaruan versi, atau
                    kendala infrastruktur dapat menyebabkan akses terbatas sementara.
                </p>
                <LegalCallout>
                    Saat pembaruan aplikasi tersedia, pengguna dapat diminta melakukan
                    muat ulang (refresh) agar versi terbaru aktif.
                </LegalCallout>
            </LegalSection>

            <LegalSection id='sanksi' title='8. Sanksi & Penghentian Akses'>
                <p>
                    Pelanggaran terhadap ketentuan ini dapat berakibat pada pembatasan
                    fitur, penangguhan akun, atau pencabutan akses sesuai kebijakan
                    internal instansi dan peraturan perundang-undangan yang berlaku.
                </p>
            </LegalSection>

            <LegalSection id='perubahan' title='9. Perubahan Ketentuan'>
                <p>
                    Syarat & Ketentuan dapat diperbarui sewaktu-waktu. Perubahan material
                    akan diinformasikan melalui aplikasi atau saluran resmi instansi.
                    Penggunaan berkelanjutan setelah perubahan dianggap sebagai
                    persetujuan atas ketentuan yang diperbarui.
                </p>
            </LegalSection>

            <LegalSection id='kontak' title='10. Kontak'>
                <p>
                    Pertanyaan mengenai Syarat & Ketentuan ini dapat disampaikan kepada
                    administrator sistem Arumanis melalui unit Bidang Air Minum dan
                    Sanitasi Kabupaten Cianjur atau kanal dukungan internal yang
                    ditetapkan instansi.
                </p>
            </LegalSection>
        </LegalPageLayout>
    )
}