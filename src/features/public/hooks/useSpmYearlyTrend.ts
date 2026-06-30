import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import {
    getPublicSanitasiStats,
    getPublicSpamUnitStats,
    type LandingSpmSector,
} from '../api/spam-stats'
import {
    buildAirMinumYearlyPoint,
    buildSanitasiYearlyPoint,
    getSpmYearlyTrendYears,
    sortYearlyTrendPoints,
    type SpmYearlyTrendPoint,
} from '../lib/spm-yearly-trend'

export function useSpmYearlyTrend(sector: LandingSpmSector) {
    const years = getSpmYearlyTrendYears()

    const queries = useQueries({
        queries: years.map((tahun) => ({
            queryKey: ['spm-yearly-trend', sector, tahun],
            queryFn: async () => {
                if (sector === 'sanitasi') {
                    const response = await getPublicSanitasiStats({ tahun })
                    return buildSanitasiYearlyPoint(response.data, tahun)
                }

                const response = await getPublicSpamUnitStats({ tahun })
                return buildAirMinumYearlyPoint(response.data, tahun)
            },
            staleTime: 60_000,
        })),
    })

    const points = useMemo(() => {
        const loaded = queries
            .map((query) => query.data)
            .filter((point): point is SpmYearlyTrendPoint => !!point)

        return sortYearlyTrendPoints(loaded)
    }, [queries])

    const isLoading = queries.some((query) => query.isLoading)
    const isError = queries.every((query) => query.isError)

    return {
        points,
        years,
        isLoading,
        isError,
    }
}