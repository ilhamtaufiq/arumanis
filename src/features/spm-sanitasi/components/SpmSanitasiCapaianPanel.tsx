import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { SPM_SEARCH_DEBOUNCE_MS } from '../lib/search'
import {
    Building2,
    GitCompare,
    Search,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
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
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { getSpmSanitasiCapaian } from '../api'
import { INFRA_JENIS_ORDER, JENIS_LABEL } from '../lib/jenis-labels'
import type { SpmSanitasiJenis } from '../types'

const JIWA_PER_KK = 5

function formatNumber(value?: number | null) {
    if (value == null) return '-'
    return new Intl.NumberFormat('id-ID').format(value)
}

function formatPercent(value?: number | null) {
    if (value == null) return '-'
    return `${value.toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`
}

interface SpmSanitasiCapaianPanelProps {
    kecamatanId?: number
}

export function SpmSanitasiCapaianPanel({ kecamatanId }: SpmSanitasiCapaianPanelProps) {
    const [capaianJenis, setCapaianJenis] = useState<SpmSanitasiJenis | 'all'>('all')
    const [capaianSearch, setCapaianSearch] = useState('')
    const debouncedCapaianSearch = useDebounce(capaianSearch, SPM_SEARCH_DEBOUNCE_MS)
    const [capaianPage, setCapaianPage] = useState(1)
    const [sort, setSort] = useState<'coverage_percentage' | 'jumlah_penduduk' | 'pemanfaat_kk' | 'n_desa'>(
        'coverage_percentage'
    )
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc')

    useEffect(() => {
        setCapaianPage(1)
    }, [debouncedCapaianSearch, capaianJenis, kecamatanId])

    const { data, isLoading, isFetching } = useQuery({
        queryKey: [
            'spm-sanitasi-capaian',
            kecamatanId,
            capaianJenis,
            debouncedCapaianSearch,
            capaianPage,
            sort,
            direction,
        ],
        queryFn: () =>
            getSpmSanitasiCapaian({
                kecamatan_id: kecamatanId,
                jenis: capaianJenis === 'all' ? undefined : capaianJenis,
                search: debouncedCapaianSearch.trim() || undefined,
                page: capaianPage,
                per_page: 15,
                sort,
                direction,
            }),
        staleTime: 30_000,
        placeholderData: (previousData) => previousData,
    })

    const summary = data?.summary
    const rows = data?.data ?? []
    const meta = data?.meta

    if (isLoading && !summary) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!summary) return null

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                <Card className="flex flex-row items-center gap-4 p-5 shadow-sm">
                    <div className="rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Total Penduduk</p>
                        <p className="text-xl font-bold">{formatNumber(summary.total_penduduk)}</p>
                        <p className="text-[11px] text-muted-foreground">
                            Target KK: {formatNumber(summary.target_kk)} (1 KK = {JIWA_PER_KK} jiwa)
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center gap-4 p-5 shadow-sm">
                    <div className="rounded-lg bg-cyan-100 p-3 text-cyan-600 dark:bg-cyan-900/30">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Pemanfaat (KK)</p>
                        <p className="text-xl font-bold">{formatNumber(summary.total_pemanfaat_kk)}</p>
                        <p className="text-[11px] text-muted-foreground">
                            Gap: {formatNumber(summary.gap_kk)} KK
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center gap-4 p-5 shadow-sm">
                    <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30">
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Pemanfaat (Jiwa)</p>
                        <p className="text-xl font-bold">{formatNumber(summary.total_pemanfaat_jiwa)}</p>
                        <p className="text-[11px] text-muted-foreground">
                            Gap: {formatNumber(summary.gap_jiwa)} jiwa
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-col justify-between p-5 shadow-sm lg:col-span-1 xl:col-span-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Capaian SPM Sanitasi</p>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-2">
                        <div className="mb-2 flex items-baseline justify-between">
                            <span className="text-2xl font-bold">{formatPercent(summary.coverage_percentage)}</span>
                            <span className="text-[11px] text-muted-foreground">
                                Jiwa terlayani / penduduk
                            </span>
                        </div>
                        <Progress value={Math.min(summary.coverage_percentage, 100)} className="h-2" />
                        <p className="mt-2 text-[11px] text-muted-foreground">
                            Capaian KK: {formatPercent(summary.coverage_kk_percentage)}
                        </p>
                    </div>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <GitCompare className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">Perbandingan per Jenis Infrastruktur</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {INFRA_JENIS_ORDER.map((jenis) => {
                            const item = summary.by_jenis[jenis]
                            const share = summary.total_pemanfaat_kk > 0
                                ? ((item.pemanfaat_kk / summary.total_pemanfaat_kk) * 100).toFixed(1)
                                : '0'
                            return (
                                <div key={jenis} className="rounded-lg border bg-muted/20 p-4">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                                        {JENIS_LABEL[jenis]}
                                    </p>
                                    <p className="mt-1 text-lg font-bold">{formatNumber(item.pemanfaat_kk)} KK</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatNumber(item.pemanfaat_jiwa)} jiwa · {item.unit_count} unit
                                    </p>
                                    <p className="mt-1 text-[11px] text-muted-foreground">{share}% dari total KK</p>
                                </div>
                            )
                        })}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        {summary.desa_with_infrastruktur} desa memiliki infrastruktur ·{' '}
                        {summary.desa_without_infrastruktur} desa belum memiliki data
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Capaian per Desa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            {isFetching ? (
                                <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                            ) : (
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            )}
                            <Input
                                className="pl-9"
                                placeholder="Cari desa atau kecamatan..."
                                value={capaianSearch}
                                onChange={(e) => setCapaianSearch(e.target.value)}
                                aria-label="Cari capaian per desa"
                            />
                        </div>
                        <Select
                            value={capaianJenis}
                            onValueChange={(v) => {
                                setCapaianJenis(v as SpmSanitasiJenis | 'all')
                            }}
                        >
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jenis</SelectItem>
                                {INFRA_JENIS_ORDER.map((jenis) => (
                                    <SelectItem key={jenis} value={jenis}>
                                        {JENIS_LABEL[jenis]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={sort}
                            onValueChange={(v) => {
                                setSort(v as typeof sort)
                                setCapaianPage(1)
                            }}
                        >
                            <SelectTrigger className="w-full lg:w-[200px]">
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="coverage_percentage">Capaian %</SelectItem>
                                <SelectItem value="jumlah_penduduk">Penduduk</SelectItem>
                                <SelectItem value="pemanfaat_kk">Pemanfaat KK</SelectItem>
                                <SelectItem value="n_desa">Nama Desa</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={direction}
                            onValueChange={(v) => {
                                setDirection(v as 'asc' | 'desc')
                                setCapaianPage(1)
                            }}
                        >
                            <SelectTrigger className="w-full lg:w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Terendah</SelectItem>
                                <SelectItem value="desc">Tertinggi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground">Tidak ada data desa.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kecamatan</TableHead>
                                        <TableHead>Desa</TableHead>
                                        <TableHead className="text-right">Penduduk</TableHead>
                                        <TableHead className="text-right">Target KK</TableHead>
                                        <TableHead className="text-right">Pemanfaat KK</TableHead>
                                        <TableHead className="text-right">Pemanfaat Jiwa</TableHead>
                                        <TableHead className="text-right">Gap Jiwa</TableHead>
                                        <TableHead className="text-right">Capaian</TableHead>
                                        <TableHead className="text-right">Unit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.desa.id}>
                                            <TableCell>{row.desa.kecamatan?.n_kec ?? '-'}</TableCell>
                                            <TableCell className="font-medium">{row.desa.n_desa}</TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(row.desa.jumlah_penduduk)}
                                            </TableCell>
                                            <TableCell className="text-right">{formatNumber(row.target_kk)}</TableCell>
                                            <TableCell className="text-right">{formatNumber(row.pemanfaat_kk)}</TableCell>
                                            <TableCell className="text-right">{formatNumber(row.pemanfaat_jiwa)}</TableCell>
                                            <TableCell className="text-right text-amber-600">
                                                {formatNumber(row.gap_jiwa)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-semibold">
                                                        {formatPercent(row.coverage_percentage)}
                                                    </span>
                                                    <Progress
                                                        value={Math.min(row.coverage_percentage, 100)}
                                                        className="h-1.5 w-20"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{row.unit_count}</TableCell>
                                        </TableRow>
                                    ))}
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
                                    disabled={capaianPage <= 1}
                                    onClick={() => setCapaianPage((p) => p - 1)}
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={capaianPage >= meta.last_page}
                                    onClick={() => setCapaianPage((p) => p + 1)}
                                >
                                    Berikutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}