import api from '@/lib/api-client'
import type {
    SpamKelembagaanParams,
    SpamKelembagaanOptions,
    SpamKelembagaanRaw,
    SpamKelembagaanResponse,
    SpamKelembagaanStats,
} from '../types'

export const getSpamKelembagaanRaw = async (params: SpamKelembagaanParams = {}) => {
    return api.get<SpamKelembagaanResponse>('/spam-kelembagaan-raw', {
        params: params as Record<string, string | number | undefined>,
    })
}

export const getSpamKelembagaanStats = async (params: SpamKelembagaanParams = {}) => {
    const response = await api.get<{ success: boolean; data: SpamKelembagaanStats }>('/spam-kelembagaan-raw/stats', {
        params: params as Record<string, string | number | undefined>,
    })
    return response.data
}

export const getSpamKelembagaanOptions = async () => {
    const response = await api.get<{ success: boolean; data: SpamKelembagaanOptions }>('/spam-kelembagaan-raw/options')
    return response.data
}

export const getSpamKelembagaanDetail = async (id: number) => {
    const response = await api.get<{ success: boolean; data: SpamKelembagaanRaw }>(`/spam-kelembagaan-raw/${id}`)
    return response.data
}

export const importSpamKelembagaanRaw = async (file: File, replace: boolean) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('replace', replace ? '1' : '0')

    return api.post<{
        success: boolean
        message: string
        data: { imported: number; replaced: boolean }
    }>('/spam-kelembagaan-raw/import', formData)
}
