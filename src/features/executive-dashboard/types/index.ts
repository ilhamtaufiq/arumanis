import type { AnalyticsStats, DataQualityStats, KegiatanStats } from '@/features/dashboard/types'
import type { PengawasStatistics } from '@/features/pengawas/types'
import type { SpmSanitasiStats } from '@/features/spm-sanitasi/types'
import type { UnitSpamStats } from '@/features/spam-unit/types'

export interface ExecutiveDashboardData {
    dashboard: KegiatanStats
    spam: UnitSpamStats
    sanitasi: SpmSanitasiStats
    pengawas: PengawasStatistics
    dataQuality: DataQualityStats
    analytics: AnalyticsStats
}