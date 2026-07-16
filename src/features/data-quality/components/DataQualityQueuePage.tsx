import { useMemo, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, RefreshCw } from 'lucide-react'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { formatCurrency } from '@/lib/format'
import { getDataQualityItems } from '../api'
import {
    DATA_QUALITY_ISSUE_LABELS,
    type DataQualityIssue,
} from '../types'

const ISSUES: DataQualityIssue[] = [
    'no_coordinates',
    'no_photos',
    'started_no_photos',
    'no_contracts',
]

function isIssue(value: unknown): value is DataQualityIssue {
    return typeof value === 'string' && ISSUES.includes(value as DataQualityIssue)
}

export default function DataQualityQueuePage() {
    const search = useSearch({ strict: false }) as { issue?: string; tahun?: string }
    const { tahunAnggaran } = useAppSettingsValues()
    const [issue, setIssue] = useState<DataQualityIssue>(
        isIssue(search.issue) ? search.issue : 'no_coordinates',
    )
    const [query, setQuery] = useState('')
    const [page, setPage] = useState(1)

    const tahun = search.tahun || tahunAnggaran

    const itemsQuery = useQuery({
        queryKey: ['data-quality-items', issue, tahun, query, page],
        queryFn: () =>
            getDataQualityItems({
                issue,
                tahun,
                search: query || undefined,
                page,
                per_page: 25,
            }),
    })

    const rows = itemsQuery.data?.data ?? []
    const meta = itemsQuery.data?.meta
    const title = useMemo(() => DATA_QUALITY_ISSUE_LABELS[issue], [issue])

    return (
        <PageContainer
            pageTitle="Antrian Kualitas Data"
            pageDescription="Daftar pekerjaan bermasalah per kategori — klik untuk menindaklanjuti."
            pageHeaderAction={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void itemsQuery.refetch()}
                    disabled={itemsQuery.isFetching}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${itemsQuery.isFetching ? 'animate-spin' : ''}`} />
                    Muat ulang
                </Button>
            }
        >
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>
                            Tahun {tahun || 'semua'} · {meta?.total ?? 0} paket
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Select
                            value={issue}
                            onValueChange={(value) => {
                                setIssue(value as DataQualityIssue)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-[220px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ISSUES.map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {DATA_QUALITY_ISSUE_LABELS[key]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Cari nama / kode..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setPage(1)
                            }}
                            className="w-56"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {itemsQuery.isLoading ? (
                        <p className="text-sm text-muted-foreground">Memuat antrian...</p>
                    ) : rows.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            Tidak ada pekerjaan pada kategori ini.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Paket</TableHead>
                                        <TableHead>Lokasi</TableHead>
                                        <TableHead>Pengawas</TableHead>
                                        <TableHead className="text-right">Pagu</TableHead>
                                        <TableHead className="w-[100px]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <div className="font-medium">{row.nama_paket}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.kode_rekening || '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {[row.desa, row.kecamatan].filter(Boolean).join(', ') || '—'}
                                            </TableCell>
                                            <TableCell className="text-sm">{row.pengawas || '—'}</TableCell>
                                            <TableCell className="text-right text-sm">
                                                {formatCurrency(row.pagu)}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={row.href}>
                                                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                                                        Buka
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {meta && meta.last_page > 1 ? (
                        <div className="mt-4 flex items-center justify-between">
                            <Badge variant="secondary">
                                Halaman {meta.current_page} / {meta.last_page}
                            </Badge>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= meta.last_page}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </PageContainer>
    )
}
