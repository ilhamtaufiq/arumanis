import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Database,
    Droplets,
    Eye,
    FileSpreadsheet,
    RefreshCw,
    Search,
    Upload,
} from 'lucide-react'
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
import { getSpamTerbangunRaw, getSpamTerbangunStats, importSpamTerbangunRaw } from '../api'
import type { SpamCondition, SpamTerbangunRaw, SpamTerbangunRawParams } from '../types'

const conditionLabels: Record<SpamCondition, string> = {
    berfungsi: 'Berfungsi',
    tidak_berfungsi: 'Tidak Berfungsi',
    lainnya: 'Lainnya',
}

function formatNumber(value: number | string | null | undefined) {
    if (value === null || value === undefined || value === '') return '-'

    return Number(value).toLocaleString('id-ID')
}

function formatMoney(values: Array<string | null>) {
    const total = values.reduce((sum, value) => sum + (value ? Number(value) : 0), 0)

    if (!total) return '-'

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(total)
}

function conditionBadge(condition: SpamTerbangunRaw['kondisi_normalized'], raw?: string | null) {
    if (condition === 'berfungsi') {
        return <Badge className="bg-emerald-600 hover:bg-emerald-600">{conditionLabels[condition]}</Badge>
    }

    if (condition === 'tidak_berfungsi') {
        return <Badge variant="destructive">{conditionLabels[condition]}</Badge>
    }

    return <Badge variant="outline">{raw || 'Belum Ada Status'}</Badge>
}

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
            <p className="text-sm">{value ?? '-'}</p>
        </div>
    )
}

export default function SpamTerbangunRawPage() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [params, setParams] = useState<SpamTerbangunRawParams>({ per_page: 15 })
    const [selectedRecord, setSelectedRecord] = useState<SpamTerbangunRaw | null>(null)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [replaceData, setReplaceData] = useState(true)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['spam-terbangun-raw', page, params],
        queryFn: () => getSpamTerbangunRaw({ ...params, page }),
    })

    const { data: stats } = useQuery({
        queryKey: ['spam-terbangun-raw-stats', params],
        queryFn: () => getSpamTerbangunStats(params),
    })

    const records = data?.data || []
    const meta = data?.meta
    const totalPages = meta?.last_page || 1

    const kecamatanOptions = useMemo(() => {
        return Array.from(new Set(records.map((record) => record.kecamatan).filter(Boolean) as string[])).sort()
    }, [records])

    const importMutation = useMutation({
        mutationFn: () => {
            if (!selectedFile) {
                throw new Error('Pilih file Excel terlebih dahulu.')
            }

            return importSpamTerbangunRaw(selectedFile, replaceData)
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Data SPAM berhasil diimpor')
            setIsImportOpen(false)
            setSelectedFile(null)
            queryClient.invalidateQueries({ queryKey: ['spam-terbangun-raw'] })
            queryClient.invalidateQueries({ queryKey: ['spam-terbangun-raw-stats'] })
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Gagal mengimpor data SPAM')
        },
    })

    const updateParam = (key: keyof SpamTerbangunRawParams, value: string) => {
        setParams((current) => ({
            ...current,
            [key]: value === 'all' || value === '' ? undefined : key === 'tahun' ? Number(value) : value,
        }))
        setPage(1)
    }

    const renderPagination = () => {
        const pages: (number | string)[] = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else if (page <= 3) {
            for (let i = 1; i <= 3; i++) pages.push(i)
            pages.push('ellipsis', totalPages)
        } else if (page >= totalPages - 2) {
            pages.push(1, 'ellipsis')
            for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages)
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(event) => {
                                event.preventDefault()
                                if (page > 1) setPage(page - 1)
                            }}
                            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                    {pages.map((item, index) => (
                        <PaginationItem key={`${item}-${index}`}>
                            {item === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    isActive={page === item}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        setPage(item as number)
                                    }}
                                >
                                    {item}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(event) => {
                                event.preventDefault()
                                if (page < totalPages) setPage(page + 1)
                            }}
                            className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Droplets className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">SPAM Terbangun Raw</h1>
                        <p className="text-muted-foreground">Data existing SPAM terbangun dari workbook sumber.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            queryClient.invalidateQueries({ queryKey: ['spam-terbangun-raw'] })
                            queryClient.invalidateQueries({ queryKey: ['spam-terbangun-raw-stats'] })
                        }}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Muat Ulang
                    </Button>
                    <Button onClick={() => setIsImportOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Excel
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Aset Raw</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{formatNumber(stats?.total)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Kecamatan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{formatNumber(stats?.kecamatan)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total SR</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{formatNumber(stats?.total_sr)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Jiwa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{formatNumber(stats?.total_penduduk_terlayani)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Persentase</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{stats?.total_target_layanan ? ((stats.total_penduduk_terlayani / stats.total_target_layanan) * 100).toFixed(1) + '%' : '0%'}</div>
                        <div className="text-xs text-muted-foreground mt-1">Jiwa Terlayani / Target</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Data Raw SPAM
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Total {formatNumber(meta?.total ?? 0)} baris
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px_160px_140px]">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari kecamatan, desa, pengelola, sumber air..."
                                value={params.search || ''}
                                onChange={(event) => updateParam('search', event.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select value={params.kecamatan || 'all'} onValueChange={(value) => updateParam('kecamatan', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Kecamatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kecamatan</SelectItem>
                                {kecamatanOptions.map((kecamatan) => (
                                    <SelectItem key={kecamatan} value={kecamatan}>{kecamatan}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={params.kondisi_normalized || 'all'} onValueChange={(value) => updateParam('kondisi_normalized', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Kondisi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kondisi</SelectItem>
                                <SelectItem value="berfungsi">Berfungsi</SelectItem>
                                <SelectItem value="tidak_berfungsi">Tidak Berfungsi</SelectItem>
                                <SelectItem value="lainnya">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Tahun"
                            inputMode="numeric"
                            value={params.tahun || ''}
                            onChange={(event) => updateParam('tahun', event.target.value)}
                        />
                        <Select value={String(params.per_page || 15)} onValueChange={(value) => updateParam('per_page', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Per page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15">15/baris</SelectItem>
                                <SelectItem value="25">25/baris</SelectItem>
                                <SelectItem value="50">50/baris</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <p>Belum ada data SPAM terbangun raw.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[160px]">Lokasi</TableHead>
                                        <TableHead className="min-w-[180px]">Pengelola</TableHead>
                                        <TableHead className="min-w-[150px]">Sumber Air</TableHead>
                                        <TableHead className="min-w-[120px]">Pemanfaatan</TableHead>
                                        <TableHead className="min-w-[110px]">Dana</TableHead>
                                        <TableHead className="min-w-[120px]">Nilai</TableHead>
                                        <TableHead className="min-w-[110px]">Tahun</TableHead>
                                        <TableHead className="min-w-[130px]">Kondisi</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                <div className="font-medium">{record.desa_kelurahan || '-'}</div>
                                                <div className="text-xs text-muted-foreground">{record.kecamatan || '-'}</div>
                                            </TableCell>
                                            <TableCell>{record.nama_pengelola || '-'}</TableCell>
                                            <TableCell>
                                                <div>{record.sumber_air_baku || '-'}</div>
                                                <div className="text-xs text-muted-foreground">{record.sistem_aliran || '-'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">SR {formatNumber(record.sr_unit)}</div>
                                                <div className="text-xs text-muted-foreground">HU/KU {formatNumber(record.hu_ku_unit)}</div>
                                            </TableCell>
                                            <TableCell>{record.sumber_dana_raw || '-'}</TableCell>
                                            <TableCell>{formatMoney([record.nilai_dak_apbn_rp, record.nilai_apbd_rp, record.nilai_banprov_rp])}</TableCell>
                                            <TableCell>{record.tahun_pembangunan_raw || '-'}</TableCell>
                                            <TableCell>{conditionBadge(record.kondisi_normalized, record.kondisi_raw)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedRecord(record)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-end">
                            {renderPagination()}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            Import SPAM Terbangun
                        </DialogTitle>
                        <DialogDescription>
                            Upload workbook Excel. Sistem membaca sheet Main data dan menyimpan barisnya sebagai data raw.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox checked={replaceData} onCheckedChange={(value) => setReplaceData(Boolean(value))} />
                            Ganti data raw lama sebelum import
                        </label>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={() => importMutation.mutate()} disabled={!selectedFile || importMutation.isPending}>
                            <Upload className="mr-2 h-4 w-4" />
                            {importMutation.isPending ? 'Mengimpor...' : 'Import'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(selectedRecord)} onOpenChange={(open) => !open && setSelectedRecord(null)}>
                <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail SPAM Raw #{selectedRecord?.id}</DialogTitle>
                        <DialogDescription>
                            Source {selectedRecord?.source_sheet || '-'} baris {selectedRecord?.source_row || '-'}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRecord && (
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center gap-2">
                                {conditionBadge(selectedRecord.kondisi_normalized, selectedRecord.kondisi_raw)}
                                <Badge variant="outline">{selectedRecord.sumber_dana_raw || 'Sumber dana kosong'}</Badge>
                                <Badge variant="outline">{selectedRecord.tahun_pembangunan_raw || 'Tahun kosong'}</Badge>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <DetailItem label="Kecamatan" value={selectedRecord.kecamatan} />
                                <DetailItem label="Desa/Kelurahan" value={selectedRecord.desa_kelurahan} />
                                <DetailItem label="Jenis Wilayah" value={selectedRecord.jenis_wilayah} />
                                <DetailItem label="Pengelola" value={selectedRecord.nama_pengelola} />
                                <DetailItem label="Sumber Air Baku" value={selectedRecord.sumber_air_baku} />
                                <DetailItem label="Sistem Aliran" value={selectedRecord.sistem_aliran} />
                                <DetailItem label="Debit Sumber" value={selectedRecord.debit_sumber_l_det ? `${selectedRecord.debit_sumber_l_det} L/det` : null} />
                                <DetailItem label="Debit Diambil" value={selectedRecord.debit_diambil_l_det ? `${selectedRecord.debit_diambil_l_det} L/det` : null} />
                                <DetailItem label="Penduduk Terlayani" value={formatNumber(selectedRecord.penduduk_terlayani)} />
                                <DetailItem label="Jumlah Penduduk" value={formatNumber(selectedRecord.jumlah_penduduk)} />
                                <DetailItem label="HU/KU" value={formatNumber(selectedRecord.hu_ku_unit)} />
                                <DetailItem label="SR" value={formatNumber(selectedRecord.sr_unit)} />
                                <DetailItem label="Tanpa Meter Air" value={formatNumber(selectedRecord.tanpa_meteran_air_unit)} />
                                <DetailItem label="Asal Proyek" value={selectedRecord.asal_proyek} />
                                <DetailItem label="Tanggal Laporan" value={selectedRecord.tanggal_terakhir_laporan} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <DetailItem label="Nilai DAK/APBN" value={formatMoney([selectedRecord.nilai_dak_apbn_rp])} />
                                <DetailItem label="Nilai APBD" value={formatMoney([selectedRecord.nilai_apbd_rp])} />
                                <DetailItem label="Nilai BANPROV" value={formatMoney([selectedRecord.nilai_banprov_rp])} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Keterangan</p>
                                <div className="rounded-md border bg-muted/30 p-3 text-sm">{selectedRecord.keterangan || '-'}</div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Payload Raw Excel</p>
                                <pre className="max-h-52 overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                                    {selectedRecord.raw_payload ? JSON.stringify(selectedRecord.raw_payload, null, 2) : 'Tidak ada payload raw.'}
                                </pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
