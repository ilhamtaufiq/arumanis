import api from '@/lib/api-client'

export type KoordinatValidationResult = {
    validasi_koordinat: boolean
    validasi_koordinat_message: string
}

export async function validateKoordinat(pekerjaanId: number, koordinat: string) {
    return api.post<KoordinatValidationResult>('/koordinat/validate', {
        pekerjaan_id: pekerjaanId,
        koordinat,
    })
}