export interface SipdRenjaItem {
    id_sub_bl: number
    kode_sub_giat: string | null
    nama_sub_giat: string | null
    pagu: number
    rincian: number
    pagu_murni: number
    synced_at: string
    rincian_count: number
    tahun: number
    id_daerah: number
    id_unit: number
}

export interface SipdRincianRow {
    id_rinci_sub_bl?: number
    subs_bl_teks?: string
    ket_bl_teks?: string
    kode_akun?: string
    nama_akun?: string
    nama_standar_harga?: string
    spek?: string
    koefisien?: string | number
    koefisien_murni?: string | number
    harga_satuan?: number
    harga_satuan_murni?: number
    total_harga?: number
    total_harga_murni?: number
    [key: string]: unknown
}

export interface SipdRincianResponse {
    parent: Record<string, unknown> | null
    total: number
    /** 0 = Renja, 1 = Penganggaran */
    is_anggaran?: number | null
    synced_at?: string
    data: SipdRincianRow[]
}

export interface SipdRenjaListResponse {
    total: number
    /** 0 = Renja, 1 = Penganggaran */
    is_anggaran?: number | null
    data: SipdRenjaItem[]
}

export interface SipdServiceStatus {
    logged_in: boolean
    user: Record<string, unknown> | null
}