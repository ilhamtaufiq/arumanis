import type { Pekerjaan } from '../types'

export type ExportColumnId =
    | 'no'
    | 'kode_rekening'
    | 'nama_paket'
    | 'sub_kegiatan'
    | 'kecamatan'
    | 'desa'
    | 'pagu'
    | 'pengawas'
    | 'pendamping'
    | 'tags'
    | 'status'
    | 'catatan'
    | 'progress_fisik'
    | 'progress_keuangan'
    | 'deviasi'
    | 'is_konsultan'

/** Label status paket untuk export (API: active | canceled). */
export function formatPekerjaanStatus(status: string | null | undefined): string {
    if (status === 'canceled') return 'Dibatalkan'
    if (status === 'active' || !status) return 'Aktif'
    return String(status)
}

export type ExportColumnDef = {
    id: ExportColumnId
    label: string
    /** Excel / PDF header */
    header: string
    /** Default selected in export dialog */
    defaultSelected: boolean
    /** Approximate Excel column width (chars) */
    excelWidth: number
    /** Approximate PDF column width (mm); ignored for auto layout */
    pdfWidth?: number
    getValue: (item: Pekerjaan, index: number) => string | number
}

function formatRp(value: number | null | undefined): string {
    if (value == null || Number.isNaN(Number(value))) return '-'
    return `Rp ${Number(value).toLocaleString('id-ID')}`
}

function formatPercent(value: number | null | undefined): string {
    if (value == null || Number.isNaN(Number(value))) return '-'
    return `${Number(value).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`
}

/** All columns available for pekerjaan export (PDF / Excel). */
export const PEKERJAAN_EXPORT_COLUMNS: ExportColumnDef[] = [
    {
        id: 'no',
        label: 'No',
        header: 'No',
        defaultSelected: true,
        excelWidth: 5,
        pdfWidth: 10,
        getValue: (_item, index) => index + 1,
    },
    {
        id: 'kode_rekening',
        label: 'Kode Rekening',
        header: 'Kode Rekening',
        defaultSelected: true,
        excelWidth: 20,
        pdfWidth: 28,
        getValue: (item) => item.kode_rekening || '-',
    },
    {
        id: 'nama_paket',
        label: 'Nama Paket',
        header: 'Nama Paket',
        defaultSelected: true,
        excelWidth: 50,
        pdfWidth: 50,
        getValue: (item) => item.nama_paket || '-',
    },
    {
        id: 'sub_kegiatan',
        label: 'Sub Kegiatan',
        header: 'Sub Kegiatan',
        defaultSelected: true,
        excelWidth: 40,
        pdfWidth: 40,
        getValue: (item) => item.kegiatan?.nama_sub_kegiatan || '-',
    },
    {
        id: 'kecamatan',
        label: 'Kecamatan',
        header: 'Kecamatan',
        defaultSelected: true,
        excelWidth: 20,
        pdfWidth: 28,
        getValue: (item) => item.kecamatan?.nama_kecamatan || '-',
    },
    {
        id: 'desa',
        label: 'Desa',
        header: 'Desa',
        defaultSelected: true,
        excelWidth: 20,
        pdfWidth: 28,
        getValue: (item) => item.desa?.nama_desa || '-',
    },
    {
        id: 'pagu',
        label: 'Pagu',
        header: 'Pagu',
        defaultSelected: true,
        excelWidth: 18,
        pdfWidth: 32,
        getValue: (item) => item.pagu ?? 0,
    },
    {
        id: 'pengawas',
        label: 'Pengawas',
        header: 'Pengawas',
        defaultSelected: true,
        excelWidth: 25,
        pdfWidth: 30,
        getValue: (item) => item.pengawas?.nama || '-',
    },
    {
        id: 'pendamping',
        label: 'Pendamping',
        header: 'Pendamping',
        defaultSelected: true,
        excelWidth: 25,
        pdfWidth: 30,
        getValue: (item) => item.pendamping?.nama || '-',
    },
    {
        id: 'tags',
        label: 'Tags',
        header: 'Tags',
        defaultSelected: true,
        excelWidth: 30,
        pdfWidth: 24,
        getValue: (item) => item.tags?.map((t) => t.name).join(', ') || '-',
    },
    {
        id: 'status',
        label: 'Status Paket',
        header: 'Status',
        defaultSelected: true,
        excelWidth: 14,
        pdfWidth: 22,
        getValue: (item) => formatPekerjaanStatus(item.status),
    },
    {
        id: 'catatan',
        label: 'Catatan',
        header: 'Catatan',
        defaultSelected: true,
        excelWidth: 40,
        pdfWidth: 36,
        getValue: (item) => {
            const text = item.catatan?.trim()
            return text ? text : '-'
        },
    },
    {
        id: 'progress_fisik',
        label: 'Progress Fisik',
        header: 'Progress Fisik',
        defaultSelected: false,
        excelWidth: 14,
        pdfWidth: 22,
        // Sumber: detail pekerjaan → tab Progress (PekerjaanProgressEstimasiTab)
        // = realisasi terakhir progress estimasi fisik
        getValue: (item) =>
            item.progress_estimasi_fisik != null
                ? formatPercent(item.progress_estimasi_fisik)
                : '-',
    },
    {
        id: 'progress_keuangan',
        label: 'Progress Keuangan',
        header: 'Progress Keuangan',
        defaultSelected: false,
        excelWidth: 16,
        pdfWidth: 24,
        // Sumber: detail pekerjaan → tab Progress → Progress Keuangan
        getValue: (item) =>
            item.progress_estimasi_keuangan != null
                ? formatPercent(item.progress_estimasi_keuangan)
                : '-',
    },
    {
        id: 'deviasi',
        label: 'Deviasi',
        header: 'Deviasi',
        defaultSelected: false,
        excelWidth: 12,
        pdfWidth: 18,
        // Deviasi estimasi fisik (realisasi − rencana) di tab Progress detail pekerjaan
        getValue: (item) =>
            item.deviasi_estimasi_fisik != null
                ? formatPercent(item.deviasi_estimasi_fisik)
                : '-',
    },
    {
        id: 'is_konsultan',
        label: 'Jenis (Konsultan)',
        header: 'Jenis',
        defaultSelected: false,
        excelWidth: 14,
        pdfWidth: 22,
        getValue: (item) => (item.is_konsultan ? 'Konsultan' : 'Fisik'),
    },
]

export const DEFAULT_EXPORT_COLUMN_IDS: ExportColumnId[] = PEKERJAAN_EXPORT_COLUMNS
    .filter((c) => c.defaultSelected)
    .map((c) => c.id)

/** Bump version when default columns change so UI picks up new defaults. */
export const EXPORT_COLUMNS_STORAGE_KEY = 'pekerjaan-export-columns-v2'

export function getExportColumnsByIds(ids: ExportColumnId[]): ExportColumnDef[] {
    const set = new Set(ids)
    // Preserve catalog order
    return PEKERJAAN_EXPORT_COLUMNS.filter((c) => set.has(c.id))
}

export function formatPaguForDisplay(value: string | number): string {
    if (typeof value === 'number') return formatRp(value)
    return String(value)
}

/** Build row objects for Excel (header keys = column headers). */
export function buildExcelRows(
    data: Pekerjaan[],
    columns: ExportColumnDef[],
): Record<string, string | number>[] {
    return data.map((item, index) => {
        const row: Record<string, string | number> = {}
        for (const col of columns) {
            row[col.header] = col.getValue(item, index)
        }
        return row
    })
}

/** Head + body arrays for jsPDF autoTable. */
export function buildPdfTable(
    data: Pekerjaan[],
    columns: ExportColumnDef[],
): { head: string[][]; body: string[][] } {
    const head = [columns.map((c) => c.header)]
    const body = data.map((item, index) =>
        columns.map((col) => {
            const value = col.getValue(item, index)
            if (col.id === 'pagu' && typeof value === 'number') {
                return formatRp(value)
            }
            return String(value ?? '-')
        }),
    )
    return { head, body }
}

export type SubKegiatanGroup = {
    key: string
    kegiatanId: number | null
    label: string
    items: Pekerjaan[]
}

/** Group pekerjaan by sub kegiatan (stable sort by label). */
export function groupPekerjaanBySubKegiatan(data: Pekerjaan[]): SubKegiatanGroup[] {
    const map = new Map<string, SubKegiatanGroup>()

    for (const item of data) {
        const kegiatanId = item.kegiatan_id ?? item.kegiatan?.id ?? null
        const label =
            item.kegiatan?.nama_sub_kegiatan?.trim() ||
            (kegiatanId != null ? `Sub kegiatan #${kegiatanId}` : 'Tanpa sub kegiatan')
        const key = kegiatanId != null ? `id:${kegiatanId}` : `label:${label}`

        const existing = map.get(key)
        if (existing) {
            existing.items.push(item)
        } else {
            map.set(key, { key, kegiatanId, label, items: [item] })
        }
    }

    return Array.from(map.values()).sort((a, b) =>
        a.label.localeCompare(b.label, 'id', { sensitivity: 'base' }),
    )
}

/** Excel sheet name: max 31 chars, no \ / * ? : [ ] */
export function sanitizeExcelSheetName(name: string, used: Set<string>, index: number): string {
    let base = name
        .replace(/[\\/*?:[\]]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 28)
    if (!base) base = `Sub ${index + 1}`

    let candidate = base
    let n = 2
    while (used.has(candidate.toLowerCase())) {
        const suffix = ` (${n})`
        candidate = `${base.slice(0, Math.max(1, 31 - suffix.length))}${suffix}`
        n += 1
    }
    used.add(candidate.toLowerCase())
    return candidate
}
