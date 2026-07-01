export type LineageEra = {
    id: string
    name: string
    repoUrl: string
    repoLabel: string
    period: string
    architecture: string
    summary: string
    status: 'archived' | 'active'
}

export type ChangelogEntry = {
    scope?: string
    text: string
    date?: string
}

export type ChangelogRelease = {
    version: string
    date: string
    summary: string
    repos: {
        arumanis: ChangelogEntry[]
        apiamis: ChangelogEntry[]
        pengawas: ChangelogEntry[]
    }
}

export const PLATFORM_VERSION = '0.5.0'
export const PLATFORM_UPDATED_AT = '1 Juli 2026'

export const LINEAGE_ERAS: LineageEra[] = [
    {
        id: 'sandb',
        name: 'SandB — Pilot Database Sanitasi',
        repoUrl: 'https://github.com/ilhamtaufiq/sandb',
        repoLabel: 'ilhamtaufiq/sandb',
        period: 'Era pilot',
        architecture: 'Laravel monolith (fork cendeka/sandb)',
        summary:
            'Validasi domain data sanitasi dan pola pengelolaan wilayah. Menjadi fondasi konsep sebelum AMS Pro.',
        status: 'archived',
    },
    {
        id: 'amspro',
        name: 'AMS Pro — Prototipe Terpadu',
        repoUrl: 'https://github.com/ilhamtaufiq/amspro',
        repoLabel: 'ilhamtaufiq/amspro',
        period: 'Era prototipe',
        architecture: 'Laravel + Inertia.js + React monolith',
        summary:
            'Aplikasi manajemen proyek air minum dan sanitasi DISPERKIM Cianjur: pekerjaan, kontrak, foto, progress, berkas, dan chat.',
        status: 'archived',
    },
    {
        id: 'platform',
        name: 'Arumanis Platform — Operasional',
        repoUrl: 'https://github.com/ilhamtaufiq/arumanis',
        repoLabel: 'arumanis + apiamis + pengawas',
        period: '2025 — sekarang',
        architecture: 'SPA React + BFF + Laravel API + app pengawas terpisah',
        summary:
            'Pemisahan frontend/backend, landing publik SPM, SSO pengawasan, ONLYOFFICE, Drive, Puspen, dan integrasi AI.',
        status: 'active',
    },
]

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
    {
        version: '0.5.0',
        date: '2026-07-01',
        summary:
            'Drive 3-zona, drive pribadi pengguna, kontrak Excel + ONLYOFFICE, validasi koordinat GPS, dan perbaikan sort/tampilan.',
        repos: {
            arumanis: [
                { scope: 'berkas', text: 'Drive 3-zona (Puspen, Pekerjaan, Users) dengan sort dan toggle grid/list', date: '2026-07-01' },
                { scope: 'kontrak', text: 'Ringkasan kontrak Excel dan pratinjau ONLYOFFICE', date: '2026-07-01' },
                { scope: 'settings', text: 'Template dokumen kontrak dan pratinjau email Sweet News', date: '2026-07-01' },
                { scope: 'foto', text: 'Validasi koordinat GPS saat upload foto', date: '2026-07-01' },
                { scope: 'dashboard', text: 'Presence pengguna online dan sinkron route permission', date: '2026-06-30' },
                { scope: 'public', text: 'SEO: OG injection, sitemap, robots, dan peta SPM responsif', date: '2026-06-30' },
                { scope: 'landing', text: 'Portal landing, kontak publik, dan integrasi Instagram', date: '2026-06-30' },
            ],
            apiamis: [
                { scope: 'user-drive', text: 'API drive pribadi pengguna (folder + unggah file)', date: '2026-07-01' },
                { scope: 'kontrak', text: 'Export ringkasan kontrak Excel', date: '2026-07-01' },
                { scope: 'presence', text: 'API presence pengguna dan sinkron route permission', date: '2026-06-30' },
                { scope: 'email', text: 'Template email Sweet News dan form kontak', date: '2026-06-30' },
                { scope: 'koordinat', text: 'Validasi koordinat foto dalam batas desa pekerjaan', date: '2026-06-23' },
            ],
            pengawas: [
                { scope: 'presence', text: 'Heartbeat presence dan antrean upload foto yang lebih tangguh', date: '2026-06-30' },
                { scope: 'foto', text: 'Validasi koordinat desa dan pemilih lokasi via peta OSM', date: '2026-06-23' },
                { scope: 'progress', text: 'Form input item pekerjaan di tab Progress', date: '2026-06-23' },
                { scope: 'notifikasi', text: 'Broadcast popup dan lonceng di sidebar', date: '2026-06-28' },
            ],
        },
    },
    {
        version: '0.4.0',
        date: '2025-12-28',
        summary:
            'Release stabil setelah migrasi arsitektur: fondasi BFF, modul pekerjaan/foto/progress, dan dashboard awal.',
        repos: {
            arumanis: [
                { text: 'Dashboard, peta, simulasi, dan modul pekerjaan inti', date: '2025-12' },
                { text: 'Embedded foto, progress tab, dan dokumentasi lapangan', date: '2025-12' },
                { text: 'Penerima dengan pagination dan perbaikan route permission', date: '2025-12' },
            ],
            apiamis: [
                { text: 'API pekerjaan, berkas, foto, dan progress', date: '2025-12' },
                { text: 'Dashboard stats dan pengaturan aplikasi', date: '2025-12' },
            ],
            pengawas: [
                { text: 'Panel pengawasan dengan SSO dari Arumanis', date: '2026-06' },
                { text: 'Detail pekerjaan, matrix penerima, dan ekstraksi GPS', date: '2026-06' },
            ],
        },
    },
]

export const REPO_LINKS = [
    { id: 'arumanis', label: 'Arumanis (frontend)', url: 'https://github.com/ilhamtaufiq/arumanis' },
    { id: 'apiamis', label: 'APIAMIS (backend)', url: 'https://github.com/ilhamtaufiq/apiamis' },
    { id: 'pengawas', label: 'Pengawas (lapangan)', url: 'https://github.com/ilhamtaufiq/arumanis-pengawasan' },
] as const