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

export type SipdKoefisienStatus = 'Bertambah' | 'Berkurang' | 'Tetap' | 'Berubah'

function isEmptyKoefisien(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
        return true
    }
    if (typeof value === 'boolean') {
        return true
    }
    const text = String(value).trim()
    return text === '' || text === '-'
}

function parseIdNumber(text: string): number | null {
    let normalized = text.trim()
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(normalized)) {
        normalized = normalized.replace(/\./g, '').replace(',', '.')
    } else if (normalized.includes(',') && !normalized.includes('.')) {
        normalized = normalized.replace(',', '.')
    }
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? null : parsed
}

/** Nilai numerik koefisien; ekspresi '2 x 3' / '1 Kg x 2' dihitung perkaliannya. */
function koefisienNumber(value: unknown): number | null {
    if (isEmptyKoefisien(value)) {
        return null
    }
    if (typeof value === 'number') {
        return value
    }
    const parts = String(value).split(/[xX×*]/)
    let result = 1
    let hasDigits = false
    for (const part of parts) {
        const cleaned = part.replace(/[^0-9,.\-]/g, '')
        if (!cleaned || !/\d/.test(cleaned)) {
            continue
        }
        hasDigits = true
        const parsed = parseIdNumber(cleaned)
        if (parsed === null) {
            return null
        }
        result *= parsed
    }
    return hasDigits ? result : null
}

/** Arah perubahan koefisien sebelum → sesudah. Mirror web/formatters.py. */
export function sipdKoefisienStatus(before: unknown, after: unknown): SipdKoefisienStatus {
    const beforeEmpty = isEmptyKoefisien(before)
    const afterEmpty = isEmptyKoefisien(after)
    if (beforeEmpty && afterEmpty) {
        return 'Tetap'
    }
    if (beforeEmpty) {
        return 'Bertambah'
    }
    if (afterEmpty) {
        return 'Berkurang'
    }
    const beforeNum = koefisienNumber(before)
    const afterNum = koefisienNumber(after)
    if (beforeNum !== null && afterNum !== null) {
        if (Math.abs(afterNum - beforeNum) <= 1e-9) {
            return 'Tetap'
        }
        return afterNum > beforeNum ? 'Bertambah' : 'Berkurang'
    }
    return String(before).trim().toLowerCase() === String(after).trim().toLowerCase()
        ? 'Tetap'
        : 'Berubah'
}

export const SIPD_KOEF_STATUS_BADGE_CLASS: Record<SipdKoefisienStatus, string> = {
    Bertambah:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    Berkurang:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300',
    Tetap: '',
    Berubah:
        'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
}