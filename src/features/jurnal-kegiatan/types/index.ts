export interface JurnalFoto {
    id: number
    url: string
    thumb: string
}

export interface JurnalEntry {
    id: number
    tanggal: string
    rhk: number | null
    kegiatan: string
    output: number | null
    satuan: string | null
    keterangan: string | null
    foto: JurnalFoto[]
    created_at: string
    updated_at: string
}

export interface JurnalRhkTotal {
    rhk: number
    jumlah: number
    output: number
}

export interface JurnalRingkasan {
    tahun: number
    bulan: number
    jumlah: number
    hari: number
    per_rhk: JurnalRhkTotal[]
}

export interface JurnalListResponse {
    data: JurnalEntry[]
    ringkasan: JurnalRingkasan
}

export interface JurnalParams {
    tahun: number
    bulan: number
}

export interface JurnalPayload {
    tanggal: string
    rhk: number | null
    kegiatan: string
    output: number | null
    satuan: string | null
    keterangan: string | null
}

/** Nilai form berbentuk string agar input kosong bisa dibedakan dari angka 0. */
export interface JurnalFormValues {
    tanggal: string
    rhk: string
    kegiatan: string
    output: string
    satuan: string
    keterangan: string
}

export type JurnalField = keyof JurnalFormValues
