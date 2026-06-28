import type { PublicLocale, PublicMessages } from './types'

export const publicMessages: Record<PublicLocale, PublicMessages> = {
    id: {
        landing: {
            nav: {
                achievements: 'Capaian',
                features: 'Fitur',
                about: 'Tentang',
                publications: 'Publikasi',
                signIn: 'Masuk',
            },
            hero: {
                tagline: 'Arumanis',
                title: 'Air Minum dan Sanitasi.',
                description:
                    'Platform manajemen pekerjaan infrastruktur air minum dan sanitasi yang mengedepankan efisiensi, akurasi data, dan transparansi publik.',
            },
            features: {
                title: 'Arsitektur Digital Untuk Pengawasan',
                description:
                    'Setiap fitur dirancang untuk memberikan kendali penuh atas siklus hidup proyek infrastruktur, dari perencanaan hingga serah terima.',
                highlights: [
                    'Monitoring Real-time',
                    'Validasi Data Akurat',
                    'Pelaporan Otomatis',
                ],
                items: [
                    {
                        title: 'Geographic Insights',
                        desc: 'Visualisasi lokasi dan sebaran pekerjaan melalui integrasi peta digital yang presisi.',
                    },
                    {
                        title: 'Document Control',
                        desc: 'Pusat kendali dokumen kontrak dan administrasi yang terorganisir secara sistematis.',
                    },
                    {
                        title: 'Advanced Analytics',
                        desc: 'Analisis performa keuangan dan fisik melalui dashboard statistik yang komprehensif.',
                    },
                    {
                        title: 'Access Governance',
                        desc: 'Manajemen hak akses yang ketat untuk menjaga integritas dan kerahasiaan data.',
                    },
                ],
            },
            about: {
                title: 'Membangun Ekosistem Air Minum dan Sanitasi yang Berkelanjutan.',
                description:
                    'Arumanis adalah platform manajemen proyek terintegrasi yang dirancang khusus untuk mendukung Bidang Air Minum dan Sanitasi. Kami percaya bahwa transparansi data dan efisiensi operasional adalah kunci untuk mewujudkan infrastruktur yang lebih baik bagi masyarakat.',
                cards: [
                    {
                        label: 'Visi',
                        text: 'Menjadi standar utama dalam manajemen data infrastruktur air minum dan sanitasi.',
                    },
                    {
                        label: 'Misi',
                        text: 'Menyediakan alat kolaborasi yang transparan, akurat, dan mudah diakses oleh semua stakeholder.',
                    },
                    {
                        label: 'Nilai',
                        text: 'Integritas, Inovasi, dan Keberlanjutan dalam setiap tetes data yang kami kelola.',
                    },
                ],
            },
            publications: {
                label: 'Publikasi',
                title: 'Akses informasi publik secara lebih terbuka.',
                description:
                    'Temukan dokumen, pembaruan, dan informasi publik terkait layanan air minum dan sanitasi dalam satu tempat yang mudah diakses.',
                cta: 'Lihat Publikasi',
            },
            spm: {
                label: 'Capaian Publik',
                dataNote: 'Data diperbarui dari basis data Arumanis.',
                syncDisclaimer:
                    'Data yang ditampilkan masih dalam tahap sinkronisasi dan belum bersifat final. Nilai capaian masih dapat berubah dan kemungkinan terjadi kesalahan data.',
                filterAria: 'Filter capaian SPM',
                viewDetail: 'Lihat Detail Capaian',
                sectors: {
                    air_minum: {
                        filterLabel: 'Air Minum',
                        title: 'Sebaran Capaian SPM Air Minum Kabupaten Cianjur',
                        description:
                            'Peta interaktif capaian layanan air minum per desa. Klik wilayah untuk melihat SR, KK, jiwa terlayani, target, dan jumlah unit SPAM.',
                    },
                    sanitasi: {
                        filterLabel: 'Sanitasi',
                        title: 'Sebaran Capaian SPM Sanitasi Kabupaten Cianjur',
                        description:
                            'Peta interaktif capaian layanan sanitasi per desa. Klik wilayah untuk melihat KK pemanfaat, target, jiwa terlayani, dan infrastruktur SPALD/MCK.',
                    },
                },
            },
            footer: {
                tagline: 'arumanis - bidang air minum dan sanitasi',
                navigation: 'Navigasi',
                legal: 'Legal',
                terms: 'Syarat',
                privacy: 'Privasi',
                dashboard: 'Dashboard',
                copyright: '© 2026 Arumanis.',
            },
        },
        legal: {
            back: 'Kembali',
            subtitle: 'Air Minum & Sanitasi Cianjur',
            footerNote: 'Dokumen hukum Arumanis — gunakan bersama panduan pengguna.',
            terms: 'Syarat & Ketentuan',
            privacy: 'Kebijakan Privasi',
            designBuild: 'Rancang Bangun',
            objectives: 'Tujuan & Hasil',
            guide: 'Panduan',
            enNotice: '',
        },
        spmDetail: {
            header: {
                back: 'Beranda',
                signIn: 'Masuk',
            },
            hero: {
                eyebrow: 'Capaian SPM Publik',
                description:
                    'Pantau capaian Standar Pelayanan Minimum (SPM) Air Minum dan Sanitasi Kabupaten Cianjur per desa melalui peta interaktif, ringkasan agregat, dan tabel lengkap.',
            },
            syncDisclaimer:
                'Data yang ditampilkan masih dalam tahap sinkronisasi dan belum bersifat final. Nilai capaian masih dapat berubah dan kemungkinan terjadi kesalahan data.',
            aggregate: {
                airMinum: {
                    title: 'Ringkasan Agregat Air Minum',
                    coverage: 'Cakupan SPM',
                    jiwa: 'Jiwa terlayani',
                    unitSpam: 'Unit SPAM',
                    bjp: 'BJP (KK)',
                    desa: 'Desa ber-capaian',
                    desaHint: 'Desa dengan KK terlayani > 0',
                    achievement: 'Record capaian tahunan',
                    kecamatan: 'kecamatan',
                    scopeFallback: 'Terakumulasi',
                },
                sanitasi: {
                    title: 'Ringkasan Agregat Sanitasi',
                    scopeLabel: 'Capaian infrastruktur sanitasi terkini',
                    coverageJiwa: 'Cakupan jiwa',
                    coverageKk: 'Cakupan KK',
                    coverageKkHint: 'Persentase KK pemanfaat terhadap target',
                    jiwaPemanfaat: 'Jiwa pemanfaat',
                    penduduk: 'penduduk',
                    infrastruktur: 'Infrastruktur',
                    berfungsi: 'berfungsi',
                    desa: 'Desa ber-capaian',
                    belumAda: 'desa belum ada infrastruktur',
                    wilayah: 'Wilayah',
                    kecamatan: 'kecamatan',
                },
            },
            infrastructure: {
                title: 'Komposisi Infrastruktur Sanitasi',
                subtitle: 'Sebaran jenis infrastruktur yang tercatat di basis data Arumanis',
                spaldt: 'SPALDT',
                spalds: 'SPALDS',
                iplt: 'IPLT',
                mckIndividu: 'MCK Individu',
                mckKomunal: 'MCK Komunal',
            },
            table: {
                title: 'Tabel Capaian per Desa',
                subtitle: '{count} desa/kelurahan tercatat',
                searchPlaceholder: 'Cari desa atau kecamatan...',
                loading: 'Memuat data desa...',
                empty: 'Tidak ada data yang cocok dengan pencarian.',
                pageInfo: 'Halaman {page} dari {totalPages} · {totalRows} baris',
                prev: 'Sebelumnya',
                next: 'Berikutnya',
                columns: {
                    desa: 'Desa/Kel.',
                    kecamatan: 'Kecamatan',
                    sr: 'SR',
                    targetKk: 'Target KK',
                    kk: 'KK terlayani',
                    kkPemanfaat: 'KK pemanfaat',
                    jiwa: 'Jiwa',
                    unitSpam: 'Unit SPAM',
                    infrastruktur: 'Infrastruktur',
                    penduduk: 'Penduduk',
                    coverage: 'Capaian %',
                },
            },
        },
    },
    en: {
        landing: {
            nav: {
                achievements: 'Achievements',
                features: 'Features',
                about: 'About',
                publications: 'Publications',
                signIn: 'Sign In',
            },
            hero: {
                tagline: 'Arumanis',
                title: 'Air Minum dan Sanitasi.',
                description:
                    'A platform for managing Air Minum dan Sanitasi infrastructure projects with a focus on efficiency, data accuracy, and public transparency.',
            },
            features: {
                title: 'Digital Architecture for Oversight',
                description:
                    'Every feature is designed to give full control over the infrastructure project lifecycle, from planning through handover.',
                highlights: [
                    'Real-time Monitoring',
                    'Accurate Data Validation',
                    'Automated Reporting',
                ],
                items: [
                    {
                        title: 'Geographic Insights',
                        desc: 'Visualize project locations and distribution through precise digital map integration.',
                    },
                    {
                        title: 'Document Control',
                        desc: 'A centralized hub for contract and administrative documents organized systematically.',
                    },
                    {
                        title: 'Advanced Analytics',
                        desc: 'Analyze financial and physical performance through comprehensive statistical dashboards.',
                    },
                    {
                        title: 'Access Governance',
                        desc: 'Strict access management to protect data integrity and confidentiality.',
                    },
                ],
            },
            about: {
                title: 'Building a Sustainable Air Minum dan Sanitasi Ecosystem.',
                description:
                    'Arumanis is an integrated project management platform built for Bidang Air Minum dan Sanitasi. We believe data transparency and operational efficiency are key to delivering better infrastructure for communities.',
                cards: [
                    {
                        label: 'Vision',
                        text: 'To become the leading standard for Air Minum dan Sanitasi infrastructure data management.',
                    },
                    {
                        label: 'Mission',
                        text: 'To provide transparent, accurate, and accessible collaboration tools for every stakeholder.',
                    },
                    {
                        label: 'Values',
                        text: 'Integrity, innovation, and sustainability in every drop of data we manage.',
                    },
                ],
            },
            publications: {
                label: 'Publications',
                title: 'Access public information more openly.',
                description:
                    'Find documents, updates, and public information about Air Minum dan Sanitasi services in one easy-to-access place.',
                cta: 'View Publications',
            },
            spm: {
                label: 'Public Achievements',
                dataNote: 'Data is updated from the Arumanis database.',
                syncDisclaimer:
                    'The data shown is still being synchronized and is not final. Achievement values may change and data errors may still occur.',
                filterAria: 'SPM achievement filter',
                viewDetail: 'View Achievement Details',
                sectors: {
                    air_minum: {
                        filterLabel: 'Air Minum',
                        title: 'SPM Air Minum Achievement Map — Kabupaten Cianjur',
                        description:
                            'Interactive map of Air Minum service coverage by village. Click a region to view connections, households, people served, targets, and SPAM units.',
                    },
                    sanitasi: {
                        filterLabel: 'Sanitation',
                        title: 'SPM Sanitation Achievement Map — Cianjur Regency',
                        description:
                            'Interactive map of sanitation service coverage by village. Click a region to view beneficiary households, targets, people served, and SPALD/MCK infrastructure.',
                    },
                },
            },
            footer: {
                tagline: 'arumanis - bidang air minum dan sanitasi',
                navigation: 'Navigation',
                legal: 'Legal',
                terms: 'Terms',
                privacy: 'Privacy',
                dashboard: 'Dashboard',
                copyright: '© 2026 Arumanis.',
            },
        },
        legal: {
            back: 'Back',
            subtitle: 'Air Minum & Sanitasi Cianjur',
            footerNote: 'Arumanis legal documents — use together with the user guide.',
            terms: 'Terms & Conditions',
            privacy: 'Privacy Policy',
            designBuild: 'Design & Build',
            objectives: 'Objectives & Outcomes',
            guide: 'User Guide',
            enNotice:
                'The full legal text below is provided in Indonesian as the authoritative version.',
        },
        spmDetail: {
            header: {
                back: 'Home',
                signIn: 'Sign In',
            },
            hero: {
                eyebrow: 'Public SPM Achievements',
                description:
                    'Monitor SPM (Minimum Service Standards) achievements for Air Minum dan Sanitasi in Cianjur Regency through an interactive map, aggregate summaries, and a full village table.',
            },
            syncDisclaimer:
                'The data shown is still being synchronized and is not final. Achievement values may change and data errors may still occur.',
            aggregate: {
                airMinum: {
                    title: 'Air Minum Aggregate Summary',
                    coverage: 'SPM coverage',
                    jiwa: 'People served',
                    unitSpam: 'SPAM units',
                    bjp: 'BJP (households)',
                    desa: 'Villages with coverage',
                    desaHint: 'Villages with served households > 0',
                    achievement: 'Annual achievement records',
                    kecamatan: 'sub-districts',
                    scopeFallback: 'Accumulated',
                },
                sanitasi: {
                    title: 'Sanitasi Aggregate Summary',
                    scopeLabel: 'Latest sanitation infrastructure achievements',
                    coverageJiwa: 'Population coverage',
                    coverageKk: 'Household coverage',
                    coverageKkHint: 'Beneficiary households vs target',
                    jiwaPemanfaat: 'Beneficiary population',
                    penduduk: 'population',
                    infrastruktur: 'Infrastructure',
                    berfungsi: 'functional',
                    desa: 'Villages with coverage',
                    belumAda: 'villages without infrastructure',
                    wilayah: 'Region',
                    kecamatan: 'sub-districts',
                },
            },
            infrastructure: {
                title: 'Sanitasi Infrastructure Mix',
                subtitle: 'Distribution of recorded infrastructure types in the Arumanis database',
                spaldt: 'SPALDT',
                spalds: 'SPALDS',
                iplt: 'IPLT',
                mckIndividu: 'Individual MCK',
                mckKomunal: 'Communal MCK',
            },
            table: {
                title: 'Village Achievement Table',
                subtitle: '{count} villages recorded',
                searchPlaceholder: 'Search village or sub-district...',
                loading: 'Loading village data...',
                empty: 'No data matches your search.',
                pageInfo: 'Page {page} of {totalPages} · {totalRows} rows',
                prev: 'Previous',
                next: 'Next',
                columns: {
                    desa: 'Village',
                    kecamatan: 'Sub-district',
                    sr: 'SR',
                    targetKk: 'Target HH',
                    kk: 'Served HH',
                    kkPemanfaat: 'Beneficiary HH',
                    jiwa: 'Population',
                    unitSpam: 'SPAM units',
                    infrastruktur: 'Infrastructure',
                    penduduk: 'Population',
                    coverage: 'Coverage %',
                },
            },
        },
    },
}

export function getPublicMessages(locale?: PublicLocale | null): PublicMessages {
    if (locale === 'en') return publicMessages.en
    return publicMessages.id
}