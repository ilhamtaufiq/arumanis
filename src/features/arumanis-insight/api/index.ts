import api from '@/lib/api-client'
import type { ArumanisInsightData, InsightScopeFilter } from '../types'

interface ArumanisInsightResponse {
    success: boolean
    data: ArumanisInsightData
}

export const getArumanisInsight = async (filters?: InsightScopeFilter): Promise<ArumanisInsightData> => {
    const response = await api.get<ArumanisInsightResponse>('/arumanis-insight', {
        params: {
            scope: filters?.scope,
            bidang: filters?.bidang,
            kecamatan_id: filters?.kecamatan_id,
            desa_id: filters?.desa_id,
            filera_id: filters?.filera_id,
        },
    })
    return response.data
}
