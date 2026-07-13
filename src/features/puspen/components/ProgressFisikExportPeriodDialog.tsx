import { useEffect, useMemo, useState } from 'react'
import { CalendarRange, FileDown, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    type ExportPeriod,
} from '../utils/export-shared'

type ExportFormat = 'pdf' | 'excel'

interface ProgressFisikExportPeriodDialogProps {
    open: boolean
    format: ExportFormat | null
    loading?: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (period: ExportPeriod) => void
}

export function ProgressFisikExportPeriodDialog({
    open,
    format,
    loading = false,
    onOpenChange,
    onConfirm,
}: ProgressFisikExportPeriodDialogProps) {
    const today = useMemo(() => toIsoDate(new Date()), [])
    const defaultMonth = useMemo(() => monthRange(), [])
    const [startDate, setStartDate] = useState(defaultMonth.start)
    const [endDate, setEndDate] = useState(defaultMonth.end)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return
        const range = monthRange()
        setStartDate(range.start)
        setEndDate(range.end)
        setError(null)
    }, [open, format])

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

    const handleConfirm = () => {
        if (!startDate || !endDate) {
            setError('Tanggal mulai dan selesai wajib diisi.')
            return
        }
        if (startDate > endDate) {
            setError('Tanggal mulai tidak boleh setelah tanggal selesai.')
            return
        }
        setError(null)
        onConfirm({ startDate, endDate })
    }

    const formatLabel = format === 'pdf' ? 'PDF' : format === 'excel' ? 'Excel' : 'Laporan'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarRange className="h-5 w-5" />
                        Periode Laporan {formatLabel}
                    </DialogTitle>
                    <DialogDescription>
                        Pilih rentang waktu laporan progress fisik. Periode ini ditampilkan di
                        header PDF/Excel. Opsi cepat mengisi rentang otomatis.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
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

                    {error ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Halaman pertama laporan menampilkan rekap progress fisik per sub
                            kegiatan (pagu, nilai kontrak, sisa, retensi 5%). PHO ditampilkan
                            sebagai Sudah / Belum.
                        </p>
                    )}
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
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
