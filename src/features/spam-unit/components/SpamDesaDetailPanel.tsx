import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
    Building2,
    Camera,
    ExternalLink,
    Loader2,
    RefreshCw,
    Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { SpamDesaIntegration } from '../types'
import { useSpamIntegrationByDesa } from '../hooks/useSpamIntegration'
import { getManualCompareLabel } from '../lib/manual-scope'
import { SpamCompareCard } from './SpamCompareCard'
import { SpamSyncDialog } from './SpamSyncDialog'

interface SpamDesaDetailPanelProps {
    row: SpamDesaIntegration | null
    tahun?: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

export function SpamDesaDetailPanel({
    row,
    tahun,
    open,
    onOpenChange,
}: SpamDesaDetailPanelProps) {
    const [syncOpen, setSyncOpen] = useState(false)

    const { data: detailData, isLoading } = useSpamIntegrationByDesa(
        row?.desa.id ?? 0,
        tahun,
        open && !!row
    )

    const detail = detailData?.data ?? row

    if (!row) return null

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>{detail?.desa.n_desa}</SheetTitle>
                        <SheetDescription>
                            {detail?.desa.kecamatan.n_kec}
                            {tahun ? ` • Tahun ${tahun}` : ''}
                            {detail?.desa.target ? ` • Target ${detail.desa.target.toLocaleString('id-ID')}` : ''}
                        </SheetDescription>
                    </SheetHeader>

                    {isLoading && !detail ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : detail ? (
                        <div className="space-y-6 px-4 pb-6">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">{detail.unit_count} Unit SPAM</Badge>
                                <Badge variant="outline">{detail.pekerjaan_count} Pekerjaan AM</Badge>
                                {detail.desa.bjp_master !== undefined && (
                                    <Badge variant="outline">BJP Master: {detail.desa.bjp_master}</Badge>
                                )}
                                {detail.units.length > 0 && detail.pekerjaan.length > 0 && (
                                    <Button size="sm" variant="outline" onClick={() => setSyncOpen(true)}>
                                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                        Sinkronisasi
                                    </Button>
                                )}
                            </div>

                            <SpamCompareCard
                                derived={detail.derived}
                                manual={detail.manual}
                                manualLabel={getManualCompareLabel(tahun)}
                            />

                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-sm font-semibold">
                                    <Building2 className="h-4 w-4" />
                                    Unit SPAM ({detail.units.length})
                                </h4>
                                {detail.units.length > 0 ? (
                                    <div className="space-y-2">
                                        {detail.units.map((unit) => (
                                            <div
                                                key={unit.id}
                                                className="rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-medium">
                                                            {unit.name || `Unit #${unit.id}`}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {unit.sistem_layanan || 'Sistem belum diisi'}
                                                        </p>
                                                    </div>
                                                    {unit.is_simspam && (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600">
                                                            SIMSPAM
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    POKMAS: {unit.pokmas || '-'} • Kepala: {unit.kepala || '-'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada unit SPAM terdaftar di desa ini.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-sm font-semibold">
                                    <Users className="h-4 w-4" />
                                    Pekerjaan Air Minum ({detail.pekerjaan.length})
                                </h4>
                                {detail.pekerjaan.length > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Paket</TableHead>
                                                    <TableHead className="text-center">Progress</TableHead>
                                                    <TableHead className="text-center">SR/KK</TableHead>
                                                    <TableHead className="text-right">Kontrak</TableHead>
                                                    <TableHead className="w-[50px]" />
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {detail.pekerjaan.map((pkj) => (
                                                    <TableRow key={pkj.id}>
                                                        <TableCell>
                                                            <p className="text-sm font-medium">{pkj.nama_paket}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {pkj.tahun_anggaran} • {pkj.sumber_dana}
                                                            </p>
                                                            <div className="mt-1 flex gap-2 text-[10px] text-muted-foreground">
                                                                <span className="flex items-center gap-0.5">
                                                                    <Users className="h-3 w-3" />
                                                                    {pkj.penerima_count}
                                                                </span>
                                                                <span className="flex items-center gap-0.5">
                                                                    <Camera className="h-3 w-3" />
                                                                    {pkj.foto_count}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="text-sm font-semibold">
                                                                {pkj.progress_total}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center text-xs">
                                                            {pkj.sr} SR / {pkj.kk} KK
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs font-medium text-emerald-600">
                                                            {formatCurrency(pkj.nilai_kontrak)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Link
                                                                to="/pekerjaan/$id"
                                                                params={{ id: pkj.id.toString() }}
                                                            >
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada pekerjaan air minum di desa ini.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>

            {detail && (
                <SpamSyncDialog
                    open={syncOpen}
                    onOpenChange={setSyncOpen}
                    units={detail.units}
                    defaultTahun={tahun}
                    desaName={detail.desa.n_desa}
                />
            )}
        </>
    )
}