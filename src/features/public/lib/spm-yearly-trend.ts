import type { UnitSpamStats } from '@/features/spam-unit/types'
import type { LandingSpmSector, PublicSanitasiStats } from '../api/spam-stats'
import { buildPublicAirMinumMetrics } from './spm-public-stats'
import { PUBLIC_SPM_TAHUN_OPTIONS } from './spm-year'

export type SpmYearlyTrendPoint = {
    tahun: string
    coverage: number
    coverageKk: number | null
    kk: number
    jiwa: number
    target: number
    units: number
}

export function buildAirMinumYearlyPoint(
    stats: UnitSpamStats | null | undefined,
    tahun: string,
): SpmYearlyTrendPoint {
    const metrics = buildPublicAirMinumMetrics(stats)

    return {
        tahun,
        coverage: metrics?.coverage ?? 0,
        coverageKk: metrics?.coverage ?? 0,
        kk: metrics?.totalKk ?? 0,
        jiwa: metrics?.totalJiwa ?? 0,
        target: metrics?.totalTarget ?? 0,
        units: metrics?.totalUnits ?? 0,
    }
}

export function buildSanitasiYearlyPoint(
    stats: PublicSanitasiStats | null | undefined,
    tahun: string,
): SpmYearlyTrendPoint {
    return {
        tahun,
        coverage: stats?.coverage_percentage ?? 0,
        coverageKk: stats?.coverage_kk_percentage ?? null,
        kk: stats?.total_pemanfaat_kk ?? 0,
        jiwa: stats?.total_pemanfaat_jiwa ?? 0,
        target: stats?.target_kk ?? 0,
        units: stats?.total_count ?? 0,
    }
}

export function sortYearlyTrendPoints(points: SpmYearlyTrendPoint[]): SpmYearlyTrendPoint[] {
    return [...points].sort((left, right) => Number(left.tahun) - Number(right.tahun))
}

export function getSpmYearlyTrendYears(): readonly string[] {
    return [...PUBLIC_SPM_TAHUN_OPTIONS].sort((a, b) => Number(a) - Number(b))
}

export function getPrimaryCoverageMetric(sector: LandingSpmSector): 'coverage' | 'coverageKk' {
    return sector === 'sanitasi' ? 'coverageKk' : 'coverage'
}