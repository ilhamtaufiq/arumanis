import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Eye, FileSpreadsheet, RefreshCw, Search, Upload, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
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
import { getSpamKelembagaanOptions, getSpamKelembagaanRaw, getSpamKelembagaanStats, importSpamKelembagaanRaw } from '../api'
import type { SpamKelembagaanParams, SpamKelembagaanRaw } from '../types'

function formatNumber(value: number | string | null | undefined) {
    if (value === null || value === undefined || value === '') return '-'
    return Number(value).toLocaleString('id-ID')
}

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div className="min-w-0 space-y-0.5 rounded-md border bg-muted/20 p-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
            <p className="truncate text-sm" title={String(value ?? '-')}>{value ?? '-'}</p>
        </div>
    )
}

export default function SpamKelembagaanPage() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [params, setParams] = useState<SpamKelembagaanParams>({ per_page: 15 })
    const [selectedRecord, setSelectedRecord] = useState<SpamKelembagaanRaw | null>(null)
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [replaceData, setReplaceData] = useState(true)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['spam-kelembagaan-raw', page, params],
        queryFn: () => getSpamKelembagaanRaw({ ...params, page }),
    })

    const { data: stats } = useQuery({
        queryKey: ['spam-kelembagaan-stats', params],
        queryFn: () => getSpamKelembagaanStats(params),
    })

    const { data: options } = useQuery({
        queryKey: ['spam-kelembagaan-options'],
        queryFn: getSpamKelembagaanOptions,
    })

    const records = data?.data || []
    const meta = data?.meta
    const totalPages = meta?.last_page || 1
    const kecamatanOptions = options?.kecamatan || []

    const importMutation = useMutation({
        mutationFn: () => {
            if (!selectedFile) throw new Error('Pilih file Excel terlebih dahulu.')
            return importSpamKelembagaanRaw(selectedFile, replaceData)
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Data kelembagaan berhasil diimpor')
            setIsImportOpen(false)
            setSelectedFile(null)
            queryClient.invalidateQueries({ queryKey: ['spam-kelembagaan-raw'] })
            queryClient.invalidateQueries({ queryKey: ['spam-kelembagaan-stats'] })
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal mengimpor data kelembagaan'),
    })

    const updateParam = (key: keyof SpamKelembagaanParams, value: string) => {
        setParams((current) => ({
            ...current,
            [key]: value === 'all' || value === '' ? undefined : key === 'tahun' || key === 'per_page' ? Number(value) : value,
        }))
        setPage(1)
    }

    const renderPagination = () => {
        const pages: (number | string)[] = []
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else if (page <= 3) {
            pages.push(1, 2, 3, 'ellipsis', totalPages)
        } else if (page >= totalPages - 2) {
            pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages)
        } else {
            pages.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages)
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); if (page > 1) { setPage(page - 1); setExpandedRows({}); } }} className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                    </PaginationItem>
                    {pages.map((item, index) => (
                        <PaginationItem key={`${item}-${index}`}>
                            {item === 'ellipsis' ? <PaginationEllipsis /> : (
                                <PaginationLink href="#" isActive={page === item} onClick={(event) => { event.preventDefault(); setPage(item as number); setExpandedRows({}); }}>
                                    {item}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(event) => { event.preventDefault(); if (page < totalPages) { setPage(page + 1); setExpandedRows({}); } }} className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kelembagaan SPAM</h1>
                        <p className="text-muted-foreground">Raw data kelembagaan JP dan BJP dari workbook sumber.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ['spam-kelembagaan-raw'] })
                        queryClient.invalidateQueries({ queryKey: ['spam-kelembagaan-stats'] })
                    }} disabled={isFetching}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Muat Ulang
                    </Button>
                    <Button onClick={() => setIsImportOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Excel
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total SR</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{formatNumber(stats?.total_sr)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total KK (JP)</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{formatNumber(stats?.total_kk_jp)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total KK (BJP)</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{formatNumber(stats?.total_kk_bjp)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Jiwa</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{formatNumber(stats?.total_jiwa_terlayani)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Persentase</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{stats?.total_target_layanan ? ((stats.total_jiwa_terlayani / stats.total_target_layanan) * 100).toFixed(1) + '%' : '0%'}</div><div className="text-xs text-muted-foreground mt-1">Jiwa Terlayani / Target</div></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Data Raw Kelembagaan</CardTitle>
                        <p className="text-sm text-muted-foreground">Total {formatNumber(meta?.total ?? 0)} baris</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 grid gap-3 md:grid-cols-[1fr_140px_180px_140px_140px]">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Cari desa, kecamatan, pengelola..." value={params.search || ''} onChange={(event) => updateParam('search', event.target.value)} className="pl-8" />
                        </div>
                        <Select value={params.jenis_jaringan || 'all'} onValueChange={(value) => updateParam('jenis_jaringan', value)}>
                            <SelectTrigger><SelectValue placeholder="Jenis" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="JP">JP</SelectItem><SelectItem value="BJP">BJP</SelectItem></SelectContent>
                        </Select>
                        <Select value={params.kecamatan || 'all'} onValueChange={(value) => updateParam('kecamatan', value)}>
                            <SelectTrigger><SelectValue placeholder="Kecamatan" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Semua Kecamatan</SelectItem>{kecamatanOptions.map((kecamatan) => <SelectItem key={kecamatan} value={kecamatan}>{kecamatan}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input placeholder="Tahun" inputMode="numeric" value={params.tahun || ''} onChange={(event) => updateParam('tahun', event.target.value)} />
                        <Select value={String(params.per_page || 15)} onValueChange={(value) => updateParam('per_page', value)}>
                            <SelectTrigger><SelectValue placeholder="Per page" /></SelectTrigger>
                            <SelectContent><SelectItem value="15">15/baris</SelectItem><SelectItem value="25">25/baris</SelectItem><SelectItem value="50">50/baris</SelectItem></SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : records.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">Belum ada data kelembagaan.</div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10"></TableHead>
                                        <TableHead>Kecamatan</TableHead>
                                        <TableHead className="min-w-[170px]">Desa/Kelurahan</TableHead>
                                        <TableHead>Total SR</TableHead>
                                        <TableHead>KK Terlayani</TableHead>
                                        <TableHead>Jiwa Terlayani</TableHead>
                                        <TableHead>Persentase</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((group, idx) => {
                                        const key = group.desa_kelurahan_normalized || String(idx)
                                        const isExpanded = expandedRows[key]
                                        return (
                                            <React.Fragment key={key}>
                                                <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }))}>
                                                    <TableCell>
                                                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                                    </TableCell>
                                                    <TableCell>{group.kecamatan || '-'}</TableCell>
                                                    <TableCell className="font-medium">{group.desa_kelurahan || '-'}</TableCell>
                                                    <TableCell>{formatNumber(group.total_sr)}</TableCell>
                                                    <TableCell>{formatNumber(group.total_kk_terlayani)}</TableCell>
                                                    <TableCell>{formatNumber(group.total_jiwa_terlayani)}</TableCell>
                                                    <TableCell>
                                                        {group.target_layanan > 0 
                                                            ? ((group.total_jiwa_terlayani / group.target_layanan) * 100).toFixed(1) + '%' 
                                                            : '0%'}
                                                    </TableCell>
                                                </TableRow>
                                                {isExpanded && (
                                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                        <TableCell colSpan={7} className="p-0 border-b">
                                                            <div className="p-4 shadow-inner">
                                                                <h4 className="font-semibold mb-3 text-sm">Daftar Sistem di {group.desa_kelurahan}</h4>
                                                                <div className="grid gap-3">
                                                                    {group.sistem_list.map(sistem => (
                                                                        <div key={sistem.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-background p-3 rounded-md border gap-3">
                                                                            <div className="flex flex-col gap-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Badge variant={sistem.jenis_jaringan === 'JP' ? 'default' : 'outline'}>{sistem.jenis_jaringan}</Badge>
                                                                                    <span className="font-medium text-sm">{sistem.nama_pengelola || 'Tanpa Pengelola'}</span>
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                                    <span>Sumber: {sistem.sistem_aliran || '-'}</span>
                                                                                    <span>&bull;</span>
                                                                                    <span>Tahun: {sistem.tahun_pembangunan_raw || '-'}</span>
                                                                                    <span>&bull;</span>
                                                                                    <span>Dana: {sistem.sumber_dana_raw || '-'}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                                <div className="flex gap-4 mr-4">
                                                                                    <div className="flex flex-col items-end">
                                                                                        <span className="text-xs">SR</span>
                                                                                        <span className="font-medium text-foreground">{formatNumber(sistem.sr_unit)}</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col items-end">
                                                                                        <span className="text-xs">KK</span>
                                                                                        <span className="font-medium text-foreground">{formatNumber(sistem.kk_terlayani)}</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col items-end">
                                                                                        <span className="text-xs">Jiwa</span>
                                                                                        <span className="font-medium text-foreground">{formatNumber(sistem.jiwa_terlayani)}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedRecord(sistem); }}>
                                                                                    <Eye className="h-4 w-4 mr-2" /> Detail
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {totalPages > 1 && <div className="mt-4 flex justify-end">{renderPagination()}</div>}
                </CardContent>
            </Card>

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" />Import Kelembagaan SPAM</DialogTitle>
                        <DialogDescription>Upload workbook dengan sheet DATA KELEMBAGAAN JP dan DATA KELEMBAGAAN BJP.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input type="file" accept=".xlsx,.xls" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
                        <label className="flex items-center gap-2 text-sm"><Checkbox checked={replaceData} onCheckedChange={(value) => setReplaceData(Boolean(value))} />Ganti data raw lama sebelum import</label>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportOpen(false)}>Batal</Button>
                        <Button onClick={() => importMutation.mutate()} disabled={!selectedFile || importMutation.isPending}><Upload className="mr-2 h-4 w-4" />{importMutation.isPending ? 'Mengimpor...' : 'Import'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(selectedRecord)} onOpenChange={(open) => !open && setSelectedRecord(null)}>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden p-4 sm:max-w-[1100px]">
                    <DialogHeader>
                        <DialogTitle>Detail Kelembagaan #{selectedRecord?.id}</DialogTitle>
                        <DialogDescription>{selectedRecord?.source_sheet} baris {selectedRecord?.source_row}</DialogDescription>
                    </DialogHeader>
                    {selectedRecord && (
                        <div className="min-w-0 space-y-3">
                            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                <DetailItem label="Jenis" value={selectedRecord.jenis_jaringan} />
                                <DetailItem label="Kecamatan" value={selectedRecord.kecamatan} />
                                <DetailItem label="Desa/Kelurahan" value={selectedRecord.desa_kelurahan} />
                                <DetailItem label="Key Lokasi" value={selectedRecord.lokasi_key} />
                                <DetailItem label="Tahun" value={selectedRecord.tahun_pembangunan_raw} />
                                <DetailItem label="Tahun Awal" value={selectedRecord.tahun_pembangunan_awal} />
                                <DetailItem label="Tahun Akhir" value={selectedRecord.tahun_pembangunan_akhir} />
                                <DetailItem label="Sumber Dana" value={selectedRecord.sumber_dana_raw} />
                                <DetailItem label="Pengelola" value={selectedRecord.nama_pengelola} />
                                <DetailItem label="Perdes Pokmas" value={selectedRecord.perdes_pembentukan_pokmas} />
                                <DetailItem label="Program" value={selectedRecord.program_pembangunan} />
                                <DetailItem label="Kepala" value={selectedRecord.pengurus_kepala} />
                                <DetailItem label="Bendahara" value={selectedRecord.pengurus_bendahara} />
                                <DetailItem label="Sekretaris" value={selectedRecord.pengurus_sekretaris} />
                                <DetailItem label="Sistem" value={selectedRecord.sistem_aliran} />
                                <DetailItem label="Kapasitas Mata Air" value={selectedRecord.kapasitas_mata_air_l_det} />
                                <DetailItem label="Kapasitas Air Tanah" value={selectedRecord.kapasitas_air_tanah_l_det} />
                                <DetailItem label="Kapasitas Lain" value={selectedRecord.kapasitas_lain_l_det} />
                                <DetailItem label="Dasar Hukum Tarif" value={selectedRecord.dasar_hukum_tarif} />
                                <DetailItem label="Besaran Iuran" value={selectedRecord.besaran_iuran} />
                                <DetailItem label="Pendapatan/Bulan" value={formatNumber(selectedRecord.pendapatan_bulanan_rp)} />
                                <DetailItem label="Operasional/Bulan" value={formatNumber(selectedRecord.biaya_operasional_bulanan_rp)} />
                                <DetailItem label="SR" value={formatNumber(selectedRecord.sr_unit)} />
                                <DetailItem label="KK Terlayani" value={formatNumber(selectedRecord.kk_terlayani)} />
                                <DetailItem label="Jiwa Terlayani" value={formatNumber(selectedRecord.jiwa_terlayani)} />
                                <DetailItem label="Target Layanan" value={formatNumber(selectedRecord.target_layanan)} />
                                <DetailItem label="Source File" value={selectedRecord.source_file} />
                            </div>
                            <div className="min-w-0 rounded-md border bg-muted/20 p-2">
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Payload Raw Excel</p>
                                <p className="mt-1 truncate font-mono text-xs" title={selectedRecord.raw_payload ? JSON.stringify(selectedRecord.raw_payload) : 'Tidak ada payload raw.'}>
                                    {selectedRecord.raw_payload ? JSON.stringify(selectedRecord.raw_payload) : 'Tidak ada payload raw.'}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
