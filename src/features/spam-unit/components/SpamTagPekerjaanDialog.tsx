import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link2, Loader2, Search, Unlink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    attachSpamPekerjaan,
    detachSpamPekerjaan,
    getSpamAirMinumPekerjaan,
    getSpamUnit,
} from '../api'
import {
    CAPAIAN_METRIC_LABEL,
    getOutputFilterLabel,
    INTEGRASI_OUTPUT_SUMMARY,
    OUTPUT_FILTER_OPTIONS,
    suggestCapaianMetric,
    type SpamAirMinumOutputType,
    type SpamCapaianMetric,
} from '../lib/output-labels'
import { spamIntegrationKeys } from '../hooks/useSpamIntegration'
import { getBaselinePolicyLabel } from '../lib/baseline'
import type { IntegrationUnit, UnitSpam } from '../types'

function formatCurrency(value?: number | null) {
    if (value == null || value <= 0) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

interface SpamTagPekerjaanDialogProps {
    unit: IntegrationUnit | UnitSpam | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SpamTagPekerjaanDialog({
    unit,
    open,
    onOpenChange,
}: SpamTagPekerjaanDialogProps) {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [outputType, setOutputType] = useState<SpamAirMinumOutputType | ''>('')
    const [page, setPage] = useState(1)
    const [metricByPekerjaan, setMetricByPekerjaan] = useState<Record<number, SpamCapaianMetric>>({})

    const { data: detailData } = useQuery({
        queryKey: ['spam-unit-detail', unit?.id],
        queryFn: () => getSpamUnit(unit!.id),
        enabled: open && !!unit?.id,
    })

    const { data: pekerjaanData, isLoading } = useQuery({
        queryKey: ['spam-air-minum-pekerjaan', unit?.id, search, outputType, page],
        queryFn: () =>
            getSpamAirMinumPekerjaan({
                unit_spam_id: unit!.id,
                search: search || undefined,
                output_type: outputType || undefined,
                page,
                per_page: 10,
            }),
        enabled: open && !!unit?.id,
    })

    const rows = pekerjaanData?.data ?? []

    useEffect(() => {
        if (rows.length === 0) return
        setMetricByPekerjaan((prev) => {
            const next = { ...prev }
            for (const row of rows) {
                if (!next[row.id]) {
                    next[row.id] = suggestCapaianMetric(row.air_minum_outputs ?? [])
                }
            }
            return next
        })
    }, [rows])

    const linkedIds = new Set(
        (detailData?.data?.pekerjaan ?? []).map((p) => p.id)
    )

    const attachMutation = useMutation({
        mutationFn: ({
            pekerjaanId,
            outputId,
            capaianMetric,
        }: {
            pekerjaanId: number
            outputId?: number
            capaianMetric: SpamCapaianMetric
        }) =>
            attachSpamPekerjaan(unit!.id, {
                pekerjaan_id: pekerjaanId,
                output_id: outputId,
                capaian_metric: capaianMetric,
            }),
        onSuccess: (res) => {
            toast.success(res.message)
            queryClient.invalidateQueries({ queryKey: ['spam-units'] })
            queryClient.invalidateQueries({ queryKey: ['spam-unit-detail', unit?.id] })
            queryClient.invalidateQueries({ queryKey: ['spam-air-minum-pekerjaan'] })
            queryClient.invalidateQueries({ queryKey: spamIntegrationKeys.all })
            queryClient.invalidateQueries({ queryKey: ['spam-units-stats'] })
        },
        onError: () => toast.error('Gagal menautkan pekerjaan'),
    })

    const detachMutation = useMutation({
        mutationFn: (pekerjaanId: number) => detachSpamPekerjaan(unit!.id, pekerjaanId),
        onSuccess: (res) => {
            toast.success(res.message)
            queryClient.invalidateQueries({ queryKey: ['spam-units'] })
            queryClient.invalidateQueries({ queryKey: ['spam-unit-detail', unit?.id] })
            queryClient.invalidateQueries({ queryKey: ['spam-air-minum-pekerjaan'] })
            queryClient.invalidateQueries({ queryKey: spamIntegrationKeys.all })
            queryClient.invalidateQueries({ queryKey: ['spam-units-stats'] })
        },
        onError: () => toast.error('Gagal menghapus tautan'),
    })

    const meta = pekerjaanData?.meta
    const isPending = attachMutation.isPending || detachMutation.isPending
    const unitName = unit?.name || (unit ? `Unit #${unit.id}` : '')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Tautkan Paket Pekerjaan</DialogTitle>
                    <DialogDescription>
                        {unit
                            ? `${unitName} — Sub Bidang Air Minum (${INTEGRASI_OUTPUT_SUMMARY}). Sumur/Sumur Bor otomatis masuk BJP; jika tidak yakin, pilih BJP. ${getBaselinePolicyLabel()}`
                            : 'Pilih unit SPAM terlebih dahulu.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Cari nama paket..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setPage(1)
                            }}
                        />
                    </div>
                    <Select
                        value={outputType || 'all'}
                        onValueChange={(v) => {
                            setOutputType(v === 'all' ? '' : (v as SpamAirMinumOutputType))
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue placeholder="Filter output" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Output</SelectItem>
                            {OUTPUT_FILTER_OPTIONS.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {getOutputFilterLabel(type)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        Tidak ada paket pekerjaan air minum dengan output terintegrasi di desa ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pekerjaan</TableHead>
                                    <TableHead>Output</TableHead>
                                    <TableHead>Capaian</TableHead>
                                    <TableHead className="text-right">Estimasi</TableHead>
                                    <TableHead className="text-right">Pembiayaan</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => {
                                    const isLinked = linkedIds.has(row.id)
                                    const outputs = row.air_minum_outputs ?? []
                                    const primaryOutput = outputs[0]
                                    const capaianMetric =
                                        metricByPekerjaan[row.id] ??
                                        suggestCapaianMetric(outputs)
                                    const isBjp = capaianMetric === 'bjp'

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <div className="font-medium">{row.nama_paket}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.tahun_anggaran ?? '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {outputs.map((o) => (
                                                        <Badge key={o.id} variant="secondary" className="text-[10px]">
                                                            {o.komponen} ({o.volume} {o.satuan})
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {isLinked ? (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {row.capaian_metric === 'bjp' ? 'BJP' : 'JP'}
                                                    </Badge>
                                                ) : (
                                                    <Select
                                                        value={capaianMetric}
                                                        onValueChange={(value) =>
                                                            setMetricByPekerjaan((prev) => ({
                                                                ...prev,
                                                                [row.id]: value as SpamCapaianMetric,
                                                            }))
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 w-[170px] text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="jp">
                                                                {CAPAIAN_METRIC_LABEL.jp}
                                                            </SelectItem>
                                                            <SelectItem value="bjp">
                                                                {CAPAIAN_METRIC_LABEL.bjp}
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                                {isBjp
                                                    ? `${row.bjp_kk ?? row.penerima_count ?? row.kk ?? 0} BJP KK`
                                                    : `${row.sr} SR / ${row.kk} KK`}
                                            </TableCell>
                                            <TableCell className="text-right text-xs">
                                                {formatCurrency(
                                                    row.derived?.pembiayaan_suggested ?? row.nilai_kontrak
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isLinked ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={isPending}
                                                        onClick={() => detachMutation.mutate(row.id)}
                                                    >
                                                        <Unlink className="mr-1 h-3 w-3" />
                                                        Lepas
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        disabled={isPending}
                                                        onClick={() =>
                                                            attachMutation.mutate({
                                                                pekerjaanId: row.id,
                                                                outputId: primaryOutput?.id,
                                                                capaianMetric,
                                                            })
                                                        }
                                                    >
                                                        <Link2 className="mr-1 h-3 w-3" />
                                                        Tautkan
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Halaman {meta.current_page} dari {meta.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= meta.last_page}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Berikutnya
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}