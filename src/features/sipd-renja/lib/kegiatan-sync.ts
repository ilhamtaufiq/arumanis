import type { Kegiatan } from '@/features/kegiatan/types'
import type { SipdRenjaItem } from '@/features/sipd-renja/types'

/** Field yang di-review saat sync SIPD → Program Kegiatan */
export type KegiatanSyncFieldKey =
    | 'nama_program'
    | 'nama_kegiatan'
    | 'nama_sub_kegiatan'
    | 'pagu'

export const KEGIATAN_SYNC_FIELDS: Array<{
    key: KegiatanSyncFieldKey
    label: string
}> = [
    { key: 'nama_program', label: 'Nama program' },
    { key: 'nama_kegiatan', label: 'Nama kegiatan' },
    { key: 'nama_sub_kegiatan', label: 'Sub kegiatan' },
    { key: 'pagu', label: 'Total pagu' },
]

export type KegiatanSyncAction = 'create' | 'update' | 'unchanged'

export type FieldDiff = {
    key: KegiatanSyncFieldKey
    label: string
    sipd: string | number
    current: string | number | null
    changed: boolean
    /** User memilih apakah field ini ikut diterapkan (hanya relevan jika changed) */
    apply: boolean
}

export type KegiatanSyncRow = {
    id: string
    id_sub_bl: number
    kode_sub_giat: string | null
    tahun: string
    action: KegiatanSyncAction
    matchReason: 'sipd_id' | 'kode_sub_giat' | 'nama_sub' | 'none'
    kegiatanId: number | null
    sipd: {
        nama_program: string
        nama_kegiatan: string
        nama_sub_kegiatan: string
        pagu: number
        kode_sub_giat: string | null
        sub_bidang: string | null
    }
    fields: FieldDiff[]
    /** Baris ikut di-apply (create/update) */
    selected: boolean
}

export function normalizeSyncText(value: string | null | undefined): string {
    return (value || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

export function inferSubBidang(namaBidang?: string | null): string | null {
    const n = normalizeSyncText(namaBidang)
    if (!n) return null
    if (n.includes('air minum') || n.includes('spam')) return 'Air Minum'
    if (n.includes('sanitasi') || n.includes('air limbah') || n.includes('persampahan')) {
        return 'Sanitasi'
    }
    return null
}

export function sipdItemToProposed(item: SipdRenjaItem): KegiatanSyncRow['sipd'] {
    return {
        nama_program: (item.nama_program || '').trim(),
        nama_kegiatan: (item.nama_giat || '').trim(),
        nama_sub_kegiatan: (item.nama_sub_giat || '').trim(),
        pagu: Number(item.pagu) || 0,
        kode_sub_giat: item.kode_sub_giat?.trim() || null,
        sub_bidang: inferSubBidang(item.nama_bidang_urusan),
    }
}

function valuesEqual(
    key: KegiatanSyncFieldKey,
    a: string | number | null | undefined,
    b: string | number | null | undefined,
): boolean {
    if (key === 'pagu') {
        return Math.abs(Number(a || 0) - Number(b || 0)) < 0.005
    }
    return normalizeSyncText(String(a ?? '')) === normalizeSyncText(String(b ?? ''))
}

function fieldValue(
    key: KegiatanSyncFieldKey,
    source: {
        nama_program?: string | null
        nama_kegiatan?: string | null
        nama_sub_kegiatan?: string | null
        pagu?: number | null
    },
): string | number {
    if (key === 'pagu') return Number(source.pagu) || 0
    if (key === 'nama_program') return source.nama_program || ''
    if (key === 'nama_kegiatan') return source.nama_kegiatan || ''
    return source.nama_sub_kegiatan || ''
}

export function matchKegiatanForSipd(
    item: SipdRenjaItem,
    kegiatanList: Kegiatan[],
): { kegiatan: Kegiatan | null; reason: KegiatanSyncRow['matchReason'] } {
    const idSub = Number(item.id_sub_bl)
    if (Number.isFinite(idSub) && idSub > 0) {
        const byId = kegiatanList.find((k) => Number(k.sipd_id_sub_bl) === idSub)
        if (byId) return { kegiatan: byId, reason: 'sipd_id' }
    }

    const kode = (item.kode_sub_giat || '').trim()
    if (kode) {
        const byKode = kegiatanList.find((k) => {
            if ((k.kode_sub_giat || '').trim() === kode) return true
            const reks = Array.isArray(k.kode_rekening) ? k.kode_rekening : []
            return reks.some((r) => String(r).trim() === kode)
        })
        if (byKode) return { kegiatan: byKode, reason: 'kode_sub_giat' }
    }

    const subNorm = normalizeSyncText(item.nama_sub_giat)
    const tahun = String(item.tahun || '')
    if (subNorm) {
        const byName = kegiatanList.filter((k) => {
            const yearOk =
                !tahun ||
                String(k.tahun_anggaran || '').trim() === tahun ||
                String(k.tahun_anggaran || '').includes(tahun)
            return yearOk && normalizeSyncText(k.nama_sub_kegiatan) === subNorm
        })
        if (byName.length === 1) return { kegiatan: byName[0], reason: 'nama_sub' }
    }

    return { kegiatan: null, reason: 'none' }
}

export function buildKegiatanSyncRows(
    sipdItems: SipdRenjaItem[],
    kegiatanList: Kegiatan[],
    options?: { defaultSelectChanged?: boolean },
): KegiatanSyncRow[] {
    const defaultSelect = options?.defaultSelectChanged !== false
    const usedKegiatanIds = new Set<number>()

    return sipdItems.map((item) => {
        const proposed = sipdItemToProposed(item)
        const { kegiatan: matched, reason } = matchKegiatanForSipd(item, kegiatanList)
        // Hindari double-match ke baris yang sama
        const kegiatan =
            matched && !usedKegiatanIds.has(matched.id) ? matched : null
        if (kegiatan) usedKegiatanIds.add(kegiatan.id)

        const fields: FieldDiff[] = KEGIATAN_SYNC_FIELDS.map(({ key, label }) => {
            const sipdVal = fieldValue(key, proposed)
            const currentVal = kegiatan
                ? fieldValue(key, {
                      nama_program: kegiatan.nama_program,
                      nama_kegiatan: kegiatan.nama_kegiatan,
                      nama_sub_kegiatan: kegiatan.nama_sub_kegiatan,
                      pagu: kegiatan.pagu,
                  })
                : null
            const changed = !kegiatan || !valuesEqual(key, sipdVal, currentVal)
            return {
                key,
                label,
                sipd: sipdVal,
                current: currentVal,
                changed,
                apply: changed && defaultSelect,
            }
        })

        const hasChanges = !kegiatan || fields.some((f) => f.changed)
        const action: KegiatanSyncAction = !kegiatan
            ? 'create'
            : hasChanges
              ? 'update'
              : 'unchanged'

        return {
            id: `sipd-${item.id_sub_bl}`,
            id_sub_bl: item.id_sub_bl,
            kode_sub_giat: proposed.kode_sub_giat,
            tahun: String(item.tahun || ''),
            action,
            matchReason: kegiatan ? reason : 'none',
            kegiatanId: kegiatan?.id ?? null,
            sipd: proposed,
            fields,
            selected: action !== 'unchanged' && defaultSelect,
        }
    })
}

/** Payload create/update dari baris review (hanya field yang di-apply + link SIPD). */
export function buildApplyPayload(
    row: KegiatanSyncRow,
    options?: { defaultSumberDana?: string },
): Partial<Kegiatan> & {
    nama_program?: string
    nama_kegiatan?: string
    nama_sub_kegiatan?: string
    pagu?: number
} {
    const payload: Record<string, unknown> = {
        sipd_id_sub_bl: row.id_sub_bl,
        kode_sub_giat: row.kode_sub_giat,
        tahun_anggaran: row.tahun || undefined,
    }

    if (row.action === 'create') {
        payload.nama_program = row.sipd.nama_program
        payload.nama_kegiatan = row.sipd.nama_kegiatan
        payload.nama_sub_kegiatan = row.sipd.nama_sub_kegiatan
        payload.pagu = row.sipd.pagu
        payload.sub_bidang = row.sipd.sub_bidang
        payload.sumber_dana = options?.defaultSumberDana || 'APBD'
        payload.kode_rekening = row.kode_sub_giat ? [row.kode_sub_giat] : []
        return payload as Partial<Kegiatan>
    }

    for (const field of row.fields) {
        if (!field.apply || !field.changed) continue
        payload[field.key] = field.sipd
    }
    // Selalu tautkan id SIPD saat update dari review
    return payload as Partial<Kegiatan>
}

export function countSyncSummary(rows: KegiatanSyncRow[]) {
    return {
        total: rows.length,
        create: rows.filter((r) => r.action === 'create').length,
        update: rows.filter((r) => r.action === 'update').length,
        unchanged: rows.filter((r) => r.action === 'unchanged').length,
        selected: rows.filter((r) => r.selected).length,
    }
}
