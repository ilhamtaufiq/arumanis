import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    getPublicSanitasiStats,
    getPublicSpamMapStats,
    getPublicSpamUnitStats,
} from '../api/spam-stats'
import { usePublicLocale } from '../i18n/use-public-locale'
import { ApiError } from '@/lib/api-client'
import { formatCoverage, formatGeneratedAtLabel } from '../lib/innovation-stats'
import { buildPublicAirMinumMetrics } from '../lib/spm-public-stats'

function formatDesaCoverage(withCount: number, total: number) {
    if (total <= 0) return '—'
    return `${formatCoverage((withCount / total) * 100)}%`
}

export function LandingHeroSummary() {
    const { messages } = usePublicLocale()
    const copy = messages.landing.hero.stats

    const publicStatsRetry = (failureCount: number, error: unknown) =>
        error instanceof ApiError && error.status === 502 && failureCount < 3

    const { data: unitResponse, isLoading: isUnitLoading } = useQuery({
        queryKey: ['landing', 'hero-air-stats'],
        queryFn: () => getPublicSpamUnitStats(),
        staleTime: 60_000,
        retry: publicStatsRetry,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    })

    const { data: mapResponse, isLoading: isMapLoading } = useQuery({
        queryKey: ['landing', 'hero-map-stats'],
        queryFn: () => getPublicSpamMapStats(),
        staleTime: 60_000,
        retry: publicStatsRetry,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    })

    const { data: sanitasiResponse, isLoading: isSanitasiLoading } = useQuery({
        queryKey: ['landing', 'hero-sanitasi-stats'],
        queryFn: () => getPublicSanitasiStats(),
        staleTime: 60_000,
        retry: publicStatsRetry,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    })

    const isLoading = isUnitLoading || isMapLoading || isSanitasiLoading
    const airMetrics = buildPublicAirMinumMetrics(unitResponse?.data)
    const mapStats = mapResponse?.data ?? []
    const sanitasiStats = sanitasiResponse?.data

    const airDesaWithCapaian = mapStats.filter((row) => row.kk > 0).length
    const airDesaTotal = mapStats.length
    const sanitasiDesaWith = sanitasiStats?.desa_with_infrastruktur ?? 0
    const sanitasiDesaTotal = sanitasiStats?.total_desa ?? 0

    const updatedLabel = useMemo(() => {
        const airAt = airMetrics?.generatedAt ?? null
        const sanitasiAt = sanitasiStats?.stats_generated_at
            ? new Date(sanitasiStats.stats_generated_at)
            : null
        const latest =
            airAt && sanitasiAt
                ? airAt > sanitasiAt
                    ? airAt
                    : sanitasiAt
                : airAt ?? sanitasiAt
        const label = formatGeneratedAtLabel(latest)
        return label ? copy.updated.replace('{time}', label) : null
    }, [airMetrics?.generatedAt, sanitasiStats?.stats_generated_at, copy.updated])

    if (isLoading) {
        return (
            <p className="mt-6 text-sm text-white/60 animate-pulse" role="status">
                {copy.loading}
            </p>
        )
    }

    if (!airMetrics && !sanitasiStats && mapStats.length === 0) return null

    const chips = [
        {
            key: 'air',
            label: copy.airMinum,
            percent: formatDesaCoverage(airDesaWithCapaian, airDesaTotal),
        },
        {
            key: 'sanitasi',
            label: copy.sanitasi,
            percent: formatDesaCoverage(sanitasiDesaWith, sanitasiDesaTotal),
        },
    ]

    return (
        <div className="mt-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
                {chips.map((chip) => (
                    <a
                        key={chip.key}
                        href="#capaian-spm"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-xs backdrop-blur-md transition-colors hover:border-white/35 hover:bg-black/35"
                    >
                        <span className="font-medium text-white/70">{chip.label}</span>
                        <span className="font-bold text-white">{chip.percent}</span>
                        <span className="text-[10px] text-white/40">{copy.desaCoverageShort}</span>
                    </a>
                ))}
            </div>
            {updatedLabel ? (
                <p className="mt-3 text-center text-[11px] text-white/45">{updatedLabel}</p>
            ) : null}
        </div>
    )
}