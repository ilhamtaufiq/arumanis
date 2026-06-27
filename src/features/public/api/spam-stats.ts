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

export type PublicSanitasiDesaMapStat = {
    desa_id: number
    desa: string
    kecamatan: string | null
    jumlah_penduduk: number
    target_kk: number
    unit_count: number
    pemanfaat_kk: number
    pemanfaat_jiwa: number
}

export type PublicSanitasiStats = {
    jiwa_per_kk: number
    total_desa: number
    desa_with_infrastruktur: number
    desa_without_infrastruktur: number
    total_penduduk: number
    target_kk: number
    total_pemanfaat_kk: number
    total_pemanfaat_jiwa: number
    gap_kk: number
    gap_jiwa: number
    coverage_percentage: number
    coverage_kk_percentage: number
    total_count: number
    berfungsi_count: number
    total_investasi: number
    wilayah_total_kecamatan: number
    spaldt_count: number
    spalds_count: number
    iplt_count: number
    mck_individu_count: number
    mck_komunal_count: number
}

export async function getPublicSanitasiStats() {
    return api.get<{ success: boolean; data: PublicSanitasiStats }>('/public/spm-sanitasi/stats', {
        params: { _t: Date.now() },
    })
}

export async function getPublicSanitasiMapStats() {
    return api.get<{ success: boolean; data: PublicSanitasiDesaMapStat[] }>(
        '/public/spm-sanitasi/map-stats',
        {
            params: { _t: Date.now() },
        },
    )
}

export type LandingSpmSector = 'air_minum' | 'sanitasi'