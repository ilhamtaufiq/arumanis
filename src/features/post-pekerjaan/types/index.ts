import type { ChecklistItem, ChecklistStatus } from '@/features/checklist/types'

export interface PostPekerjaanKontrakSummary {
    id: number
    nomor_penawaran: string | null
    spk: string | null
    kode_paket: string | null
    penyedia: string | null
}

export interface PostPekerjaanRow {
    id: number
    nama_paket: string
    kegiatan: {
        id: number
        nama_sub_kegiatan: string
    } | null
    kontrak: PostPekerjaanKontrakSummary | null
    checklist: Record<number, ChecklistStatus>
}

export interface PostPekerjaanResponse {
    columns: ChecklistItem[]
    data: PostPekerjaanRow[]
    meta: {
        current_page: number
        from: number
        last_page: number
        per_page: number
        to: number
        total: number
    }
}

export interface PostPekerjaanParams {
    tahun?: string
    kegiatan_id?: number
    search?: string
    page?: number
    per_page?: number
    [key: string]: string | number | undefined
}