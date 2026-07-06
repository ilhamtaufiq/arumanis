import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ExternalLink, Eye, RefreshCw } from 'lucide-react'
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
import { formatCurrency } from '@/lib/format'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import {
    fetchSipdCachedRenja,
    fetchSipdServiceStatus,
} from '@/features/sipd-renja/api'
import { formatSipdSyncTime } from '@/features/sipd-renja/lib/format'

const SIPD_WEB_URL = (import.meta.env.VITE_SIPD_WEB_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

export default function SipdRenjaPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [search, setSearch] = useState('')

    const tahun = tahunAnggaran ? Number(tahunAnggaran) : undefined

    const statusQuery = useQuery({
        queryKey: ['sipd-service-status'],
        queryFn: fetchSipdServiceStatus,
        retry: 1,
    })

    const renjaQuery = useQuery({
        queryKey: ['sipd-cached-renja', tahun],
        queryFn: () => fetchSipdCachedRenja(tahun ? { tahun } : undefined),
        retry: 1,
    })

    const filteredItems = useMemo(() => {
        const items = renjaQuery.data?.data || []
        const needle = search.trim().toLowerCase()
        if (!needle) return items
        return items.filter((item) => {
            const kode = (item.kode_sub_giat || '').toLowerCase()
            const nama = (item.nama_sub_giat || '').toLowerCase()
            return kode.includes(needle) || nama.includes(needle)
        })
    }, [renjaQuery.data?.data, search])

    const handleRefresh = async () => {
        try {
            await Promise.all([statusQuery.refetch(), renjaQuery.refetch()])
            toast.success('Data cache SIPD diperbarui')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal memuat ulang data SIPD')
        }
    }

    const sipdLoggedIn = statusQuery.data?.logged_in === true
    const loadError = renjaQuery.error instanceof Error ? renjaQuery.error.message : null

    return (
        <PageContainer
            pageTitle="Renja SIPD (Cache)"
            pageDescription="Data sub kegiatan dan rincian belanja dari cache SQLite layanan SIPD-RI. Sync manual dilakukan di aplikasi SIPD."
            pageHeaderAction={(
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={renjaQuery.isFetching}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${renjaQuery.isFetching ? 'animate-spin' : ''}`} />
                        Muat ulang
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a href={`${SIPD_WEB_URL}/renja`} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Sync di SIPD Web
                        </a>
                    </Button>
                </div>
            )}
        >
            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Status layanan SIPD</CardTitle>
                        <CardDescription>
                            Arumanis membaca cache SQLite via BFF — tidak memanggil SIPD Kemendagri langsung.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-2 text-sm">
                        {statusQuery.isLoading ? (
                            <Badge variant="outline">Memeriksa...</Badge>
                        ) : statusQuery.isError ? (
                            <Badge variant="destructive">Tidak terhubung</Badge>
                        ) : sipdLoggedIn ? (
                            <Badge>Tersambung ke SIPD service</Badge>
                        ) : (
                            <Badge variant="secondary">SIPD service aktif — sesi web belum login</Badge>
                        )}
                        {tahun ? <Badge variant="outline">Tahun {tahun}</Badge> : null}
                        <span className="text-muted-foreground">
                            {renjaQuery.data?.total ?? 0} sub kegiatan tersimpan di cache
                        </span>
                    </CardContent>
                </Card>

                {loadError ? (
                    <Card className="border-destructive/40">
                        <CardContent className="py-4 text-sm text-destructive">
                            {loadError}
                            <p className="mt-2 text-muted-foreground">
                                Pastikan layanan SIPD berjalan dan `SIPD_BASE_URL` / `APIAMIS_BASE_URL` sudah benar.
                            </p>
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-base">Sub kegiatan tersync</CardTitle>
                                <CardDescription>
                                    Klik rincian untuk membuka halaman detail baris belanja.
                                </CardDescription>
                            </div>
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari kode atau nama sub kegiatan..."
                                className="max-w-sm"
                                aria-label="Cari sub kegiatan SIPD"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama Sub Kegiatan</TableHead>
                                    <TableHead className="text-right">Pagu</TableHead>
                                    <TableHead className="text-right">Rincian</TableHead>
                                    <TableHead className="text-right">Baris</TableHead>
                                    <TableHead>Terakhir sync</TableHead>
                                    <TableHead className="w-[100px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renjaQuery.isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                            Memuat data cache...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                            Belum ada data cache untuk tahun ini. Jalankan sync di SIPD Web.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => (
                                        <TableRow key={item.id_sub_bl}>
                                            <TableCell className="font-mono text-xs">{item.kode_sub_giat || '-'}</TableCell>
                                            <TableCell>{item.nama_sub_giat || '-'}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.pagu)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.rincian)}</TableCell>
                                            <TableCell className="text-right">{item.rincian_count}</TableCell>
                                            <TableCell>{formatSipdSyncTime(item.synced_at)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link
                                                        to="/sipd-renja/$idSubBl"
                                                        params={{ idSubBl: String(item.id_sub_bl) }}
                                                    >
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        Rincian
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    )
}