import api from '@/lib/api-client'

/** Satu paket dengan BASTP. Tanggal berformat YYYY-MM-DD. */
export type MasaPemeliharaanRow = {
    pekerjaan_id: number
    nama_paket: string | null
    nomor_bastp: string | null
    tanggal_bastp: string
    tanggal_akhir: string
    status: 'berjalan' | 'berakhir'
}

export type MasaPemeliharaanResponse = {
    tahun: string | null
    masa_pemeliharaan_hari: number
    data: MasaPemeliharaanRow[]
}

/** Rekap untuk satu tahun anggaran. Tahun diambil dari header aplikasi (`tahunAnggaran`). */
export const getMasaPemeliharaan = async (tahun: string): Promise<MasaPemeliharaanResponse> => {
    return api.get<MasaPemeliharaanResponse>('/laporan/masa-pemeliharaan', { params: { tahun } })
}
