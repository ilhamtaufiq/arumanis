import { useQuery } from '@tanstack/react-query'
import { Eye, Filter, Loader2, Plus, RefreshCw, Search } from 'lucide-react'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import { getDesaByKecamatan } from '@/features/desa/api/desa'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useSpmIntegration } from '../hooks/useSpmIntegration'
import { getDesaLabel } from '../lib/integration-helpers'
import {
    getOutputFilterLabel,
    getOutputTypeLabel,
    INTEGRASI_OUTPUT_SUMMARY,
    OUTPUT_FILTER_OPTIONS,
    type SpmSanitasiOutputType,
} from '../lib/output-labels'
import { SPM_TAHUN_OPTIONS } from '../lib/tahun-options'
import type { SpmDesaIntegration, SpmSanitasiSyncStatus } from '../types'
import { SpmIntegrationSummaryCards } from './SpmIntegrationSummaryCards'

const SYNC_STATUS_CONFIG: Record<
    SpmSanitasiSyncStatus,
    { label: string; className: string }
> = {
    matched: {
        label: 'Terintegrasi',
        className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
    partial: {
        label: 'Partial',
        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    no_infrastruktur: {
        label: 'Tanpa Infrastruktur',
        className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    },
    no_pekerjaan: {
        label: 'Tanpa Paket Pekerjaan',
        className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    },
    no_data: {
        label: 'Tanpa Data',
        className: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    },
}

interface SpmSanitasiIntegrationTableProps {
    page: number
    /** Nilai input (langsung dari keyboard) */
    search: string
    /** Nilai setelah debounce — dipakai query API */
    debouncedSearch?: string
    selectedKec: number | ''
    selectedDesa: number | ''
    selectedTahun: string
    selectedStatus: SpmSanitasiSyncStatus | ''
    selectedOutputType: SpmSanitasiOutputType | ''
    onPageChange: (page: number) => void
    onSearchChange: (search: string) => void
    onKecChange: (kec: number | '') => void
    onDesaChange: (desa: number | '') => void
    onTahunChange: (tahun: string) => void
    onStatusChange: (status: SpmSanitasiSyncStatus | '') => void
    onOutputTypeChange: (outputType: SpmSanitasiOutputType | '') => void
    onRowSelect: (row: SpmDesaIntegration) => void
    onQuickAddInfrastruktur?: (row: SpmDesaIntegration) => void
    isAutoCreating?: boolean
}

function SyncStatusBadge({ status }: { status: SpmSanitasiSyncStatus }) {
    const config = SYNC_STATUS_CONFIG[status]
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    )
}

export function SpmSanitasiIntegrationTable({
    page,
    search,
    debouncedSearch,
    selectedKec,
    selectedDesa,
    selectedTahun,
    selectedStatus,
    selectedOutputType,
    onPageChange,
    onSearchChange,
    onKecChange,
    onDesaChange,
    onTahunChange,
    onStatusChange,
    onOutputTypeChange,
    onRowSelect,
    onQuickAddInfrastruktur,
    isAutoCreating = false,
}: SpmSanitasiIntegrationTableProps) {
    const searchQuery = (debouncedSearch ?? search).trim()

    const { data: kecamatans } = useQuery({
        queryKey: ['kecamatans-list'],
        queryFn: getKecamatan,
        staleTime: 5 * 60_000,
    })

    const { data: desas } = useQuery({
        queryKey: ['desas-list-by-kec', selectedKec],
        queryFn: () => getDesaByKecamatan(selectedKec as number),
        enabled: !!selectedKec,
        staleTime: 5 * 60_000,
    })

    const { data, isLoading, isFetching, refetch } = useSpmIntegration({
        page,
        per_page: 10,
        search: searchQuery || undefined,
        kecamatan_id: selectedKec || undefined,
        desa_id: selectedDesa || undefined,
        tahun: selectedTahun || undefined,
        sync_status: selectedStatus || undefined,
        output_type: selectedOutputType || undefined,
    })

    const rows = data?.data ?? []
    const meta = data?.meta
    const summary = data?.summary

    return (
        <div className="space-y-6">
            <SpmIntegrationSummaryCards summary={summary} isLoading={isLoading && !summary} />

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                            <div>
                                <CardTitle>Integrasi Paket Pekerjaan</CardTitle>
                                {summary && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Output: {INTEGRASI_OUTPUT_SUMMARY}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <Select
                                    value={selectedKec ? String(selectedKec) : 'all'}
                                    onValueChange={(v) => {
                                        onKecChange(v === 'all' ? '' : Number(v))
                                        onDesaChange('')
                                        onPageChange(1)
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-[180px] text-xs">
                                        <SelectValue placeholder="Kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kecamatan</SelectItem>
                                        {kecamatans?.data?.map((k) => (
                                            <SelectItem key={k.id} value={String(k.id)}>
                                                {k.nama_kecamatan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={selectedDesa ? String(selectedDesa) : 'all'}
                                    onValueChange={(v) => {
                                        onDesaChange(v === 'all' ? '' : Number(v))
                                        onPageChange(1)
                                    }}
                                    disabled={!selectedKec}
                                >
                                    <SelectTrigger className="h-9 w-[180px] text-xs">
                                        <SelectValue placeholder="Desa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Desa</SelectItem>
                                        {desas?.data?.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)}>
                                                {getDesaLabel(d)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={selectedTahun || 'all'}
                                    onValueChange={(v) => {
                                        onTahunChange(v === 'all' ? '' : v)
                                        onPageChange(1)
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-[130px] text-xs">
                                        <SelectValue placeholder="Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tahun</SelectItem>
                                        {SPM_TAHUN_OPTIONS.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={selectedOutputType || 'all'}
                                    onValueChange={(v) => {
                                        onOutputTypeChange(
                                            v === 'all' ? '' : (v as SpmSanitasiOutputType)
                                        )
                                        onPageChange(1)
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-[220px] text-xs">
                                        <SelectValue placeholder="Output" />
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

                                <Select
                                    value={selectedStatus || 'all'}
                                    onValueChange={(v) => {
                                        onStatusChange(
                                            v === 'all' ? '' : (v as SpmSanitasiSyncStatus)
                                        )
                                        onPageChange(1)
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-[160px] text-xs">
                                        <Filter className="mr-2 h-3.5 w-3.5" />
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="matched">Terintegrasi</SelectItem>
                                        <SelectItem value="partial">Partial</SelectItem>
                                        <SelectItem value="no_infrastruktur">Tanpa Infrastruktur</SelectItem>
                                        <SelectItem value="no_pekerjaan">Tanpa Paket Pekerjaan</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                    onClick={() => refetch()}
                                    disabled={isFetching}
                                >
                                    <RefreshCw
                                        className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
                                    />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            {isFetching ? (
                                <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                            ) : (
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            )}
                            <Input
                                className="pl-9"
                                placeholder="Cari desa atau kecamatan..."
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                aria-label="Cari desa atau kecamatan"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className={`p-0 ${isFetching && !isLoading ? 'opacity-80 transition-opacity' : ''}`}>
                    {isLoading && !data ? (
                        <div className="flex flex-col items-center justify-center space-y-4 p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Memuat data integrasi...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 hover:bg-transparent dark:bg-slate-900/50">
                                        <TableHead className="min-w-[120px]">Kecamatan</TableHead>
                                        <TableHead className="min-w-[120px]">Desa</TableHead>
                                        <TableHead>Output</TableHead>
                                        <TableHead className="text-center">Infrastruktur</TableHead>
                                        <TableHead className="text-center">Pekerjaan</TableHead>
                                        <TableHead className="text-center">Tertaut</TableHead>
                                        <TableHead className="min-w-[140px] text-center">
                                            <span className="block text-xs">KK</span>
                                            <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                                                manual / derived
                                            </span>
                                        </TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="sticky right-0 w-[100px] bg-background text-right shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.length > 0 ? (
                                        rows.map((row) => (
                                            <TableRow
                                                key={row.desa.id}
                                                className="cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                                                onClick={() => onRowSelect(row)}
                                            >
                                                <TableCell className="font-medium">
                                                    {row.desa.kecamatan.n_kec}
                                                </TableCell>
                                                <TableCell>{row.desa.n_desa}</TableCell>
                                                <TableCell>
                                                    <div className="flex max-w-[180px] flex-wrap gap-1">
                                                        {(row.output_types ?? []).length > 0 ? (
                                                            row.output_types!.map((type) => (
                                                                <Badge
                                                                    key={type}
                                                                    variant="secondary"
                                                                    className="text-[10px]"
                                                                >
                                                                    {getOutputTypeLabel(type)}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-semibold">
                                                    {row.infrastruktur_count}
                                                </TableCell>
                                                <TableCell className="text-center font-semibold">
                                                    {row.pekerjaan_count}
                                                </TableCell>
                                                <TableCell className="text-center font-semibold text-blue-600">
                                                    {row.linked_count}
                                                </TableCell>
                                                <TableCell className="text-center text-xs">
                                                    <span className="font-medium">{row.manual.kk}</span>
                                                    <span className="text-muted-foreground"> / </span>
                                                    <span className="text-emerald-600">{row.derived.kk}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <SyncStatusBadge status={row.sync_status} />
                                                </TableCell>
                                                <TableCell
                                                    className="sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex justify-end gap-1">
                                                        {(row.sync_status === 'no_infrastruktur' ||
                                                            row.sync_status === 'partial') &&
                                                            row.pekerjaan_count > 0 &&
                                                            onQuickAddInfrastruktur && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={
                                                                        row.sync_status === 'partial'
                                                                            ? 'h-8 w-8 text-amber-600 hover:text-amber-700'
                                                                            : 'h-8 w-8 text-orange-600 hover:text-orange-700'
                                                                    }
                                                                    title={
                                                                        row.sync_status === 'partial'
                                                                            ? 'Lengkapi infrastruktur yang kurang & tautkan paket pekerjaan'
                                                                            : 'Buat infrastruktur otomatis & tautkan pekerjaan'
                                                                    }
                                                                    disabled={isAutoCreating}
                                                                    onClick={() =>
                                                                        onQuickAddInfrastruktur(row)
                                                                    }
                                                                >
                                                                    {isAutoCreating ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Plus className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            title="Detail"
                                                            onClick={() => onRowSelect(row)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                className="p-8 text-center text-muted-foreground"
                                            >
                                                Belum ada data integrasi untuk filter ini.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>

                {meta && (
                    <CardFooter className="flex items-center justify-between border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-900/50">
                        <p className="text-xs text-muted-foreground">
                            Menampilkan {rows.length} dari {meta.total} desa
                            {meta.last_page > 1 &&
                                ` · Halaman ${meta.current_page} dari ${meta.last_page}`}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                disabled={page <= 1}
                                onClick={() => onPageChange(page - 1)}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                disabled={page >= meta.last_page}
                                onClick={() => onPageChange(page + 1)}
                            >
                                Berikutnya
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}