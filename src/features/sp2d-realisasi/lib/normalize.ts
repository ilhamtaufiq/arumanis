/** Lowercase, strip punctuation/noise, expand common abbreviations for matching. */
export function normalizeText(input: string | null | undefined): string {
    if (!input) return ''

    let s = String(input)
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')

    // Expand abbreviations before stripping dots
    const replacements: Array<[RegExp, string]> = [
        [/\bpemb\./g, 'pembangunan '],
        [/\bpembang\./g, 'pembangunan '],
        [/\bpemeliharaan\b/g, 'pemeliharaan'],
        [/\bpemel\./g, 'pemeliharaan '],
        [/\bperaw\./g, 'perawatan '],
        [/\bpemer\./g, 'pemeriksaan '],
        [/\brehab\./g, 'rehabilitasi '],
        [/\bjl\./g, 'jalan '],
        [/\bjln\./g, 'jalan '],
        [/\bling\./g, 'lingkungan '],
        [/\bds\./g, 'desa '],
        [/\bkec\./g, 'kecamatan '],
        [/\bkel\./g, 'kelurahan '],
        [/\bkp\./g, 'kampung '],
        [/\brw\./g, 'rw '],
        [/\brt\./g, 'rt '],
        [/\bgg\./g, 'gang '],
        [/\bcv\./g, 'cv '],
        [/\bpt\./g, 'pt '],
        [/\bseb\./g, 'sebesar '],
        [/\bpk\./g, 'pekerjaan '],
        [/\bpek\./g, 'pekerjaan '],
    ]

    for (const [re, to] of replacements) {
        s = s.replace(re, to)
    }

    s = s
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    // Drop legal entity tokens for company compare (keep for display elsewhere)
    s = s
        .replace(/\b(cv|pt|ud|firma|tbk)\b/g, ' ')
        .replace(/\b(st|sst|s t|s\.t)\b/g, ' ')
        .replace(/\bhj\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    return s
}

export function tokenize(normalized: string): string[] {
    if (!normalized) return []
    return normalized
        .split(' ')
        .map((t) => t.trim())
        .filter((t) => t.length > 1)
}

/** Jaccard similarity on token sets (0..1). */
export function tokenJaccard(a: string, b: string): number {
    const ta = new Set(tokenize(a))
    const tb = new Set(tokenize(b))
    if (ta.size === 0 || tb.size === 0) return 0
    let inter = 0
    for (const t of ta) {
        if (tb.has(t)) inter += 1
    }
    const union = ta.size + tb.size - inter
    return union === 0 ? 0 : inter / union
}

/** Contiguity bonus when one string contains the other (normalized). */
export function containmentScore(a: string, b: string): number {
    if (!a || !b) return 0
    if (a === b) return 1
    if (a.includes(b) || b.includes(a)) {
        const shorter = Math.min(a.length, b.length)
        const longer = Math.max(a.length, b.length)
        return shorter / longer
    }
    return 0
}

/** Combined fuzzy score 0..1. */
export function fuzzyScore(query: string, candidate: string): number {
    const q = normalizeText(query)
    const c = normalizeText(candidate)
    if (!q || !c) return 0
    if (q === c) return 1

    const jaccard = tokenJaccard(q, c)
    const contain = containmentScore(q, c)
    // Prefer token overlap for long package names; containment helps short company names
    return Math.max(jaccard * 0.75 + contain * 0.25, contain * 0.9, jaccard)
}

export function splitPenerima(namaPenerima: string): { perusahaan: string; direktur: string } {
    const raw = String(namaPenerima || '').trim()
    if (!raw) return { perusahaan: '', direktur: '' }
    const parts = raw.split('/').map((p) => p.trim())
    if (parts.length === 1) {
        return { perusahaan: parts[0] ?? '', direktur: '' }
    }
    return {
        perusahaan: parts[0] ?? '',
        direktur: parts.slice(1).join(' / '),
    }
}

/**
 * Extract package fragment from SP2D keterangan.
 * Example: "(DAU) Biaya Pembayaran sebesar 95% Pek.Pembangunan Jalan ... Pada Sub Keg. ..."
 */
export function extractPaketHint(keterangan: string): string {
    const raw = String(keterangan || '').trim()
    if (!raw) return ''

    let body = raw.replace(/^\([^)]+\)\s*/, '')

    const pekMatch = body.match(
        /(?:Pek\.|Pekerjaan\s+|Pek\s+)(.+?)(?:\s+Pada\s+Sub\s+Keg\.?|\s+Pada\s+Sub\s+Kegiatan|$)/i,
    )
    if (pekMatch?.[1]) {
        return pekMatch[1].trim().replace(/[.,;]+$/, '')
    }

    // Fallback: strip payment boilerplate
    body = body
        .replace(/^Biaya\s+Pembayaran\s+(sebesar\s+[\d.,]+\s*%\s+|Pemeliharaan\s+seb\.?\s*[\d.,]+\s*%\s+)*/i, '')
        .replace(/^Pembayaran\s+/i, '')
        .trim()

    const cut = body.split(/\s+Pada\s+Sub\s+Keg/i)[0] ?? body
    return cut.trim().replace(/[.,;]+$/, '')
}

/**
 * Extract "Sub Keg." fragment from SP2D keterangan.
 * Example: "... Pada Sub Keg. Perbaikan Prasarana, Sarana, dan Utilitas Umum di Perumahan"
 */
export function extractSubKegiatanHint(keterangan: string): string {
    const raw = String(keterangan || '').trim()
    if (!raw) return ''

    const m =
        raw.match(/\bPada\s+Sub\s+Keg(?:iatan)?\.?\s*(.+)$/i) ||
        raw.match(/\bSub\s+Keg(?:iatan)?\.?\s*(.+)$/i)
    if (!m?.[1]) return ''

    return m[1]
        .trim()
        .replace(/[.,;]+$/, '')
        .replace(/\s+/g, ' ')
}

export function extractSumberDana(keterangan: string): string | null {
    const m = String(keterangan || '').match(/^\(([^)]+)\)/)
    return m?.[1]?.trim() || null
}

export function extractPersenPembayaran(keterangan: string): number | null {
    const s = String(keterangan || '')
    const m =
        s.match(/sebesar\s*([\d.,]+)\s*%/i) ||
        s.match(/seb\.?\s*([\d.,]+)\s*%/i) ||
        s.match(/([\d.,]+)\s*%/)
    if (!m?.[1]) return null
    const n = Number(String(m[1]).replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : null
}

/**
 * Kategori pembayaran SP2D:
 * - silpa_pemeliharaan: (SILPA) retensi/pemeliharaan ±5% TA sebelumnya
 * - uang_muka: pencairan UM ±30%
 * - termin: pembayaran termin TA berjalan (95%/100%/dll)
 * - lainnya: tidak terklasifikasi
 */
export type Sp2dPembayaranKategori =
    | 'silpa_pemeliharaan'
    | 'uang_muka'
    | 'termin'
    | 'lainnya'

export const SP2D_KATEGORI_LABEL: Record<Sp2dPembayaranKategori, string> = {
    silpa_pemeliharaan: 'SILPA · Pemeliharaan 5% (TA sebelumnya)',
    uang_muka: 'Pencairan Uang Muka (30%)',
    termin: 'Termin / realisasi TA berjalan',
    lainnya: 'Lainnya',
}

export const SP2D_KATEGORI_SHORT: Record<Sp2dPembayaranKategori, string> = {
    silpa_pemeliharaan: 'SILPA 5%',
    uang_muka: 'Uang Muka 30%',
    termin: 'Termin',
    lainnya: 'Lainnya',
}

export function classifyPembayaranKategori(
    sumberDana: string | null | undefined,
    persenPembayaran: number | null | undefined,
    keterangan: string,
): Sp2dPembayaranKategori {
    const ket = String(keterangan || '')
    const dana = String(sumberDana || '').toUpperCase()
    const persen = persenPembayaran

    // Uang muka: explicit phrase or ~30%
    if (/\buang\s*muka\b/i.test(ket) || persen === 30) {
        return 'uang_muka'
    }

    // SILPA = retensi/pemeliharaan TA sebelumnya (biasanya 5%)
    if (dana.includes('SILPA') || /\bsilpa\b/i.test(ket)) {
        return 'silpa_pemeliharaan'
    }
    if (persen === 5 && /pemeliharaan|retensi|pemel/i.test(ket)) {
        return 'silpa_pemeliharaan'
    }

    // Termin TA berjalan: 95%, 100%, atau sisa pembayaran biasa
    if (persen === 95 || persen === 100 || persen === 70 || persen === 65) {
        return 'termin'
    }
    if (/biaya\s+pembayaran/i.test(ket) && !/pemeliharaan/i.test(ket)) {
        return 'termin'
    }

    return 'lainnya'
}

const NON_PEKERJAAN_RE =
    /\b(gaji|tunjangan|pppk|pns|bendahara|honor|uang\s*makan|operasional\s*kantor|belanja\s*pegawai)\b/i

const NON_PENERIMA_RE = /^(terlampir|bendahara(\s+pengeluaran)?.*)$/i

export function isNonPekerjaanRow(namaPenerima: string, keterangan: string): boolean {
    if (NON_PENERIMA_RE.test(String(namaPenerima || '').trim())) return true
    if (NON_PEKERJAAN_RE.test(String(keterangan || ''))) return true
    // Must look like a construction payment
    if (!/pek\.|pekerjaan|pemb\.|pembangunan|rehab|mck|spam|rutilahu|jalan|tpt|sumur/i.test(keterangan)) {
        // If no package markers and looks administrative
        if (/pembayaran/i.test(keterangan) && !/biaya\s+pembayaran/i.test(keterangan)) {
            return true
        }
    }
    return false
}

export function parseIdrAmount(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (value == null || value === '') return 0
    const s = String(value).trim()
    // Indonesian thousand-dot: 189.041.145
    const cleaned = s.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : 0
}
