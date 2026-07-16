/**
 * Helpers for master-fase keywords (RAB auto-classify).
 */

export function parseKeywords(keywords: unknown): string[] {
    if (Array.isArray(keywords)) {
        return keywords
            .map((k) => String(k ?? '').trim())
            .filter((k) => k.length > 0)
    }
    if (typeof keywords === 'string') {
        const raw = keywords.trim()
        if (!raw) return []
        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
                return parsed.map((k) => String(k ?? '').trim()).filter(Boolean)
            }
        } catch {
            // comma-separated fallback
        }
        return raw
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean)
    }
    return []
}

export function normalizeKeywordText(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

export type KeywordHit = {
    keyword: string
    /** Longer keyword = more specific match */
    score: number
}

/** Find all keywords that hit sample text; sorted by score desc. */
export function findKeywordHits(sampleText: string, keywords: string[]): KeywordHit[] {
    const hay = normalizeKeywordText(sampleText)
    if (!hay) return []

    const hits: KeywordHit[] = []
    for (const keyword of keywords) {
        const needle = normalizeKeywordText(keyword)
        if (!needle) continue
        if (hay.includes(needle)) {
            hits.push({ keyword, score: needle.length })
        }
    }
    return hits.sort((a, b) => b.score - a.score)
}

export type FaseMatchPreview = {
    faseId: number
    kode_fase: string
    nama_fase: string
    bestKeyword: string
    score: number
}

/**
 * Preview which phase would win for a RAB line.
 * Prefers longer keyword hits among active phases ordered by prioritas.
 */
export function previewClassifyPhase(
    sampleText: string,
    fases: Array<{
        id: number
        kode_fase: string
        nama_fase: string
        prioritas: number
        is_active?: boolean
        keywords: unknown
    }>,
): FaseMatchPreview | null {
    const hay = normalizeKeywordText(sampleText)
    if (!hay) return null

    let best: FaseMatchPreview | null = null

    const active = fases
        .filter((f) => f.is_active !== false)
        .slice()
        .sort((a, b) => a.prioritas - b.prioritas)

    for (const fase of active) {
        const keywords = parseKeywords(fase.keywords)
        const hits = findKeywordHits(sampleText, keywords)
        if (hits.length === 0) continue
        const top = hits[0]
        const candidate: FaseMatchPreview = {
            faseId: fase.id,
            kode_fase: fase.kode_fase,
            nama_fase: fase.nama_fase,
            bestKeyword: top.keyword,
            score: top.score,
        }
        // Prefer longer keyword; tie-break lower prioritas (already sorted)
        if (!best || candidate.score > best.score) {
            best = candidate
        }
    }

    return best
}

export function keywordsFromChipInput(parts: string[]): string[] {
    const seen = new Set<string>()
    const out: string[] = []
    for (const part of parts) {
        const k = part.trim()
        if (!k) continue
        const key = normalizeKeywordText(k)
        if (seen.has(key)) continue
        seen.add(key)
        out.push(k)
    }
    return out
}
