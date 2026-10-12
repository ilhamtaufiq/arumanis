/** Surat terpusat: satu deret nomor per tahun, dengan atau tanpa pekerjaan. */

export interface SuratJenis {
    id: number
    name: string
    code: string
}

export interface Surat {
    id: number
    tahun: number
    sequence_number: number
    nomor: string
    /** YYYY-MM-DD */
    tanggal: string
    perihal: string
    tujuan: string | null
    keterangan: string | null
    type_id: number
    jenis: SuratJenis
    pekerjaan_id: number | null
    pekerjaan: { id: number; nama_paket: string | null } | null
}

export interface SuratListMeta {
    tahun: number
    page: number
    per_page: number
    total: number
    last_page: number
}

export interface SuratListResponse {
    data: Surat[]
    meta: SuratListMeta
}

export interface SuratFormData {
    type_id: number
    tanggal: string
    perihal: string
    tujuan?: string | null
    keterangan?: string | null
    pekerjaan_id?: number | null
    /** Kosong saat membuat berarti nomor otomatis dari template jenis. */
    nomor?: string
}

export interface SuratPratinjau {
    nomor: string
    sequence_number: number
}
