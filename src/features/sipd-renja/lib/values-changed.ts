/** Sama dengan web/formatters.py — deteksi perubahan sebelum vs sesudah. */

function normalizeCompare(value: unknown): string | number | null {
    if (value === null || value === undefined || value === '') {
        return null
    }
    if (typeof value === 'number') {
        return value
    }
    const text = String(value).trim()
    if (!text || text === '-') {
        return null
    }
    const normalized = text.replace(',', '.')
    const parsed = Number(normalized)
    if (!Number.isNaN(parsed) && /^-?\d/.test(text)) {
        return parsed
    }
    return text.toLowerCase()
}

export function sipdValuesChanged(before: unknown, after: unknown): boolean {
    const left = normalizeCompare(before)
    const right = normalizeCompare(after)
    if (left === null && right === null) {
        return false
    }
    if (left === null || right === null) {
        return left !== right
    }
    if (typeof left === 'number' && typeof right === 'number') {
        return Math.abs(left - right) > 1e-9
    }
    return left !== right
}

export function sipdValueRemoved(before: unknown, after: unknown): boolean {
    const left = normalizeCompare(before)
    const right = normalizeCompare(after)
    return left !== null && right === null
}

export const SIPD_CHANGED_CELL_CLASS =
    'bg-amber-100 text-foreground shadow-[inset_0_0_0_1px_rgba(255,193,7,0.45)] dark:bg-amber-950/70 dark:text-amber-50 dark:shadow-[inset_0_0_0_1px_rgba(251,191,36,0.4)]'

export const SIPD_REMOVED_CELL_CLASS =
    'bg-red-100 font-semibold text-red-800 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.4)] dark:bg-red-950/60 dark:text-red-200 dark:shadow-[inset_0_0_0_1px_rgba(248,113,113,0.35)]'

export function sipdRincianCellClass(before: unknown, after: unknown): string {
    if (sipdValueRemoved(before, after)) {
        return SIPD_REMOVED_CELL_CLASS
    }
    if (sipdValuesChanged(before, after)) {
        return SIPD_CHANGED_CELL_CLASS
    }
    return ''
}

/** @deprecated gunakan sipdRincianCellClass */
export function sipdChangedCellClass(before: unknown, after: unknown): string {
    return sipdRincianCellClass(before, after)
}

export function formatSipdKoefisien(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return '-'
    }
    return String(value)
}