import api from '@/lib/api-client'
import type { UnitSpamStats } from '@/features/spam-unit/types'

export type PublicSpamDesaMapStat = {
    desa_id: number
    desa: string
    kecamatan: string | null
    target: number
    unit_count: number
    sr: number
    kk: number
    jiwa: number
}

export async function getPublicSpamUnitStats(params?: { tahun?: string }) {
    return api.get<{ success: boolean; data: UnitSpamStats }>('/public/spam-units/stats', {
        params: {
            ...params,
            _t: Date.now(),
        },
    })
}

export async function getPublicSpamMapStats(params?: { tahun?: string }) {
    return api.get<{ success: boolean; data: PublicSpamDesaMapStat[] }>('/public/spam-units/map-stats', {
        params: {
            ...params,
            _t: Date.now(),
        },
    })
}