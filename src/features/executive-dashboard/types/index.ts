import type { AnalyticsStats, DataQualityStats, KegiatanStats } from '@/features/dashboard/types'
import type { ProgressEstimasiAverages } from '@/features/dashboard/lib/progress-estimasi-averages'
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
    /** Rata-rata tab Progress (fisik & keuangan) — sumber SP2D untuk keuangan */
    estimasiProgress: ProgressEstimasiAverages
}