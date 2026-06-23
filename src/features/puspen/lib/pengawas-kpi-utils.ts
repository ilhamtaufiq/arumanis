import type { PengawasKpiItem } from '../api/pengawas-kpi'
import type { PengawasKpiPeranFilter } from './pengawas-kpi-peran'

export function getScorePerPekerjaan(item: Pick<PengawasKpiItem, 'score' | 'pekerjaan_count' | 'score_per_pekerjaan'>): number {
    if (item.score_per_pekerjaan != null && !Number.isNaN(item.score_per_pekerjaan)) {
        return item.score_per_pekerjaan
    }
    if (item.pekerjaan_count <= 0) return 0
    return Math.round((item.score / item.pekerjaan_count) * 10) / 10
}

export async function fetchAllPengawasKpiItems(params: {
    tahun?: number
    search?: string
    peran?: PengawasKpiPeranFilter
}): Promise<PengawasKpiItem[]> {
    const { getPuspenPengawasKpi } = await import('../api/pengawas-kpi')

    const first = await getPuspenPengawasKpi({
        ...params,
        page: 1,
        per_page: 100,
    })

    const all = [...first.data]

    for (let page = 2; page <= first.meta.last_page; page += 1) {
        const next = await getPuspenPengawasKpi({
            ...params,
            page,
            per_page: 100,
        })
        all.push(...next.data)
    }

    return all
}