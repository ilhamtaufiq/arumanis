import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
    Building2,
    Camera,
    ExternalLink,
    Link2,
    Loader2,
    Plus,
    Users,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
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
import type { IntegrationUnit, SpamDesaIntegration } from '../types'
import { getSpamIntegrationByDesa } from '../api'
import { getManualCompareLabel } from '../lib/manual-scope'

import { SpamCompareCard } from './SpamCompareCard'
import { SpamCreateUnitDialog } from './SpamCreateUnitDialog'
import { SpamTagPekerjaanDialog } from './SpamTagPekerjaanDialog'

const SYNC_STATUS_LABEL: Record<string, string> = {
    matched: 'Terintegrasi',
    partial: 'Partial',
    no_unit: 'Tanpa Unit',
    no_pekerjaan: 'Tanpa Paket Pekerjaan',
    no_data: 'Tanpa Data',
}

interface SpamDesaDetailPanelProps {
    row: SpamDesaIntegration | null
    tahun?: string
    komponen?: string
    open: boolean
    onOpenChange: (open: boolean) => void
    initialAction?: 'create-unit' | null
    onInitialActionHandled?: () => void
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
    komponen,
    open,
    onOpenChange,
    initialAction,
    onInitialActionHandled,
}: SpamDesaDetailPanelProps) {
    const [tagUnit, setTagUnit] = useState<IntegrationUnit | null>(null)
    const [tagOpen, setTagOpen] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)

    const { data: detailData, isLoading } = useQuery({
        queryKey: ['spam-integration-desa', row?.desa.id, tahun, komponen],
        queryFn: () =>
            getSpamIntegrationByDesa(row!.desa.id, {
                tahun,
                komponen,
            }),
        enabled: open && !!row?.desa.id,
    })

    const detail = detailData?.data ?? row
    const canCreateUnit =
        !!row &&
        (detail?.units.length ?? 0) === 0 &&
        (detail?.pekerjaan_count ?? 0) > 0

    useEffect(() => {
        if (!open || !row || initialAction !== 'create-unit' || !canCreateUnit) return
        setCreateOpen(true)
        onInitialActionHandled?.()
    }, [open, row, initialAction, canCreateUnit, onInitialActionHandled])

    if (!row) return null

    const handleTagUnit = (unit: IntegrationUnit) => {
        setTagUnit(unit)
        setTagOpen(true)
    }

    const handleUnitCreated = (unit: IntegrationUnit) => {
        handleTagUnit(unit)
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>{detail?.desa.n_desa}</SheetTitle>
                        <SheetDescription>
                            {detail?.desa.kecamatan.n_kec}
                            {tahun ? ` • Tahun ${tahun}` : ''}
                            {komponen ? ` • Output ${komponen}` : ''}
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
                                <Badge variant="outline">{detail.pekerjaan_count} Paket Pekerjaan</Badge>
                                <Badge variant="outline">{detail.linked_count ?? 0} Tertaut</Badge>
                                <Badge variant="secondary">
                                    {SYNC_STATUS_LABEL[detail.sync_status] ?? detail.sync_status}
                                </Badge>
                            </div>

                            <SpamCompareCard
                                derived={detail.derived}
                                manual={detail.manual}
                                manualIntegrasi={detail.manual_integrasi}
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
                                                className="flex items-start justify-between gap-2 rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {unit.name || `Unit #${unit.id}`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {unit.sistem_layanan || 'Sistem belum diisi'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        POKMAS: {unit.pokmas || '-'} • Kepala: {unit.kepala || '-'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {unit.linked_pekerjaan_count ?? 0} pekerjaan tertaut
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {unit.is_simspam && (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600">
                                                            SIMSPAM
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleTagUnit(unit)}
                                                    >
                                                        <Link2 className="mr-1 h-3 w-3" />
                                                        Tautkan
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : canCreateUnit ? (
                                    <div className="rounded-lg border border-dashed border-orange-300/60 bg-orange-50/40 p-4 dark:bg-orange-950/20">
                                        <p className="text-sm text-muted-foreground">
                                            Ada {detail.pekerjaan_count} paket pekerjaan air minum,
                                            tetapi belum ada unit SPAM / POKMAS di desa ini.
                                        </p>
                                        <Button
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => setCreateOpen(true)}
                                        >
                                            <Plus className="mr-1 h-3.5 w-3.5" />
                                            Buat Unit SPAM
                                        </Button>
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
                                    Paket Pekerjaan Air Minum ({detail.pekerjaan.length})
                                </h4>
                                {detail.pekerjaan.length > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Paket</TableHead>
                                                    <TableHead>Output</TableHead>
                                                    <TableHead className="text-center">Progress</TableHead>
                                                    <TableHead className="text-center">Capaian</TableHead>
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
                                                                {pkj.is_linked && (
                                                                    <Badge variant="secondary" className="text-[10px]">
                                                                        Tertaut
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(pkj.air_minum_outputs ?? []).slice(0, 2).map((o) => (
                                                                    <Badge
                                                                        key={o.id}
                                                                        variant="outline"
                                                                        className="text-[10px]"
                                                                    >
                                                                        {o.komponen}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="text-sm font-semibold">
                                                                {pkj.progress_total}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center text-xs">
                                                            {pkj.capaian_metric === 'bjp' || (pkj.bjp_kk ?? 0) > 0
                                                                ? `${pkj.bjp_kk ?? pkj.kk ?? 0} BJP KK`
                                                                : `${pkj.sr} SR / ${pkj.kk} KK`}
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
                                        Belum ada pekerjaan air minum dengan output terintegrasi di desa ini.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>

            <SpamCreateUnitDialog
                desaId={row.desa.id}
                desaName={row.desa.n_desa}
                kecamatanName={row.desa.kecamatan.n_kec}
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={handleUnitCreated}
            />

            <SpamTagPekerjaanDialog
                unit={tagUnit}
                open={tagOpen}
                onOpenChange={setTagOpen}
            />
        </>
    )
}