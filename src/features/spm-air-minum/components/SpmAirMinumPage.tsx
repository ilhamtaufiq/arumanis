import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BarChart3, Eye, RefreshCw, Search, Shuffle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { consolidateSpmAirMinum, getSpmAirMinum, getSpmDetail, getSpmOptions, getSpmStats, getSpmUnmatched } from '../api'
import type { SpmAirMinum, SpmParams, SpmStatus } from '../types'

const statusLabels: Record<SpmStatus, string> = {
    terpenuhi: 'Terpenuhi',
    belum_terpenuhi: 'Belum Terpenuhi',
    data_kurang: 'Data Kurang',
}

function formatNumber(value: number | string | null | undefined) {
    if (value === null || value === undefined || value === '') return '-'
    return Number(value).toLocaleString('id-ID')
}

function formatMoney(value: number | string | null | undefined) {
    if (value === null || value === undefined || value === '') return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value))
}

function statusBadge(status: SpmStatus) {
    if (status === 'terpenuhi') return <Badge className="bg-emerald-600 hover:bg-emerald-600">{statusLabels[status]}</Badge>
    if (status === 'belum_terpenuhi') return <Badge variant="destructive">{statusLabels[status]}</Badge>
    return <Badge variant="outline">{statusLabels[status]}</Badge>
}

function sourceMatchesJenis(source: NonNullable<SpmAirMinum['sources']>[number], jenisJaringan?: 'JP' | 'BJP') {
    if (!jenisJaringan) return true
    if (source.source_type === 'terbangun_raw') return jenisJaringan === 'JP'
    return source.jenis_jaringan === jenisJaringan
}

function SourceTable({ title, sources, showJenis = false }: { title: string; sources: SpmAirMinum['sources']; showJenis?: boolean }) {
    const items = sources || []

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{title}</h3>
                <Badge variant="outline">{items.length} sumber</Badge>
            </div>
            {items.length === 0 ? (
                <div className="rounded-md border p-4 text-sm text-muted-foreground">Tidak ada sumber data.</div>
            ) : (
                <div className="max-w-full overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {showJenis && <TableHead>Jenis</TableHead>}
                                <TableHead className="min-w-[180px]">Pengelola</TableHead>
                                <TableHead>SR</TableHead>
                                <TableHead>Capaian Jiwa</TableHead>
                                <TableHead className="min-w-[130px]">Tahun</TableHead>
                                <TableHead className="min-w-[130px]">Sumber Dana</TableHead>
                                <TableHead className="min-w-[140px]">Anggaran</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((source) => {
                                const sr = source.sr_unit || 0
                                const capaianJiwa = sr * 5

                                return (
                                    <TableRow key={source.id}>
                                        {showJenis && (
                                            <TableCell>
                                                <Badge variant={source.jenis_jaringan === 'BJP' ? 'outline' : 'default'}>
                                                    {source.jenis_jaringan || '-'}
                                                </Badge>
                                            </TableCell>
                                        )}
                                        <TableCell>{source.nama_pengelola || '-'}</TableCell>
                                        <TableCell>{formatNumber(source.sr_unit)}</TableCell>
                                        <TableCell>{formatNumber(capaianJiwa)}</TableCell>
                                        <TableCell>{source.tahun_pembangunan_raw || '-'}</TableCell>
                                        <TableCell>{source.sumber_dana_raw || '-'}</TableCell>
                                        <TableCell>{formatMoney(source.anggaran_rp)}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

export default function SpmAirMinumPage() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [params, setParams] = useState<SpmParams>({ per_page: 15 })
    const [selected, setSelected] = useState<SpmAirMinum | null>(null)

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['spm-air-minum', page, params],
        queryFn: () => getSpmAirMinum({ ...params, page }),
    })
    const { data: stats } = useQuery({
        queryKey: ['spm-air-minum-stats', params.jenis_jaringan],
        queryFn: () => getSpmStats({ jenis_jaringan: params.jenis_jaringan }),
    })
    const { data: options } = useQuery({ queryKey: ['spm-air-minum-options'], queryFn: getSpmOptions })
    const { data: unmatched } = useQuery({ queryKey: ['spm-air-minum-unmatched'], queryFn: getSpmUnmatched })

    const detailMutation = useMutation({
        mutationFn: getSpmDetail,
        onSuccess: setSelected,
    })

    const consolidateMutation = useMutation({
        mutationFn: consolidateSpmAirMinum,
        onSuccess: (response) => {
            toast.success(response.message)
            queryClient.invalidateQueries({ queryKey: ['spm-air-minum'] })
            queryClient.invalidateQueries({ queryKey: ['spm-air-minum-stats'] })
            queryClient.invalidateQueries({ queryKey: ['spm-air-minum-options'] })
            queryClient.invalidateQueries({ queryKey: ['spm-air-minum-unmatched'] })
        },
        onError: () => toast.error('Konsolidasi gagal dijalankan'),
    })

    const records = data?.data || []
    const meta = data?.meta
    const updateParam = (key: keyof SpmParams, value: string) => {
        setParams((current) => ({
            ...current,
            [key]: value === 'all' || value === '' ? undefined : key === 'kecamatan_id' || key === 'per_page' ? Number(value) : value,
        }))
        setPage(1)
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">SPM Air Minum</h1>
                        <p className="text-muted-foreground">Konsolidasi JP dan BJP per desa dari data raw SPAM.</p>
                    </div>
                </div>
                <Button onClick={() => consolidateMutation.mutate()} disabled={consolidateMutation.isPending}>
                    <Shuffle className="mr-2 h-4 w-4" />
                    {consolidateMutation.isPending ? 'Memproses...' : 'Jalankan Konsolidasi'}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Desa</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{formatNumber(stats?.total_desa)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Jiwa JP</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{formatNumber(stats?.jp_jiwa_terlayani)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Jiwa BJP</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{formatNumber(stats?.bjp_jiwa_terlayani)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Belum Match</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold text-destructive">{formatNumber(stats?.match.unmatched)}</div></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Konsolidasi Desa</CardTitle>
                        <p className="text-sm text-muted-foreground">{isFetching ? 'Memuat...' : `Total ${formatNumber(meta?.total ?? 0)} baris`}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 grid gap-3 md:grid-cols-[1fr_190px_150px_180px_130px]">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Cari desa atau kecamatan..." value={params.search || ''} onChange={(event) => updateParam('search', event.target.value)} className="pl-8" />
                        </div>
                        <Select value={params.kecamatan_id ? String(params.kecamatan_id) : 'all'} onValueChange={(value) => updateParam('kecamatan_id', value)}>
                            <SelectTrigger><SelectValue placeholder="Kecamatan" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Semua Kecamatan</SelectItem>{options?.kecamatan.map((kec) => <SelectItem key={kec.id} value={String(kec.id)}>{kec.nama}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={params.jenis_jaringan || 'all'} onValueChange={(value) => updateParam('jenis_jaringan', value)}>
                            <SelectTrigger><SelectValue placeholder="Jenis" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">JP + BJP</SelectItem><SelectItem value="JP">JP</SelectItem><SelectItem value="BJP">BJP</SelectItem></SelectContent>
                        </Select>
                        <Select value={params.status_spm || 'all'} onValueChange={(value) => updateParam('status_spm', value)}>
                            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Semua Status</SelectItem><SelectItem value="terpenuhi">Terpenuhi</SelectItem><SelectItem value="belum_terpenuhi">Belum Terpenuhi</SelectItem><SelectItem value="data_kurang">Data Kurang</SelectItem></SelectContent>
                        </Select>
                        <Select value={String(params.per_page || 15)} onValueChange={(value) => updateParam('per_page', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="15">15/baris</SelectItem><SelectItem value="50">50/baris</SelectItem></SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Wilayah</TableHead><TableHead>Target</TableHead><TableHead>JP</TableHead><TableHead>BJP</TableHead><TableHead>Total</TableHead><TableHead>Belum</TableHead><TableHead>%</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell><div className="font-medium">{record.desa}</div><div className="text-xs text-muted-foreground">{record.kecamatan}</div></TableCell>
                                            <TableCell>{formatNumber(record.target_total_jiwa)}</TableCell>
                                            <TableCell>{formatNumber(record.jp_jiwa_terlayani)}</TableCell>
                                            <TableCell>{formatNumber(record.bjp_jiwa_terlayani)}</TableCell>
                                            <TableCell>{formatNumber(record.total_jiwa_terlayani)}</TableCell>
                                            <TableCell>{formatNumber(record.belum_terlayani)}</TableCell>
                                            <TableCell>{record.persentase_layanan ? `${record.persentase_layanan}%` : '-'}</TableCell>
                                            <TableCell>{statusBadge(record.status_spm)}</TableCell>
                                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => detailMutation.mutate(record.id)}><Eye className="h-4 w-4" /></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {meta && meta.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
                            <span className="text-sm">Hal {page} dari {meta.last_page}</span>
                            <Button variant="outline" size="sm" disabled={page === meta.last_page} onClick={() => setPage(page + 1)}>Next</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Raw Belum Match</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid gap-2 md:grid-cols-2">
                        {(unmatched?.data || []).map((item) => (
                            <div key={item.id} className="rounded-md border p-3 text-sm">
                                <div className="font-medium">{item.desa_raw || '-'} <span className="text-muted-foreground">({item.kecamatan_raw || '-'})</span></div>
                                <div className="text-xs text-muted-foreground">{item.source_type} #{item.source_id} - {item.match_status}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>{selected?.desa} - {selected?.kecamatan}</DialogTitle>
                        <DialogDescription>Sumber data konsolidasi dengan capaian jiwa dihitung dari SR x 5.</DialogDescription>
                    </DialogHeader>
                    <div className="min-w-0 flex-1 space-y-5 overflow-y-auto pr-1">
                        <SourceTable
                            title="kelembagaan_raw (JP/BJP)"
                            sources={selected?.sources?.filter((source) => source.source_type === 'kelembagaan_raw' && sourceMatchesJenis(source, params.jenis_jaringan))}
                            showJenis
                        />
                        <SourceTable
                            title="terbangun_raw"
                            sources={selected?.sources?.filter((source) => source.source_type === 'terbangun_raw' && sourceMatchesJenis(source, params.jenis_jaringan))}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
