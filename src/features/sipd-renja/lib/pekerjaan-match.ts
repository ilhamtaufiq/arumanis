import type { Pekerjaan } from '@/features/pekerjaan/types'

export type SipdPekerjaanLookup = Pick<
    Pekerjaan,
    'id' | 'nama_paket' | 'progress_total' | 'desa' | 'kecamatan'
> & {
    kontrak?: Array<{ id: number }>
    foto_status?: string | null
    is_konsultan?: boolean
}

/** Sama dengan normalizeLookupText di KontrakImport (apiamis). */
export function normalizeLookupText(value: string | null | undefined): string {
    return (value || '')
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, '')
        .toLowerCase()
}

/** Pola umum ket_bl_teks lokasi: "Desa Mayak Kecamatan Cibeber". */
export function parseDesaKecamatanKet(ket: string): { desa: string; kecamatan: string } | null {
    const match = ket.trim().match(/^desa\s+(.+?)\s+kecamatan\s+(.+)$/i)
    if (!match) return null
    return { desa: match[1].trim(), kecamatan: match[2].trim() }
}

function isPhysicalPekerjaan(p: SipdPekerjaanLookup): boolean {
    // Paket jasa/konsultan biasanya tanpa desa — jangan ikut match lokasi
    if (p.is_konsultan) return false
    const desa = normalizeLookupText(p.desa?.nama_desa)
    const kec = normalizeLookupText(p.kecamatan?.nama_kecamatan)
    return Boolean(desa && kec)
}

/** Exact atau satu sisi contains, hanya jika kedua string non-kosong. */
function namesLooseEqual(a: string, b: string): boolean {
    if (!a || !b) return false
    if (a === b) return true
    // Hindari match terlalu longgar (mis. "cik" ⊂ "cikadu") — min 4 char
    if (a.length < 4 || b.length < 4) return false
    return a.includes(b) || b.includes(a)
}

function matchByLocation(
    loc: { desa: string; kecamatan: string },
    pekerjaanList: SipdPekerjaanLookup[],
): SipdPekerjaanLookup | null {
    const desaNorm = normalizeLookupText(loc.desa)
    const kecNorm = normalizeLookupText(loc.kecamatan)
    if (!desaNorm || !kecNorm) return null

    const candidates = pekerjaanList.filter(isPhysicalPekerjaan)

    const exact = candidates.filter((p) => {
        const pDesa = normalizeLookupText(p.desa?.nama_desa)
        const pKec = normalizeLookupText(p.kecamatan?.nama_kecamatan)
        return pDesa === desaNorm && pKec === kecNorm
    })
    if (exact.length === 1) return exact[0]
    if (exact.length > 1) {
        // Disambiguasi: nama paket memuat nama desa
        const byName = exact.filter((p) =>
            normalizeLookupText(p.nama_paket).includes(desaNorm),
        )
        if (byName.length === 1) return byName[0]
        // Ambigu — jangan tebak
        return null
    }

    // Fallback longgar hanya jika exact 0
    const loose = candidates.filter((p) => {
        const pDesa = normalizeLookupText(p.desa?.nama_desa)
        const pKec = normalizeLookupText(p.kecamatan?.nama_kecamatan)
        return namesLooseEqual(pDesa, desaNorm) && namesLooseEqual(pKec, kecNorm)
    })
    if (loose.length === 1) return loose[0]
    if (loose.length > 1) {
        const byName = loose.filter((p) =>
            normalizeLookupText(p.nama_paket).includes(desaNorm),
        )
        if (byName.length === 1) return byName[0]
        return null
    }

    return null
}

export function matchKetToPekerjaan(
    ket: string | null | undefined,
    pekerjaanList: SipdPekerjaanLookup[],
): SipdPekerjaanLookup | null {
    const trimmed = (ket || '').trim()
    if (!trimmed) return null

    const normalizedKet = normalizeLookupText(trimmed)
    if (!normalizedKet) return null

    const exact = pekerjaanList.find(
        (p) => normalizeLookupText(p.nama_paket) === normalizedKet,
    )
    if (exact) return exact

    const loc = parseDesaKecamatanKet(trimmed)
    if (loc) {
        // Ket lokasi: HANYA match by desa/kec. Jangan fuzzy ke nama paket jasa.
        return matchByLocation(loc, pekerjaanList)
    }

    // Fuzzy contains hanya untuk ket non-lokasi, dan hanya satu arah nama paket ⊃ ket
    // (bukan ket ⊃ nama — menghindari "desa..." menyerap substring acak).
    if (normalizedKet.length >= 12) {
        const contains = pekerjaanList.filter((p) => {
            const normName = normalizeLookupText(p.nama_paket)
            if (!normName || normName.length < 8) return false
            return normName.includes(normalizedKet) || normalizedKet.includes(normName)
        })
        if (contains.length === 1) return contains[0]
    }

    return null
}

export function buildPekerjaanMatchIndex(pekerjaanList: SipdPekerjaanLookup[]) {
    return { list: pekerjaanList }
}

export function lookupPekerjaanByKet(
    ket: string | null | undefined,
    index: ReturnType<typeof buildPekerjaanMatchIndex>,
): SipdPekerjaanLookup | null {
    return matchKetToPekerjaan(ket, index.list)
}
