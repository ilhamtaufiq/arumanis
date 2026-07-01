import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    getPublicSanitasiStats,
    getPublicSpamMapStats,
    getPublicSpamUnitStats,
} from '../api/spam-stats'
import { buildInnovationMetrics } from '../lib/innovation-stats'

export function usePublicInnovationStats() {
    const statsQuery = useQuery({
        queryKey: ['public', 'innovation-stats'],
        queryFn: () => getPublicSpamUnitStats(),
        staleTime: 60_000,
        refetchOnWindowFocus: true,
    })

    const mapQuery = useQuery({
        queryKey: ['public', 'innovation-map-stats'],
        queryFn: () => getPublicSpamMapStats(),
        staleTime: 60_000,
        refetchOnWindowFocus: true,
    })

    const sanitasiQuery = useQuery({
        queryKey: ['public', 'innovation-sanitasi-stats'],
        queryFn: () => getPublicSanitasiStats(),
        staleTime: 60_000,
        refetchOnWindowFocus: true,
    })

    const stats = statsQuery.data?.data
    const mapStats = mapQuery.data?.data ?? []
    const mapDesaCount = mapStats.length > 0 ? mapStats.length : null
    const airDesaWithCapaian = mapStats.filter((row) => row.kk > 0).length
    const sanitasiStats = sanitasiQuery.data?.data ?? null

    const metrics = useMemo(
        () =>
            buildInnovationMetrics(stats, mapDesaCount, {
                airDesaWithCapaian,
                sanitasi: sanitasiStats,
            }),
        [stats, mapDesaCount, airDesaWithCapaian, sanitasiStats],
    )

    return {
        stats,
        mapDesaCount,
        sanitasiStats,
        metrics,
        isLoading:
            statsQuery.isLoading || mapQuery.isLoading || sanitasiQuery.isLoading,
        isError: statsQuery.isError || mapQuery.isError || sanitasiQuery.isError,
        isLive: Boolean(metrics),
        refetch: () => {
            void statsQuery.refetch()
            void mapQuery.refetch()
            void sanitasiQuery.refetch()
        },
    }
}