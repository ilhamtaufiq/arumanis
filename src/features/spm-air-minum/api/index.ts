import api from '@/lib/api-client'
import type { SpmAirMinum, SpmOptions, SpmParams, SpmResponse, SpmStats, SpmUnmatched } from '../types'

export const getSpmAirMinum = async (params: SpmParams = {}) => {
    return api.get<SpmResponse>('/spm-air-minum', {
        params: params as Record<string, string | number | undefined>,
    })
}

export const getSpmStats = async (params: Pick<SpmParams, 'jenis_jaringan'> = {}) => {
    const response = await api.get<{ success: boolean; data: SpmStats }>('/spm-air-minum/stats', {
        params: params as Record<string, string | undefined>,
    })
    return response.data
}

export const getSpmOptions = async () => {
    const response = await api.get<{ success: boolean; data: SpmOptions }>('/spm-air-minum/options')
    return response.data
}

export const getSpmDetail = async (id: number) => {
    const response = await api.get<{ success: boolean; data: SpmAirMinum }>(`/spm-air-minum/${id}`)
    return response.data
}

export const getSpmUnmatched = async () => {
    const response = await api.get<{ success: boolean; data: SpmUnmatched[]; meta: { total: number } }>('/spm-air-minum/unmatched', {
        params: { per_page: 10 },
    })
    return response
}

export const consolidateSpmAirMinum = async () => {
    return api.post<{ success: boolean; message: string; data: Record<string, number> }>('/spm-air-minum/consolidate')
}
