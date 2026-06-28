import type {
    LandingSpmSector,
    PublicSanitasiDesaMapStat,
    PublicSpamDesaMapStat,
} from '../api/spam-stats'

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
    return data.map((row) => ({
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
    return data.map((row) => ({
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

        return compareValues(leftValue, rightValue)
    })

    return direction === 'desc' ? sorted.reverse() : sorted
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