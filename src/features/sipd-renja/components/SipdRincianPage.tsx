import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { cn, orEmpty } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import {
    fetchSipdCachedRincian,
    SIPD_IS_ANGGARAN_PENGANGGARAN,
} from '@/features/sipd-renja/api'
import { sipdKoefisienStatus } from '@/features/sipd-renja/lib/values-changed'
import { formatSipdSyncTime } from '@/features/sipd-renja/lib/format'
import {
    getSipdPekerjaanLinks,
    setSipdPekerjaanLink,
    removeSipdPekerjaanLink,
} from '@/features/sipd-renja/api/links'
import type { SipdPekerjaanLookup } from '@/features/sipd-renja/lib/pekerjaan-status'
import { unduhRincianXlsx } from '@/features/sipd-renja/lib/export-rincian-xlsx'
import {
    terapkanFilterUrut,
    type FilterKategori,
    type UrutRincian,
} from '@/features/sipd-renja/lib/rincian-view'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    adalahAkunLokasi,
    cariLokasi,
    ringkasStatLokasi,
    type HasilLokasi,
} from '@/features/sipd-renja/lib/lokasi-wilayah'
import { getMasterDesaUntukSipd } from '@/features/sipd-renja/api/wilayah'
import { SipdRincianTableRow } from '@/features/sipd-renja/components/SipdRincianTableRow'
import type { SipdRincianRow } from '@/features/sipd-renja/types'

const RINCIAN_COL_COUNT = 14

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
    const [filterKategori, setFilterKategori] = useState<FilterKategori>('semua')
    const [urutRincian, setUrutRincian] = useState<UrutRincian>('urutan')
    const queryClient = useQueryClient()

    const rincianQuery = useQuery({
        queryKey: ['sipd-cached-rincian', id, SIPD_IS_ANGGARAN_PENGANGGARAN],
        queryFn: () =>
            fetchSipdCachedRincian(id, { is_anggaran: SIPD_IS_ANGGARAN_PENGANGGARAN }),
        enabled: Number.isFinite(id) && id > 0,
        retry: 1,
    })

    const parent = rincianQuery.data?.parent
    const namaSubGiat = (parent?.nama_sub_giat as string) || ''

    const pekerjaanQuery = useQuery({
        queryKey: ['pekerjaan', 'sipd-match', tahunAnggaran, namaSubGiat],
        queryFn: () =>
            getPekerjaan({
                tahun: tahunAnggaran,
                per_page: -1,
                nama_sub_kegiatan: namaSubGiat || undefined,
            }),
        enabled: !!tahunAnggaran && Number.isFinite(id) && id > 0,
        staleTime: 5 * 60 * 1000,
    })

    const linksQuery = useQuery({
        queryKey: ['sipd-pekerjaan-links', id],
        queryFn: () => getSipdPekerjaanLinks(id),
        enabled: Number.isFinite(id) && id > 0,
    })

    const pekerjaanList = useMemo(
        () => (pekerjaanQuery.data?.data || []) as SipdPekerjaanLookup[],
        [pekerjaanQuery.data?.data],
    )

    /** Map id_rinci_sub_bl → pekerjaan yang ditautkan manual. */
    const linkedByRinci = useMemo(() => {
        const map = new Map<number, SipdPekerjaanLookup>()
        const byId = new Map(pekerjaanList.map((p) => [p.id, p]))
        for (const link of linksQuery.data ?? []) {
            const p = byId.get(link.pekerjaan_id)
            if (p) map.set(link.id_rinci_sub_bl, p)
        }
        return map
    }, [linksQuery.data, pekerjaanList])

    /** Id pekerjaan yang sudah ditautkan ke baris lain (cegah double-link). */
    const occupiedPekerjaanIds = useMemo(() => {
        const set = new Set<number>()
        for (const link of linksQuery.data ?? []) set.add(link.pekerjaan_id)
        // Kecualikan tautan baris ini sendiri (dihitung per-baris di row).
        return set
    }, [linksQuery.data])

    const linkedPekerjaanCount = occupiedPekerjaanIds.size
    const linkedBarisCount = linksQuery.data?.length ?? 0

    const invalidateLinks = () =>
        queryClient.invalidateQueries({ queryKey: ['sipd-pekerjaan-links', id] })

    const setLinkMutation = useMutation({
        mutationFn: (input: { idRinciSubBl: number; pekerjaanId: number }) =>
            setSipdPekerjaanLink({ idSubBl: id, ...input }),
        onSuccess: () => {
            void invalidateLinks()
            toast.success('Pekerjaan ditautkan')
        },
        onError: (error) =>
            toast.error(error instanceof Error ? error.message : 'Gagal menautkan pekerjaan'),
    })

    const removeLinkMutation = useMutation({
        mutationFn: (idRinciSubBl: number) => removeSipdPekerjaanLink({ idSubBl: id, idRinciSubBl }),
        onSuccess: () => {
            void invalidateLinks()
            toast.success('Tautan dilepas')
        },
        onError: (error) =>
            toast.error(error instanceof Error ? error.message : 'Gagal melepas tautan'),
    })

    const handleSetLink = (idRinciSubBl: number, pekerjaanId: number | null) => {
        if (pekerjaanId === null) {
            removeLinkMutation.mutate(idRinciSubBl)
        } else {
            setLinkMutation.mutate({ idRinciSubBl, pekerjaanId })
        }
    }

    const rows = orEmpty(rincianQuery.data?.data as SipdRincianRow[] | undefined)
    const syncedAt = rincianQuery.data?.synced_at

    // Master desa Arumanis untuk mencocokkan lokasi di teks SIPD menjadi kolom Desa dan Kecamatan.
    const masterDesaQuery = useQuery({
        queryKey: ['sipd-renja', 'master-desa'],
        queryFn: getMasterDesaUntukSipd,
        staleTime: 10 * 60 * 1000,
    })
    const lokasiByRinci = useMemo(() => {
        const peta = new Map<number, HasilLokasi>()
        const master = masterDesaQuery.data ?? []
        const daftar = (rincianQuery.data?.data ?? []) as SipdRincianRow[]
        for (const row of daftar) {
            const id = Number(row.id_rinci_sub_bl)
            if (!Number.isFinite(id)) continue
            // Desa dan kecamatan hanya untuk rekening Belanja Barang untuk Dijual/Diserahkan kepada Masyarakat.
            if (!adalahAkunLokasi(row.nama_akun)) continue
            peta.set(id, cariLokasi([row.subs_bl_teks, row.ket_bl_teks], master))
        }
        return peta
    }, [rincianQuery.data, masterDesaQuery.data])
    const statLokasi = useMemo(() => ringkasStatLokasi([...lokasiByRinci.values()]), [lokasiByRinci])

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
                sipdKoefisienStatus(row.koefisien_murni, row.koefisien),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
            return haystack.includes(needle)
        })
    }, [rows, search])
    const tampilRows = useMemo(
        () => terapkanFilterUrut(filteredRows, lokasiByRinci, { kategori: filterKategori, urut: urutRincian }),
        [filteredRows, lokasiByRinci, filterKategori, urutRincian],
    )

    const totalSesudah = rows.reduce((sum, row) => sum + Number(row.total_harga || 0), 0)
    const totalSebelum = rows.reduce((sum, row) => sum + Number(row.total_harga_murni || 0), 0)
    const loadError = rincianQuery.error instanceof Error ? rincianQuery.error.message : null

    const kode = (parent?.kode_sub_giat as string) || ''
    const nama = (parent?.nama_sub_giat as string) || 'Sub kegiatan'
    const sipdParent = { idSubBl: id, kodeSubGiat: kode, namaSubGiat: nama }

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
                        Kembali ke Penganggaran SIPD
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
                <div className="grid gap-3 sm:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Total Baris</p>
                            <p className="text-lg font-semibold">{rows.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Pekerjaan Tertaut</p>
                            <p className="text-lg font-semibold">{linkedPekerjaanCount}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Baris Tertaut</p>
                            <p className="text-lg font-semibold">{linkedBarisCount}</p>
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

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Statistik lokasi · Kegiatan Fisik</CardTitle>
                        <CardDescription>
                            Jumlah baris rincian Belanja Barang untuk Dijual/Diserahkan kepada Masyarakat per desa dan kecamatan.
                            {' '}
                            <span className="font-medium text-foreground">{statLokasi.berlokasi}</span> baris berlokasi,{' '}
                            <span className="font-medium text-foreground">{statLokasi.tanpaLokasi}</span> tidak cocok dengan master.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 pt-0 lg:grid-cols-2">
                        <div>
                            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Per kecamatan</p>
                            {statLokasi.perKecamatan.length === 0 ? (
                                <p className="py-10 text-center text-sm text-muted-foreground">Belum ada lokasi yang cocok.</p>
                            ) : (
                                <div style={{ height: Math.max(180, statLokasi.perKecamatan.length * 36 + 40) }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statLokasi.perKecamatan} layout="vertical" margin={{ left: 8, right: 24 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" allowDecimals={false} />
                                            <YAxis type="category" dataKey="kecamatan" width={130} tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="jumlah" name="Jumlah lokasi" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Per desa</p>
                            {statLokasi.perDesa.length === 0 ? (
                                <p className="py-10 text-center text-sm text-muted-foreground">Belum ada desa yang cocok.</p>
                            ) : (
                                <div style={{ height: Math.max(180, statLokasi.perDesa.length * 32 + 40) }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={statLokasi.perDesa.map((d) => ({
                                                ...d,
                                                label: d.kecamatan ? `${d.desa} (${d.kecamatan})` : d.desa,
                                            }))}
                                            layout="vertical"
                                            margin={{ left: 8, right: 24 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" allowDecimals={false} />
                                            <YAxis type="category" dataKey="label" width={200} tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="jumlah" name="Jumlah lokasi" fill="hsl(var(--chart-2, var(--primary)))" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

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
                    <span className="inline-flex items-center gap-2">
                        Ket. Koef. = arah perubahan Koefisien: Bertambah / Berkurang / Tetap
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
                                    {tampilRows.length} dari {rows.length} baris ditampilkan
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                            <Select value={filterKategori} onValueChange={(v) => setFilterKategori(v as FilterKategori)}>
                                <SelectTrigger className="h-9 w-[170px]" aria-label="Filter kategori">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua kategori</SelectItem>
                                    <SelectItem value="fisik">Kegiatan Fisik</SelectItem>
                                    <SelectItem value="penunjang">Penunjang</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={urutRincian} onValueChange={(v) => setUrutRincian(v as UrutRincian)}>
                                <SelectTrigger className="h-9 w-[190px]" aria-label="Urutkan">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="urutan">Urutan asli</SelectItem>
                                    <SelectItem value="rekening">Kode rekening (A-Z)</SelectItem>
                                    <SelectItem value="total-desc">Total terbesar</SelectItem>
                                    <SelectItem value="total-asc">Total terkecil</SelectItem>
                                    <SelectItem value="desa">Desa (A-Z)</SelectItem>
                                    <SelectItem value="uraian">Uraian (A-Z)</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={rows.length === 0}
                                onClick={() => {
                                    try {
                                        unduhRincianXlsx(tampilRows, lokasiByRinci, statLokasi, {
                                            subKegiatan: namaSubGiat || 'Sub Kegiatan',
                                            kodeSubGiat: kode || null,
                                            tahun: (parent?.tahun as number | string | undefined) ?? null,
                                        })
                                    } catch {
                                        toast.error('Gagal membuat file XLSX.')
                                    }
                                }}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export XLSX
                            </Button>
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari uraian, keterangan, rekening, SSH..."
                                className="max-w-sm"
                                aria-label="Cari baris rincian"
                            />
                            </div>
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
                                        <TableHead
                                            rowSpan={2}
                                            className="min-w-[120px] align-bottom"
                                            title="Dicocokkan dari teks Uraian/Keterangan dengan master desa"
                                        >
                                            Desa
                                        </TableHead>
                                        <TableHead
                                            rowSpan={2}
                                            className="min-w-[130px] align-bottom"
                                            title="Dicocokkan dari teks Uraian/Keterangan dengan master kecamatan"
                                        >
                                            Kecamatan
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
                                        <TableHead
                                            rowSpan={2}
                                            className="min-w-[110px] align-bottom"
                                            title="Arah perubahan Koefisien (sebelum → sesudah)"
                                        >
                                            Ket. Koef.
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
                                    ) : tampilRows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={RINCIAN_COL_COUNT} className="py-8 text-center text-muted-foreground">
                                                {rows.length === 0
                                                    ? 'Belum ada baris rincian untuk sub kegiatan ini.'
                                                    : 'Tidak ada baris yang cocok dengan pencarian.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tampilRows.map((row, index) => (
                                            <SipdRincianTableRow
                                                key={row.id_rinci_sub_bl || index}
                                                row={row}
                                                pekerjaanList={pekerjaanList}
                                                linkedPekerjaan={linkedByRinci.get(Number(row.id_rinci_sub_bl)) ?? null}
                                                lokasi={lokasiByRinci.get(Number(row.id_rinci_sub_bl)) ?? null}
                                                occupiedPekerjaanIds={occupiedPekerjaanIds}
                                                onSetLink={handleSetLink}
                                                sipdParent={sipdParent}
                                                kodeSubGiat={kode}
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