import { useState } from 'react'
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
    attachSpmPekerjaan,
    detachSpmPekerjaan,
    getSpmMckPekerjaan,
    getSpmSanitasiById,
} from '../api'
import {
    getOutputFilterLabel,
    INTEGRASI_OUTPUT_SUMMARY,
    OUTPUT_FILTER_OPTIONS,
    type SpmSanitasiOutputType,
} from '../lib/output-labels'
import { JENIS_LABEL } from '../lib/jenis-labels'
import type { SpmSanitasi } from '../types'

function formatCurrency(value?: number | null) {
    if (value == null || value <= 0) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

interface SpmSanitasiTagPekerjaanDialogProps {
    spmItem: SpmSanitasi | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SpmSanitasiTagPekerjaanDialog({
    spmItem,
    open,
    onOpenChange,
}: SpmSanitasiTagPekerjaanDialogProps) {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [outputType, setOutputType] = useState<SpmSanitasiOutputType | ''>('')
    const [page, setPage] = useState(1)

    const { data: detailData } = useQuery({
        queryKey: ['spm-sanitasi-detail', spmItem?.id],
        queryFn: () => getSpmSanitasiById(spmItem!.id),
        enabled: open && !!spmItem?.id,
    })

    const { data: mckData, isLoading } = useQuery({
        queryKey: ['spm-mck-pekerjaan', spmItem?.id, search, outputType, page],
        queryFn: () =>
            getSpmMckPekerjaan({
                spm_sanitasi_id: spmItem!.id,
                search: search || undefined,
                output_type: outputType || undefined,
                page,
                per_page: 10,
            }),
        enabled: open && !!spmItem?.id,
    })

    const linkedIds = new Set(
        (detailData?.data?.pekerjaan ?? []).map((p) => p.id)
    )

    const attachMutation = useMutation({
        mutationFn: ({ pekerjaanId, outputId }: { pekerjaanId: number; outputId?: number }) =>
            attachSpmPekerjaan(spmItem!.id, { pekerjaan_id: pekerjaanId, output_id: outputId }),
        onSuccess: (res) => {
            toast.success(res.message)
            queryClient.invalidateQueries({ queryKey: ['spm-sanitasi'] })
            queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-detail', spmItem?.id] })
            queryClient.invalidateQueries({ queryKey: ['spm-mck-pekerjaan'] })
            queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-integration'] })
            queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-stats'] })
            queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-capaian'] })
        },
        onError: () => toast.error('Gagal menautkan pekerjaan'),
    })

    const detachMutation = useMutation({
        mutationFn: (pekerjaanId: number) => detachSpmPekerjaan(spmItem!.id, pekerjaanId),
        onSuccess: (res) => {
            toast.success(res.message)
            queryClient.invalidateQueries({ queryKey: ['spm-sanitasi'] })
            queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-detail', spmItem?.id] })
            queryClient.invalidateQueries({ queryKey: ['spm-mck-pekerjaan'] })
            queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-integration'] })
            queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-stats'] })
            queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-capaian'] })
        },
        onError: () => toast.error('Gagal menghapus tautan'),
    })

    const rows = mckData?.data ?? []
    const meta = mckData?.meta
    const isPending = attachMutation.isPending || detachMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Tautkan Paket Pekerjaan</DialogTitle>
                    <DialogDescription>
                        {spmItem
                            ? `${spmItem.nama_infrastruktur} (${JENIS_LABEL[spmItem.jenis]}) — setelah ditautkan, tahun konstruksi dan total pembiayaan infrastruktur diisi otomatis dari pekerjaan (kontrak, atau pagu).`
                            : 'Pilih infrastruktur terlebih dahulu.'}
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
                            setOutputType(v === 'all' ? '' : (v as SpmSanitasiOutputType))
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[240px]">
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
                        Tidak ada paket pekerjaan dengan output yang sesuai di desa ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pekerjaan</TableHead>
                                    <TableHead>Output</TableHead>
                                    <TableHead className="text-right">Tahun</TableHead>
                                    <TableHead className="text-right">Pembiayaan</TableHead>
                                    <TableHead className="text-right">KK / Jiwa</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => {
                                    const isLinked = linkedIds.has(row.id)
                                    const outputs = row.sanitasi_outputs ?? row.mck_outputs
                                    const primaryOutput = outputs[0]
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
                                            <TableCell className="text-right text-sm">
                                                {row.derived.tahun_konstruksi_suggested ??
                                                    row.tahun_anggaran ??
                                                    '-'}
                                            </TableCell>
                                            <TableCell className="text-right text-xs">
                                                {formatCurrency(
                                                    row.derived.pembiayaan_suggested ??
                                                        row.derived.nilai_kontrak
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                                {row.derived.kk} KK / {row.derived.jiwa} jiwa
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