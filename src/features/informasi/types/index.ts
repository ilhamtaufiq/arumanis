export type InformasiKategori = 'fitur-baru' | 'pemeliharaan' | 'pengumuman' | 'lainnya'

export interface Informasi {
    id: number
    judul: string
    isi: string
    kategori: InformasiKategori
    terbit: boolean
    /** YYYY-MM-DD, atau null bila langsung tampil. */
    tampil_dari: string | null
    /** YYYY-MM-DD, atau null bila tidak ada batas akhir. */
    tampil_sampai: string | null
    created_by: number | null
    created_at: string | null
    updated_at: string | null
}

export interface InformasiFormData {
    judul: string
    isi: string
    kategori: InformasiKategori
    terbit: boolean
    tampil_dari: string | null
    tampil_sampai: string | null
}

export interface InformasiListResponse {
    data: Informasi[]
    is_admin: boolean
    /** Tanggal hari ini menurut server (YYYY-MM-DD), dipakai untuk status tampil. */
    today: string
}
