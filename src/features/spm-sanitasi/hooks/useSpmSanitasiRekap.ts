import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { getPublicSanitasiMapStats, type PublicSanitasiDesaMapStat } from '@/features/public/api/spam-stats'
import { filterPublicSpmMapStats } from '@/features/public/lib/spm-reserved-wilayah'
import { buildYearlyRows, normalizeWilayahName, type SpmRekapDesaInput } from '@/lib/spm-rekap'
import { getSpmSanitasiStats, getSpmSanitasiStatsSeries } from '../api'
import { SPM_TAHUN_OPTIONS } from '../lib/tahun-options'

const REKAP_TAHUN = [...SPM_TAHUN_OPTIONS].sort((a, b) => Number(a) - Number(b))

type UseSpmSanitasiRekapParams = {
    kecamatanId?: number
    kecamatanName?: string
    tahun?: string
    /** Muat capaian per desa untuk setiap tahun (matriks peningkatan) */
    matrixEnabled?: boolean
}

function toDesaInputs(
    data: PublicSanitasiDesaMapStat[] | undefined,
    kecamatanName: string | undefined,
): SpmRekapDesaInput[] {
    const kec = normalizeWilayahName(kecamatanName)
    return filterPublicSpmMapStats(data ?? [])
        .filter((row) => !kec || normalizeWilayahName(row.kecamatan) === kec)
        .map((row) => ({
            desaId: row.desa_id,
            desa: row.desa,
            kecamatan: row.kecamatan ?? '-',
            target: row.target_kk,
            capaian: row.pemanfaat_kk,
            jiwa: row.pemanfaat_jiwa,
            unit: row.unit_count,
        }))
}

/**
 * Data rekap capaian SPM Sanitasi:
 * - per desa / kecamatan dari `/public/spm-sanitasi/map-stats` (KK pemanfaat vs target KK desa)
 * - per tahun konstruksi dari `/spm-sanitasi/stats?tahun=`
 */
export function useSpmSanitasiRekap({
    kecamatanId,
    kecamatanName,
    tahun,
    matrixEnabled = false,
}: UseSpmSanitasiRekapParams) {
    const mapQuery = useQuery({
        queryKey: ['spm-sanitasi-rekap-map-stats', tahun ?? 'all'],
        queryFn: () => getPublicSanitasiMapStats(tahun ? { tahun } : undefined),
        staleTime: 60_000,
    })

    // Total seluruh tahun (untuk target & capaian tanpa tahun konstruksi)
    const totalQuery = useQuery({
        queryKey: ['spm-sanitasi-stats', kecamatanId ?? '', ''],
        queryFn: () => getSpmSanitasiStats({ kecamatan_id: kecamatanId }),
        staleTime: 60_000,
    })

    // Satu request untuk semua tahun (GET /spm-sanitasi/stats/series)
    const yearlyQuery = useQuery({
        queryKey: ['spm-sanitasi-stats-series', kecamatanId ?? '', REKAP_TAHUN.join(',')],
        queryFn: () => getSpmSanitasiStatsSeries({ kecamatan_id: kecamatanId, years: REKAP_TAHUN }),
        staleTime: 60_000,
    })

    const scopeKecamatan = kecamatanId ? kecamatanName : undefined

    const desaInputs = useMemo(
        () => toDesaInputs(mapQuery.data?.data, scopeKecamatan),
        [mapQuery.data?.data, scopeKecamatan],
    )

    const matrixQueries = useQueries({
        queries: REKAP_TAHUN.map((year) => ({
            queryKey: ['spm-sanitasi-rekap-map-stats', year],
            queryFn: () => getPublicSanitasiMapStats({ tahun: year }),
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

    const totalStats = totalQuery.data?.data
    const yearlyKey = String(yearlyQuery.dataUpdatedAt)

    const { yearlyRows, baseline } = useMemo(() => {
        const inputs = REKAP_TAHUN.map((year, index) => {
            const stats = yearlyQuery.data?.data?.[year]
            return {
                tahun: year,
                capaian: stats?.total_pemanfaat_kk ?? 0,
                jiwa: stats?.total_pemanfaat_jiwa ?? 0,
                unit: stats?.total_count ?? 0,
            }
        })
        const sumYears = inputs.reduce((sum, row) => sum + row.capaian, 0)
        const base = Math.max(0, (totalStats?.total_pemanfaat_kk ?? 0) - sumYears)
        return {
            yearlyRows: buildYearlyRows(inputs, totalStats?.target_kk ?? 0, base),
            baseline: base,
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yearlyKey, totalStats])

    return {
        desaInputs,
        isDesaLoading: mapQuery.isLoading,
        yearlyRows,
        yearlyBaseline: baseline,
        targetKk: totalStats?.target_kk ?? 0,
        firstTahun: REKAP_TAHUN[0],
        isYearlyLoading: totalQuery.isLoading || yearlyQuery.isLoading,
        matrixYears: REKAP_TAHUN,
        matrixByYear,
        isMatrixLoading: matrixEnabled && matrixQueries.some((query) => query.isLoading),
    }
}
