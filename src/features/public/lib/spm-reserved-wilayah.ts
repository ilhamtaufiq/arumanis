const RESERVED_WILAYAH_NAMES = new Set(['null', 'nulls'])

export function isReservedWilayahName(name?: string | null): boolean {
    const normalized = (name ?? '').trim().toLowerCase()
    return !normalized || RESERVED_WILAYAH_NAMES.has(normalized)
}

export function isReservedSpmMapStat(row: {
    desa?: string | null
    kecamatan?: string | null
}): boolean {
    return isReservedWilayahName(row.desa) || isReservedWilayahName(row.kecamatan)
}

export function filterPublicSpmMapStats<
    T extends { desa?: string | null; kecamatan?: string | null },
>(rows: T[]): T[] {
    return rows.filter((row) => !isReservedSpmMapStat(row))
}