export type SpmStatus = 'terpenuhi' | 'belum_terpenuhi' | 'data_kurang'

export interface SpmAirMinum {
    id: number
    kecamatan_id: number
    desa_id: number
    kecamatan: string | null
    desa: string | null
    target_total_jiwa: number | null
    jp_jiwa_terlayani: number
    bjp_jiwa_terlayani: number
    total_jiwa_terlayani: number
    belum_terlayani: number | null
    persentase_layanan: string | number | null
    status_spm: SpmStatus
    tahun_data: number | null
    last_consolidated_at: string | null
    sources?: SpmSource[]
}

export interface SpmSource {
    id: number
    source_type: string
    source_id: number
    jenis_jaringan: string | null
    sr_unit: number | null
    kk_terlayani: number | null
    jiwa_terlayani: number | null
    kondisi: string | null
    nama_pengelola: string | null
    tahun_pembangunan_raw: string | null
    sumber_dana_raw: string | null
    anggaran_rp: string | null
}

export interface SpmParams {
    page?: number
    per_page?: number
    search?: string
    kecamatan_id?: number
    status_spm?: SpmStatus
    jenis_jaringan?: 'JP' | 'BJP'
}

export interface SpmResponse {
    success: boolean
    data: SpmAirMinum[]
    meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null }
}

export interface SpmStats {
    total_desa: number
    terpenuhi: number
    belum_terpenuhi: number
    data_kurang: number
    target_total_jiwa: number
    jp_jiwa_terlayani: number
    bjp_jiwa_terlayani: number
    total_jiwa_terlayani: number
    match: { matched: number; ambiguous: number; unmatched: number }
}

export interface SpmOptions {
    kecamatan: Array<{ id: number; nama: string }>
    status: SpmStatus[]
    jenis_jaringan: Array<'JP' | 'BJP'>
}

export interface SpmUnmatched {
    id: number
    source_type: string
    source_id: number
    kecamatan_raw: string | null
    desa_raw: string | null
    match_status: string
    match_score: number
    notes: string | null
}
