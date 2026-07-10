export type KelembagaanSubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface KelembagaanFormFields {
    name?: string | null
    tahun_pembangunan?: string | null
    sumber_dana?: string | null
    program?: string | null
    sistem_layanan?: string | null
    sumber_mata_air_kap?: string | null
    sumber_air_tanah_kap?: string | null
    lain_lain_kap?: string | null
    tarif_dasar_hukum?: string | null
    iuran_nominal?: string | null
    pendapatan_bulan?: string | null
    biaya_operasional?: string | null
    pokmas?: string | null
    perdes?: string | null
    kepala?: string | null
    bendahara?: string | null
    sekretaris?: string | null
}

export interface KelembagaanShareLink {
    id: number
    token: string
    label?: string | null
    is_active: boolean
    is_usable: boolean
    expires_at?: string | null
    max_submissions?: number | null
    submission_count: number
    admin_note?: string | null
    path: string
    created_at?: string
    unit_spam_id: number
    unit?: {
        id: number
        name?: string | null
        desa?: string | null
        kecamatan?: string | null
    } | null
    creator?: { id: number; name?: string } | null
}

export interface KelembagaanSubmission {
    id: number
    share_link_id: number
    unit_spam_id: number
    payload: KelembagaanFormFields
    snapshot_before?: KelembagaanFormFields | null
    submitter_name?: string | null
    submitter_phone?: string | null
    submitter_instansi?: string | null
    submitter_note?: string | null
    status: KelembagaanSubmissionStatus
    review_note?: string | null
    reviewed_at?: string | null
    reviewer?: { id: number; name?: string } | null
    created_at?: string
    unit?: {
        id: number
        name?: string | null
        desa?: string | null
        kecamatan?: string | null
    } | null
    share_link?: {
        id: number
        token: string
        label?: string | null
    } | null
}

export interface KelembagaanPublicFormData {
    link: {
        token: string
        label?: string | null
        expires_at?: string | null
        is_usable: boolean
    }
    unit: {
        id: number
        name?: string | null
        desa?: string | null
        kecamatan?: string | null
        current: KelembagaanFormFields
    }
    fields: {
        unit: string[]
        pengelola: string[]
    }
}
