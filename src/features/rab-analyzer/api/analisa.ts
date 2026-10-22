import api, { ApiError } from '@/lib/api-client'
import type { RabAnalysisResult } from '../types'

/**
 * Analisa RAB di backend (`POST /api/rab/analisa`) dari berkas Excel atau teks tempel.
 * Mengembalikan `null` bila backend tidak mengenali formatnya (HTTP 422), supaya pemanggil
 * bisa memakai parser lama untuk format Hasil Nego atau SPAM JP.
 */
export async function analisaRabServer(input: { file?: File; teks?: string }): Promise<RabAnalysisResult | null> {
    const isi = new FormData()
    if (input.file) isi.append('file', input.file, input.file.name)
    if (input.teks) isi.append('teks', input.teks)
    try {
        return await api.post<RabAnalysisResult>('/rab/analisa', isi)
    } catch (error) {
        if (error instanceof ApiError && error.status === 422) return null
        throw error
    }
}
