import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { getPublicSpamMapStats, type PublicSpamDesaMapStat } from '@/features/public/api/spam-stats'
import { filterPublicSpmMapStats } from '@/features/public/lib/spm-reserved-wilayah'
import { buildYearlyRows, normalizeWilayahName, type SpmRekapDesaInput } from '@/lib/spm-rekap'
import { getSpamUnitStats } from '../api'
import type { UnitSpamStats } from '../types'

export const SPAM_REKAP_TAHUN = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'] as const

const JIWA_PER_KK = 5

type UseSpamRekapParams = {
    kecamatanId?: number
    /** Nama kecamatan terpilih — map-stats hanya membawa nama, bukan id */
    kecamatanName?: string
    tahun?: string
    /** Muat capaian per desa untuk setiap tahun (matriks peningkatan) */
    matrixEnabled?: boolean
}

/**
 * @param includeBjpMaster BJP master desa tidak bertahun — hanya dihitung pada
 *   tampilan akumulasi (tanpa filter tahun), bukan pada tambahan per tahun.
 */
function toDesaInputs(
    data: PublicSpamDesaMapStat[] | undefined,
    kecamatanName: string | undefined,
    includeBjpMaster: boolean,
): SpmRekapDesaInput[] {
    const kec = normalizeWilayahName(kecamatanName)
    return filterPublicSpmMapStats(data ?? [])
        .filter((row) => !kec || normalizeWilayahName(row.kecamatan) === kec)
        .map((row) => {
            const bjp = (row.bjp_unit ?? 0) + (includeBjpMaster ? (row.bjp_master ?? 0) : 0)
            return {
                desaId: row.desa_id,
                desa: row.desa,
                kecamatan: row.kecamatan ?? '-',
                target: row.target,
                capaian: row.kk + bjp,
                jiwa: row.jiwa + bjp * JIWA_PER_KK,
                unit: row.unit_count,
                sr: row.sr,
                bjp,
            }
        })
}

/** KK terlayani = KK JP + BJP unit (+ BJP master bila cakupan akumulasi). */
function servedKk(stats: UnitSpamStats | undefined, includeBjpMaster: boolean) {
    if (!stats) return { kk: 0, jiwa: 0, sr: 0 }
    const capaian = stats.ringkasan?.capaian
    const spm = stats.ringkasan?.spm
    const jpKk = capaian?.kk ?? stats.capaian_kk ?? stats.total_kk ?? 0
    const bjp = (spm?.bjp_unit_kk ?? 0) + (includeBjpMaster ? (spm?.bjp_master_kk ?? 0) : 0)
    return {
        kk: jpKk + bjp,
        jiwa: (capaian?.jiwa ?? stats.capaian_jiwa ?? stats.total_jiwa ?? 0) + bjp * JIWA_PER_KK,
        sr: capaian?.sr ?? stats.capaian_sr ?? stats.total_sr ?? 0,
    }
}

/**
 * Data rekap capaian SPM Air Minum (KK terlayani = KK JP + BJP):
 * - per desa / kecamatan dari `/public/spam-units/map-stats`
 * - per tahun dari `/spam-units/stats?tahun=` (tambahan pada tahun tersebut)
 */
export function useSpamRekap({
    kecamatanId,
    kecamatanName,
    tahun,
    matrixEnabled = false,
}: UseSpamRekapParams) {
    const mapQuery = useQuery({
        queryKey: ['spam-rekap-map-stats', tahun ?? 'all'],
        queryFn: () => getPublicSpamMapStats(tahun ? { tahun } : undefined),
        staleTime: 60_000,
    })

    // Akumulasi seluruh tahun (target + titik awal tren); kunci sama dengan dashboard
    const totalQuery = useQuery({
        queryKey: ['spam-units-stats', kecamatanId, undefined],
        queryFn: () => getSpamUnitStats({ kecamatan_id: kecamatanId }),
        staleTime: 30_000,
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
        () => toDesaInputs(mapQuery.data?.data, scopeKecamatan, !tahun),
        [mapQuery.data?.data, scopeKecamatan, tahun],
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
        () =>
            matrixQueries.map((query) =>
                query.data ? toDesaInputs(query.data.data, scopeKecamatan, false) : undefined,
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [matrixKey, scopeKecamatan],
    )

    const totalStats = totalQuery.data?.data
    const yearlyKey = yearlyQueries.map((query) => query.dataUpdatedAt).join('|')

    const { yearlyRows, baseline, targetKk } = useMemo(() => {
        const inputs = SPAM_REKAP_TAHUN.map((year, index) => ({
            tahun: year,
            ...servedKk(yearlyQueries[index]?.data?.data, false),
        }))
        const sumYears = inputs.reduce((sum, row) => sum + row.kk, 0)
        const total = servedKk(totalStats, true).kk
        // Capaian di luar rentang tahun + BJP master desa (tidak bertahun)
        const base = Math.max(0, total - sumYears)
        const target = totalStats?.ringkasan?.spm?.target_kk ?? totalStats?.total_target ?? 0
        return {
            yearlyRows: buildYearlyRows(
                inputs.map((row) => ({ tahun: row.tahun, capaian: row.kk, jiwa: row.jiwa, sr: row.sr })),
                target,
                base,
            ),
            baseline: base,
            targetKk: target,
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yearlyKey, totalStats])

    return {
        desaInputs,
        isDesaLoading: mapQuery.isLoading,
        yearlyRows,
        yearlyBaseline: baseline,
        targetKk,
        firstTahun: SPAM_REKAP_TAHUN[0],
        isYearlyLoading: totalQuery.isLoading || yearlyQueries.some((query) => query.isLoading),
        matrixYears: SPAM_REKAP_TAHUN,
        matrixByYear,
        isMatrixLoading: matrixEnabled && matrixQueries.some((query) => query.isLoading),
    }
}
