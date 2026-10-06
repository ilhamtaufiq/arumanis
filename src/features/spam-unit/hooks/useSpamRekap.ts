import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { getPublicSpamMapStats, type PublicSpamDesaMapStat } from '@/features/public/api/spam-stats'
import { filterPublicSpmMapStats } from '@/features/public/lib/spm-reserved-wilayah'
import { buildYearlyRows, normalizeWilayahName, type SpmRekapDesaInput } from '@/lib/spm-rekap'
import { getSpamUnitStats } from '../api'

export const SPAM_REKAP_TAHUN = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'] as const

type UseSpamRekapParams = {
    kecamatanId?: number
    /** Nama kecamatan terpilih — map-stats hanya membawa nama, bukan id */
    kecamatanName?: string
    tahun?: string
    targetKk: number
    /** Muat capaian per desa untuk setiap tahun (matriks peningkatan) */
    matrixEnabled?: boolean
}

function toDesaInputs(
    data: PublicSpamDesaMapStat[] | undefined,
    kecamatanName: string | undefined,
): SpmRekapDesaInput[] {
    const kec = normalizeWilayahName(kecamatanName)
    return filterPublicSpmMapStats(data ?? [])
        .filter((row) => !kec || normalizeWilayahName(row.kecamatan) === kec)
        .map((row) => ({
            desaId: row.desa_id,
            desa: row.desa,
            kecamatan: row.kecamatan ?? '-',
            target: row.target,
            capaian: row.kk,
            jiwa: row.jiwa,
            unit: row.unit_count,
            sr: row.sr,
        }))
}

/**
 * Data rekap capaian SPM Air Minum:
 * - per desa / kecamatan dari `/public/spam-units/map-stats` (KK JP vs target desa)
 * - per tahun dari `/spam-units/stats?tahun=` (tambahan KK JP pada tahun tersebut)
 */
export function useSpamRekap({
    kecamatanId,
    kecamatanName,
    tahun,
    targetKk,
    matrixEnabled = false,
}: UseSpamRekapParams) {
    const mapQuery = useQuery({
        queryKey: ['spam-rekap-map-stats', tahun ?? 'all'],
        queryFn: () => getPublicSpamMapStats(tahun ? { tahun } : undefined),
        staleTime: 60_000,
    })

    const yearlyQueries = useQueries({
        queries: SPAM_REKAP_TAHUN.map((year) => ({
            queryKey: ['spam-units-stats', kecamatanId, year],
            queryFn: () => getSpamUnitStats({ kecamatan_id: kecamatanId, tahun: year }),
            staleTime: 60_000,
        })),
    })

    const scopeKecamatan = kecamatanId ? kecamatanName : undefined

    const desaInputs = useMemo(
        () => toDesaInputs(mapQuery.data?.data, scopeKecamatan),
        [mapQuery.data?.data, scopeKecamatan],
    )

    const matrixQueries = useQueries({
        queries: SPAM_REKAP_TAHUN.map((year) => ({
            queryKey: ['spam-rekap-map-stats', year],
            queryFn: () => getPublicSpamMapStats({ tahun: year }),
            staleTime: 60_000,
            enabled: matrixEnabled,
        })),
    })
    const matrixKey = matrixQueries.map((query) => query.dataUpdatedAt).join('|')
    const matrixByYear = useMemo(
        () => matrixQueries.map((query) => (query.data ? toDesaInputs(query.data.data, scopeKecamatan) : undefined)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [matrixKey, scopeKecamatan],
    )

    const yearlyData = yearlyQueries.map((query) => query.data?.data)
    const yearlyKey = yearlyQueries.map((query) => query.dataUpdatedAt).join('|')

    const yearlyRows = useMemo(() => {
        const inputs = SPAM_REKAP_TAHUN.map((year, index) => {
            const stats = yearlyData[index]
            const capaian = stats?.ringkasan?.capaian
            return {
                tahun: year,
                capaian: capaian?.kk ?? stats?.capaian_kk ?? stats?.total_kk ?? 0,
                jiwa: capaian?.jiwa ?? stats?.capaian_jiwa ?? stats?.total_jiwa ?? 0,
                sr: capaian?.sr ?? stats?.capaian_sr ?? stats?.total_sr ?? 0,
            }
        })
        return buildYearlyRows(inputs, targetKk)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yearlyKey, targetKk])

    return {
        desaInputs,
        isDesaLoading: mapQuery.isLoading,
        yearlyRows,
        isYearlyLoading: yearlyQueries.some((query) => query.isLoading),
        matrixYears: SPAM_REKAP_TAHUN,
        matrixByYear,
        isMatrixLoading: matrixEnabled && matrixQueries.some((query) => query.isLoading),
    }
}
