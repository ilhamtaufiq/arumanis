import api from '@/lib/api-client'
import type {
    SpamTerbangunImportResult,
    SpamTerbangunRaw,
    SpamTerbangunRawParams,
    SpamTerbangunRawResponse,
    SpamTerbangunStats,
} from '../types'

export const getSpamTerbangunRaw = async (params: SpamTerbangunRawParams = {}) => {
    return api.get<SpamTerbangunRawResponse>('/spam-terbangun-raw', {
        params: params as Record<string, string | number | undefined>,
    })
}

export const getSpamTerbangunRawDetail = async (id: number) => {
    const response = await api.get<{ success: boolean; data: SpamTerbangunRaw }>(`/spam-terbangun-raw/${id}`)
    return response.data
}

export const getSpamTerbangunStats = async (params: SpamTerbangunRawParams = {}) => {
    const response = await api.get<{ success: boolean; data: SpamTerbangunStats }>('/spam-terbangun-raw/stats', {
        params: params as Record<string, string | number | undefined>,
    })
    return response.data
}

export const importSpamTerbangunRaw = async (file: File, replace: boolean) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('replace', replace ? '1' : '0')

    const response = await api.post<{
        success: boolean
        message: string
        data: SpamTerbangunImportResult
    }>('/spam-terbangun-raw/import', formData)

    return response
}
