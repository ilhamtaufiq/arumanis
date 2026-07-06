import type { Pekerjaan } from '@/features/pekerjaan/types'

export type SipdPekerjaanLookup = Pick<
    Pekerjaan,
    'id' | 'nama_paket' | 'progress_total' | 'desa' | 'kecamatan'
> & {
    kontrak?: Array<{ id: number }>
    foto_status?: string | null
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

function matchByLocation(
    loc: { desa: string; kecamatan: string },
    pekerjaanList: SipdPekerjaanLookup[],
): SipdPekerjaanLookup | null {
    const desaNorm = normalizeLookupText(loc.desa)
    const kecNorm = normalizeLookupText(loc.kecamatan)

    const byLocation = pekerjaanList.filter((p) => {
        const pDesa = normalizeLookupText(p.desa?.nama_desa)
        const pKec = normalizeLookupText(p.kecamatan?.nama_kecamatan)
        const desaMatch = pDesa.includes(desaNorm) || desaNorm.includes(pDesa)
        const kecMatch = pKec.includes(kecNorm) || kecNorm.includes(pKec)
        return desaMatch && kecMatch
    })

    if (byLocation.length === 1) return byLocation[0]

    const byName = byLocation.filter((p) =>
        normalizeLookupText(p.nama_paket).includes(desaNorm),
    )
    if (byName.length === 1) return byName[0]

    return byLocation[0] ?? null
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
        const byLoc = matchByLocation(loc, pekerjaanList)
        if (byLoc) return byLoc
    }

    if (normalizedKet.length >= 10) {
        const contains = pekerjaanList.filter((p) => {
            const normName = normalizeLookupText(p.nama_paket)
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