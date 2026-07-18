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
}

type Format = 'excel' | 'pdf'
type KegiatanScope = 'all' | 'selected'

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

function applyPdfTableStyles(
    columns: ReturnType<typeof getExportColumnsByIds>,
) {
    const narrow = columns.length > 8
    return {
        theme: 'grid' as const,
        headStyles: {
            fillColor: [59, 130, 246] as [number, number, number],
            textColor: 255,
            fontStyle: 'bold' as const,
            halign: 'center' as const,
            fontSize: narrow ? 7 : 8,
        },
        styles: {
            fontSize: narrow ? 6.5 : 8,
            cellPadding: narrow ? 1.5 : 2,
            overflow: 'linebreak' as const,
        },
        columnStyles: Object.fromEntries(
            columns.map((col, i) => [
                i,
                {
                    cellWidth: col.pdfWidth,
                    halign:
                        col.id === 'no'
                            ? ('center' as const)
                            : col.id === 'pagu'
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
    const [groupBySubKegiatan, setGroupBySubKegiatan] = useState(true)
    const [kegiatanSearch, setKegiatanSearch] = useState('')
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        if (!open) return
        setSelectedIds(loadSavedColumnIds())
        setKegiatanSearch('')
        setGroupBySubKegiatan(true)

        if (filters.kegiatanId) {
            setKegiatanScope('selected')
            setSelectedKegiatanIds([filters.kegiatanId])
        } else {
            setKegiatanScope('all')
            setSelectedKegiatanIds(kegiatanOptions.map((k) => k.id))
        }
        // Only re-seed when dialog opens (or list filter kegiatan changes while closed→open)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid resetting selection when options array identity changes mid-open
    }, [open, filters.kegiatanId])

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
            toast.loading('Mengambil data pekerjaan…')

            // Fetch without list kegiatan filter — dialog controls sub kegiatan selection
            const response = await getPekerjaan({
                per_page: -1,
                kecamatan_id: filters.kecamatanId,
                tag_id: filters.tagId,
                pengawas_id: filters.pengawasId,
                search: filters.search || undefined,
                tahun: filters.tahun,
            })
            toast.dismiss()

            let allData: Pekerjaan[] = response.data ?? []

            if (kegiatanScope === 'selected') {
                const allow = new Set(selectedKegiatanIds)
                allData = allData.filter((item) => {
                    const id = item.kegiatan_id ?? item.kegiatan?.id
                    return id != null && allow.has(id)
                })
            }

            if (allData.length === 0) {
                toast.error('Tidak ada data untuk diekspor (periksa filter / sub kegiatan)')
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

                XLSX.writeFile(workbook, `Daftar_Pekerjaan_${dateStamp}.xlsx`)
                toast.success(
                    groupBySubKegiatan
                        ? `Excel diunduh: ${groups.length} sub kegiatan, ${allData.length} paket`
                        : `Excel diunduh: ${allData.length} paket`,
                )
            } else {
                const doc = new jsPDF('landscape')
                const timestamp = new Date().toLocaleString('id-ID')
                const tableStyles = applyPdfTableStyles(columns)
                const pageWidth = doc.internal.pageSize.getWidth()
                const centerX = pageWidth / 2

                groups.forEach((group, groupIndex) => {
                    if (groupIndex > 0) {
                        doc.addPage()
                    }

                    doc.setFontSize(14)
                    doc.setFont('helvetica', 'bold')
                    doc.text('DAFTAR PEKERJAAN', centerX, 15, { align: 'center' })

                    doc.setFontSize(10)
                    doc.setFont('helvetica', 'normal')
                    doc.text(
                        `Tahun Anggaran: ${filters.tahun ?? '-'} | Tanggal Cetak: ${timestamp}`,
                        centerX,
                        22,
                        { align: 'center' },
                    )

                    let startY = 28
                    if (groupBySubKegiatan) {
                        doc.setFont('helvetica', 'bold')
                        doc.setFontSize(11)
                        const title = `Sub Kegiatan: ${group.label}`
                        const wrapped = doc.splitTextToSize(title, pageWidth - 28)
                        doc.text(wrapped, 14, startY)
                        startY += Math.max(8, wrapped.length * 5 + 2)
                        doc.setFont('helvetica', 'normal')
                        doc.setFontSize(9)
                        doc.text(
                            `Jumlah paket: ${group.items.length} | Halaman ${groupIndex + 1}/${groups.length}`,
                            14,
                            startY,
                        )
                        startY += 6
                    } else {
                        const filterLine = (filters.filterLabels ?? []).filter(Boolean).join(' | ')
                        if (filterLine) {
                            doc.text(filterLine, centerX, 28, { align: 'center' })
                            startY = 34
                        }
                    }

                    const { head, body } = buildPdfTable(group.items, columns)
                    autoTable(doc, {
                        startY,
                        head,
                        body,
                        ...tableStyles,
                    })
                })

                doc.save(`Daftar_Pekerjaan_${dateStamp}.pdf`)
                toast.success(
                    groupBySubKegiatan
                        ? `PDF diunduh: ${groups.length} sub kegiatan, ${allData.length} paket`
                        : `PDF diunduh: ${allData.length} paket`,
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
                        Pilih format, sub kegiatan, dan kolom. Output bisa dipisah per sub kegiatan.
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
                        {format === 'pdf' && selectedIds.length > 10 && (
                            <p className="text-xs text-muted-foreground">
                                Banyak kolom di PDF memakai font lebih kecil (landscape).
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
