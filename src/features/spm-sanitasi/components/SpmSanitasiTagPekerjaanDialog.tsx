import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link2, Loader2, Search, Unlink } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { SPM_SEARCH_DEBOUNCE_MS } from '../lib/search'
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
import {
    filterOutputsForSpmJenis,
    getApiErrorMessage,
    pickDefaultOutput,
} from '../lib/integration-helpers'
import { invalidateSpmIntegrationQueries } from '../hooks/useSpmIntegration'
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
    const debouncedSearch = useDebounce(search, SPM_SEARCH_DEBOUNCE_MS)
    const [outputType, setOutputType] = useState<SpmSanitasiOutputType | ''>('')
    const [page, setPage] = useState(1)
    const [outputByPekerjaan, setOutputByPekerjaan] = useState<Record<number, number>>({})

    useEffect(() => {
        if (!open) {
            setSearch('')
            setOutputType('')
            setPage(1)
            setOutputByPekerjaan({})
        }
    }, [open])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, outputType])

    const { data: detailData } = useQuery({
        queryKey: ['spm-sanitasi-detail', spmItem?.id],
        queryFn: () => getSpmSanitasiById(spmItem!.id),
        enabled: open && !!spmItem?.id,
        staleTime: 30_000,
    })

    const { data: mckData, isLoading, isFetching } = useQuery({
        queryKey: ['spm-mck-pekerjaan', spmItem?.id, debouncedSearch, outputType, page],
        queryFn: () =>
            getSpmMckPekerjaan({
                spm_sanitasi_id: spmItem!.id,
                search: debouncedSearch.trim() || undefined,
                output_type: outputType || undefined,
                page,
                per_page: 10,
            }),
        enabled: open && !!spmItem?.id,
        staleTime: 30_000,
        placeholderData: (previousData) => previousData,
    })

    const rows = useMemo(() => mckData?.data ?? [], [mckData?.data])
    const meta = mckData?.meta
    const spmJenis = spmItem?.jenis

    useEffect(() => {
        if (!spmJenis || rows.length === 0) return
        setOutputByPekerjaan((prev) => {
            const next = { ...prev }
            for (const row of rows) {
                if (next[row.id]) continue
                const outputs = row.sanitasi_outputs ?? row.mck_outputs
                const defaultOutput = pickDefaultOutput(outputs, spmJenis)
                if (defaultOutput) {
                    next[row.id] = defaultOutput.id
                }
            }
            return next
        })
    }, [rows, spmJenis])

    const linkedIds = new Set(
        (detailData?.data?.pekerjaan ?? []).map((p) => p.id)
    )

    const handleSuccess = (message: string) => {
        toast.success(message)
        invalidateSpmIntegrationQueries(queryClient)
    }

    const attachMutation = useMutation({
        mutationFn: ({ pekerjaanId, outputId }: { pekerjaanId: number; outputId?: number }) =>
            attachSpmPekerjaan(spmItem!.id, { pekerjaan_id: pekerjaanId, output_id: outputId }),
        onSuccess: (res) => handleSuccess(res.message),
        onError: (error) =>
            toast.error(
                getApiErrorMessage(
                    error,
                    'Gagal menautkan pekerjaan. Pastikan output sesuai jenis infrastruktur.'
                )
            ),
    })

    const detachMutation = useMutation({
        mutationFn: (pekerjaanId: number) => detachSpmPekerjaan(spmItem!.id, pekerjaanId),
        onSuccess: (res) => handleSuccess(res.message),
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'Gagal menghapus tautan pekerjaan')),
    })

    const isPending = attachMutation.isPending || detachMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Tautkan Paket Pekerjaan</DialogTitle>
                    <DialogDescription>
                        {spmItem
                            ? `${spmItem.nama_infrastruktur} (${JENIS_LABEL[spmItem.jenis]}) — output ${INTEGRASI_OUTPUT_SUMMARY}. Setelah ditautkan, tahun konstruksi dan pembiayaan diisi otomatis dari pekerjaan.`
                            : 'Pilih infrastruktur terlebih dahulu.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        {isFetching ? (
                            <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        ) : (
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        )}
                        <Input
                            className="pl-9"
                            placeholder="Cari nama paket..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Cari paket pekerjaan"
                        />
                    </div>
                    <Select
                        value={outputType || 'all'}
                        onValueChange={(v) => {
                            setOutputType(v === 'all' ? '' : (v as SpmSanitasiOutputType))
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

                {isLoading && !mckData ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="space-y-2 py-10 text-center text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">
                            Tidak ada paket pekerjaan sanitasi di desa ini.
                        </p>
                        <p>
                            Cek: (1) pekerjaan punya{' '}
                            <span className="font-medium">desa</span> sama dengan infrastruktur, (2)
                            output berisi kata kunci MCK / jamban / tangki septik / SPALDS / IPAL /
                            IPLT / SPALDT, (3) akun Anda berhak melihat pekerjaan itu. Coba kosongkan
                            filter output atau cari nama paket.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pekerjaan</TableHead>
                                    <TableHead>Output</TableHead>
                                    <TableHead>Output Tautan</TableHead>
                                    <TableHead className="text-right">Tahun</TableHead>
                                    <TableHead className="text-right">Pembiayaan</TableHead>
                                    <TableHead className="text-right">KK / Jiwa</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => {
                                    const isLinked = linkedIds.has(row.id)
                                    const allOutputs = row.sanitasi_outputs ?? row.mck_outputs
                                    const matchingOutputs = spmJenis
                                        ? filterOutputsForSpmJenis(allOutputs, spmJenis)
                                        : allOutputs
                                    const selectableOutputs =
                                        matchingOutputs.length > 0 ? matchingOutputs : allOutputs
                                    const selectedOutputId =
                                        outputByPekerjaan[row.id] ?? selectableOutputs[0]?.id
                                    const selectedOutput = selectableOutputs.find(
                                        (o) => o.id === selectedOutputId
                                    )

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
                                                    {allOutputs.map((o) => (
                                                        <Badge
                                                            key={o.id}
                                                            variant="secondary"
                                                            className="text-[10px]"
                                                        >
                                                            {o.komponen} ({o.volume} {o.satuan})
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {isLinked ? (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        Tertaut
                                                    </Badge>
                                                ) : selectableOutputs.length > 1 ? (
                                                    <Select
                                                        value={
                                                            selectedOutputId
                                                                ? String(selectedOutputId)
                                                                : undefined
                                                        }
                                                        onValueChange={(value) =>
                                                            setOutputByPekerjaan((prev) => ({
                                                                ...prev,
                                                                [row.id]: Number(value),
                                                            }))
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 w-[200px] text-xs">
                                                            <SelectValue placeholder="Pilih output" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {selectableOutputs.map((o) => (
                                                                <SelectItem
                                                                    key={o.id}
                                                                    value={String(o.id)}
                                                                >
                                                                    {o.komponen}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        {selectedOutput?.komponen ?? '-'}
                                                    </span>
                                                )}
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
                                                        disabled={
                                                            isPending || !selectedOutputId
                                                        }
                                                        onClick={() =>
                                                            attachMutation.mutate({
                                                                pekerjaanId: row.id,
                                                                outputId: selectedOutputId,
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