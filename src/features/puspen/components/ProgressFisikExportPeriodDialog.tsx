import { useEffect, useMemo, useState } from 'react'
import { CalendarRange, FileDown, FileSpreadsheet, Loader2 } from 'lucide-react'
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
import {
    monthRange,
    toIsoDate,
    weekRange,
    type ExportOptions,
} from '../utils/export-shared'

type ExportFormat = 'pdf' | 'excel'

interface ProgressFisikExportPeriodDialogProps {
    open: boolean
    format: ExportFormat | null
    loading?: boolean
    /** Daftar nama sub kegiatan yang tersedia */
    subKegiatanOptions: string[]
    onOpenChange: (open: boolean) => void
    onConfirm: (options: ExportOptions) => void
}

export function ProgressFisikExportPeriodDialog({
    open,
    format,
    loading = false,
    subKegiatanOptions,
    onOpenChange,
    onConfirm,
}: ProgressFisikExportPeriodDialogProps) {
    const today = useMemo(() => toIsoDate(new Date()), [])
    const defaultMonth = useMemo(() => monthRange(), [])
    const [startDate, setStartDate] = useState(defaultMonth.start)
    const [endDate, setEndDate] = useState(defaultMonth.end)
    const [selectedSub, setSelectedSub] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return
        const range = monthRange()
        setStartDate(range.start)
        setEndDate(range.end)
        // Default: pilih semua sub kegiatan
        setSelectedSub([...subKegiatanOptions])
        setError(null)
    }, [open, format, subKegiatanOptions])

    const allSelected =
        subKegiatanOptions.length > 0 && selectedSub.length === subKegiatanOptions.length

    const applyQuick = (kind: 'mingguan' | 'bulanan' | 'hari-ini') => {
        if (kind === 'hari-ini') {
            setStartDate(today)
            setEndDate(today)
            setError(null)
            return
        }
        if (kind === 'mingguan') {
            const range = weekRange()
            setStartDate(range.start)
            setEndDate(range.end)
            setError(null)
            return
        }
        const range = monthRange()
        setStartDate(range.start)
        setEndDate(range.end)
        setError(null)
    }

    const toggleSub = (name: string, checked: boolean) => {
        setSelectedSub((prev) => {
            if (checked) {
                if (prev.includes(name)) return prev
                // Pertahankan urutan opsi
                return subKegiatanOptions.filter(
                    (opt) => opt === name || prev.includes(opt),
                )
            }
            return prev.filter((s) => s !== name)
        })
        setError(null)
    }

    const selectAll = () => {
        setSelectedSub([...subKegiatanOptions])
        setError(null)
    }

    const clearAll = () => {
        setSelectedSub([])
        setError(null)
    }

    const handleConfirm = () => {
        if (!startDate || !endDate) {
            setError('Tanggal mulai dan selesai wajib diisi.')
            return
        }
        if (startDate > endDate) {
            setError('Tanggal mulai tidak boleh setelah tanggal selesai.')
            return
        }
        if (selectedSub.length === 0) {
            setError('Pilih minimal satu sub kegiatan untuk diexport.')
            return
        }
        setError(null)
        onConfirm({
            period: { startDate, endDate },
            subKegiatan: selectedSub,
        })
    }

    const formatLabel = format === 'pdf' ? 'PDF' : format === 'excel' ? 'Excel' : 'Laporan'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarRange className="h-5 w-5" />
                        Export Laporan {formatLabel}
                    </DialogTitle>
                    <DialogDescription>
                        Pilih periode dan sub kegiatan. Laporan disusun rekap dulu, lalu detail
                        per sub kegiatan yang dipilih.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-1">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Periode laporan</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={loading}
                                onClick={() => applyQuick('hari-ini')}
                            >
                                Hari ini
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={loading}
                                onClick={() => applyQuick('mingguan')}
                            >
                                Mingguan
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={loading}
                                onClick={() => applyQuick('bulanan')}
                            >
                                Bulanan
                            </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="export-period-start">Dari tanggal</Label>
                                <Input
                                    id="export-period-start"
                                    type="date"
                                    value={startDate}
                                    max={endDate || undefined}
                                    disabled={loading}
                                    onChange={(e) => {
                                        setStartDate(e.target.value)
                                        setError(null)
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="export-period-end">Sampai tanggal</Label>
                                <Input
                                    id="export-period-end"
                                    type="date"
                                    value={endDate}
                                    min={startDate || undefined}
                                    disabled={loading}
                                    onChange={(e) => {
                                        setEndDate(e.target.value)
                                        setError(null)
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Label className="text-sm font-semibold">
                                Sub kegiatan ({selectedSub.length}/{subKegiatanOptions.length})
                            </Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    disabled={loading || allSelected || subKegiatanOptions.length === 0}
                                    onClick={selectAll}
                                >
                                    Pilih semua
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    disabled={loading || selectedSub.length === 0}
                                    onClick={clearAll}
                                >
                                    Kosongkan
                                </Button>
                            </div>
                        </div>

                        {subKegiatanOptions.length === 0 ? (
                            <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
                                Belum ada sub kegiatan pada data tahun ini.
                            </p>
                        ) : (
                            <div className="max-h-52 space-y-2 overflow-y-auto rounded-md border p-3">
                                {subKegiatanOptions.map((name) => {
                                    const checked = selectedSub.includes(name)
                                    const id = `export-sub-${name.replace(/\s+/g, '-')}`
                                    return (
                                        <div key={name} className="flex items-start gap-2">
                                            <Checkbox
                                                id={id}
                                                checked={checked}
                                                disabled={loading}
                                                onCheckedChange={(value) =>
                                                    toggleSub(name, value === true)
                                                }
                                            />
                                            <Label
                                                htmlFor={id}
                                                className="cursor-pointer text-sm font-normal leading-snug"
                                            >
                                                {name}
                                            </Label>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            PDF: 1 halaman rekap + halaman detail per sub kegiatan. Excel: sheet
                            rekap + 1 sheet per sub kegiatan.
                        </p>
                    </div>

                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button type="button" disabled={loading} onClick={handleConfirm}>
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : format === 'pdf' ? (
                            <FileDown className="mr-2 h-4 w-4" />
                        ) : (
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                        )}
                        Export {formatLabel}
                        {selectedSub.length > 0 ? ` (${selectedSub.length})` : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
