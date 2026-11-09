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
    masa_pemeliharaan_hari: number
    data: MasaPemeliharaanRow[]
}

export const getMasaPemeliharaan = async (): Promise<MasaPemeliharaanResponse> => {
    return api.get<MasaPemeliharaanResponse>('/laporan/masa-pemeliharaan')
}
