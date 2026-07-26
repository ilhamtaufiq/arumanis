import { getAnalyticsStats, getDashboardStats, getDataQualityStats } from '@/features/dashboard/api/dashboard'
import { fetchProgressEstimasiAverages } from '@/features/dashboard/lib/progress-estimasi-averages'
import { getPengawasStatistics } from '@/features/pengawas/api/pengawas'
import { getSpmSanitasiStats } from '@/features/spm-sanitasi/api'
import { getSpamUnitStats } from '@/features/spam-unit/api'
import type { ExecutiveDashboardData } from '../types'

export async function fetchExecutiveDashboardData(tahun: string): Promise<ExecutiveDashboardData> {
    const [
        dashboard,
        spamResponse,
        sanitasiResponse,
        pengawasResponse,
        dataQuality,
        analytics,
        estimasiProgress,
    ] = await Promise.all([
        getDashboardStats(tahun),
        getSpamUnitStats({ tahun }),
        getSpmSanitasiStats(),
        getPengawasStatistics(),
        getDataQualityStats(tahun),
        getAnalyticsStats(tahun),
        fetchProgressEstimasiAverages(tahun),
    ])

    return {
        dashboard,
        spam: spamResponse.data,
        sanitasi: sanitasiResponse.data,
        pengawas: pengawasResponse.data,
        dataQuality,
        analytics,
        estimasiProgress,
    }
}