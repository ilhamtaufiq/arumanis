import type {
    Sp2dKegiatanCatalog,
    Sp2dMatchRef,
    Sp2dRow,
    Sp2dSubKegiatanFilterResult,
} from '../types'
import { fuzzyScore, normalizeText } from './normalize'

const SUB_KEG_MIN = 0.42

type IndexedKegiatan = Sp2dKegiatanCatalog & {
    norm: string
}

function indexKegiatan(catalog: Sp2dKegiatanCatalog[]): IndexedKegiatan[] {
    return catalog.map((k) => ({
        ...k,
        norm: normalizeText(k.nama_sub_kegiatan),
    }))
}

/** Best match of SP2D Sub Keg. text against master nama_sub_kegiatan. */
export function matchSubKegiatan(
    subKegiatanHint: string,
    catalog: Sp2dKegiatanCatalog[],
): Sp2dMatchRef | null {
    const hint = subKegiatanHint.trim()
    if (!hint || catalog.length === 0) return null

    const hintNorm = normalizeText(hint)
    if (!hintNorm) return null

    let best: Sp2dMatchRef | null = null
    for (const item of catalog) {
        const score = fuzzyScore(hintNorm, item.nama_sub_kegiatan)
        if (score < SUB_KEG_MIN) continue
        if (!best || score > best.score) {
            best = {
                id: item.id,
                label: item.nama_sub_kegiatan,
                score: Number(score.toFixed(3)),
            }
        }
    }
    return best
}

/**
 * Keep only rows whose "Sub Keg." matches master kegiatan (TA aktif).
 * Non-pekerjaan / gaji rows without Sub Keg. are dropped (not in scope).
 */
export function filterRowsBySubKegiatan(
    rows: Sp2dRow[],
    kegiatanCatalog: Sp2dKegiatanCatalog[],
): Sp2dSubKegiatanFilterResult & {
    /** rowKey / index -> matched sub kegiatan for kept rows */
    subKegiatanByRowIndex: Map<number, Sp2dMatchRef>
} {
    const indexed = indexKegiatan(kegiatanCatalog)
    // Reuse fuzzy via original labels
    const catalog = indexed.map(({ id, nama_sub_kegiatan, nama_kegiatan, tahun_anggaran }) => ({
        id,
        nama_sub_kegiatan,
        nama_kegiatan,
        tahun_anggaran,
    }))

    const kept: Sp2dRow[] = []
    const subKegiatanByRowIndex = new Map<number, Sp2dMatchRef>()
    const matchedLabels = new Set<string>()
    let noSubKegCount = 0
    let unmatchedSubKegCount = 0

    // Cache hint -> match for repeated Sub Keg strings
    const cache = new Map<string, Sp2dMatchRef | null>()

    for (const row of rows) {
        if (row.isNonPekerjaan) {
            // Still drop; out of scope for realisasi paket
            continue
        }

        const hint = row.subKegiatanHint?.trim() || ''
        if (!hint) {
            noSubKegCount += 1
            continue
        }

        let match = cache.get(hint)
        if (match === undefined) {
            match = matchSubKegiatan(hint, catalog)
            cache.set(hint, match)
        }

        if (!match) {
            unmatchedSubKegCount += 1
            continue
        }

        kept.push(row)
        subKegiatanByRowIndex.set(row.index, match)
        // Use file+index uniqueness for multi-file later if needed; index alone ok per file merge with fileName in row
        matchedLabels.add(match.label)
    }

    // Multi-file: index may collide — also key by fileName+index in caller if needed.
    // Rebuild map with composite when matching multi-file: for now use sequential unique via kept array position in match step.

    return {
        kept,
        droppedCount: rows.length - kept.length,
        unmatchedSubKegCount,
        noSubKegCount,
        matchedSubKegiatanLabels: Array.from(matchedLabels).sort(),
        subKegiatanByRowIndex,
    }
}

/** Stable key for multi-file rows. */
export function sp2dRowIdentity(row: Pick<Sp2dRow, 'fileName' | 'index' | 'nomorSp2d'>) {
    return `${row.fileName}::${row.index}::${row.nomorSp2d}`
}

/**
 * Filter using composite identity (safe for multi-file).
 */
export function filterRowsBySubKegiatanMulti(
    rows: Sp2dRow[],
    kegiatanCatalog: Sp2dKegiatanCatalog[],
): Sp2dSubKegiatanFilterResult & {
    subKegiatanByKey: Map<string, Sp2dMatchRef>
    kegiatanIds: number[]
} {
    const catalog = kegiatanCatalog
    const kept: Sp2dRow[] = []
    const subKegiatanByKey = new Map<string, Sp2dMatchRef>()
    const matchedLabels = new Set<string>()
    const kegiatanIds = new Set<number>()
    let noSubKegCount = 0
    let unmatchedSubKegCount = 0
    const cache = new Map<string, Sp2dMatchRef | null>()

    for (const row of rows) {
        if (row.isNonPekerjaan) continue

        const hint = row.subKegiatanHint?.trim() || ''
        if (!hint) {
            noSubKegCount += 1
            continue
        }

        let match = cache.get(hint)
        if (match === undefined) {
            match = matchSubKegiatan(hint, catalog)
            cache.set(hint, match)
        }

        if (!match) {
            unmatchedSubKegCount += 1
            continue
        }

        kept.push(row)
        subKegiatanByKey.set(sp2dRowIdentity(row), match)
        matchedLabels.add(match.label)
        kegiatanIds.add(match.id)
    }

    return {
        kept,
        droppedCount: rows.length - kept.length,
        unmatchedSubKegCount,
        noSubKegCount,
        matchedSubKegiatanLabels: Array.from(matchedLabels).sort(),
        subKegiatanByKey,
        kegiatanIds: Array.from(kegiatanIds),
    }
}
