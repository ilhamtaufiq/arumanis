import { useQuery } from '@tanstack/react-query'
import {
    Eye,
    Filter,
    Loader2,
    Plus,
    RefreshCw,
    Search,
} from 'lucide-react'
import { getOutputTypeLabel } from '../lib/output-labels'
import { getSpamIntegrationOutputOptions } from '../api'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import { getDesaByKecamatan } from '@/features/desa/api/desa'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
import { getIntegrationMetricColumnLabel } from '../lib/baseline'
import type { SpamDesaIntegration, SyncStatus } from '../types'
import { useSpamIntegration } from '../hooks/useSpamIntegration'

const TAHUN_OPTIONS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020']

const SYNC_STATUS_CONFIG: Record<
    SyncStatus,
    { label: string; className: string }
> = {
    matched: {
        label: 'Terintegrasi',
        className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
    no_data: {
        label: 'Tanpa Data',
        className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    },
    partial: {
        label: 'Partial',
        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    no_unit: {
        label: 'Tanpa Unit',
        className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    },
    no_pekerjaan: {
        label: 'Tanpa Pekerjaan',
        className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    },
}

interface SpamIntegrationTableProps {
    page: number
    search: string
    selectedKec: number | ''
    selectedDesa: number | ''
    selectedTahun: string
    selectedStatus: SyncStatus | ''
    selectedKomponen: string
    onPageChange: (page: number) => void
    onSearchChange: (search: string) => void
    onKecChange: (kec: number | '') => void
    onDesaChange: (desa: number | '') => void
    onTahunChange: (tahun: string) => void
    onStatusChange: (status: SyncStatus | '') => void
    onKomponenChange: (komponen: string) => void
    onRowSelect: (row: SpamDesaIntegration) => void
    onQuickCreateUnit?: (row: SpamDesaIntegration) => void
}

function SyncStatusBadge({ status }: { status: SyncStatus }) {
    const config = SYNC_STATUS_CONFIG[status]
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    )
}

export function SpamIntegrationTable({
    page,
    search,
    selectedKec,
    selectedDesa,
    selectedTahun,
    selectedStatus,
    selectedKomponen,
    onPageChange,
    onSearchChange,
    onKecChange,
    onDesaChange,
    onTahunChange,
    onStatusChange,
    onKomponenChange,
    onRowSelect,
    onQuickCreateUnit,
}: SpamIntegrationTableProps) {
    const { data: kecamatans } = useQuery({
        queryKey: ['kecamatans-list'],
        queryFn: getKecamatan,
    })

    const { data: desas } = useQuery({
        queryKey: ['desas-list-by-kec', selectedKec],
        queryFn: () => getDesaByKecamatan(selectedKec as number),
        enabled: !!selectedKec,
        staleTime: 0,
    })

    const { data: outputOptionsData, isLoading: isOutputOptionsLoading } = useQuery({
        queryKey: ['spam-integration-output-options', selectedKec, selectedTahun],
        queryFn: () =>
            getSpamIntegrationOutputOptions({
                kecamatan_id: selectedKec || undefined,
                tahun: selectedTahun || undefined,
            }),
        staleTime: 0,
    })

    const outputOptions = outputOptionsData?.data ?? []

    const { data, isLoading, isFetching, refetch } = useSpamIntegration({
        page,
        search: search || undefined,
        kecamatan_id: selectedKec || undefined,
        desa_id: selectedDesa || undefined,
        tahun: selectedTahun || undefined,
        sync_status: selectedStatus || undefined,
        komponen: selectedKomponen || undefined,
        per_page: 10,
    })

    const rows = data?.data ?? []
    const meta = data?.meta
    const tahunFilter = selectedTahun || undefined
    const srColumnLabel = getIntegrationMetricColumnLabel('SR', tahunFilter)
    const kkColumnLabel = getIntegrationMetricColumnLabel('KK', tahunFilter)

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                        <CardTitle>Integrasi Paket Pekerjaan</CardTitle>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                                    Filter:
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-xs text-muted-foreground">Kecamatan:</span>
                                <Select
                                    value={selectedKec ? String(selectedKec) : 'all'}
                                    onValueChange={(val) => {
                                        onKecChange(val === 'all' ? '' : Number(val))
                                        onDesaChange('')
                                        onPageChange(1)
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-[180px] text-xs">
                                        <SelectValue placeholder="Semua Kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kecamatan</SelectItem>
                                        {kecamatans?.data?.map((kec: { id: number; nama_kecamatan?: string; n_kec?: string }) => (
                                            <SelectItem key={kec.id} value={String(kec.id)}>
                                                {kec.nama_kecamatan || kec.n_kec}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-xs text-muted-foreground">Desa:</span>
                                <Select
                                    value={selectedDesa ? String(selectedDesa) : 'all'}
                                    onValueChange={(val) => {
                                        onDesaChange(val === 'all' ? '' : Number(val))
                                        onPageChange(1)
                                    }}
                                    disabled={!selectedKec}
                                >
                                    <SelectTrigger className="h-9 w-[180px] text-xs">
                                        <SelectValue placeholder="Semua Desa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Desa</SelectItem>
                                        {desas?.data?.map((desa: { id: number; nama_desa?: string; n_desa?: string }) => (
                                            <SelectItem key={desa.id} value={String(desa.id)}>
                                                {desa.nama_desa || desa.n_desa}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-xs text-muted-foreground">Tahun:</span>
                                <Select
                                    value={selectedTahun || 'all'}
                                    onValueChange={(val) => {
                                        onTahunChange(val === 'all' ? '' : val)
                                        onPageChange(1)
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-[130px] text-xs">
                                        <SelectValue placeholder="Semua Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tahun</SelectItem>
                                        {TAHUN_OPTIONS.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                Tahun {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-xs text-muted-foreground">Output:</span>
                                <Select
                                    value={selectedKomponen || 'all'}
                                    onValueChange={(val) => {
                                        onKomponenChange(val === 'all' ? '' : val)
                                        onPageChange(1)
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-[240px] text-xs">
                                        <SelectValue placeholder="Semua Output AM" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Output (Air Minum)</SelectItem>
                                        {isOutputOptionsLoading ? (
                                            <SelectItem value="__loading" disabled>
                                                Memuat output...
                                            </SelectItem>
                                        ) : outputOptions.length === 0 ? (
                                            <SelectItem value="__empty" disabled>
                                                Belum ada output pekerjaan AM
                                            </SelectItem>
                                        ) : (
                                            outputOptions.map((option) => (
                                                <SelectItem key={option.komponen} value={option.komponen}>
                                                    <span className="flex flex-col gap-0.5">
                                                        <span>{option.label}</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {option.pekerjaan_count} paket
                                                            {option.output_type
                                                                ? ` · ${getOutputTypeLabel(option.output_type)}`
                                                                : ''}
                                                            {option.is_integrasi ? ' · integrasi' : ''}
                                                        </span>
                                                    </span>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-xs text-muted-foreground">Status:</span>
                                <Select
                                    value={selectedStatus || 'all'}
                                    onValueChange={(val) => {
                                        onStatusChange(val === 'all' ? '' : (val as SyncStatus))
                                        onPageChange(1)
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-[160px] text-xs">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="matched">Terintegrasi</SelectItem>
                                        <SelectItem value="partial">Partial</SelectItem>
                                        <SelectItem value="no_unit">Tanpa Unit</SelectItem>
                                        <SelectItem value="no_pekerjaan">Tanpa Pekerjaan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9"
                                onClick={() => refetch()}
                                disabled={isFetching}
                            >
                                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari desa, kecamatan, unit SPAM..."
                            value={search}
                            onChange={(e) => {
                                onSearchChange(e.target.value)
                                onPageChange(1)
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4 p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm text-muted-foreground">Memuat data integrasi...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-transparent dark:bg-slate-900/50">
                                    <TableHead className="min-w-[120px]">Kecamatan</TableHead>
                                    <TableHead className="min-w-[120px]">Desa</TableHead>
                                    <TableHead className="text-center">Unit</TableHead>
                                    <TableHead className="text-center">Pekerjaan</TableHead>
                                    <TableHead className="text-center">Tertaut</TableHead>
                                    <TableHead className="min-w-[150px] text-center">
                                        <span className="block text-xs leading-tight">{srColumnLabel}</span>
                                        <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                                            kiri: acuan / kanan: potensi
                                        </span>
                                    </TableHead>
                                    <TableHead className="min-w-[150px] text-center">
                                        <span className="block text-xs leading-tight">{kkColumnLabel}</span>
                                        <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                                            kiri: acuan / kanan: potensi
                                        </span>
                                    </TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="sticky right-0 w-[120px] bg-background text-right shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
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
                                            <TableCell className="text-center font-semibold">
                                                {row.unit_count}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {row.pekerjaan_count}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-blue-600">
                                                {row.linked_count ?? 0}
                                            </TableCell>
                                            <TableCell className="text-center text-xs">
                                                <span className="font-medium">{row.manual.sr}</span>
                                                <span className="text-muted-foreground"> / </span>
                                                <span className="text-emerald-600">{row.derived.sr}</span>
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
                                                    {row.sync_status === 'no_unit' &&
                                                        row.pekerjaan_count > 0 &&
                                                        onQuickCreateUnit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-orange-600 hover:text-orange-700"
                                                                title="Buat unit SPAM"
                                                                onClick={() => onQuickCreateUnit(row)}
                                                            >
                                                                <Plus className="h-4 w-4" />
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
                                        <TableCell colSpan={9} className="p-8 text-center text-muted-foreground">
                                            Tidak ada data integrasi ditemukan.
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
                    <div className="text-xs text-muted-foreground">
                        Menampilkan {rows.length} dari {meta.total} desa
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(page - 1, 1))}
                            disabled={page === 1}
                            className="h-8 px-3 text-xs"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(page + 1, meta.last_page))}
                            disabled={page === meta.last_page}
                            className="h-8 px-3 text-xs"
                        >
                            Selanjutnya
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}