import { FileText } from 'lucide-react'

export function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-8 sm:p-10 space-y-8">
                    <div className="flex items-center space-x-4 border-b border-border pb-6">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <FileText className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Kebijakan Privasi</h1>
                            <p className="text-muted-foreground mt-1">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">1. Pendahuluan</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Selamat datang di ARUMANIS (Aplikasi Satu Data Air Minum dan Sanitasi). Kami sangat menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan menjaga informasi Anda saat Anda menggunakan aplikasi kami.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">2. Informasi yang Kami Kumpulkan</h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                Saat Anda menggunakan layanan kami, kami dapat mengumpulkan berbagai jenis informasi, termasuk:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong>Informasi Profil:</strong> Nama, alamat email, dan informasi kontak lainnya saat Anda mendaftar atau login (termasuk melalui Google OAuth).</li>
                                <li><strong>Informasi Lokasi (GPS):</strong> Untuk fitur dokumentasi foto dan pelaporan proyek, aplikasi kami membutuhkan dan akan mencatat data koordinat lokasi (Geo-Fencing) untuk memastikan keakuratan posisi di area proyek.</li>
                                <li><strong>Informasi Perangkat & Penggunaan:</strong> Log aktivitas, jenis perangkat, dan informasi koneksi yang digunakan untuk mengakses aplikasi offline/online.</li>
                                <li><strong>Media dan Dokumen:</strong> Foto, dokumen (PDF, Excel, Word), dan file lain yang Anda unggah ke dalam sistem.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">3. Penggunaan Informasi</h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                Kami menggunakan informasi yang dikumpulkan untuk tujuan berikut:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Memfasilitasi manajemen proyek infrastruktur air minum dan sanitasi.</li>
                                <li>Memvalidasi lokasi (melalui Geo-Fencing) dan waktu pelaporan kegiatan di lapangan (penambahan watermark otomatis pada foto).</li>
                                <li>Mengelola otorisasi dan hak akses pengguna sesuai peran (Role-Based Access Control).</li>
                                <li>Meningkatkan dan memelihara keamanan, ketersediaan, dan kinerja aplikasi.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">4. Berbagi Informasi</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Kami tidak akan menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Informasi Anda hanya dapat diakses oleh pihak internal atau pihak berwenang sesuai dengan tingkat akses yang ditentukan (berdasarkan wilayah, proyek, atau peran spesifik) untuk keperluan manajemen data dan evaluasi infrastruktur.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">5. Keamanan Data</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Kami menerapkan langkah-langkah keamanan teknis dan administratif untuk melindungi data Anda dari akses, modifikasi, atau penghancuran yang tidak sah. Walaupun kami berusaha maksimal, perlu dipahami bahwa tidak ada transmisi data melalui internet yang sepenuhnya 100% aman.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">6. Perubahan Kebijakan Privasi</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu. Kami akan memberitahukan perubahan signifikan melalui pemberitahuan di dalam aplikasi. Dengan terus menggunakan ARUMANIS setelah perubahan tersebut, Anda dianggap menyetujui kebijakan yang baru.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">7. Kontak Kami</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Jika Anda memiliki pertanyaan atau kekhawatiran terkait Kebijakan Privasi ini, silakan hubungi administrator sistem ARUMANIS di instansi terkait.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
