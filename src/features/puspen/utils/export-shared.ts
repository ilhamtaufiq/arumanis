import type {
    PuspenProgressFisikItem,
    PuspenUncontractedPekerjaan,
} from '../api/progress-fisik'

/** Header resmi laporan progress fisik (PDF & Excel) */
export const PROGRESS_FISIK_EXPORT_TITLE =
    'Arumanis - Bidang Air Minum dan Sanitasi'

export type ExportPeriod = {
    startDate: string // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
}

/** Kolom anggaran di laporan — default semua tampil */
export type ExportFinancialColumns = {
    pagu: boolean
    nilaiKontrak: boolean
    sisaKontrak: boolean
    retensi: boolean
}

export const DEFAULT_EXPORT_FINANCIAL_COLUMNS: ExportFinancialColumns = {
    pagu: true,
    nilaiKontrak: true,
    sisaKontrak: true,
    retensi: true,
}

export const FINANCIAL_COLUMN_LABELS: Array<{
    key: keyof ExportFinancialColumns
    label: string
    short: string
}> = [
    { key: 'pagu', label: 'Pagu', short: 'Pagu' },
    { key: 'nilaiKontrak', label: 'Nilai Kontrak', short: 'Nilai Kontrak' },
    { key: 'sisaKontrak', label: 'Sisa Kontrak (Pagu − Nilai Kontrak)', short: 'Sisa Kontrak' },
    { key: 'retensi', label: 'Retensi (5% Nilai Kontrak)', short: 'Retensi (5%)' },
]

export function countFinancialColumns(cols: ExportFinancialColumns): number {
    return FINANCIAL_COLUMN_LABELS.filter((c) => cols[c.key]).length
}

export function financialHeaderLabels(
    cols: ExportFinancialColumns,
    mode: 'short' | 'long' = 'short',
): string[] {
    return FINANCIAL_COLUMN_LABELS.filter((c) => cols[c.key]).map((c) =>
        mode === 'short' ? c.short : c.label,
    )
}

/** Nilai numerik kolom anggaran (untuk Excel) */
export function financialNumericCells(
    cols: ExportFinancialColumns,
    values: {
        pagu: number
        nilaiKontrak: number
        sisaKontrak: number
        retensi: number
    },
): number[] {
    const out: number[] = []
    if (cols.pagu) out.push(values.pagu)
    if (cols.nilaiKontrak) out.push(values.nilaiKontrak)
    if (cols.sisaKontrak) out.push(values.sisaKontrak)
    if (cols.retensi) out.push(values.retensi)
    return out
}

/** Nilai terformat currency (untuk PDF) */
export function financialFormattedCells(
    cols: ExportFinancialColumns,
    values: {
        pagu: number
        nilaiKontrak: number
        sisaKontrak: number
        retensi: number
    },
): string[] {
    const out: string[] = []
    if (cols.pagu) out.push(formatCurrencyId(values.pagu))
    if (cols.nilaiKontrak) out.push(formatCurrencyId(values.nilaiKontrak))
    if (cols.sisaKontrak) out.push(formatCurrencyId(values.sisaKontrak))
    if (cols.retensi) out.push(formatCurrencyId(values.retensi))
    return out
}

/** Lebar relatif kolom anggaran (untuk PDF scale) */
export function financialColumnWidths(cols: ExportFinancialColumns, width = 26): number[] {
    return FINANCIAL_COLUMN_LABELS.filter((c) => cols[c.key]).map(() => width)
}

/** Opsi export: periode + sub kegiatan + kolom anggaran (+ logo PDF) */
export type ExportOptions = {
    period: ExportPeriod
    /** Nama sub kegiatan yang diexport (urutan = urutan di laporan) */
    subKegiatan: string[]
    /** Kolom pagu / nilai / sisa / retensi di laporan */
    financialColumns: ExportFinancialColumns
    /**
     * PDF only — logo tambahan di kop (default: tidak tampil).
     * Lambang Cianjurkab selalu ditampilkan.
     */
    pdfShowLogoAms?: boolean
    pdfShowLogoArumanis?: boolean
}

export const TANPA_SUB_KEGIATAN_LABEL = 'Tanpa Sub Kegiatan'

export function resolveSubKegiatanKey(value: string | null | undefined): string {
    const trimmed = value?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : TANPA_SUB_KEGIATAN_LABEL
}

/** Filter + susun item per sub kegiatan (hanya yang dipilih) */
export function filterAndGroupBySubKegiatan(
    items: PuspenProgressFisikItem[],
    selectedSubKegiatan: string[],
): Array<{ subKegiatan: string; items: PuspenProgressFisikItem[] }> {
    const selected = new Set(selectedSubKegiatan)
    if (selected.size === 0) return []

    const groups = new Map<string, PuspenProgressFisikItem[]>()
    for (const item of items) {
        const key = resolveSubKegiatanKey(item.subKegiatan)
        if (!selected.has(key)) continue
        const list = groups.get(key) ?? []
        list.push(item)
        groups.set(key, list)
    }

    // Ikuti urutan pilihan user; sisanya alfabetis jika ada
    const ordered: Array<{ subKegiatan: string; items: PuspenProgressFisikItem[] }> = []
    for (const name of selectedSubKegiatan) {
        const list = groups.get(name)
        if (list && list.length > 0) {
            ordered.push({ subKegiatan: name, items: list })
        }
    }
    return ordered
}

export function flattenGroupedItems(
    groups: Array<{ subKegiatan: string; items: PuspenProgressFisikItem[] }>,
): PuspenProgressFisikItem[] {
    return groups.flatMap((g) => g.items)
}

/** Nama sheet Excel aman (max 31 char, tanpa karakter terlarang) */
export function safeExcelSheetName(name: string, index: number): string {
    const cleaned = name.replace(/[\\/*?:\[\]]/g, ' ').replace(/\s+/g, ' ').trim() || `Sub ${index + 1}`
    if (cleaned.length <= 31) return cleaned
    return `${cleaned.slice(0, 28)}…`
}

export type SubKegiatanRekapRow = {
    subKegiatan: string
    count: number
    rencana: number
    realisasi: number
    deviasi: number
    pagu: number
    nilaiKontrak: number
    sisaKontrak: number
    retensi: number
    phoSudah: number
    phoBelum: number
}

export function formatCurrencyId(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

export function formatNumberId(value: number | null | undefined, digits = 2): string {
    if (value == null || !Number.isFinite(value)) return '-'
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
    }).format(value)
}

export function formatDateId(isoDate: string): string {
    const date = new Date(`${isoDate}T00:00:00`)
    if (Number.isNaN(date.getTime())) return isoDate
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date)
}

export function formatUpdatedAt(value: string | null): string {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

export function phoLabel(completed: boolean): 'Sudah' | 'Belum' {
    return completed ? 'Sudah' : 'Belum'
}

export function buildSubKegiatanRekap(items: PuspenProgressFisikItem[]): SubKegiatanRekapRow[] {
    const map = new Map<string, SubKegiatanRekapRow>()

    for (const item of items) {
        const key = item.subKegiatan?.trim() || 'Tanpa Sub Kegiatan'
        const existing = map.get(key) ?? {
            subKegiatan: key,
            count: 0,
            rencana: 0,
            realisasi: 0,
            deviasi: 0,
            pagu: 0,
            nilaiKontrak: 0,
            sisaKontrak: 0,
            retensi: 0,
            phoSudah: 0,
            phoBelum: 0,
        }

        existing.count += 1
        existing.rencana += item.rencana ?? 0
        existing.realisasi += item.realisasi ?? 0
        existing.pagu += item.pagu ?? 0
        existing.nilaiKontrak += item.nilaiKontrak ?? 0
        existing.sisaKontrak += item.sisaKontrak ?? 0
        existing.retensi += item.retensi ?? 0
        if (item.phoCompleted) existing.phoSudah += 1
        else existing.phoBelum += 1

        map.set(key, existing)
    }

    return Array.from(map.values())
        .map((row) => {
            const avgRencana = row.count > 0 ? row.rencana / row.count : 0
            const avgRealisasi = row.count > 0 ? row.realisasi / row.count : 0
            return {
                ...row,
                rencana: Number(avgRencana.toFixed(2)),
                realisasi: Number(avgRealisasi.toFixed(2)),
                deviasi: Number((avgRealisasi - avgRencana).toFixed(2)),
            }
        })
        .sort((a, b) => a.subKegiatan.localeCompare(b.subKegiatan, 'id'))
}

/** Awal minggu (Senin) dan akhir minggu (Minggu) untuk tanggal acuan */
export function weekRange(anchor = new Date()): { start: string; end: string } {
    const d = new Date(anchor)
    d.setHours(0, 0, 0, 0)
    const day = d.getDay() // 0 Minggu
    const mondayOffset = day === 0 ? -6 : 1 - day
    const start = new Date(d)
    start.setDate(d.getDate() + mondayOffset)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start: toIsoDate(start), end: toIsoDate(end) }
}

export function monthRange(anchor = new Date()): { start: string; end: string } {
    const d = new Date(anchor)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return { start: toIsoDate(start), end: toIsoDate(end) }
}

export function toIsoDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/** Akhir hari lokal dari YYYY-MM-DD */
export function endOfDayFromIsoDate(isoDate: string): Date {
    const date = new Date(`${isoDate}T23:59:59.999`)
    return date
}

/**
 * Apakah timestamp (ISO) termasuk "sudah terjadi" s.d. akhir periode.
 * true → data boleh ditampilkan; false → anggap belum ada (0% / belum PHO).
 *
 * Contoh: progress diisi Juli → laporan Juni (end=30 Juni) → false → 0%.
 * Progress diisi Juli → laporan Juli (end=31 Juli) → true → nilai tampil.
 */
export function isAtOrBeforePeriodEnd(
    isoTimestamp: string | null | undefined,
    periodEndIso: string,
): boolean {
    if (!isoTimestamp) return false
    const at = new Date(isoTimestamp)
    if (Number.isNaN(at.getTime())) return false
    return at.getTime() <= endOfDayFromIsoDate(periodEndIso).getTime()
}

/**
 * Snapshot data per periode untuk export.
 * - Semua kontrak tetap ada (tidak dihapus barisnya).
 * - Rencana / realisasi / deviasi / PHO / realisasi output di-nol-kan
 *   jika belum ada update s.d. tanggal akhir periode.
 * - Pagu, nilai kontrak, sisa, retensi tetap (data master, bukan progres periodik).
 */
export function applyPeriodSnapshot(
    items: PuspenProgressFisikItem[],
    period: ExportPeriod,
): PuspenProgressFisikItem[] {
    return items.map((item) => {
        const progressVisible = isAtOrBeforePeriodEnd(item.updatedAt, period.endDate)

        const rencana = progressVisible ? item.rencana : 0
        const realisasi = progressVisible ? item.realisasi : 0
        const deviasi =
            rencana != null && realisasi != null
                ? Number((realisasi - rencana).toFixed(2))
                : progressVisible
                  ? item.deviasi
                  : 0

        const outputs = (item.outputs ?? []).map((output) => {
            const outputVisible = isAtOrBeforePeriodEnd(output.updatedAt, period.endDate)
            return {
                ...output,
                realisasi: outputVisible ? output.realisasi : null,
                // updatedAt tetap untuk audit, tapi realisasi sudah difilter
            }
        })

        return {
            ...item,
            rencana: rencana ?? 0,
            realisasi: realisasi ?? 0,
            deviasi: deviasi ?? 0,
            phoCompleted: progressVisible ? item.phoCompleted : false,
            // Jangan tampilkan "update" seolah di luar periode
            updatedAt: progressVisible ? item.updatedAt : null,
            outputs,
        }
    })
}

/**
 * Siapkan items untuk export: snapshot periode dulu, lalu filter sub kegiatan.
 */
export function prepareItemsForExport(
    items: PuspenProgressFisikItem[],
    options: Pick<ExportOptions, 'period' | 'subKegiatan'>,
): Array<{ subKegiatan: string; items: PuspenProgressFisikItem[] }> {
    const snapshot = applyPeriodSnapshot(items, options.period)
    return filterAndGroupBySubKegiatan(snapshot, options.subKegiatan)
}

/** Ubah paket belum berkontrak → baris export (progres 0%, nilai kontrak 0) */
export function uncontractedToProgressItems(
    rows: PuspenUncontractedPekerjaan[],
    tahun: number,
): PuspenProgressFisikItem[] {
    return rows.map((row) => {
        const pagu = row.pagu ?? 0
        return {
            // ID negatif agar tidak bentrok dengan kontrak_id nyata
            kontrakId: -Math.abs(row.pekerjaanId),
            kodePaket: row.kodeRekening,
            namaPaket: row.namaPaket,
            subKegiatan: row.subKegiatan,
            tahunAnggaran: tahun,
            pagu,
            nilaiKontrak: 0,
            sisaKontrak: pagu,
            retensi: 0,
            rencana: 0,
            realisasi: 0,
            deviasi: 0,
            phoCompleted: false,
            updatedAt: null,
            outputs: [],
            hasOutputs: false,
            outputNotice: 'Belum berkontrak',
            isUncontracted: true,
        }
    })
}

/** Filter uncontracted by selected sub kegiatan */
export function filterUncontractedBySubKegiatan(
    rows: PuspenUncontractedPekerjaan[],
    selectedSubKegiatan: string[],
): PuspenUncontractedPekerjaan[] {
    if (selectedSubKegiatan.length === 0) return []
    const selected = new Set(selectedSubKegiatan)
    return rows.filter((row) => selected.has(resolveSubKegiatanKey(row.subKegiatan)))
}

/**
 * Gabungkan kontrak + paket belum berkontrak, snapshot periode, group by sub.
 */
export function prepareItemsForExportWithUncontracted(
    contracted: PuspenProgressFisikItem[],
    uncontracted: PuspenUncontractedPekerjaan[],
    tahun: number,
    options: Pick<ExportOptions, 'period' | 'subKegiatan'>,
): {
    groups: Array<{ subKegiatan: string; items: PuspenProgressFisikItem[] }>
    uncontractedFiltered: PuspenUncontractedPekerjaan[]
} {
    const uncontractedFiltered = filterUncontractedBySubKegiatan(
        uncontracted,
        options.subKegiatan,
    )
    const asItems = uncontractedToProgressItems(uncontractedFiltered, tahun)
    const combined = [...contracted, ...asItems]
    const groups = prepareItemsForExport(combined, options)
    return { groups, uncontractedFiltered }
}
