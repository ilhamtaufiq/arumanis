export type SpamCondition = 'berfungsi' | 'tidak_berfungsi' | 'lainnya'

export interface SpamTerbangunRaw {
    id: number
    kecamatan: string | null
    jenis_wilayah: string | null
    desa_kelurahan: string | null
    nama_pengelola: string | null
    sumber_air_baku: string | null
    sistem_aliran: string | null
    debit_sumber_l_det: string | null
    debit_diambil_l_det: string | null
    penduduk_terlayani: number | null
    jumlah_penduduk: number | null
    hu_ku_unit: number | null
    sr_unit: number | null
    tanpa_meteran_air_unit: number | null
    sumber_dana_raw: string | null
    asal_proyek: string | null
    nilai_dak_apbn_rp: string | null
    nilai_apbd_rp: string | null
    nilai_banprov_rp: string | null
    tahun_pembangunan_raw: string | null
    tahun_pembangunan_awal: number | null
    tahun_pembangunan_akhir: number | null
    kondisi_raw: string | null
    kondisi_normalized: SpamCondition | null
    tanggal_terakhir_laporan: string | null
    keterangan: string | null
    raw_payload: unknown[] | null
    source_file: string | null
    source_sheet: string | null
    source_row: number | null
    created_at: string
    updated_at: string
}

export interface SpamTerbangunRawParams {
    page?: number
    per_page?: number
    search?: string
    kecamatan?: string
    sumber_dana_raw?: string
    kondisi_normalized?: SpamCondition
    tahun?: number
}

export interface SpamTerbangunRawResponse {
    success: boolean
    data: SpamTerbangunRaw[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
        from: number | null
        to: number | null
    }
}

export interface SpamTerbangunStats {
    total: number
    kecamatan: number
    berfungsi: number
    tidak_berfungsi: number
    total_sr: number
    total_penduduk_terlayani: number
    total_target_layanan: number
    sumber_dana: Array<{
        sumber_dana_raw: string
        total: number
    }>
}

export interface SpamTerbangunImportResult {
    imported: number
    replaced: boolean
}
