export type SpamKelembagaanJenis = 'JP' | 'BJP'

export interface SpamKelembagaanRaw {
    id: number
    jenis_jaringan: SpamKelembagaanJenis
    kecamatan: string | null
    desa_kelurahan: string | null
    desa_kelurahan_normalized: string | null
    lokasi_key: string | null
    tahun_pembangunan_raw: string | null
    tahun_pembangunan_awal: number | null
    tahun_pembangunan_akhir: number | null
    sumber_dana_raw: string | null
    program_pembangunan: string | null
    nama_pengelola: string | null
    perdes_pembentukan_pokmas: string | null
    pengurus_kepala: string | null
    pengurus_bendahara: string | null
    pengurus_sekretaris: string | null
    kapasitas_mata_air_l_det: string | null
    sistem_aliran: string | null
    kapasitas_air_tanah_l_det: string | null
    kapasitas_lain_l_det: string | null
    dasar_hukum_tarif: string | null
    besaran_iuran: string | null
    pendapatan_bulanan_rp: string | null
    biaya_operasional_bulanan_rp: string | null
    sr_unit: number | null
    kk_terlayani: number | null
    jiwa_terlayani: number | null
    target_layanan: number | null
    raw_payload: unknown[] | null
    source_file: string | null
    source_sheet: string | null
    source_row: number | null
    created_at: string
    updated_at: string
}

export interface SpamKelembagaanParams {
    page?: number
    per_page?: number
    search?: string
    jenis_jaringan?: SpamKelembagaanJenis
    kecamatan?: string
    sumber_dana_raw?: string
    tahun?: number
}

export interface SpamKelembagaanGrouped {
    kecamatan: string | null
    desa_kelurahan: string | null
    desa_kelurahan_normalized: string | null
    jumlah_jp: number
    jumlah_bjp: number
    total_sr: number
    total_kk_terlayani: number
    total_jiwa_terlayani: number
    target_layanan: number
    sistem_list: SpamKelembagaanRaw[]
}

export interface SpamKelembagaanResponse {
    success: boolean
    data: SpamKelembagaanGrouped[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
        from: number | null
        to: number | null
    }
}

export interface SpamKelembagaanStats {
    total: number
    jp: number
    bjp: number
    kecamatan: number
    total_sr: number
    total_kk_terlayani: number
    total_kk_jp: number
    total_kk_bjp: number
    total_jiwa_terlayani: number
    total_target_layanan: number
    sumber_dana: Array<{ sumber_dana_raw: string; total: number }>
}

export interface SpamKelembagaanOptions {
    kecamatan: string[]
    sumber_dana: string[]
}
