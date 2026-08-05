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
        sanitasiAllResponse,
        pengawasResponse,
        dataQuality,
        analytics,
        estimasiProgress,
    ] = await Promise.all([
        getDashboardStats(tahun),
        getSpamUnitStats({ tahun }),
        getSpmSanitasiStats({ tahun }),
        getSpmSanitasiStats({}),
        getPengawasStatistics(),
        getDataQualityStats(tahun),
        getAnalyticsStats(tahun),
        fetchProgressEstimasiAverages(tahun),
    ])

    return {
        dashboard,
        spam: spamResponse.data,
        sanitasi: sanitasiResponse.data,
        sanitasiAllTime: sanitasiAllResponse.data,
        pengawas: pengawasResponse.data,
        dataQuality,
        analytics,
        estimasiProgress,
    }
}