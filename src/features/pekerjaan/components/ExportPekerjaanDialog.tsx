import { useEffect, useMemo, useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchAllPages } from '@/lib/paginated-fetch'
import { getPekerjaan } from '../api/pekerjaan'
import {
    buildExcelRows,
    buildPdfTable,
    DEFAULT_EXPORT_COLUMN_IDS,
    EXPORT_COLUMNS_STORAGE_KEY,
    getExportColumnsByIds,
    groupPekerjaanBySubKegiatan,
    PEKERJAAN_EXPORT_COLUMNS,
    sanitizeExcelSheetName,
    type ExportColumnId,
} from '../lib/export-pekerjaan-columns'
import type { Pekerjaan } from '../types'

/** API caps per_page at 100; per_page=-1 is only ~80 rows (mobile safety). Export paginates. */
const EXPORT_PAGE_SIZE = 100

export type ExportKegiatanOption = {
    id: number
    label: string
}

export type ExportPekerjaanFilters = {
    kecamatanId?: number
    /** Pre-selected kegiatan from list filter (optional seed) */
    kegiatanId?: number
    tagId?: number
    pengawasId?: number
    search?: string
    tahun?: string | number
    filterLabels?: string[]
    /**
     * Seed filter jenis paket dari list (opsional).
     * all | konsultan | fisik (non-konsultan)
     */
    isKonsultan?: 'all' | 'konsultan' | 'fisik'
}

type Format = 'excel' | 'pdf'
type KegiatanScope = 'all' | 'selected'
/** Filter jenis paket pekerjaan */
type KonsultanScope = 'all' | 'konsultan' | 'fisik'

const KONSULTAN_SCOPE_LABEL: Record<KonsultanScope, string> = {
    all: 'Semua jenis (fisik + konsultan)',
    konsultan: 'Hanya pekerjaan konsultan',
    fisik: 'Hanya pekerjaan fisik (non-konsultan)',
}

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    filters: ExportPekerjaanFilters
    /** Sub kegiatan list for tahun anggaran aktif */
    kegiatanOptions: ExportKegiatanOption[]
}

function loadSavedColumnIds(): ExportColumnId[] {
    try {
        const raw = localStorage.getItem(EXPORT_COLUMNS_STORAGE_KEY)
        if (!raw) return [...DEFAULT_EXPORT_COLUMN_IDS]
        const parsed = JSON.parse(raw) as unknown
        if (!Array.isArray(parsed)) return [...DEFAULT_EXPORT_COLUMN_IDS]
        const valid = new Set(PEKERJAAN_EXPORT_COLUMNS.map((c) => c.id))
        const ids = parsed.filter(
            (id): id is ExportColumnId => typeof id === 'string' && valid.has(id as ExportColumnId),
        )
        return ids.length > 0 ? ids : [...DEFAULT_EXPORT_COLUMN_IDS]
    } catch {
        return [...DEFAULT_EXPORT_COLUMN_IDS]
    }
}

function saveColumnIds(ids: ExportColumnId[]) {
    try {
        localStorage.setItem(EXPORT_COLUMNS_STORAGE_KEY, JSON.stringify(ids))
    } catch {
        // ignore
    }
}

/**
 * A4 landscape printable margins (mm).
 * Margin kertas tetap aman cetak; yang dinamis = lebar kolom mengisi area konten.
 */
const PDF_A4_MARGIN_MM = {
    top: 12,
    right: 12,
    bottom: 14,
    left: 12,
} as const

/** A4 landscape content width with side margins (297 − left − right). */
function a4LandscapeContentWidthMm(): number {
    return 297 - PDF_A4_MARGIN_MM.left - PDF_A4_MARGIN_MM.right
}

/** Minimum width (mm) per column type — tetap terbaca saat scale/stretch. */
function pdfColumnMinWidth(colId: string): number {
    switch (colId) {
        case 'no':
            return 8
        case 'status':
        case 'is_konsultan':
            return 14
        case 'pagu':
        case 'deviasi':
        case 'progress_fisik':
        case 'progress_keuangan':
            return 16
        case 'kode_rekening':
            return 18
        default:
            return 14
    }
}

/**
 * Proporsional mengisi penuh area konten A4 landscape (273 mm).
 * - Kolom sedikit → melebar merata (bukan tabel “mengambang” kiri)
 * - Kolom banyak → menyusut proporsional, hormati min width
 */
function computePdfColumnWidths(
    columns: ReturnType<typeof getExportColumnsByIds>,
    contentWidth: number,
): number[] {
    const n = columns.length
    if (n === 0) return []

    const weights = columns.map((c) => Math.max(c.pdfWidth ?? 20, 1))
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1
    let widths = weights.map((w) => (w / totalWeight) * contentWidth)

    const mins = columns.map((c) => pdfColumnMinWidth(c.id))
    // Iterasi: naikkan yang di bawah min, ambil dari kolom yang longgar
    for (let pass = 0; pass < 4; pass++) {
        let deficit = 0
        let flexible = 0
        for (let i = 0; i < n; i++) {
            if (widths[i] < mins[i]) {
                deficit += mins[i] - widths[i]
                widths[i] = mins[i]
            } else {
                flexible += widths[i] - mins[i]
            }
        }
        if (deficit <= 0.01 || flexible <= 0.01) break
        const take = Math.min(deficit, flexible)
        for (let i = 0; i < n; i++) {
            const slack = widths[i] - mins[i]
            if (slack > 0) {
                widths[i] -= (slack / flexible) * take
            }
        }
    }

    // Normalisasi total = contentWidth (hindari drift floating point)
    const sum = widths.reduce((a, b) => a + b, 0) || 1
    if (Math.abs(sum - contentWidth) > 0.05) {
        widths = widths.map((w) => (w / sum) * contentWidth)
    }

    return widths
}

function pdfDensity(columnCount: number): {
    headFont: number
    bodyFont: number
    cellPadding: number
} {
    if (columnCount <= 6) {
        return { headFont: 9, bodyFont: 8.5, cellPadding: 2.2 }
    }
    if (columnCount <= 9) {
        return { headFont: 8, bodyFont: 7.5, cellPadding: 1.6 }
    }
    if (columnCount <= 12) {
        return { headFont: 7, bodyFont: 6.5, cellPadding: 1.3 }
    }
    return { headFont: 6.5, bodyFont: 6, cellPadding: 1.1 }
}

function applyPdfTableStyles(
    columns: ReturnType<typeof getExportColumnsByIds>,
) {
    const contentWidth = a4LandscapeContentWidthMm()
    const colWidths = computePdfColumnWidths(columns, contentWidth)
    const density = pdfDensity(columns.length)

    return {
        theme: 'grid' as const,
        margin: { ...PDF_A4_MARGIN_MM },
        tableWidth: contentWidth,
        headStyles: {
            fillColor: [37, 99, 235] as [number, number, number],
            textColor: 255,
            fontStyle: 'bold' as const,
            halign: 'center' as const,
            fontSize: density.headFont,
            cellPadding: density.cellPadding,
            valign: 'middle' as const,
        },
        styles: {
            fontSize: density.bodyFont,
            cellPadding: density.cellPadding,
            overflow: 'linebreak' as const,
            valign: 'top' as const,
            lineColor: [203, 213, 225] as [number, number, number],
            lineWidth: 0.15,
            textColor: [15, 23, 42] as [number, number, number],
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252] as [number, number, number],
        },
        columnStyles: Object.fromEntries(
            columns.map((col, i) => [
                i,
                {
                    cellWidth: colWidths[i],
                    halign:
                        col.id === 'no' ||
                        col.id === 'status' ||
                        col.id === 'is_konsultan'
                            ? ('center' as const)
                            : col.id === 'pagu' ||
                                col.id === 'progress_fisik' ||
                                col.id === 'progress_keuangan' ||
                                col.id === 'deviasi'
                              ? ('right' as const)
                              : ('left' as const),
                },
            ]),
        ),
    }
}

export function ExportPekerjaanDialog({
    open,
    onOpenChange,
    filters,
    kegiatanOptions,
}: Props) {
    const [format, setFormat] = useState<Format>('excel')
    const [selectedIds, setSelectedIds] = useState<ExportColumnId[]>(DEFAULT_EXPORT_COLUMN_IDS)
    const [kegiatanScope, setKegiatanScope] = useState<KegiatanScope>('all')
    const [selectedKegiatanIds, setSelectedKegiatanIds] = useState<number[]>([])
    const [konsultanScope, setKonsultanScope] = useState<KonsultanScope>('all')
    const [groupBySubKegiatan, setGroupBySubKegiatan] = useState(true)
    const [kegiatanSearch, setKegiatanSearch] = useState('')
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        if (!open) return
        setSelectedIds(loadSavedColumnIds())
        setKegiatanSearch('')
        setGroupBySubKegiatan(true)
        setKonsultanScope(filters.isKonsultan ?? 'all')

        if (filters.kegiatanId) {
            setKegiatanScope('selected')
            setSelectedKegiatanIds([filters.kegiatanId])
        } else {
            setKegiatanScope('all')
            setSelectedKegiatanIds(kegiatanOptions.map((k) => k.id))
        }
        // Only re-seed when dialog opens (or list filter kegiatan changes while closed→open)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid resetting selection when options array identity changes mid-open
    }, [open, filters.kegiatanId, filters.isKonsultan])

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
    const selectedKegiatanSet = useMemo(() => new Set(selectedKegiatanIds), [selectedKegiatanIds])

    const filteredKegiatanOptions = useMemo(() => {
        const q = kegiatanSearch.trim().toLowerCase()
        if (!q) return kegiatanOptions
        return kegiatanOptions.filter((k) => k.label.toLowerCase().includes(q))
    }, [kegiatanOptions, kegiatanSearch])

    const allColumnsSelected = selectedIds.length === PEKERJAAN_EXPORT_COLUMNS.length
    const noneColumnsSelected = selectedIds.length === 0
    const allKegiatanSelected =
        kegiatanOptions.length > 0 && selectedKegiatanIds.length === kegiatanOptions.length
    const noneKegiatanSelected = selectedKegiatanIds.length === 0
    const kegiatanSelectionInvalid = kegiatanScope === 'selected' && noneKegiatanSelected

    const toggleColumn = (id: ExportColumnId, checked: boolean) => {
        setSelectedIds((current) => {
            if (checked) return current.includes(id) ? current : [...current, id]
            return current.filter((x) => x !== id)
        })
    }

    const toggleKegiatan = (id: number, checked: boolean) => {
        setSelectedKegiatanIds((current) => {
            if (checked) return current.includes(id) ? current : [...current, id]
            return current.filter((x) => x !== id)
        })
    }

    const handleExport = async () => {
        const columns = getExportColumnsByIds(selectedIds)
        if (columns.length === 0) {
            toast.error('Pilih minimal satu kolom untuk diekspor')
            return
        }
        if (kegiatanScope === 'selected' && selectedKegiatanIds.length === 0) {
            toast.error('Pilih minimal satu sub kegiatan')
            return
        }

        setExporting(true)
        try {
            toast.loading('Mengambil semua data pekerjaan…')

            // Jangan pakai per_page=-1: backend hard-cap ~80 baris (anti-OOM mobile).
            // Ambil berhalaman (max 100) sampai last_page agar export = total list (mis. 134).
            const listParams = {
                kecamatan_id: filters.kecamatanId,
                tag_id: filters.tagId,
                pengawas_id: filters.pengawasId,
                search: filters.search || undefined,
                tahun: filters.tahun != null ? String(filters.tahun) : undefined,
                per_page: EXPORT_PAGE_SIZE,
                sort_by: 'updated_at' as const,
                sort_direction: 'desc' as const,
            }

            let allData: Pekerjaan[] = await fetchAllPages((page) =>
                getPekerjaan({ ...listParams, page }),
            )
            toast.dismiss()

            if (kegiatanScope === 'selected') {
                const allow = new Set(selectedKegiatanIds)
                allData = allData.filter((item) => {
                    const id = item.kegiatan_id ?? item.kegiatan?.id
                    return id != null && allow.has(id)
                })
            }

            if (konsultanScope === 'konsultan') {
                allData = allData.filter((item) => Boolean(item.is_konsultan))
            } else if (konsultanScope === 'fisik') {
                allData = allData.filter((item) => !item.is_konsultan)
            }

            if (allData.length === 0) {
                toast.error(
                    'Tidak ada data untuk diekspor (periksa filter / sub kegiatan / jenis paket)',
                )
                return
            }

            saveColumnIds(selectedIds)
            const dateStamp = new Date().toISOString().split('T')[0]
            const groups = groupBySubKegiatan
                ? groupPekerjaanBySubKegiatan(allData)
                : [
                      {
                          key: 'all',
                          kegiatanId: null as number | null,
                          label: 'Semua Pekerjaan',
                          items: allData,
                      },
                  ]

            if (format === 'excel') {
                const workbook = XLSX.utils.book_new()
                const usedNames = new Set<string>()

                if (groupBySubKegiatan && groups.length > 1) {
                    // Summary sheet first
                    const summary = groups.map((g, i) => ({
                        No: i + 1,
                        'Sub Kegiatan': g.label,
                        'Jumlah Paket': g.items.length,
                        'Total Pagu': g.items.reduce((sum, row) => sum + (Number(row.pagu) || 0), 0),
                    }))
                    const summarySheet = XLSX.utils.json_to_sheet(summary)
                    summarySheet['!cols'] = [{ wch: 5 }, { wch: 50 }, { wch: 14 }, { wch: 18 }]
                    XLSX.utils.book_append_sheet(
                        workbook,
                        summarySheet,
                        sanitizeExcelSheetName('Ringkasan', usedNames, 0),
                    )
                }

                groups.forEach((group, index) => {
                    const excelData = buildExcelRows(group.items, columns)
                    const worksheet = XLSX.utils.json_to_sheet(excelData)
                    worksheet['!cols'] = columns.map((c) => ({ wch: c.excelWidth }))
                    const sheetName = groupBySubKegiatan
                        ? sanitizeExcelSheetName(group.label, usedNames, index + 1)
                        : sanitizeExcelSheetName('Pekerjaan', usedNames, 0)
                    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
                })

                const jenisSuffix =
                    konsultanScope === 'all' ? '' : ` · ${KONSULTAN_SCOPE_LABEL[konsultanScope]}`
                XLSX.writeFile(workbook, `Daftar_Pekerjaan_${dateStamp}.xlsx`)
                toast.success(
                    groupBySubKegiatan
                        ? `Excel diunduh: ${groups.length} sub kegiatan, ${allData.length} paket${jenisSuffix}`
                        : `Excel diunduh: ${allData.length} paket${jenisSuffix}`,
                )
            } else {
                // Explicit A4 landscape (mm) so margins/table width match printable paper.
                const doc = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4',
                })
                const timestamp = new Date().toLocaleString('id-ID')
                const tableStyles = applyPdfTableStyles(columns)
                const pageWidth = doc.internal.pageSize.getWidth()
                const centerX = pageWidth / 2
                const contentWidth = a4LandscapeContentWidthMm()
                const left = PDF_A4_MARGIN_MM.left
                const top = PDF_A4_MARGIN_MM.top

                groups.forEach((group, groupIndex) => {
                    if (groupIndex > 0) {
                        doc.addPage('a4', 'landscape')
                    }

                    doc.setFontSize(14)
                    doc.setFont('helvetica', 'bold')
                    doc.text('DAFTAR PEKERJAAN', centerX, top + 3, { align: 'center' })

                    doc.setFontSize(10)
                    doc.setFont('helvetica', 'normal')
                    const jenisLine =
                        konsultanScope === 'all'
                            ? ''
                            : ` | ${KONSULTAN_SCOPE_LABEL[konsultanScope]}`
                    doc.text(
                        `Tahun Anggaran: ${filters.tahun ?? '-'} | Tanggal Cetak: ${timestamp}${jenisLine}`,
                        centerX,
                        top + 10,
                        { align: 'center' },
                    )

                    let startY = top + 16
                    if (groupBySubKegiatan) {
                        doc.setFont('helvetica', 'bold')
                        doc.setFontSize(11)
                        const title = `Sub Kegiatan: ${group.label}`
                        const wrapped = doc.splitTextToSize(title, contentWidth)
                        doc.text(wrapped, left, startY)
                        startY += Math.max(8, wrapped.length * 5 + 2)
                        doc.setFont('helvetica', 'normal')
                        doc.setFontSize(9)
                        doc.text(
                            `Jumlah paket: ${group.items.length} | Halaman ${groupIndex + 1}/${groups.length}`,
                            left,
                            startY,
                        )
                        startY += 6
                    } else {
                        const labels = [...(filters.filterLabels ?? [])]
                        if (konsultanScope !== 'all') {
                            labels.push(`Jenis: ${KONSULTAN_SCOPE_LABEL[konsultanScope]}`)
                        }
                        const filterLine = labels.filter(Boolean).join(' | ')
                        if (filterLine) {
                            const wrappedFilter = doc.splitTextToSize(filterLine, contentWidth)
                            doc.text(wrappedFilter, centerX, startY, { align: 'center' })
                            startY += Math.max(6, wrappedFilter.length * 4 + 2)
                        }
                    }

                    const { head, body } = buildPdfTable(group.items, columns)
                    autoTable(doc, {
                        startY,
                        head,
                        body,
                        ...tableStyles,
                        didDrawPage: (data) => {
                            const pageH = doc.internal.pageSize.getHeight()
                            const pageW = doc.internal.pageSize.getWidth()
                            const pageNo = data.pageNumber
                            doc.setFontSize(7.5)
                            doc.setFont('helvetica', 'normal')
                            doc.setTextColor(100)
                            doc.text(
                                'Arumanis · Daftar Pekerjaan · A4 Landscape',
                                PDF_A4_MARGIN_MM.left,
                                pageH - 6,
                            )
                            doc.text(`Halaman ${pageNo}`, pageW - PDF_A4_MARGIN_MM.right, pageH - 6, {
                                align: 'right',
                            })
                            doc.setTextColor(0)
                        },
                    })
                })

                const jenisSuffixPdf =
                    konsultanScope === 'all' ? '' : ` · ${KONSULTAN_SCOPE_LABEL[konsultanScope]}`
                doc.save(`Daftar_Pekerjaan_${dateStamp}.pdf`)
                toast.success(
                    groupBySubKegiatan
                        ? `PDF diunduh: ${groups.length} sub kegiatan, ${allData.length} paket${jenisSuffixPdf}`
                        : `PDF diunduh: ${allData.length} paket${jenisSuffixPdf}`,
                )
            }

            onOpenChange(false)
        } catch (error) {
            toast.dismiss()
            console.error('Failed to export pekerjaan:', error)
            toast.error(format === 'excel' ? 'Gagal mengekspor Excel' : 'Gagal mengekspor PDF')
        } finally {
            setExporting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-xl">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Ekspor Pekerjaan</DialogTitle>
                    <DialogDescription>
                        Mengekspor semua paket yang cocok filter (bukan hanya halaman tabel 20 baris).
                        Pilih format, sub kegiatan, dan kolom; opsional pisah sheet per sub kegiatan.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2 pr-1">
                    {/* Format */}
                    <div className="space-y-2">
                        <Label>Format</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={format === 'excel' ? 'default' : 'outline'}
                                onClick={() => setFormat('excel')}
                                disabled={exporting}
                            >
                                Excel (.xlsx)
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={format === 'pdf' ? 'default' : 'outline'}
                                onClick={() => setFormat('pdf')}
                                disabled={exporting}
                            >
                                PDF
                            </Button>
                        </div>
                    </div>

                    {/* Jenis paket: fisik vs konsultan */}
                    <div className="space-y-2">
                        <Label>Jenis paket</Label>
                        <div className="flex flex-wrap gap-2">
                            {(
                                [
                                    ['all', 'Semua'],
                                    ['fisik', 'Fisik saja'],
                                    ['konsultan', 'Konsultan saja'],
                                ] as const
                            ).map(([value, label]) => (
                                <Button
                                    key={value}
                                    type="button"
                                    size="sm"
                                    variant={konsultanScope === value ? 'default' : 'outline'}
                                    onClick={() => setKonsultanScope(value)}
                                    disabled={exporting}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {KONSULTAN_SCOPE_LABEL[konsultanScope]}. Paket konsultan biasanya tanpa
                            desa/kecamatan dan dikecualikan dari progress fisik.
                        </p>
                    </div>

                    {/* Sub kegiatan scope */}
                    <div className="space-y-2">
                        <Label>Sub kegiatan</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={kegiatanScope === 'all' ? 'default' : 'outline'}
                                onClick={() => {
                                    setKegiatanScope('all')
                                    setSelectedKegiatanIds(kegiatanOptions.map((k) => k.id))
                                }}
                                disabled={exporting}
                            >
                                Semua sub kegiatan
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={kegiatanScope === 'selected' ? 'default' : 'outline'}
                                onClick={() => setKegiatanScope('selected')}
                                disabled={exporting || kegiatanOptions.length === 0}
                            >
                                Pilih beberapa
                            </Button>
                        </div>

                        {kegiatanScope === 'selected' && (
                            <div className="space-y-2 rounded-md border p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs text-muted-foreground">
                                        {selectedKegiatanIds.length}/{kegiatanOptions.length} dipilih
                                    </p>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs"
                                            disabled={exporting || allKegiatanSelected}
                                            onClick={() =>
                                                setSelectedKegiatanIds(kegiatanOptions.map((k) => k.id))
                                            }
                                        >
                                            Semua
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs"
                                            disabled={exporting || noneKegiatanSelected}
                                            onClick={() => setSelectedKegiatanIds([])}
                                        >
                                            Kosongkan
                                        </Button>
                                    </div>
                                </div>
                                <Input
                                    placeholder="Cari sub kegiatan…"
                                    value={kegiatanSearch}
                                    onChange={(e) => setKegiatanSearch(e.target.value)}
                                    disabled={exporting}
                                    className="h-8"
                                />
                                <div className="max-h-40 space-y-1 overflow-y-auto">
                                    {filteredKegiatanOptions.length === 0 ? (
                                        <p className="py-4 text-center text-xs text-muted-foreground">
                                            Tidak ada sub kegiatan
                                        </p>
                                    ) : (
                                        filteredKegiatanOptions.map((keg) => {
                                            const id = `export-keg-${keg.id}`
                                            const checked = selectedKegiatanSet.has(keg.id)
                                            return (
                                                <label
                                                    key={keg.id}
                                                    htmlFor={id}
                                                    className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1.5 text-sm hover:bg-muted/60"
                                                >
                                                    <Checkbox
                                                        id={id}
                                                        className="mt-0.5"
                                                        checked={checked}
                                                        disabled={exporting}
                                                        onCheckedChange={(value) =>
                                                            toggleKegiatan(keg.id, value === true)
                                                        }
                                                    />
                                                    <span className="leading-snug">{keg.label}</span>
                                                </label>
                                            )
                                        })
                                    )}
                                </div>
                                {kegiatanSelectionInvalid && (
                                    <p className="text-xs text-destructive">
                                        Pilih minimal satu sub kegiatan.
                                    </p>
                                )}
                            </div>
                        )}

                        {kegiatanScope === 'all' && (
                            <p className="text-xs text-muted-foreground">
                                Semua sub kegiatan tahun anggaran aktif akan diekspor
                                {kegiatanOptions.length > 0
                                    ? ` (${kegiatanOptions.length} sub kegiatan).`
                                    : '.'}
                            </p>
                        )}
                    </div>

                    {/* Grouping */}
                    <label className="flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm hover:bg-muted/40">
                        <Checkbox
                            checked={groupBySubKegiatan}
                            disabled={exporting}
                            onCheckedChange={(v) => setGroupBySubKegiatan(v === true)}
                            className="mt-0.5"
                        />
                        <span>
                            <span className="font-medium">Pisah per sub kegiatan</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                {format === 'excel'
                                    ? 'Excel: sheet Ringkasan + 1 sheet per sub kegiatan'
                                    : 'PDF: 1 halaman/section per sub kegiatan'}
                            </span>
                        </span>
                    </label>

                    {/* Columns */}
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Label>
                                Kolom ({selectedIds.length}/{PEKERJAAN_EXPORT_COLUMNS.length})
                            </Label>
                            <div className="flex flex-wrap gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() =>
                                        setSelectedIds(PEKERJAAN_EXPORT_COLUMNS.map((c) => c.id))
                                    }
                                    disabled={exporting || allColumnsSelected}
                                >
                                    Semua
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => setSelectedIds([...DEFAULT_EXPORT_COLUMN_IDS])}
                                    disabled={exporting}
                                >
                                    Default
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => setSelectedIds([])}
                                    disabled={exporting || noneColumnsSelected}
                                >
                                    Kosongkan
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto rounded-md border p-3">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {PEKERJAAN_EXPORT_COLUMNS.map((col) => {
                                    const checked = selectedSet.has(col.id)
                                    const id = `export-col-${col.id}`
                                    return (
                                        <label
                                            key={col.id}
                                            htmlFor={id}
                                            className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm hover:bg-muted/60"
                                        >
                                            <Checkbox
                                                id={id}
                                                checked={checked}
                                                disabled={exporting}
                                                onCheckedChange={(value) =>
                                                    toggleColumn(col.id, value === true)
                                                }
                                            />
                                            <span>{col.label}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>

                        {noneColumnsSelected && (
                            <p className="text-xs text-destructive">Pilih minimal satu kolom.</p>
                        )}
                        {format === 'pdf' && (
                            <p className="text-xs text-muted-foreground">
                                PDF A4 landscape: margin cetak 12&nbsp;mm, tabel mengisi penuh lebar
                                konten; font menyesuaikan jumlah kolom
                                {selectedIds.length > 10 ? ' (kolom banyak → font lebih rapat)' : ''}.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="shrink-0 gap-2 border-t pt-3 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={exporting}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={() => void handleExport()}
                        disabled={exporting || noneColumnsSelected || kegiatanSelectionInvalid}
                    >
                        {exporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileDown className="mr-2 h-4 w-4" />
                        )}
                        Ekspor {format === 'excel' ? 'Excel' : 'PDF'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
