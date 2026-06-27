import { useQuery } from '@tanstack/react-query'
import { Eye, Filter, Loader2, RefreshCw, Search } from 'lucide-react'
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
import { getSpmSanitasiIntegration } from '../api'
import {
    getOutputFilterLabel,
    getOutputTypeLabel,
    INTEGRASI_OUTPUT_SUMMARY,
    OUTPUT_FILTER_OPTIONS,
    type SpmSanitasiOutputType,
} from '../lib/output-labels'
import type { SpmDesaIntegration, SpmSanitasiSyncStatus } from '../types'

const TAHUN_OPTIONS = ['2026', '2025', '2024', '2023', '2022']

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
    search: string
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
}: SpmSanitasiIntegrationTableProps) {
    const { data: kecamatans } = useQuery({
        queryKey: ['kecamatans-list'],
        queryFn: getKecamatan,
    })

    const { data: desas } = useQuery({
        queryKey: ['desas-list-by-kec', selectedKec],
        queryFn: () => getDesaByKecamatan(selectedKec as number),
        enabled: !!selectedKec,
    })

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: [
            'spm-sanitasi-integration',
            page,
            search,
            selectedKec,
            selectedDesa,
            selectedTahun,
            selectedStatus,
            selectedOutputType,
        ],
        queryFn: () =>
            getSpmSanitasiIntegration({
                page,
                per_page: 10,
                search: search || undefined,
                kecamatan_id: selectedKec || undefined,
                desa_id: selectedDesa || undefined,
                tahun: selectedTahun || undefined,
                sync_status: selectedStatus || undefined,
                output_type: selectedOutputType || undefined,
            }),
    })

    const rows = data?.data ?? []
    const meta = data?.meta
    const summary = data?.summary

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Integrasi Paket Pekerjaan</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
                {summary && (
                    <p className="text-sm text-muted-foreground">
                        Output: {INTEGRASI_OUTPUT_SUMMARY}. {summary.matched_count} desa terintegrasi ·{' '}
                        {summary.total_pekerjaan} paket pekerjaan · {summary.total_infrastruktur} infrastruktur
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Cari desa atau kecamatan..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Select
                        value={selectedKec ? String(selectedKec) : 'all'}
                        onValueChange={(v) => {
                            onKecChange(v === 'all' ? '' : Number(v))
                            onDesaChange('')
                        }}
                    >
                        <SelectTrigger className="w-full lg:w-[180px]">
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
                        onValueChange={(v) => onDesaChange(v === 'all' ? '' : Number(v))}
                        disabled={!selectedKec}
                    >
                        <SelectTrigger className="w-full lg:w-[180px]">
                            <SelectValue placeholder="Desa" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Desa</SelectItem>
                            {desas?.data?.map((d) => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.n_desa}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedTahun || 'all'} onValueChange={(v) => onTahunChange(v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-full lg:w-[140px]">
                            <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tahun</SelectItem>
                            {TAHUN_OPTIONS.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={selectedOutputType || 'all'}
                        onValueChange={(v) =>
                            onOutputTypeChange(v === 'all' ? '' : (v as SpmSanitasiOutputType))
                        }
                    >
                        <SelectTrigger className="w-full lg:w-[220px]">
                            <SelectValue placeholder="Filter Output" />
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
                        onValueChange={(v) =>
                            onStatusChange(v === 'all' ? '' : (v as SpmSanitasiSyncStatus))
                        }
                    >
                        <SelectTrigger className="w-full lg:w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
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
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Belum ada data integrasi paket pekerjaan untuk filter ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Desa</TableHead>
                                    <TableHead>Output</TableHead>
                                    <TableHead className="text-right">Infrastruktur</TableHead>
                                    <TableHead className="text-right">Paket Pekerjaan</TableHead>
                                    <TableHead className="text-right">Tertaut</TableHead>
                                    <TableHead className="text-right">Manual KK</TableHead>
                                    <TableHead className="text-right">Derived KK</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.desa.id}>
                                        <TableCell>
                                            <div className="font-medium">{row.desa.n_desa}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.desa.kecamatan.n_kec}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex max-w-[200px] flex-wrap gap-1">
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
                                        <TableCell className="text-right">{row.infrastruktur_count}</TableCell>
                                        <TableCell className="text-right">{row.pekerjaan_count}</TableCell>
                                        <TableCell className="text-right">{row.linked_count}</TableCell>
                                        <TableCell className="text-right">{row.manual.kk}</TableCell>
                                        <TableCell className="text-right">{row.derived.kk}</TableCell>
                                        <TableCell>
                                            <SyncStatusBadge status={row.sync_status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => onRowSelect(row)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
            {meta && meta.last_page > 1 && (
                <CardFooter className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Halaman {meta.current_page} dari {meta.last_page}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => onPageChange(page - 1)}
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= meta.last_page}
                            onClick={() => onPageChange(page + 1)}
                        >
                            Berikutnya
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}