export type JenisProyekFase = 'sanitasi' | 'air_minum' | string

export interface MasterFasePekerjaan {
    id: number
    jenis_proyek: JenisProyekFase
    kode_fase: string
    nama_fase: string
    prioritas: number
    overlap_persen: number
    durasi_faktor: number
    keywords: string[] | string | null
    deskripsi?: string | null
    is_active: boolean
    created_at?: string
    updated_at?: string
}

export const JENIS_PROYEK_OPTIONS = [
    { value: 'sanitasi', label: 'Sanitasi' },
    { value: 'air_minum', label: 'Air Minum (SPAM)' },
] as const
