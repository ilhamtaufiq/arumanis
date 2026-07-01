import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { IntegrationUnit, SyncMode } from '../types'
import { useSpamSync } from '../hooks/useSpamSync'

const TAHUN_OPTIONS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020']

interface SpamSyncDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    units: IntegrationUnit[]
    defaultTahun?: string
    desaName?: string
    onSynced?: (tahun: string) => void
}

export function SpamSyncDialog({
    open,
    onOpenChange,
    units,
    defaultTahun = '',
    desaName,
    onSynced,
}: SpamSyncDialogProps) {
    const syncMutation = useSpamSync()
    const [selectedUnitId, setSelectedUnitId] = useState<string>('')
    const [tahun, setTahun] = useState(defaultTahun || '2026')
    const [mode, setMode] = useState<SyncMode>('all')

    useEffect(() => {
        if (open) {
            setSelectedUnitId(units.length === 1 ? String(units[0].id) : '')
            setTahun(defaultTahun || '2026')
            setMode('all')
        }
    }, [open, units, defaultTahun])

    const handleSync = () => {
        if (!selectedUnitId) return
        syncMutation.mutate(
            {
                unitSpamId: Number(selectedUnitId),
                data: { tahun, mode },
            },
            {
                onSuccess: () => {
                    onSynced?.(tahun)
                    onOpenChange(false)
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Sinkronisasi dari Pekerjaan</DialogTitle>
                    <DialogDescription>
                        Salin capaian dan anggaran dari pekerjaan air minum ke unit SPAM
                        {desaName ? ` di Desa ${desaName}` : ''}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Unit SPAM</Label>
                        <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih unit SPAM" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((unit) => (
                                    <SelectItem key={unit.id} value={String(unit.id)}>
                                        {unit.name || `Unit #${unit.id}`}
                                        {unit.is_simspam ? ' (SIMSPAM)' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {units.length === 0 && (
                            <p className="text-xs text-destructive">
                                Tidak ada unit SPAM di desa ini. Tambahkan unit terlebih dahulu.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Tahun</Label>
                        <Select value={tahun} onValueChange={setTahun}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {TAHUN_OPTIONS.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        Tahun {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Mode Sinkronisasi</Label>
                        <Select value={mode} onValueChange={(val) => setMode(val as SyncMode)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua (Capaian + Anggaran)</SelectItem>
                                <SelectItem value="achievement">Capaian Saja (SR/KK/Jiwa)</SelectItem>
                                <SelectItem value="budget">Anggaran Saja</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleSync}
                        disabled={!selectedUnitId || syncMutation.isPending || units.length === 0}
                    >
                        {syncMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Sinkronkan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}