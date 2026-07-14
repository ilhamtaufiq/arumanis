import type { LucideIcon } from 'lucide-react'
import {
    Activity,
    Briefcase,
    Calendar,
    ClipboardList,
    FileText,
    MapPin,
    Shield,
    Users,
    Wallet,
    Droplets,
    FileStack,
} from 'lucide-react'

export type ReportFormat = 'pdf' | 'excel'
export type ReportId =
    | 'rekap-progres'
    | 'daftar-pekerjaan'
    | 'pekerjaan-per-desa'
    | 'pagu-vs-kontrak'
    | 'rekap-kontrak'
    | 'register-dokumen'
    | 'penerima'
    | 'pengawas'
    | 'spm-sanitasi'
    | 'draft-pekerjaan'
    | 'kalender'

export type ReportDefinition = {
    id: ReportId
    title: string
    description: (year: string) => string
    icon: LucideIcon
    formats: ReportFormat[]
    tags: string[]
}

export type ReportCategory = {
    category: string
    items: ReportDefinition[]
}

/** Catalog of reports that can actually be generated from existing APIs/data. */
export const REPORT_CATEGORIES: ReportCategory[] = [
    {
        category: 'Pekerjaan & Progres',
        items: [
            {
                id: 'rekap-progres',
                title: 'Rekap Progres Mingguan',
                description: (year) =>
                    `Tren rencana vs realisasi fisik per minggu + rekap progres pekerjaan TA ${year}.`,
                icon: Activity,
                formats: ['pdf', 'excel'],
                tags: ['OPERASIONAL', 'PIMPINAN'],
            },
            {
                id: 'daftar-pekerjaan',
                title: 'Daftar Pekerjaan',
                description: (year) =>
                    `Seluruh paket pekerjaan TA ${year} dengan lokasi, pengawas, dan pagu.`,
                icon: Briefcase,
                formats: ['pdf', 'excel'],
                tags: ['DATA-TEKNIS'],
            },
            {
                id: 'pekerjaan-per-desa',
                title: 'Daftar Pekerjaan per Desa',
                description: () =>
                    'Distribusi lokasi pekerjaan diurutkan per kecamatan/desa beserta pengawas.',
                icon: MapPin,
                formats: ['excel'],
                tags: ['DATA-TEKNIS', 'WILAYAH'],
            },
        ],
    },
    {
        category: 'Keuangan & Administrasi',
        items: [
            {
                id: 'pagu-vs-kontrak',
                title: 'Realisasi Pagu vs Kontrak',
                description: () =>
                    'Perbandingan pagu pekerjaan terhadap nilai kontrak terikat dan sisa anggaran.',
                icon: Wallet,
                formats: ['excel'],
                tags: ['KEUANGAN', 'EVALUASI'],
            },
            {
                id: 'rekap-kontrak',
                title: 'Rekapitulasi Nilai Kontrak',
                description: (year) =>
                    `Export server daftar kontrak TA ${year} (penyedia, nomor, nilai).`,
                icon: FileText,
                formats: ['excel'],
                tags: ['ADMINISTRASI'],
            },
            {
                id: 'register-dokumen',
                title: 'Register Dokumen',
                description: (year) =>
                    `Register SPPBJ/SPK/SPMK dan kelengkapan dokumen pekerjaan TA ${year}.`,
                icon: ClipboardList,
                formats: ['excel'],
                tags: ['ADMINISTRASI'],
            },
            {
                id: 'draft-pekerjaan',
                title: 'Draft Pekerjaan',
                description: (year) =>
                    `Export server data draft pekerjaan TA ${year}.`,
                icon: FileStack,
                formats: ['excel'],
                tags: ['OPERASIONAL'],
            },
        ],
    },
    {
        category: 'Manfaat & Lapangan',
        items: [
            {
                id: 'penerima',
                title: 'Daftar Penerima Manfaat',
                description: (year) =>
                    `BNBA penerima manfaat (nama, NIK, alamat, jiwa) TA ${year}.`,
                icon: Users,
                formats: ['pdf', 'excel'],
                tags: ['SOSIAL', 'VERIFIKASI'],
            },
            {
                id: 'pengawas',
                title: 'Daftar Pengawas Lapangan',
                description: () =>
                    'Rekap pengawas, jumlah lokasi, dan total pagu yang dipantau.',
                icon: Shield,
                formats: ['pdf', 'excel'],
                tags: ['LAPANGAN'],
            },
            {
                id: 'spm-sanitasi',
                title: 'Data SPM Sanitasi',
                description: () =>
                    'Export server data infrastruktur sanitasi dan cakupan KK.',
                icon: Droplets,
                formats: ['excel'],
                tags: ['SPM', 'SANITASI'],
            },
        ],
    },
    {
        category: 'Perencanaan',
        items: [
            {
                id: 'kalender',
                title: 'Kalender Kegiatan',
                description: () =>
                    'Jadwal event, tugas, dan milestone dari kalender aplikasi.',
                icon: Calendar,
                formats: ['pdf', 'excel'],
                tags: ['PERENCANAAN'],
            },
        ],
    },
]
