/** Opsi standar agar penamaan jenis dokumen seragam di seluruh app. */
export const DEFAULT_JENIS_DOKUMEN = [
    'RAB',
    'GAMBAR',
    'NEGO',
    'Kontrak',
    'SPK',
    'BA Klarifikasi',
    'Hasil Negosiasi',
    'Laporan Harian',
    'Laporan Mingguan',
    'Berita Acara',
    'Dokumentasi',
    'Surat',
    'Lainnya',
] as const

/**
 * Gabung default + dari DB + lokal (baru ditambah user).
 * Dedup case-insensitive; prefer casing yang muncul lebih dulu (default dulu).
 */
export function mergeJenisDokumenOptions(
    fromApi: string[] = [],
    extras: string[] = [],
    selected?: string | null,
): string[] {
    const seen = new Set<string>()
    const result: string[] = []

    const push = (raw: string | null | undefined) => {
        const value = (raw ?? '').trim()
        if (!value) return
        const key = value.toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
        result.push(value)
    }

    for (const item of DEFAULT_JENIS_DOKUMEN) {
        push(item)
    }
    for (const item of fromApi) {
        push(item)
    }
    for (const item of extras) {
        push(item)
    }
    push(selected)

    return result
}

export function normalizeJenisDokumenLabel(value: string): string {
    return value.trim().replace(/\s+/g, ' ')
}

export function findJenisDokumenMatch(
    options: readonly string[],
    query: string,
): string | undefined {
    const q = normalizeJenisDokumenLabel(query).toLowerCase()
    if (!q) return undefined
    return options.find((item) => item.toLowerCase() === q)
}
