import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Building2, ExternalLink, Link2, Loader2, Users } from 'lucide-react'
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
import { useSpmIntegrationByDesa } from '../hooks/useSpmIntegration'
import {
    collectSuggestedJenis,
    findPekerjaanForJenis,
} from '../lib/integration-helpers'
import { JENIS_LABEL } from '../lib/jenis-labels'
import { getOutputTypeLabel, INTEGRASI_OUTPUT_SUMMARY, type SpmSanitasiOutputType } from '../lib/output-labels'
import type {
    SpmDesaIntegration,
    SpmPaketPekerjaan,
    SpmSanitasi,
    SpmSanitasiJenis,
} from '../types'
import { SpmCompareCard } from './SpmCompareCard'

const SYNC_STATUS_LABEL: Record<string, string> = {
    matched: 'Terintegrasi',
    partial: 'Partial',
    no_infrastruktur: 'Tanpa Infrastruktur',
    no_pekerjaan: 'Tanpa Paket Pekerjaan',
    no_data: 'Tanpa Data',
}

interface SpmDesaDetailPanelProps {
    row: SpmDesaIntegration | null
    tahun?: string
    outputType?: SpmSanitasiOutputType
    open: boolean
    onOpenChange: (open: boolean) => void
    initialAction?: 'add-infrastruktur' | null
    onInitialActionHandled?: () => void
    onTagInfrastruktur?: (item: SpmSanitasi) => void
    onAddInfrastruktur?: (
        desaId: number,
        kecamatanId: number,
        suggestedJenis: SpmSanitasiJenis,
        fromPekerjaan?: SpmPaketPekerjaan
    ) => void
    /** Buat master infrastruktur + tautan pekerjaan otomatis dari output paket */
    onAutoCreateInfrastruktur?: (row: SpmDesaIntegration) => void
    isAutoCreating?: boolean
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

export function SpmDesaDetailPanel({
    row,
    tahun,
    outputType,
    open,
    onOpenChange,
    initialAction,
    onInitialActionHandled,
    onTagInfrastruktur,
    onAddInfrastruktur,
    onAutoCreateInfrastruktur,
    isAutoCreating = false,
}: SpmDesaDetailPanelProps) {
    const { data: detailData, isLoading } = useSpmIntegrationByDesa(
        row?.desa.id ?? 0,
        { tahun, output_type: outputType },
        open && !!row?.desa.id
    )

    const detail = detailData?.data ?? row

    const canAddInfrastruktur =
        !!detail &&
        detail.infrastruktur_count === 0 &&
        detail.pekerjaan_count > 0 &&
        collectSuggestedJenis(detail).length > 0

    useEffect(() => {
        if (!open || !row || initialAction !== 'add-infrastruktur' || !canAddInfrastruktur) return
        if (!detail) return

        // Prefer auto-create; fallback ke form manual
        if (onAutoCreateInfrastruktur) {
            onAutoCreateInfrastruktur(detail)
        } else if (onAddInfrastruktur) {
            const jenis = collectSuggestedJenis(detail)[0]
            onAddInfrastruktur(
                detail.desa.id,
                detail.desa.kecamatan.id,
                jenis,
                findPekerjaanForJenis(detail, jenis)
            )
        }
        onInitialActionHandled?.()
    }, [
        open,
        row,
        initialAction,
        canAddInfrastruktur,
        detail,
        onAddInfrastruktur,
        onAutoCreateInfrastruktur,
        onInitialActionHandled,
    ])

    if (!row) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>{detail?.desa.n_desa}</SheetTitle>
                    <SheetDescription>
                        {detail?.desa.kecamatan.n_kec}
                        {tahun ? ` • Tahun ${tahun}` : ''}
                        {outputType ? ` • Output ${getOutputTypeLabel(outputType)}` : ''}
                        {detail?.desa.jumlah_penduduk
                            ? ` • Penduduk ${detail.desa.jumlah_penduduk.toLocaleString('id-ID')}`
                            : ''}
                    </SheetDescription>
                </SheetHeader>

                {isLoading && !detail ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : detail ? (
                    <div className="space-y-6 px-4 pb-6">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{detail.infrastruktur_count} Infrastruktur</Badge>
                            <Badge variant="outline">{detail.pekerjaan_count} Paket Pekerjaan</Badge>
                            <Badge variant="outline">{detail.linked_count} Tertaut</Badge>
                            <Badge variant="secondary">
                                {SYNC_STATUS_LABEL[detail.sync_status] ?? detail.sync_status}
                            </Badge>
                        </div>

                        <SpmCompareCard
                            infrastrukturCount={detail.infrastruktur_count}
                            derived={detail.derived}
                            manual={detail.manual}
                        />

                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-semibold">
                                <Building2 className="h-4 w-4" />
                                Infrastruktur Sanitasi ({detail.infrastruktur.length})
                            </h4>
                            {detail.infrastruktur.length > 0 ? (
                                <div className="space-y-2">
                                    {detail.infrastruktur.map((infra) => (
                                        <div
                                            key={infra.id}
                                            className="flex items-start justify-between gap-2 rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50"
                                        >
                                            <div>
                                                <p className="font-medium">{infra.nama_infrastruktur}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {JENIS_LABEL[infra.jenis]} · {infra.jumlah_pemanfaat_kk} KK
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {infra.linked_pekerjaan_count} pekerjaan tertaut
                                                </p>
                                            </div>
                                            {onTagInfrastruktur && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        onTagInfrastruktur({
                                                            id: infra.id,
                                                            jenis: infra.jenis,
                                                            nama_infrastruktur: infra.nama_infrastruktur,
                                                            desa_id: detail.desa.id,
                                                        } as SpmSanitasi)
                                                    }
                                                >
                                                    <Link2 className="mr-1 h-3 w-3" />
                                                    Tautkan
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm">
                                    <p className="font-medium">Belum ada infrastruktur sanitasi di desa ini.</p>
                                    <p className="mt-2 text-muted-foreground">
                                        Integrasi membutuhkan data master infrastruktur di tab{' '}
                                        <strong>Infrastruktur & Capaian</strong> (SPALDT, SPALDS, MCK Individu,
                                        atau MCK Komunal) dengan <strong>Desa ID</strong> yang benar.
                                    </p>
                                    {detail.pekerjaan_count > 0 && (
                                        <p className="mt-2 text-muted-foreground">
                                            Desa ini punya {detail.pekerjaan_count} paket pekerjaan dengan output
                                            sanitasi, tetapi belum ada baris infrastruktur untuk ditautkan.
                                        </p>
                                    )}
                                    {collectSuggestedJenis(detail).length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="text-xs text-muted-foreground">Disarankan tambah:</span>
                                            {collectSuggestedJenis(detail).map((jenis) => (
                                                <Badge key={jenis} variant="secondary">
                                                    {JENIS_LABEL[jenis]}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {onAutoCreateInfrastruktur &&
                                            collectSuggestedJenis(detail).length > 0 && (
                                                <Button
                                                    size="sm"
                                                    disabled={isAutoCreating}
                                                    onClick={() => onAutoCreateInfrastruktur(detail)}
                                                >
                                                    {isAutoCreating ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : null}
                                                    Buat & tautkan otomatis
                                                </Button>
                                            )}
                                        {onAddInfrastruktur &&
                                            collectSuggestedJenis(detail).length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isAutoCreating}
                                                    onClick={() => {
                                                        const jenis = collectSuggestedJenis(detail)[0]
                                                        onAddInfrastruktur(
                                                            detail.desa.id,
                                                            detail.desa.kecamatan.id,
                                                            jenis,
                                                            findPekerjaanForJenis(detail, jenis)
                                                        )
                                                    }}
                                                >
                                                    Buat manual (form)
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-semibold">
                                <Users className="h-4 w-4" />
                                Paket Pekerjaan ({detail.pekerjaan.length})
                            </h4>
                            {detail.pekerjaan.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Paket</TableHead>
                                                <TableHead>Output</TableHead>
                                                <TableHead className="text-center">KK/Jiwa</TableHead>
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
                                                            {pkj.tahun_anggaran ?? '-'}
                                                        </p>
                                                        {pkj.is_linked && (
                                                            <Badge variant="outline" className="mt-1 text-[10px]">
                                                                Tertaut
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(pkj.sanitasi_outputs ?? pkj.mck_outputs).map((o) => (
                                                                <Badge
                                                                    key={o.id}
                                                                    variant="secondary"
                                                                    className="text-[10px]"
                                                                >
                                                                    {o.komponen}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-xs">
                                                        {pkj.derived.kk} KK / {pkj.derived.jiwa} jiwa
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs font-medium text-emerald-600">
                                                        {formatCurrency(pkj.derived.nilai_kontrak)}
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
                                    Belum ada paket pekerjaan dengan output {INTEGRASI_OUTPUT_SUMMARY} di desa ini.
                                </p>
                            )}
                        </div>
                    </div>
                ) : null}
            </SheetContent>
        </Sheet>
    )
}