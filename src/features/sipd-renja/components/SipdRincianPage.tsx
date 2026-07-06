import { useMemo, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { fetchSipdCachedRincian } from '@/features/sipd-renja/api'
import { formatSipdSyncTime } from '@/features/sipd-renja/lib/format'
import {
    buildPekerjaanMatchIndex,
    type SipdPekerjaanLookup,
} from '@/features/sipd-renja/lib/pekerjaan-match'
import { SipdRincianTableRow } from '@/features/sipd-renja/components/SipdRincianTableRow'
import type { SipdRincianRow } from '@/features/sipd-renja/types'

const RINCIAN_COL_COUNT = 11

const BEFORE_GROUP_HEAD =
    'border-l-2 border-l-slate-300 bg-slate-100 text-center font-semibold text-slate-800 dark:border-l-slate-600 dark:bg-slate-800 dark:text-slate-100'
const AFTER_GROUP_HEAD =
    'border-l-2 border-l-sky-300 bg-sky-50 text-center font-semibold text-sky-900 dark:border-l-sky-700 dark:bg-sky-950/60 dark:text-sky-100'
const BEFORE_SUB_HEAD =
    'border-l-2 border-l-slate-300 bg-slate-100 text-foreground dark:border-l-slate-600 dark:bg-slate-800'
const AFTER_SUB_HEAD =
    'border-l-2 border-l-sky-300 bg-sky-50 text-foreground dark:border-l-sky-700 dark:bg-sky-950/60'
export function SipdRincianPage() {
    const { idSubBl } = useParams({ from: '/_authenticated/sipd-renja/$idSubBl/' })
    const { tahunAnggaran } = useAppSettingsValues()
    const id = Number(idSubBl)
    const [search, setSearch] = useState('')

    const rincianQuery = useQuery({
        queryKey: ['sipd-cached-rincian', id],
        queryFn: () => fetchSipdCachedRincian(id),
        enabled: Number.isFinite(id) && id > 0,
        retry: 1,
    })

    const pekerjaanQuery = useQuery({
        queryKey: ['pekerjaan', 'sipd-match', tahunAnggaran],
        queryFn: () =>
            getPekerjaan({
                tahun: tahunAnggaran,
                per_page: -1,
            }),
        enabled: !!tahunAnggaran,
        staleTime: 5 * 60 * 1000,
    })

    const pekerjaanIndex = useMemo(() => {
        const list = (pekerjaanQuery.data?.data || []) as SipdPekerjaanLookup[]
        return buildPekerjaanMatchIndex(list)
    }, [pekerjaanQuery.data?.data])

    const parent = rincianQuery.data?.parent
    const rows = (rincianQuery.data?.data || []) as SipdRincianRow[]
    const syncedAt = rincianQuery.data?.synced_at

    const filteredRows = useMemo(() => {
        const needle = search.trim().toLowerCase()
        if (!needle) return rows
        return rows.filter((row) => {
            const haystack = [
                row.subs_bl_teks,
                row.ket_bl_teks,
                row.kode_akun,
                row.nama_akun,
                row.nama_standar_harga,
                row.spek,
                row.koefisien_murni,
                row.koefisien,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
            return haystack.includes(needle)
        })
    }, [rows, search])

    const totalSesudah = rows.reduce((sum, row) => sum + Number(row.total_harga || 0), 0)
    const totalSebelum = rows.reduce((sum, row) => sum + Number(row.total_harga_murni || 0), 0)
    const loadError = rincianQuery.error instanceof Error ? rincianQuery.error.message : null

    const kode = (parent?.kode_sub_giat as string) || ''
    const nama = (parent?.nama_sub_giat as string) || 'Sub kegiatan'

    const handleRefresh = async () => {
        try {
            await rincianQuery.refetch()
            toast.success('Rincian diperbarui')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal memuat ulang rincian')
        }
    }

    if (!Number.isFinite(id) || id <= 0) {
        return (
            <PageContainer pageTitle="Rincian tidak valid" pageDescription="ID sub kegiatan tidak dikenali.">
                <Button variant="outline" asChild>
                    <Link to="/sipd-renja">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Renja SIPD
                    </Link>
                </Button>
            </PageContainer>
        )
    }

    return (
        <PageContainer
            pageTitle={kode ? `Rincian ${kode}` : 'Rincian belanja'}
            pageDescription={nama}
            pageHeaderAction={(
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/sipd-renja">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={rincianQuery.isFetching}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${rincianQuery.isFetching ? 'animate-spin' : ''}`} />
                        Muat ulang
                    </Button>
                </div>
            )}
        >
            <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Total Baris</p>
                            <p className="text-lg font-semibold">{rows.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Total Sebelum Perubahan</p>
                            <p className="text-lg font-semibold">{formatCurrency(totalSebelum)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Total Sesudah Perubahan</p>
                            <p className="text-lg font-semibold">{formatCurrency(totalSesudah)}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {syncedAt ? (
                        <Badge variant="secondary">Sync {formatSipdSyncTime(syncedAt)}</Badge>
                    ) : null}
                    <span className="inline-flex items-center gap-2">
                        <span
                            className="inline-block h-3 w-6 rounded-sm bg-amber-100 shadow-[inset_0_0_0_1px_rgba(255,193,7,0.45)] dark:bg-amber-950/70 dark:shadow-[inset_0_0_0_1px_rgba(251,191,36,0.4)]"
                            aria-hidden
                        />
                        Kuning = nilai berubah
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span
                            className="inline-block h-3 w-6 rounded-sm bg-red-100 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.4)] dark:bg-red-950/60 dark:shadow-[inset_0_0_0_1px_rgba(248,113,113,0.35)]"
                            aria-hidden
                        />
                        Merah = nilai dihapus (sebelum ada, sesudah kosong)
                    </span>
                </div>

                {loadError ? (
                    <Card className="border-destructive/40">
                        <CardContent className="py-4 text-sm text-destructive">{loadError}</CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-base">Baris rincian</CardTitle>
                                <CardDescription>
                                    {filteredRows.length} dari {rows.length} baris ditampilkan
                                </CardDescription>
                            </div>
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari uraian, keterangan, rekening, SSH..."
                                className="max-w-sm"
                                aria-label="Cari baris rincian"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead rowSpan={2} className="min-w-[160px] align-bottom">
                                            Uraian Sub BL
                                        </TableHead>
                                        <TableHead rowSpan={2} className="min-w-[140px] align-bottom">
                                            Keterangan
                                        </TableHead>
                                        <TableHead rowSpan={2} className="min-w-[130px] align-bottom">
                                            Status Arumanis
                                        </TableHead>
                                        <TableHead rowSpan={2} className="min-w-[120px] align-bottom">
                                            Rekening
                                        </TableHead>
                                        <TableHead rowSpan={2} className="min-w-[140px] align-bottom">
                                            SSH
                                        </TableHead>
                                        <TableHead colSpan={3} className={BEFORE_GROUP_HEAD}>
                                            Sebelum Perubahan
                                        </TableHead>
                                        <TableHead colSpan={3} className={AFTER_GROUP_HEAD}>
                                            Sesudah Perubahan
                                        </TableHead>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead className={cn(BEFORE_SUB_HEAD, 'font-medium')}>
                                            Koefisien
                                        </TableHead>
                                        <TableHead className={cn(BEFORE_SUB_HEAD, 'text-right font-medium')}>
                                            Harga Satuan
                                        </TableHead>
                                        <TableHead className={cn(BEFORE_SUB_HEAD, 'text-right font-medium')}>
                                            Total
                                        </TableHead>
                                        <TableHead className={cn(AFTER_SUB_HEAD, 'font-medium')}>
                                            Koefisien
                                        </TableHead>
                                        <TableHead className={cn(AFTER_SUB_HEAD, 'text-right font-medium')}>
                                            Harga Satuan
                                        </TableHead>
                                        <TableHead className={cn(AFTER_SUB_HEAD, 'text-right font-medium')}>
                                            Total
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rincianQuery.isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={RINCIAN_COL_COUNT} className="py-8 text-center text-muted-foreground">
                                                Memuat rincian...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredRows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={RINCIAN_COL_COUNT} className="py-8 text-center text-muted-foreground">
                                                {rows.length === 0
                                                    ? 'Belum ada baris rincian untuk sub kegiatan ini.'
                                                    : 'Tidak ada baris yang cocok dengan pencarian.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRows.map((row, index) => (
                                            <SipdRincianTableRow
                                                key={row.id_rinci_sub_bl || index}
                                                row={row}
                                                pekerjaanIndex={pekerjaanIndex}
                                            />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    )
}