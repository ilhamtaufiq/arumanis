import type { Kontrak } from '@/features/kontrak/types'
import type { Tag } from '@/features/pekerjaan/types'

export type RekapPekerjaanItem = {
    id: number
    nama_paket: string
    pagu?: number
    status?: string | null
    progress_estimasi_fisik?: number | null
    progress_estimasi_keuangan?: number | null
    kecamatan?: { nama_kecamatan?: string }
    desa?: { nama_desa?: string }
    kegiatan?: { nama_sub_kegiatan?: string }
    /** Loaded when paginated (not unbounded). Used for konsolidasi grouping. */
    kontrak?: Kontrak[]
    tags?: Tag[]
    /** Jumlah baris rincian SIPD (Status Arumanis) yang menautkan pekerjaan ini. */
    sipd_links_count?: number
}

export type RekapSortField = 'nama_paket' | 'progress_estimasi_fisik' | 'progress_estimasi_keuangan' | 'pagu' | 'nilai_kontrak'
export type RekapSortDir = 'asc' | 'desc'

export type RekapSortState = {
    field: RekapSortField | null
    dir: RekapSortDir
}

/** Show all grouped rows (single + consolidated), single only, or consolidated only. */
export type KonsolidasiMode = 'all' | 'single' | 'consolidated'

export const isCanceledRekapItem = (item: RekapPekerjaanItem) => item.status === 'canceled'

/** Group pekerjaan by kontrak IDs: pekerjaan dengan kontrak sama = konsolidasi. */
export function groupByKonsolidasi(list: RekapPekerjaanItem[]): RekapPekerjaanItem[][] {
    const kontrakToPekerjaan = new Map<string, RekapPekerjaanItem[]>()
    const processed = new Set<number>()

    for (const item of list) {
        if (processed.has(item.id)) continue
        const kontrakIds = (item.kontrak ?? []).map((k) => k.id).sort()
        const key = kontrakIds.length > 0 ? kontrakIds.join('-') : null

        if (!key) {
            kontrakToPekerjaan.set(`single-${item.id}`, [item])
            processed.add(item.id)
            continue
        }

        const existing = kontrakToPekerjaan.get(key) ?? []
        existing.push(item)
        kontrakToPekerjaan.set(key, existing)
        processed.add(item.id)
    }

    return Array.from(kontrakToPekerjaan.values())
}

/** Total nilai kontrak paket; null bila belum ada kontrak bernilai. */
export function getNilaiKontrak(item: RekapPekerjaanItem): number | null {
    const vals = (item.kontrak ?? [])
        .map((k) => k.nilai_kontrak)
        .filter((v): v is number => v != null)
    return vals.length ? vals.reduce((s, v) => s + v, 0) : null
}

export function compareRekapItems(a: RekapPekerjaanItem, b: RekapPekerjaanItem, field: RekapSortField): number {
    if (field === 'nilai_kontrak') {
        const aVal = getNilaiKontrak(a)
        const bVal = getNilaiKontrak(b)
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1
        return aVal - bVal
    }
    const aVal = a[field]
    const bVal = b[field]
    if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal)
    if (typeof aVal === 'number' && typeof bVal === 'number') return aVal - bVal
    if (aVal == null) return 1
    if (bVal == null) return -1
    return 0
}

export function sortRekapItems(list: RekapPekerjaanItem[], sort: RekapSortState): RekapPekerjaanItem[] {
    if (!sort.field) return list
    return [...list].sort((a, b) => {
        const cmp = compareRekapItems(a, b, sort.field!)
        return sort.dir === 'asc' ? cmp : -cmp
    })
}

export type GroupProgressSummary = {
    isKonsolidasi: boolean
    /** Rata-rata fisik grup (paket tunggal = nilainya sendiri). */
    fisik: number
    /** Rata-rata keuangan grup. */
    keuangan: number
    /** Rentang min–max fisik anggota (hanya informatif untuk konsolidasi). */
    fisikMin: number
    fisikMax: number
}

/** Ringkasan progres grup: rata-rata (bukan progres paket pertama). */
export function summarizeGroupProgress(items: RekapPekerjaanItem[]): GroupProgressSummary {
    const fisikVals = items.map((i) => i.progress_estimasi_fisik ?? 0)
    const keuVals = items.map((i) => i.progress_estimasi_keuangan ?? 0)
    const avg = (vals: number[]) => (vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0)
    return {
        isKonsolidasi: items.length > 1,
        fisik: avg(fisikVals),
        keuangan: avg(keuVals),
        fisikMin: fisikVals.length ? Math.min(...fisikVals) : 0,
        fisikMax: fisikVals.length ? Math.max(...fisikVals) : 0,
    }
}

/** Total pagu grup (dijumlah) + nilai kontrak grup (dedupe kontrak bersama). */
export function summarizeGroupMoney(items: RekapPekerjaanItem[]): { totalPagu: number; totalKontrak: number; kontrakCount: number } {
    const totalPagu = items.reduce((s, i) => s + (i.pagu ?? 0), 0)
    const kontrakById = new Map<number, number>()
    for (const item of items) {
        for (const k of item.kontrak ?? []) {
            if (k.nilai_kontrak != null) kontrakById.set(k.id, k.nilai_kontrak)
        }
    }
    return {
        totalPagu,
        totalKontrak: [...kontrakById.values()].reduce((s, v) => s + v, 0),
        kontrakCount: kontrakById.size,
    }
}

/** Filter grup: mode konsolidasi + pencarian multi-field (paket, wilayah, sub kegiatan). */
export function filterRekapGroups(
    groups: RekapPekerjaanItem[][],
    options: { mode: KonsolidasiMode; search: string },
): RekapPekerjaanItem[][] {
    const term = options.search.trim().toLowerCase()
    return groups.filter((items) => {
        const modeOk =
            options.mode === 'all' ? true
            : options.mode === 'single' ? items.length === 1
            : items.length > 1
        if (!modeOk) return false
        if (!term) return true
        return items.some((i) =>
            [
                i.nama_paket,
                i.kecamatan?.nama_kecamatan,
                i.desa?.nama_desa,
                i.kegiatan?.nama_sub_kegiatan,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(term),
        )
    })
}

export type RekapExportRow = {
    namaPaket: string
    subKegiatan: string
    kecamatan: string
    desa: string
    tags: string
    totalPagu: number
    totalKontrak: number
    fisik: number
    keuangan: number
}

/** Baris ekspor bersama (PDF + Excel) dari grup yang sudah difilter. */
export function buildRekapExportRows(groups: RekapPekerjaanItem[][]): RekapExportRow[] {
    return groups.map((items) => {
        const primary = items[0]
        const isKonsolidasi = items.length > 1
        const { totalPagu, totalKontrak } = summarizeGroupMoney(items)
        const { fisik, keuangan } = summarizeGroupProgress(items)
        return {
            namaPaket: isKonsolidasi
                ? `${items.map((i) => i.nama_paket).join(', ')} (Konsolidasi ${items.length} paket)`
                : primary.nama_paket,
            subKegiatan: primary.kegiatan?.nama_sub_kegiatan || '-',
            kecamatan: primary.kecamatan?.nama_kecamatan || '-',
            desa: primary.desa?.nama_desa || '-',
            tags: (primary.tags ?? []).map((t) => t.name).join(', ') || '-',
            totalPagu,
            totalKontrak,
            fisik,
            keuangan,
        }
    })
}
