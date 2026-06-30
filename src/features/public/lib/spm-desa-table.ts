import type {
    LandingSpmSector,
    PublicSanitasiDesaMapStat,
    PublicSpamDesaMapStat,
} from '../api/spam-stats'
import { getCoverageTier, type SpmCoverageTier } from './spm-map-coverage'
import { filterPublicSpmMapStats } from './spm-reserved-wilayah'

export type SpmCoverageTierFilter = SpmCoverageTier | 'all'

export type SpmDesaSortKey =
    | 'desa'
    | 'kecamatan'
    | 'coverage'
    | 'kk'
    | 'target'
    | 'jiwa'
    | 'sr'
    | 'unit_count'
    | 'penduduk'

export type SpmDesaSortDirection = 'asc' | 'desc'

export type SpmDesaRowBase = {
    desa_id: number
    desa: string
    kecamatan: string
    target: number
    kk: number
    jiwa: number
    unit_count: number
    coverage: number
}

export type SpmDesaRowAirMinum = SpmDesaRowBase & {
    sector: 'air_minum'
    sr: number
}

export type SpmDesaRowSanitasi = SpmDesaRowBase & {
    sector: 'sanitasi'
    penduduk: number
}

export type SpmDesaRow = SpmDesaRowAirMinum | SpmDesaRowSanitasi

export const SPM_DESA_PAGE_SIZE = 25

export function calcSpmDesaCoverage(kk: number, target: number): number {
    if (target <= 0) return 0
    return Math.min(100, (kk / target) * 100)
}

export function buildAirMinumDesaRows(data: PublicSpamDesaMapStat[]): SpmDesaRowAirMinum[] {
    return filterPublicSpmMapStats(data).map((row) => ({
        sector: 'air_minum' as const,
        desa_id: row.desa_id,
        desa: row.desa,
        kecamatan: row.kecamatan?.trim() || '—',
        target: row.target,
        sr: row.sr,
        kk: row.kk,
        jiwa: row.jiwa,
        unit_count: row.unit_count,
        coverage: calcSpmDesaCoverage(row.kk, row.target),
    }))
}

export function buildSanitasiDesaRows(data: PublicSanitasiDesaMapStat[]): SpmDesaRowSanitasi[] {
    return filterPublicSpmMapStats(data).map((row) => ({
        sector: 'sanitasi' as const,
        desa_id: row.desa_id,
        desa: row.desa,
        kecamatan: row.kecamatan?.trim() || '—',
        target: row.target_kk,
        kk: row.pemanfaat_kk,
        jiwa: row.pemanfaat_jiwa,
        unit_count: row.unit_count,
        penduduk: row.jumlah_penduduk,
        coverage: calcSpmDesaCoverage(row.pemanfaat_kk, row.target_kk),
    }))
}

export function filterSpmDesaRows<T extends { desa: string; kecamatan: string }>(
    rows: T[],
    query: string,
): T[] {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return rows

    return rows.filter((row) => {
        const haystack = `${row.desa} ${row.kecamatan}`.toLowerCase()
        return haystack.includes(normalized)
    })
}

function compareValues(left: string | number, right: string | number) {
    if (typeof left === 'number' && typeof right === 'number') {
        return left - right
    }

    return String(left).localeCompare(String(right), 'id')
}

export function sortSpmDesaRows<T extends SpmDesaRow>(
    rows: T[],
    sortKey: SpmDesaSortKey,
    direction: SpmDesaSortDirection,
): T[] {
    const sorted = [...rows].sort((left, right) => {
        const leftValue =
            sortKey === 'penduduk' && left.sector === 'sanitasi'
                ? left.penduduk
                : sortKey === 'sr' && left.sector === 'air_minum'
                  ? left.sr
                  : (left[sortKey as keyof SpmDesaRowBase] as string | number)
        const rightValue =
            sortKey === 'penduduk' && right.sector === 'sanitasi'
                ? right.penduduk
                : sortKey === 'sr' && right.sector === 'air_minum'
                  ? right.sr
                  : (right[sortKey as keyof SpmDesaRowBase] as string | number)

        const primary = compareValues(leftValue, rightValue)
        if (primary !== 0) return primary

        const kecamatanCompare = compareValues(left.kecamatan, right.kecamatan)
        if (kecamatanCompare !== 0) return kecamatanCompare

        return left.desa_id - right.desa_id
    })

    return direction === 'desc' ? sorted.reverse() : sorted
}

export function getDuplicateDesaNameKeys(rows: Array<{ desa: string }>): Set<string> {
    const counts = new Map<string, number>()

    for (const row of rows) {
        const key = row.desa.trim().toLowerCase()
        if (!key) continue
        counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return new Set(
        [...counts.entries()]
            .filter(([, count]) => count > 1)
            .map(([name]) => name),
    )
}

export function paginateSpmDesaRows<T>(rows: T[], page: number, pageSize = SPM_DESA_PAGE_SIZE) {
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * pageSize

    return {
        rows: rows.slice(start, start + pageSize),
        page: safePage,
        totalPages,
        totalRows: rows.length,
        pageSize,
    }
}

export function getDefaultSortKey(sector: LandingSpmSector): SpmDesaSortKey {
    return sector === 'sanitasi' ? 'coverage' : 'coverage'
}

export function getUniqueKecamatans(rows: SpmDesaRow[]): string[] {
    const kecamatans = new Set<string>()
    for (const row of rows) {
        if (row.kecamatan && row.kecamatan !== '—') {
            kecamatans.add(row.kecamatan)
        }
    }
    return [...kecamatans].sort((a, b) => a.localeCompare(b, 'id'))
}

export function filterSpmDesaRowsByKecamatan<T extends SpmDesaRow>(
    rows: T[],
    kecamatan: string,
): T[] {
    if (!kecamatan) return rows
    return rows.filter((row) => row.kecamatan === kecamatan)
}

export function filterSpmDesaRowsByCoverageTier<T extends SpmDesaRow>(
    rows: T[],
    tier: SpmCoverageTierFilter,
): T[] {
    if (tier === 'all') return rows
    return rows.filter((row) => getCoverageTier(row.coverage) === tier)
}

export function findSpmDesaRowPage(
    rows: SpmDesaRow[],
    desaId: number,
    pageSize = SPM_DESA_PAGE_SIZE,
): number | null {
    const index = rows.findIndex((row) => row.desa_id === desaId)
    if (index < 0) return null
    return Math.floor(index / pageSize) + 1
}