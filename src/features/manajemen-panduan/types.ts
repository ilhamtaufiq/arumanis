export type PanduanPage = {
    id: number
    slug: string
    title: string
    description: string | null
    section: string
    sort_order: number
    body: string
    is_published: boolean
    updated_by: number | null
    editor?: { id: number; name: string } | null
    created_at: string | null
    updated_at: string | null
}

export type PanduanPageInput = {
    slug?: string
    title: string
    description?: string | null
    section?: string
    sort_order?: number
    body: string
    is_published?: boolean
}

export const PANDUAN_SECTIONS = [
    { value: 'cms', label: 'CMS / Dinamis' },
    { value: 'mulai', label: 'Mulai di sini' },
    { value: 'modul', label: 'Modul inti' },
    { value: 'integrasi', label: 'Integrasi' },
    { value: 'kolaborasi', label: 'Kolaborasi' },
    { value: 'admin', label: 'Administrasi' },
    { value: 'referensi', label: 'Referensi' },
    { value: 'umum', label: 'Umum' },
] as const
