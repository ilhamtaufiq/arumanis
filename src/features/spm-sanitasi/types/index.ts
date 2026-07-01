import type { Desa } from '@/features/desa/types'

export type SpmSanitasiJenis = 'spaldt' | 'spalds' | 'iplt' | 'mck_individu' | 'mck_komunal'

export type SpmSanitasiSyncStatus = 'matched' | 'partial' | 'no_infrastruktur' | 'no_pekerjaan' | 'no_data'

export interface SpmSanitasiOutput {
    id: number
    komponen: string
    satuan: string
    volume: number
    output_type?: string | null
    target_jenis?: SpmSanitasiJenis | null
    mck_type?: string | null
}

/** @deprecated Use SpmSanitasiOutput */
export type SpmMckOutput = SpmSanitasiOutput

export interface SpmPaketPekerjaan {
    id: number
    nama_paket: string
    pagu: number
    tahun_anggaran?: string
    desa?: { id?: number; n_desa?: string }
    kecamatan?: { id?: number; n_kec?: string }
    sanitasi_outputs: SpmSanitasiOutput[]
    mck_outputs: SpmSanitasiOutput[]
    output_types: string[]
    mck_types: string[]
    target_jenis_list: SpmSanitasiJenis[]
    derived: {
        unit: number
        mck_unit: number
        kk: number
        jiwa: number
        nilai_kontrak: number
        pembiayaan_suggested?: number
        tahun_konstruksi_suggested?: number | null
        progress_total: number
    }
    is_linked: boolean
    linked_spm_ids: number[]
}

/** @deprecated Use SpmPaketPekerjaan */
export type SpmMckPekerjaan = SpmPaketPekerjaan

export interface SpmDesaIntegration {
    desa: {
        id: number
        n_desa: string
        jumlah_penduduk: number
        kecamatan: { id: number; n_kec: string }
    }
    infrastruktur: Array<{
        id: number
        jenis: SpmSanitasiJenis
        nama_infrastruktur: string
        jumlah_pemanfaat_kk: number
        linked_pekerjaan_count: number
    }>
    infrastruktur_count: number
    pekerjaan_count: number
    linked_count: number
    pekerjaan: SpmPaketPekerjaan[]
    derived: {
        unit: number
        mck_unit: number
        kk: number
        jiwa: number
        nilai_kontrak: number
        progress_avg: number
    }
    manual: {
        kk: number
        jiwa: number
        nilai_kontrak: number
    }
    sync_status: SpmSanitasiSyncStatus
    output_types?: string[]
    output_type_filter?: string | null
}

export interface SpmIntegrationResponse {
    success: boolean
    data: SpmDesaIntegration[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
    summary?: {
        total_desa: number
        matched_count: number
        partial_count: number
        no_infrastruktur_count: number
        no_pekerjaan_count: number
        total_infrastruktur: number
        total_pekerjaan: number
        total_linked: number
    }
}

export interface SpmSanitasi {
    id: number
    jenis: SpmSanitasiJenis
    desa_id?: number | null
    skala_pelayanan?: string | null
    nama_infrastruktur: string
    latitude?: number | null
    longitude?: number | null
    alamat_lengkap?: string | null
    jumlah_pemanfaat_kk?: number | null
    jumlah_pemanfaat_jiwa?: number | null
    tahun_konstruksi?: number | null
    pembiayaan_apbn?: number | null
    pembiayaan_apbd?: number | null
    pembiayaan_dak?: number | null
    pembiayaan_hibah?: number | null
    pembiayaan_csr?: number | null
    pembiayaan_lain?: number | null
    pembiayaan_total?: number | null
    status_keberfungsian?: string | null
    kualitas_keberfungsian?: string | null
    pengelola?: string | null
    kapasitas_desain?: number | null
    kapasitas_terpakai?: number | null
    kapasitas_tidak_terpakai?: number | null
    jenis_pengolahan?: string | null
    peta_cakupan?: string | null
    status_lahan?: string | null
    luas_lahan_ha?: string | null
    opsi_teknologi?: string | null
    jumlah_stasiun_pompa?: string | null
    biaya_operasional?: number | null
    jenis_pengelola?: string | null
    sistem_pengolahan?: string | null
    truk_tinja_unit?: number | null
    kapasitas_truk_m3?: number | null
    jumlah_ritasi?: number | null
    jarak_maksimal_pelayanan_km?: number | null
    alokasi_biaya_operasional?: number | null
    created_at?: string
    updated_at?: string
    desa?: Desa & {
        kecamatan?: { id: number; n_kec: string }
    }
    pekerjaan?: SpmPaketPekerjaan[]
}

export interface SpmSanitasiJenisCapaian {
    unit_count: number
    pemanfaat_kk: number
    pemanfaat_jiwa: number
}

export interface SpmSanitasiCapaianSummary {
    jiwa_per_kk: number
    total_desa: number
    desa_with_infrastruktur: number
    desa_without_infrastruktur: number
    total_penduduk: number
    target_kk: number
    total_pemanfaat_kk: number
    total_pemanfaat_jiwa: number
    gap_kk: number
    gap_jiwa: number
    coverage_percentage: number
    coverage_kk_percentage: number
    by_jenis: Record<SpmSanitasiJenis, SpmSanitasiJenisCapaian>
}

export interface SpmSanitasiDesaCapaian {
    desa: {
        id: number
        n_desa: string
        jumlah_penduduk: number
        kecamatan?: { id?: number; n_kec?: string }
    }
    unit_count: number
    target_kk: number
    pemanfaat_kk: number
    pemanfaat_jiwa: number
    gap_kk: number
    gap_jiwa: number
    coverage_percentage: number
    coverage_kk_percentage: number
    by_jenis: {
        spaldt_kk: number
        spalds_kk: number
        iplt_kk: number
    }
}

export interface SpmSanitasiStats extends SpmSanitasiCapaianSummary {
    spaldt_count: number
    spalds_count: number
    iplt_count: number
    mck_individu_count: number
    mck_komunal_count: number
    total_count: number
    berfungsi_count: number
    total_investasi: number
}

export interface SpmSanitasiCapaianResponse {
    success: boolean
    summary: SpmSanitasiCapaianSummary
    data: SpmSanitasiDesaCapaian[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export interface SpmSanitasiResponse {
    success: boolean
    data: SpmSanitasi[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export interface SpmSanitasiFilters {
    page?: number
    per_page?: number
    jenis?: SpmSanitasiJenis
    kecamatan_id?: number
    desa_id?: number
    search?: string
}

export type SpmSanitasiFormData = Omit<
    SpmSanitasi,
    'id' | 'created_at' | 'updated_at' | 'desa'
>