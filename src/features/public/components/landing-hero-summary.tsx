import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    getPublicSanitasiStats,
    getPublicSpamMapStats,
    getPublicSpamUnitStats,
} from '../api/spam-stats'
import { usePublicLocale } from '../i18n/use-public-locale'
import { formatCount, formatCoverage, formatGeneratedAtLabel } from '../lib/innovation-stats'
import { buildPublicAirMinumMetrics } from '../lib/spm-public-stats'

function formatDesaCoverage(withCount: number, total: number) {
    if (total <= 0) return { percent: '—', line: '—' }
    const percent = `${formatCoverage((withCount / total) * 100)}%`
    return { percent, withCount, total }
}

export function LandingHeroSummary() {
    const { messages } = usePublicLocale()
    const copy = messages.landing.hero.stats

    const { data: unitResponse, isLoading: isUnitLoading } = useQuery({
        queryKey: ['landing', 'hero-air-stats'],
        queryFn: () => getPublicSpamUnitStats(),
        staleTime: 60_000,
    })

    const { data: mapResponse, isLoading: isMapLoading } = useQuery({
        queryKey: ['landing', 'hero-map-stats'],
        queryFn: () => getPublicSpamMapStats(),
        staleTime: 60_000,
    })

    const { data: sanitasiResponse, isLoading: isSanitasiLoading } = useQuery({
        queryKey: ['landing', 'hero-sanitasi-stats'],
        queryFn: () => getPublicSanitasiStats(),
        staleTime: 60_000,
    })

    const isLoading = isUnitLoading || isMapLoading || isSanitasiLoading
    const airMetrics = buildPublicAirMinumMetrics(unitResponse?.data)
    const mapStats = mapResponse?.data ?? []
    const sanitasiStats = sanitasiResponse?.data

    const airDesaWithCapaian = mapStats.filter((row) => row.kk > 0).length
    const airDesaTotal = mapStats.length
    const sanitasiDesaWith = sanitasiStats?.desa_with_infrastruktur ?? 0
    const sanitasiDesaTotal = sanitasiStats?.total_desa ?? 0

    const airCoverage = formatDesaCoverage(airDesaWithCapaian, airDesaTotal)
    const sanitasiCoverage = formatDesaCoverage(sanitasiDesaWith, sanitasiDesaTotal)

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

    const formatDesaLine = (withCount: number, total: number) =>
        copy.desaCount
            .replace('{with}', formatCount(withCount))
            .replace('{total}', formatCount(total))

    if (isLoading) {
        return (
            <p className="mt-8 text-sm text-white/60 animate-pulse" role="status">
                {copy.loading}
            </p>
        )
    }

    if (!airMetrics && !sanitasiStats && mapStats.length === 0) return null

    const rows = [
        {
            key: 'air',
            label: copy.airMinum,
            percent: airCoverage.percent,
            desaLine:
                airCoverage.total != null
                    ? formatDesaLine(airCoverage.withCount!, airCoverage.total)
                    : '—',
        },
        {
            key: 'sanitasi',
            label: copy.sanitasi,
            percent: sanitasiCoverage.percent,
            desaLine:
                sanitasiCoverage.total != null
                    ? formatDesaLine(sanitasiCoverage.withCount!, sanitasiCoverage.total)
                    : '—',
        },
    ]

    return (
        <div className="mt-10 mx-auto max-w-xl">
            <div className="rounded-xl border border-white/15 bg-black/25 px-5 py-4 backdrop-blur-md">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                    {copy.desaCoverageTitle}
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:divide-x sm:divide-white/10">
                    {rows.map((row) => (
                        <div key={row.key} className="text-center sm:px-3">
                            <p className="text-xs font-medium text-white/70">{row.label}</p>
                            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                                {row.percent}
                            </p>
                            <p className="mt-1 text-[11px] text-white/45">{row.desaLine}</p>
                        </div>
                    ))}
                </div>
            </div>
            {updatedLabel ? (
                <p className="mt-3 text-center text-[11px] text-white/45">{updatedLabel}</p>
            ) : null}
        </div>
    )
}