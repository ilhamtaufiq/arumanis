import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { getPublicSanitasiMapStats } from '@/features/public/api/spam-stats'
import { filterPublicSpmMapStats } from '@/features/public/lib/spm-reserved-wilayah'
import { buildYearlyRows, normalizeWilayahName, type SpmRekapDesaInput } from '@/lib/spm-rekap'
import { getSpmSanitasiStats } from '../api'
import { SPM_TAHUN_OPTIONS } from '../lib/tahun-options'

const REKAP_TAHUN = [...SPM_TAHUN_OPTIONS].sort((a, b) => Number(a) - Number(b))

type UseSpmSanitasiRekapParams = {
    kecamatanId?: number
    kecamatanName?: string
    tahun?: string
}

/**
 * Data rekap capaian SPM Sanitasi:
 * - per desa / kecamatan dari `/public/spm-sanitasi/map-stats` (KK pemanfaat vs target KK desa)
 * - per tahun konstruksi dari `/spm-sanitasi/stats?tahun=`
 */
export function useSpmSanitasiRekap({ kecamatanId, kecamatanName, tahun }: UseSpmSanitasiRekapParams) {
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

    const yearlyQueries = useQueries({
        queries: REKAP_TAHUN.map((year) => ({
            queryKey: ['spm-sanitasi-stats', kecamatanId ?? '', year],
            queryFn: () => getSpmSanitasiStats({ kecamatan_id: kecamatanId, tahun: year }),
            staleTime: 60_000,
        })),
    })

    const desaInputs = useMemo<SpmRekapDesaInput[]>(() => {
        const rows = filterPublicSpmMapStats(mapQuery.data?.data ?? [])
        const kec = kecamatanId ? normalizeWilayahName(kecamatanName) : ''
        return rows
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
    }, [mapQuery.data?.data, kecamatanId, kecamatanName])

    const totalStats = totalQuery.data?.data
    const yearlyKey = yearlyQueries.map((query) => query.dataUpdatedAt).join('|')

    const { yearlyRows, baseline } = useMemo(() => {
        const inputs = REKAP_TAHUN.map((year, index) => {
            const stats = yearlyQueries[index]?.data?.data
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
        firstTahun: REKAP_TAHUN[0],
        isYearlyLoading: totalQuery.isLoading || yearlyQueries.some((query) => query.isLoading),
    }
}
