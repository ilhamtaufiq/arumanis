import { fetchAllPages } from '@/lib/paginated-fetch'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'

export type ProgressEstimasiAverages = {
    totalPaket: number
    /** Paket dengan realisasi estimasi fisik terisi */
    countFisik: number
    /** Paket dengan realisasi estimasi keuangan terisi */
    countKeuangan: number
    /** Rata-rata realisasi progress estimasi fisik (%) */
    avgFisik: number | null
    /** Rata-rata realisasi progress estimasi keuangan (%) — termasuk sinkron SP2D */
    avgKeuangan: number | null
}

function average(values: number[]): number | null {
    if (!values.length) return null
    const sum = values.reduce((a, b) => a + b, 0)
    return Math.round((sum / values.length) * 10) / 10
}

/**
 * Rata-rata realisasi tab Progress (fisik & keuangan) untuk TA.
 * Memakai summary=1 agar progressEstimasiHistory ter-load.
 */
export async function fetchProgressEstimasiAverages(
    tahun: string,
): Promise<ProgressEstimasiAverages> {
    const items = await fetchAllPages((page) =>
        getPekerjaan({
            page,
            per_page: 100,
            tahun,
            status: 'active',
            summary: true,
        }),
    )

    const fisikVals = items
        .map((i) => i.progress_estimasi_fisik)
        .filter((n): n is number => n != null && Number.isFinite(n))
    const keuVals = items
        .map((i) => i.progress_estimasi_keuangan)
        .filter((n): n is number => n != null && Number.isFinite(n))

    return {
        totalPaket: items.length,
        countFisik: fisikVals.length,
        countKeuangan: keuVals.length,
        avgFisik: average(fisikVals),
        avgKeuangan: average(keuVals),
    }
}
