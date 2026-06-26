import { useQuery } from '@tanstack/react-query'
import { getPublicSpamMapStats, getPublicSpamUnitStats } from '../api/spam-stats'
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

    const stats = statsQuery.data?.data
    const mapDesaCount = mapQuery.data?.data?.length ?? null
    const metrics = buildInnovationMetrics(stats, mapDesaCount)

    return {
        stats,
        mapDesaCount,
        metrics,
        isLoading: statsQuery.isLoading || mapQuery.isLoading,
        isError: statsQuery.isError || mapQuery.isError,
        isLive: Boolean(metrics),
        refetch: () => {
            void statsQuery.refetch()
            void mapQuery.refetch()
        },
    }
}