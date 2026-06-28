import type { UnitSpamStats } from '@/features/spam-unit/types'
import type { PublicSanitasiStats } from '../api/spam-stats'
import { formatGeneratedAtLabel } from './innovation-stats'

export type PublicAirMinumMetrics = {
    scopeLabel: string
    coverage: number
    totalKk: number
    totalSr: number
    totalJiwa: number
    totalTarget: number
    totalUnits: number
    simspamCount: number
    nonSimspamCount: number
    totalBjpKk: number
    totalBjpJiwa: number
    achievementRecords: number
    generatedAt: Date | null
    generatedAtLabel: string | null
}

export function buildPublicAirMinumMetrics(stats?: UnitSpamStats | null): PublicAirMinumMetrics | null {
    if (!stats) return null

    const ringkasan = stats.ringkasan
    const spm = ringkasan?.spm
    const generatedAt = stats.stats_generated_at ? new Date(stats.stats_generated_at) : null

    return {
        scopeLabel: ringkasan?.scope_label ?? stats.manual_scope_label ?? stats.target_year ?? 'Terakumulasi',
        coverage: spm?.coverage_percentage ?? stats.coverage_percentage ?? 0,
        totalKk: ringkasan?.capaian.kk ?? stats.capaian_kk ?? stats.total_kk ?? 0,
        totalSr: ringkasan?.capaian.sr ?? stats.capaian_sr ?? stats.total_sr ?? 0,
        totalJiwa: ringkasan?.capaian.jiwa ?? stats.capaian_jiwa ?? stats.total_jiwa ?? 0,
        totalTarget: spm?.target_kk ?? stats.total_target ?? 0,
        totalUnits: stats.total_units,
        simspamCount: stats.simspam_count,
        nonSimspamCount: stats.non_simspam_count,
        totalBjpKk: stats.total_bjp_kk ?? spm?.total_bjp_kk ?? 0,
        totalBjpJiwa: stats.total_bjp_jiwa ?? 0,
        achievementRecords: stats.achievement_records ?? 0,
        generatedAt,
        generatedAtLabel: formatGeneratedAtLabel(generatedAt),
    }
}

export type PublicSanitasiMetrics = {
    scopeLabel: string
    generatedAt: Date | null
    generatedAtLabel: string | null
}

export function buildPublicSanitasiMetrics(
    stats?: PublicSanitasiStats | null,
    fallbackScopeLabel?: string,
): PublicSanitasiMetrics | null {
    if (!stats) return null

    const generatedAt = stats.stats_generated_at ? new Date(stats.stats_generated_at) : null

    return {
        scopeLabel: stats.scope_label ?? fallbackScopeLabel ?? 'Semua infrastruktur terdata',
        generatedAt,
        generatedAtLabel: formatGeneratedAtLabel(generatedAt),
    }
}