import type {
    Sp2dMatchRef,
    Sp2dMatchStatus,
    Sp2dMatchSummary,
    Sp2dMatchedRow,
    Sp2dPekerjaanCatalog,
    Sp2dPenyediaCatalog,
    Sp2dRow,
} from '../types'
import { containmentScore, normalizeText, tokenJaccard, tokenize } from './normalize'

const PENYEDIA_MIN = 0.45
const PAKET_MIN = 0.38
const TOP_N = 5

type IndexedPenyedia = Sp2dPenyediaCatalog & {
    normNama: string
    normDirektur: string
    tokensNama: Set<string>
}

type IndexedPekerjaan = Sp2dPekerjaanCatalog & {
    normPaket: string
    tokensPaket: Set<string>
}

/** Score using pre-normalized strings (avoids re-normalize on every catalog item). */
function scoreNormalized(queryNorm: string, candidateNorm: string, candidateTokens: Set<string>): number {
    if (!queryNorm || !candidateNorm) return 0
    if (queryNorm === candidateNorm) return 1

    const qTokens = tokenize(queryNorm)
    if (qTokens.length === 0) return 0

    let inter = 0
    for (const t of qTokens) {
        if (candidateTokens.has(t)) inter += 1
    }
    const union = qTokens.length + candidateTokens.size - inter
    const jaccard = union === 0 ? 0 : inter / union
    const contain = containmentScore(queryNorm, candidateNorm)
    return Math.max(jaccard * 0.75 + contain * 0.25, contain * 0.9, jaccard)
}

function scorePenyediaIndexed(
    rowNormPerusahaan: string,
    rowNormDirektur: string,
    p: IndexedPenyedia,
): number {
    const byNama = scoreNormalized(rowNormPerusahaan, p.normNama, p.tokensNama)
    if (!rowNormDirektur || !p.normDirektur) return byNama
    const byDirektur = tokenJaccard(rowNormDirektur, p.normDirektur)
    return Math.max(byNama, byNama * 0.85 + byDirektur * 0.15)
}

/** Keep only top-N above min without sorting full list (O(n) insert). */
function topNMatches<T>(
    items: T[],
    scoreOf: (item: T) => number,
    toRef: (item: T, score: number) => Sp2dMatchRef,
    minScore: number,
    limit = TOP_N,
): Sp2dMatchRef[] {
    const best: Array<{ item: T; score: number }> = []

    for (const item of items) {
        const score = scoreOf(item)
        if (score < minScore) continue

        if (best.length < limit) {
            best.push({ item, score })
            best.sort((a, b) => b.score - a.score)
            continue
        }

        const worst = best[best.length - 1]!
        if (score <= worst.score) continue
        best[best.length - 1] = { item, score }
        best.sort((a, b) => b.score - a.score)
    }

    return best.map((x) => toRef(x.item, Number(x.score.toFixed(3))))
}

/** Full match only when pair is linked by kontrak. */
function resolveStatus(
    row: Sp2dRow,
    penyedia: Sp2dMatchRef | null,
    pekerjaan: Sp2dMatchRef | null,
    kontrakId: number | null,
): Sp2dMatchStatus {
    if (row.isNonPekerjaan) return 'skipped'
    if (penyedia && pekerjaan && kontrakId != null) return 'matched'
    if (penyedia || pekerjaan) return 'partial'
    return 'unmatched'
}

function findKontrakForPair(
    pk: Sp2dPekerjaanCatalog | IndexedPekerjaan | undefined,
    penyediaId: number | null | undefined,
) {
    if (!pk || !penyediaId) return null
    return pk.kontrak.find((k) => k.penyedia_id === penyediaId) ?? null
}

function pairIsOnKontrak(
    pk: Sp2dPekerjaanCatalog | IndexedPekerjaan | undefined,
    penyediaId: number | null | undefined,
): boolean {
    return findKontrakForPair(pk, penyediaId) != null
}

function indexPenyedia(catalog: Sp2dPenyediaCatalog[]): IndexedPenyedia[] {
    return catalog.map((p) => {
        const normNama = normalizeText(p.nama)
        return {
            ...p,
            normNama,
            normDirektur: normalizeText(p.direktur),
            tokensNama: new Set(tokenize(normNama)),
        }
    })
}

function indexPekerjaan(catalog: Sp2dPekerjaanCatalog[]): IndexedPekerjaan[] {
    return catalog.map((p) => {
        const normPaket = normalizeText(p.nama_paket)
        return {
            ...p,
            normPaket,
            tokensPaket: new Set(tokenize(normPaket)),
        }
    })
}

type KontrakPairCandidate = {
    pekerjaan: IndexedPekerjaan
    penyedia: IndexedPenyedia
    kontrakId: number
    nilaiKontrak: number | null
    paketScore: number
    penyediaScore: number
    /** Combined score for ranking */
    pairScore: number
}

/**
 * Find all pekerjaan IDs that share the same kontrak(s) as the matched pekerjaan.
 * Returns all IDs including the matched one — used for konsolidasi multi-paket.
 */
function findKonsolidasiPekerjaanIds(
    matchedPekerjaanId: number,
    kontrakIds: number[],
    pekerjaanIndexed: IndexedPekerjaan[],
): number[] {
    if (kontrakIds.length === 0) return [matchedPekerjaanId]
    const kontrakSet = new Set(kontrakIds)
    const ids = new Set<number>()
    for (const pk of pekerjaanIndexed) {
        for (const k of pk.kontrak) {
            if (kontrakSet.has(k.id)) {
                ids.add(pk.id)
                break
            }
        }
    }
    return ids.has(matchedPekerjaanId)
        ? Array.from(ids)
        : [matchedPekerjaanId]
}

/**
 * Match one SP2D row.
 * Full match requires pekerjaan + penyedia that appear together on kontrak.
 */
function matchOneRow(
    row: Sp2dRow,
    penyediaIndexed: IndexedPenyedia[],
    pekerjaanIndexed: IndexedPekerjaan[],
    penyediaById: Map<number, IndexedPenyedia>,
    pekerjaanById: Map<number, IndexedPekerjaan>,
    matchedSubKegiatan: Sp2dMatchRef | null = null,
): Sp2dMatchedRow {
    if (row.isNonPekerjaan) {
        return {
            ...row,
            status: 'skipped',
            matchedSubKegiatan: null,
            matchedPenyedia: null,
            matchedPekerjaan: null,
            matchedKontrakId: null,
            nilaiKontrak: null,
            realisasiTerhadapKontrak: null,
            candidatesPenyedia: [],
            candidatesPekerjaan: [],
        }
    }

    const rowNormPerusahaan = normalizeText(row.penyediaHint || row.namaPenerima)
    const rowNormDirektur = normalizeText(row.direkturHint)
    const rowNormPaket = normalizeText(row.paketHint || row.keterangan)

    // Scope package search to the matched sub-kegiatan when available
    const pekerjaanScope =
        matchedSubKegiatan != null
            ? pekerjaanIndexed.filter((pk) => pk.kegiatan_id === matchedSubKegiatan.id)
            : pekerjaanIndexed
    const pekerjaanPool = pekerjaanScope.length > 0 ? pekerjaanScope : pekerjaanIndexed

    // Build candidates only from kontrak pairs (pekerjaan ↔ penyedia)
    const pairCandidates: KontrakPairCandidate[] = []
    for (const pk of pekerjaanPool) {
        if (!pk.kontrak.length) continue
        const paketScore = scoreNormalized(rowNormPaket, pk.normPaket, pk.tokensPaket)
        if (paketScore < PAKET_MIN * 0.85) continue // slightly softer prefilter; final needs both mins

        for (const k of pk.kontrak) {
            if (!k.penyedia_id) continue
            const peny = penyediaById.get(k.penyedia_id)
            if (!peny) continue
            const penyediaScore = scorePenyediaIndexed(rowNormPerusahaan, rowNormDirektur, peny)
            if (penyediaScore < PENYEDIA_MIN * 0.85) continue

            // Require both above thresholds for a valid pair, or strong combined
            const bothOk = paketScore >= PAKET_MIN && penyediaScore >= PENYEDIA_MIN
            const strongCombined = paketScore * 0.55 + penyediaScore * 0.45 >= 0.5
            if (!bothOk && !strongCombined) continue

            const pairScore = paketScore * 0.5 + penyediaScore * 0.5
            pairCandidates.push({
                pekerjaan: pk,
                penyedia: peny,
                kontrakId: k.id,
                nilaiKontrak: k.nilai_kontrak,
                paketScore,
                penyediaScore,
                pairScore,
            })
        }
    }

    pairCandidates.sort((a, b) => b.pairScore - a.pairScore)

    const bestPair = pairCandidates[0] ?? null

    let matchedPenyedia: Sp2dMatchRef | null = null
    let matchedPekerjaan: Sp2dMatchRef | null = null
    let matchedKontrakId: number | null = null
    let nilaiKontrak: number | null = null

    if (bestPair) {
        matchedPenyedia = {
            id: bestPair.penyedia.id,
            label: bestPair.penyedia.nama,
            score: Number(bestPair.penyediaScore.toFixed(3)),
        }
        matchedPekerjaan = {
            id: bestPair.pekerjaan.id,
            label: bestPair.pekerjaan.nama_paket,
            score: Number(bestPair.paketScore.toFixed(3)),
        }
        matchedKontrakId = bestPair.kontrakId
        nilaiKontrak = bestPair.nilaiKontrak
    } else {
        // Fallback partial: best package name OR best penyedia name alone (no kontrak pair)
        const candidatesPekerjaanOnly = topNMatches(
            pekerjaanPool,
            (pk) => scoreNormalized(rowNormPaket, pk.normPaket, pk.tokensPaket),
            (pk, score) => ({ id: pk.id, label: pk.nama_paket, score }),
            PAKET_MIN,
        )
        const candidatesPenyediaOnly = topNMatches(
            penyediaIndexed,
            (p) => scorePenyediaIndexed(rowNormPerusahaan, rowNormDirektur, p),
            (p, score) => ({ id: p.id, label: p.nama, score }),
            PENYEDIA_MIN,
        )
        matchedPekerjaan = candidatesPekerjaanOnly[0] ?? null
        matchedPenyedia = candidatesPenyediaOnly[0] ?? null

        // If both exist but not on same kontrak → clear kontrak, keep partial
        if (matchedPekerjaan && matchedPenyedia) {
            const pk = pekerjaanById.get(matchedPekerjaan.id)
            const kontrak = findKontrakForPair(pk, matchedPenyedia.id)
            if (kontrak) {
                matchedKontrakId = kontrak.id
                nilaiKontrak = kontrak.nilai_kontrak
            } else {
                // Prefer package + its kontrak penyedia if package is stronger
                if (
                    matchedPekerjaan.score >= (matchedPenyedia.score ?? 0) &&
                    pk &&
                    pk.penyediaIds.length === 1
                ) {
                    const only = penyediaById.get(pk.penyediaIds[0]!)
                    const k0 = pk.kontrak[0]
                    if (only && k0) {
                        const s = scorePenyediaIndexed(rowNormPerusahaan, rowNormDirektur, only)
                        if (s >= 0.3) {
                            matchedPenyedia = {
                                id: only.id,
                                label: only.nama,
                                score: Number(s.toFixed(3)),
                            }
                            matchedKontrakId = k0.id
                            nilaiKontrak = k0.nilai_kontrak
                        } else {
                            // Keep both as hints but no kontrak = partial
                            matchedKontrakId = null
                            nilaiKontrak = null
                        }
                    }
                } else {
                    matchedKontrakId = null
                    nilaiKontrak = null
                }
            }
        } else if (matchedPekerjaan) {
            const pk = pekerjaanById.get(matchedPekerjaan.id)
            // Single-penyedia kontrak: auto-fill penyedia from kontrak if name is close enough
            if (pk && pk.penyediaIds.length === 1) {
                const only = penyediaById.get(pk.penyediaIds[0]!)
                const k0 = pk.kontrak.find((k) => k.penyedia_id === pk.penyediaIds[0]) ?? pk.kontrak[0]
                if (only && k0) {
                    const s = scorePenyediaIndexed(rowNormPerusahaan, rowNormDirektur, only)
                    if (s >= PENYEDIA_MIN) {
                        matchedPenyedia = {
                            id: only.id,
                            label: only.nama,
                            score: Number(s.toFixed(3)),
                        }
                        matchedKontrakId = k0.id
                        nilaiKontrak = k0.nilai_kontrak
                    }
                }
            }
        }
    }

    // Candidate lists: prefer kontrak-consistent pairs for override UI
    const candidatesPekerjaan: Sp2dMatchRef[] = []
    const candidatesPenyedia: Sp2dMatchRef[] = []
    const seenPk = new Set<number>()
    const seenPeny = new Set<number>()
    for (const pair of pairCandidates.slice(0, TOP_N * 2)) {
        if (!seenPk.has(pair.pekerjaan.id)) {
            seenPk.add(pair.pekerjaan.id)
            candidatesPekerjaan.push({
                id: pair.pekerjaan.id,
                label: pair.pekerjaan.nama_paket,
                score: Number(pair.paketScore.toFixed(3)),
            })
        }
        if (!seenPeny.has(pair.penyedia.id)) {
            seenPeny.add(pair.penyedia.id)
            candidatesPenyedia.push({
                id: pair.penyedia.id,
                label: pair.penyedia.nama,
                score: Number(pair.penyediaScore.toFixed(3)),
            })
        }
        if (candidatesPekerjaan.length >= TOP_N && candidatesPenyedia.length >= TOP_N) break
    }
    // Ensure current matches appear in candidates
    if (matchedPekerjaan && !seenPk.has(matchedPekerjaan.id)) {
        candidatesPekerjaan.unshift(matchedPekerjaan)
    }
    if (matchedPenyedia && !seenPeny.has(matchedPenyedia.id)) {
        candidatesPenyedia.unshift(matchedPenyedia)
    }

    const realisasiTerhadapKontrak =
        nilaiKontrak && nilaiKontrak > 0
            ? Number(((row.bruto / nilaiKontrak) * 100).toFixed(2))
            : null

    const konsolidasiIds = matchedKontrakId
        ? findKonsolidasiPekerjaanIds(
              matchedPekerjaan!.id,
              matchedPekerjaan && pekerjaanById.get(matchedPekerjaan.id)
                  ? pekerjaanById.get(matchedPekerjaan.id)!.kontrak.map(k => k.id)
                  : [],
              pekerjaanIndexed,
          )
        : [matchedPekerjaan!.id]

    return {
        ...row,
        status: resolveStatus(row, matchedPenyedia, matchedPekerjaan, matchedKontrakId),
        matchedSubKegiatan,
        matchedPenyedia,
        matchedPekerjaan,
        matchedKontrakId,
        nilaiKontrak,
        realisasiTerhadapKontrak,
        candidatesPenyedia: candidatesPenyedia.slice(0, TOP_N),
        candidatesPekerjaan: candidatesPekerjaan.slice(0, TOP_N),
        konsolidasiPekerjaanIds: konsolidasiIds,
    }
}

export type MatchSp2dOptions = {
    /** Pre-matched sub kegiatan per row identity (file::index::nomor) */
    subKegiatanByKey?: Map<string, Sp2dMatchRef>
    rowKeyOf?: (row: Sp2dRow) => string
    chunkSize?: number
    onProgress?: (done: number, total: number) => void
}

function defaultRowKey(row: Sp2dRow) {
    return `${row.fileName}::${row.index}::${row.nomorSp2d}`
}

/**
 * Match SP2D rows against master penyedia + pekerjaan.
 * Catalog is normalized once; per-row scoring uses precomputed tokens.
 */
export function matchSp2dRows(
    rows: Sp2dRow[],
    penyediaCatalog: Sp2dPenyediaCatalog[],
    pekerjaanCatalog: Sp2dPekerjaanCatalog[],
    options?: Pick<MatchSp2dOptions, 'subKegiatanByKey' | 'rowKeyOf'>,
): Sp2dMatchedRow[] {
    const penyediaIndexed = indexPenyedia(penyediaCatalog)
    const pekerjaanIndexed = indexPekerjaan(pekerjaanCatalog)
    const penyediaById = new Map(penyediaIndexed.map((p) => [p.id, p]))
    const pekerjaanById = new Map(pekerjaanIndexed.map((p) => [p.id, p]))
    const keyOf = options?.rowKeyOf ?? defaultRowKey

    return rows.map((row) =>
        matchOneRow(
            row,
            penyediaIndexed,
            pekerjaanIndexed,
            penyediaById,
            pekerjaanById,
            options?.subKegiatanByKey?.get(keyOf(row)) ?? null,
        ),
    )
}

/** Async chunked match so UI stays responsive on large files. */
export async function matchSp2dRowsChunked(
    rows: Sp2dRow[],
    penyediaCatalog: Sp2dPenyediaCatalog[],
    pekerjaanCatalog: Sp2dPekerjaanCatalog[],
    options?: MatchSp2dOptions,
): Promise<Sp2dMatchedRow[]> {
    const chunkSize = options?.chunkSize ?? 40
    const penyediaIndexed = indexPenyedia(penyediaCatalog)
    const pekerjaanIndexed = indexPekerjaan(pekerjaanCatalog)
    const penyediaById = new Map(penyediaIndexed.map((p) => [p.id, p]))
    const pekerjaanById = new Map(pekerjaanIndexed.map((p) => [p.id, p]))
    const keyOf = options?.rowKeyOf ?? defaultRowKey

    const out: Sp2dMatchedRow[] = new Array(rows.length)
    const total = rows.length

    for (let i = 0; i < total; i += chunkSize) {
        const end = Math.min(i + chunkSize, total)
        for (let j = i; j < end; j++) {
            const row = rows[j]!
            out[j] = matchOneRow(
                row,
                penyediaIndexed,
                pekerjaanIndexed,
                penyediaById,
                pekerjaanById,
                options?.subKegiatanByKey?.get(keyOf(row)) ?? null,
            )
        }
        options?.onProgress?.(end, total)
        if (end < total) {
            await new Promise<void>((resolve) => {
                if (typeof requestAnimationFrame === 'function') {
                    requestAnimationFrame(() => resolve())
                } else {
                    setTimeout(resolve, 0)
                }
            })
        }
    }

    return out
}

export function summarizeMatches(rows: Sp2dMatchedRow[]): Sp2dMatchSummary {
    const summary: Sp2dMatchSummary = {
        total: rows.length,
        matched: 0,
        partial: 0,
        unmatched: 0,
        skipped: 0,
        totalBruto: 0,
        totalNeto: 0,
        matchedBruto: 0,
    }

    for (const row of rows) {
        summary.totalBruto += row.bruto
        summary.totalNeto += row.neto
        if (row.status === 'matched') {
            summary.matched += 1
            summary.matchedBruto += row.bruto
        } else if (row.status === 'partial') summary.partial += 1
        else if (row.status === 'unmatched') summary.unmatched += 1
        else if (row.status === 'skipped') summary.skipped += 1
    }

    return summary
}

import type { Sp2dPembayaranKategori } from './normalize'
import { SP2D_KATEGORI_SHORT } from './normalize'

export type Sp2dPaketAggregate = {
    /** Composite key pekerjaanId + kategori for unique rows */
    key: string
    pekerjaanId: number
    /** Pekerjaan lain yang share kontrak yang sama (konsolidasi) */
    konsolidasiPekerjaanIds: number[]
    kategori: Sp2dPembayaranKategori
    kategoriLabel: string
    namaPaket: string
    penyediaLabel: string | null
    subKegiatanLabel: string | null
    totalBruto: number
    totalNeto: number
    count: number
    /** Rows that have both penyedia + pekerjaan */
    fullMatchCount: number
    nilaiKontrak: number | null
    sp2dPercentOfKontrak: number | null
    /**
     * SILPA retensi biasanya tidak digabung ke progress TA berjalan.
     * Uang muka + termin boleh diterapkan ke progress pencairan.
     */
    canApply: boolean
}

/** Persen yang masuk rekap / apply pencairan TA (bukan SILPA 5%). */
export const REKAP_PERSEN_ALLOWED = [30, 65, 95, 100] as const
export type RekapPersen = (typeof REKAP_PERSEN_ALLOWED)[number]

export function isRekapPencairanRow(
    row: Pick<Sp2dMatchedRow, 'persenPembayaran' | 'kategori'>,
): boolean {
    const p = row.persenPembayaran
    if (p != null && (REKAP_PERSEN_ALLOWED as readonly number[]).includes(p)) return true
    // Fallback: kata "uang muka" tanpa parse persen
    if (row.kategori === 'uang_muka') return true
    return false
}

function resolveRekapPersen(
    row: Pick<Sp2dMatchedRow, 'persenPembayaran' | 'kategori'>,
): RekapPersen {
    const p = row.persenPembayaran
    if (p === 30 || p === 65 || p === 95 || p === 100) return p
    if (row.kategori === 'uang_muka') return 30
    return 95
}

function rekapLabel(persen: RekapPersen): string {
    if (persen === 30) return 'UM 30%'
    return `Termin ${persen}%`
}

function rekapKategoriFromPersen(persen: RekapPersen): Sp2dPembayaranKategori {
    return persen === 30 ? 'uang_muka' : 'termin'
}

/**
 * Aggregate SP2D per (pekerjaan × persen) — **hanya 30%, 65%, 95%, 100%**.
 * SILPA 5% dan persen lain tidak ditampilkan di rekap ter-match.
 */
export function aggregateByPekerjaan(rows: Sp2dMatchedRow[]): Sp2dPaketAggregate[] {
    const map = new Map<
        string,
        {
            key: string
            pekerjaanId: number
            konsolidasiPekerjaanIds: number[]
            kategori: Sp2dPembayaranKategori
            persen: RekapPersen
            namaPaket: string
            penyediaLabel: string | null
            subKegiatanLabel: string | null
            totalBruto: number
            totalNeto: number
            count: number
            fullMatchCount: number
            nilaiKontrak: number | null
        }
    >()

    for (const row of rows) {
        if (!row.matchedPekerjaan) continue
        if (!isRekapPencairanRow(row)) continue

        const pekerjaanId = row.matchedPekerjaan.id
        const persen = resolveRekapPersen(row)
        const kategori = rekapKategoriFromPersen(persen)
        // Key per persen agar 65% / 95% / 100% tidak tercampur
        const key = `${pekerjaanId}::${persen}`
        const isFull = Boolean(row.matchedPenyedia && row.matchedPekerjaan)
        const existing = map.get(key)
        if (existing) {
            existing.totalBruto += row.bruto
            existing.totalNeto += row.neto
            existing.count += 1
            if (isFull) existing.fullMatchCount += 1
            if (existing.nilaiKontrak == null && row.nilaiKontrak != null) {
                existing.nilaiKontrak = row.nilaiKontrak
            }
            if (!existing.penyediaLabel && row.matchedPenyedia) {
                existing.penyediaLabel = row.matchedPenyedia.label
            }
            if (!existing.subKegiatanLabel && row.matchedSubKegiatan) {
                existing.subKegiatanLabel = row.matchedSubKegiatan.label
            }
        } else {
            map.set(key, {
                key,
                pekerjaanId,
                konsolidasiPekerjaanIds: row.konsolidasiPekerjaanIds,
                kategori,
                persen,
                namaPaket: row.matchedPekerjaan.label,
                penyediaLabel: row.matchedPenyedia?.label ?? null,
                subKegiatanLabel: row.matchedSubKegiatan?.label ?? null,
                totalBruto: row.bruto,
                totalNeto: row.neto,
                count: 1,
                fullMatchCount: isFull ? 1 : 0,
                nilaiKontrak: row.nilaiKontrak,
            })
        }
    }

    const orderPersen: Record<RekapPersen, number> = { 30: 0, 65: 1, 95: 2, 100: 3 }

    return Array.from(map.values())
        .map((item) => {
            const sp2dPercentOfKontrak =
                item.nilaiKontrak && item.nilaiKontrak > 0
                    ? Number(((item.totalBruto / item.nilaiKontrak) * 100).toFixed(2))
                    : null
            const canApply = item.nilaiKontrak != null && item.nilaiKontrak > 0
            return {
                key: item.key,
                pekerjaanId: item.pekerjaanId,
                konsolidasiPekerjaanIds: item.konsolidasiPekerjaanIds,
                kategori: item.kategori,
                kategoriLabel: rekapLabel(item.persen),
                namaPaket: item.namaPaket,
                penyediaLabel: item.penyediaLabel,
                subKegiatanLabel: item.subKegiatanLabel,
                totalBruto: item.totalBruto,
                totalNeto: item.totalNeto,
                count: item.count,
                fullMatchCount: item.fullMatchCount,
                nilaiKontrak: item.nilaiKontrak,
                sp2dPercentOfKontrak,
                canApply,
            }
        })
        .sort((a, b) => {
            // Parse persen from key suffix for stable order
            const pa = Number(a.key.split('::')[1] ?? 0) as RekapPersen
            const pb = Number(b.key.split('::')[1] ?? 0) as RekapPersen
            const od = (orderPersen[pa] ?? 9) - (orderPersen[pb] ?? 9)
            if (od !== 0) return od
            return b.totalBruto - a.totalBruto
        })
}

export function summarizeByKategori(rows: Sp2dMatchedRow[]) {
    const base: Record<Sp2dPembayaranKategori, { count: number; bruto: number }> = {
        silpa_pemeliharaan: { count: 0, bruto: 0 },
        uang_muka: { count: 0, bruto: 0 },
        termin: { count: 0, bruto: 0 },
        lainnya: { count: 0, bruto: 0 },
    }
    for (const row of rows) {
        if (row.isNonPekerjaan) continue
        const bucket = base[row.kategori]
        bucket.count += 1
        bucket.bruto += row.bruto
    }
    return base
}

/**
 * Manual override penyedia — kontrak only accepted if pair exists on pekerjaan.
 * If pair not on kontrak, status becomes partial (matchedKontrakId null).
 */
export function applyManualPenyedia(
    row: Sp2dMatchedRow,
    penyedia: Sp2dMatchRef | null,
    pekerjaanCatalog: Sp2dPekerjaanCatalog[],
): Sp2dMatchedRow {
    let matchedKontrakId: number | null = null
    let nilaiKontrak: number | null = null

    if (row.matchedPekerjaan && penyedia) {
        const pk = pekerjaanCatalog.find((p) => p.id === row.matchedPekerjaan!.id)
        const kontrak = findKontrakForPair(pk, penyedia.id)
        if (kontrak) {
            matchedKontrakId = kontrak.id
            nilaiKontrak = kontrak.nilai_kontrak
        }
        // If not on kontrak: keep selection but no kontrak link (partial)
    }

    const next: Sp2dMatchedRow = {
        ...row,
        matchedPenyedia: penyedia,
        matchedKontrakId,
        nilaiKontrak,
        realisasiTerhadapKontrak:
            nilaiKontrak && nilaiKontrak > 0
                ? Number(((row.bruto / nilaiKontrak) * 100).toFixed(2))
                : null,
    }
    next.status = resolveStatus(next, next.matchedPenyedia, next.matchedPekerjaan, next.matchedKontrakId)
    return next
}

/**
 * Manual override pekerjaan — resolve kontrak with current penyedia if pair matches.
 * If current penyedia not on kontrak for this paket, try single-kontrak auto penyedia.
 */
export function applyManualPekerjaan(
    row: Sp2dMatchedRow,
    pekerjaan: Sp2dMatchRef | null,
    pekerjaanCatalog: Sp2dPekerjaanCatalog[],
): Sp2dMatchedRow {
    let matchedPenyedia = row.matchedPenyedia
    let matchedKontrakId: number | null = null
    let nilaiKontrak: number | null = null

    if (pekerjaan) {
        const pk = pekerjaanCatalog.find((p) => p.id === pekerjaan.id)
        if (pk) {
            // Prefer existing penyedia if on kontrak
            const kontrakExisting = findKontrakForPair(pk, matchedPenyedia?.id)
            if (kontrakExisting) {
                matchedKontrakId = kontrakExisting.id
                nilaiKontrak = kontrakExisting.nilai_kontrak
            } else if (pk.penyediaIds.length === 1 && pk.kontrak[0]) {
                // Auto-bind the only kontrak penyedia for this paket
                const onlyId = pk.penyediaIds[0]!
                const k0 = findKontrakForPair(pk, onlyId) ?? pk.kontrak[0]
                matchedPenyedia = {
                    id: onlyId,
                    label: k0.penyedia_nama || pk.kontrak[0].penyedia_nama || `Penyedia #${onlyId}`,
                    score: 1,
                }
                matchedKontrakId = k0.id
                nilaiKontrak = k0.nilai_kontrak
            } else {
                // Keep penyedia if set but clear kontrak (inconsistent pair)
                matchedKontrakId = null
                nilaiKontrak = null
            }
        }
    }

    const next: Sp2dMatchedRow = {
        ...row,
        matchedPekerjaan: pekerjaan,
        matchedPenyedia,
        matchedKontrakId,
        nilaiKontrak,
        realisasiTerhadapKontrak:
            nilaiKontrak && nilaiKontrak > 0
                ? Number(((row.bruto / nilaiKontrak) * 100).toFixed(2))
                : null,
    }
    next.status = resolveStatus(next, next.matchedPenyedia, next.matchedPekerjaan, next.matchedKontrakId)
    return next
}

/** Exported for tests: whether pair is valid on kontrak catalog. */
export function isPekerjaanPenyediaOnKontrak(
    pekerjaan: Sp2dPekerjaanCatalog | undefined,
    penyediaId: number | null | undefined,
): boolean {
    return pairIsOnKontrak(pekerjaan, penyediaId)
}
