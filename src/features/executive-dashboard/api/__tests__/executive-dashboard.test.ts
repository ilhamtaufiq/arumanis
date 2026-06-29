import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fetchExecutiveDashboardData } from '../executive-dashboard'

vi.mock('@/features/dashboard/api/dashboard', () => ({
    getDashboardStats: vi.fn(),
    getDataQualityStats: vi.fn(),
    getAnalyticsStats: vi.fn(),
}))

vi.mock('@/features/spam-unit/api', () => ({
    getSpamUnitStats: vi.fn(),
}))

vi.mock('@/features/spm-sanitasi/api', () => ({
    getSpmSanitasiStats: vi.fn(),
}))

vi.mock('@/features/pengawas/api/pengawas', () => ({
    getPengawasStatistics: vi.fn(),
}))

import {
    getAnalyticsStats,
    getDashboardStats,
    getDataQualityStats,
} from '@/features/dashboard/api/dashboard'
import { getSpamUnitStats } from '@/features/spam-unit/api'
import { getSpmSanitasiStats } from '@/features/spm-sanitasi/api'
import { getPengawasStatistics } from '@/features/pengawas/api/pengawas'

describe('fetchExecutiveDashboardData', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('aggregates all dashboard sources in parallel', async () => {
        vi.mocked(getDashboardStats).mockResolvedValue({ totalPekerjaan: 10 } as never)
        vi.mocked(getSpamUnitStats).mockResolvedValue({ data: { total_units: 5 } } as never)
        vi.mocked(getSpmSanitasiStats).mockResolvedValue({ data: { total_count: 3 } } as never)
        vi.mocked(getPengawasStatistics).mockResolvedValue({ data: { total_pengawas: 2 } } as never)
        vi.mocked(getDataQualityStats).mockResolvedValue({ total_jobs: 10 } as never)
        vi.mocked(getAnalyticsStats).mockResolvedValue({ trend: [], regions: [], categories: [] } as never)

        const result = await fetchExecutiveDashboardData('2025')

        expect(getDashboardStats).toHaveBeenCalledWith('2025')
        expect(getSpamUnitStats).toHaveBeenCalledWith({ tahun: '2025' })
        expect(getDataQualityStats).toHaveBeenCalledWith('2025')
        expect(getAnalyticsStats).toHaveBeenCalledWith('2025')
        expect(result.dashboard).toEqual({ totalPekerjaan: 10 })
        expect(result.spam).toEqual({ total_units: 5 })
        expect(result.sanitasi).toEqual({ total_count: 3 })
        expect(result.pengawas).toEqual({ total_pengawas: 2 })
        expect(result.dataQuality).toEqual({ total_jobs: 10 })
    })
})