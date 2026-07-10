import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Filter, Loader2, RefreshCw, Search, Share2, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import { getDesaByKecamatan } from '@/features/desa/api/desa'
import { getSpamUnits, getSpamUnitStats } from '../api'
import type { UnitSpam } from '../types'
import {
    completenessScore,
    downloadKelembagaanPokmasWorkbook,
    mapUnitToKelembagaanRow,
    type KelembagaanRow,
} from '../lib/kelembagaan'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { SpamUnitDetailSheet } from './SpamUnitDetailSheet'
import { SpamKelembagaanShareDialog } from './SpamKelembagaanShareDialog'
import { SpamKelembagaanSubmissionsPanel } from './SpamKelembagaanSubmissionsPanel'
import { cn } from '@/lib/utils'

const TAHUN_OPTIONS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020']

interface SpamKelembagaanDashboardProps {
    kecamatanId?: number
    desaId?: number
    tahun?: string
    onKecChange?: (kec: number | '') => void
    onDesaChange?: (desa: number | '') => void
    onTahunChange?: (tahun: string) => void
}

function scoreTone(score: number) {
    if (score >= 75) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    if (score >= 40) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
}

export function SpamKelembagaanDashboard({
    kecamatanId,
    desaId,
    tahun,
    onKecChange,
    onDesaChange,
    onTahunChange,
}: SpamKelembagaanDashboardProps) {
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [detailUnitId, setDetailUnitId] = useState<number | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [shareUnit, setShareUnit] = useState<UnitSpam | null>(null)
    const [shareOpen, setShareOpen] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput.trim())
            setPage(1)
        }, 300)
        return () => clearTimeout(t)
    }, [searchInput])

    useEffect(() => {
        setPage(1)
    }, [kecamatanId, desaId, tahun])

    const { data: kecamatans } = useQuery({
        queryKey: ['kecamatans-list'],
        queryFn: getKecamatan,
    })

    const { data: desas } = useQuery({
        queryKey: ['desas-list-by-kec', kecamatanId],
        queryFn: () => getDesaByKecamatan(kecamatanId as number),
        enabled: !!kecamatanId,
    })

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['spam-kelembagaan-units', page, search, kecamatanId, desaId, tahun],
        queryFn: () =>
            getSpamUnits({
                page,
                per_page: 20,
                search: search || undefined,
                kecamatan_id: kecamatanId,
                desa_id: desaId,
                tahun: tahun || undefined,
            }),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    })

    const meta = data?.meta
    const units = data?.data ?? []

    const rows: KelembagaanRow[] = useMemo(() => {
        const offset = ((meta?.current_page ?? page) - 1) * (meta?.per_page ?? 20)
        return units.map((u, idx) => mapUnitToKelembagaanRow(u, offset + idx + 1, tahun))
    }, [units, meta, page, tahun])

    const pageSummary = useMemo(() => {
        const withPokmas = rows.filter((r) => r.pengelola !== '-' && !r.pengelola_is_fallback).length
        const withPerdes = rows.filter((r) => r.perdes !== '-').length
        const withPengurus = rows.filter((r) => r.kepala !== '-').length
        const avgScore =
            rows.length > 0
                ? Math.round(rows.reduce((s, r) => s + completenessScore(r), 0) / rows.length)
                : 0
        return { withPokmas, withPerdes, withPengurus, avgScore, total: rows.length }
    }, [rows])

    const hasFilter = Boolean(kecamatanId || desaId || tahun || search)

    const clearFilters = () => {
        onKecChange?.('')
        onDesaChange?.('')
        onTahunChange?.('')
        setSearchInput('')
        setSearch('')
        setPage(1)
    }

    const handleExport = async () => {
        if ((meta?.total ?? rows.length) === 0) {
            toast.error('Tidak ada data untuk diekspor')
            return
        }
        setIsExporting(true)
        const toastId = toast.loading('Menyiapkan Excel format workbook POKMAS...')
        try {
            // Ambil seluruh unit sesuai filter (bukan hanya halaman aktif)
            const allUnits: UnitSpam[] = []
            let fetchPage = 1
            let lastPage = 1
            const perPage = 100
            do {
                const res = await getSpamUnits({
                    page: fetchPage,
                    per_page: perPage,
                    search: search || undefined,
                    kecamatan_id: kecamatanId,
                    desa_id: desaId,
                    tahun: tahun || undefined,
                })
                allUnits.push(...(res.data ?? []))
                lastPage = res.meta?.last_page ?? 1
                fetchPage += 1
            } while (fetchPage <= lastPage)

            if (allUnits.length === 0) {
                toast.error('Tidak ada data untuk diekspor', { id: toastId })
                return
            }

            // Total Capaian SPM harus sama dengan tab Capaian SPM (bukan SUM baris unit saja)
            let spmTotals:
                | {
                      target_kk: number
                      jp_kk: number
                      total_bjp_kk: number
                      coverage_percentage: number
                      unit_count: number
                  }
                | undefined
            try {
                const statsRes = await getSpamUnitStats({
                    kecamatan_id: kecamatanId,
                    tahun: tahun || undefined,
                })
                const stats = statsRes?.data
                const spm = stats?.ringkasan?.spm
                if (stats || spm) {
                    spmTotals = {
                        target_kk: spm?.target_kk ?? stats?.total_target ?? 0,
                        jp_kk: spm?.jp_kk ?? stats?.total_kk ?? 0,
                        total_bjp_kk: spm?.total_bjp_kk ?? stats?.total_bjp_kk ?? 0,
                        coverage_percentage:
                            spm?.coverage_percentage ?? stats?.coverage_percentage ?? 0,
                        unit_count: stats?.total_units ?? allUnits.length,
                    }
                }
            } catch {
                // Fallback: footer pakai SUM baris unit
            }

            const exportRows = allUnits.map((u, idx) =>
                mapUnitToKelembagaanRow(u, idx + 1, tahun),
            )
            downloadKelembagaanPokmasWorkbook(exportRows, {
                tahun,
                units: allUnits,
                spmTotals,
            })
            toast.success(
                `Excel diunduh: ${allUnits.length} unit · Capaian SPM diselaraskan dengan tab stats`,
                { id: toastId },
            )
        } catch {
            toast.error('Gagal mengekspor Excel', { id: toastId })
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-4">
            <SpamKelembagaanSubmissionsPanel />

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4" />
                                Pemantauan Kelembagaan SPAM POKMAS
                            </CardTitle>
                            <p className="text-xs text-muted-foreground max-w-3xl">
                                Format mengikuti workbook <em>Pemantauan Kelembagaan SPAM Pokmas dan SPM AM Kab.
                                Cianjur</em> — lokasi, kelembagaan POKMAS, data teknis, parameter iuran, dan SR/KK/jiwa.
                                Gunakan <strong>Share form</strong> agar petugas mengisi tanpa login (perlu verifikasi admin).
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => void refetch()}>
                                <RefreshCw className={cn('mr-1 h-3.5 w-3.5', isFetching && 'animate-spin')} />
                                Muat ulang
                            </Button>
                            <Button
                                size="sm"
                                className="h-9 text-xs"
                                onClick={() => void handleExport()}
                                disabled={isExporting || (meta?.total ?? rows.length) === 0}
                            >
                                {isExporting ? (
                                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Download className="mr-1 h-3.5 w-3.5" />
                                )}
                                Export Excel
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select
                            value={kecamatanId ? String(kecamatanId) : 'all'}
                            onValueChange={(val) => {
                                onKecChange?.(val === 'all' ? '' : Number(val))
                                onDesaChange?.('')
                            }}
                        >
                            <SelectTrigger className="h-9 w-[180px] text-xs">
                                <SelectValue placeholder="Kecamatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kecamatan</SelectItem>
                                {kecamatans?.data?.map(
                                    (kec: { id: number; nama_kecamatan?: string; n_kec?: string }) => (
                                        <SelectItem key={kec.id} value={String(kec.id)}>
                                            {kec.nama_kecamatan || kec.n_kec}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                        <Select
                            value={desaId ? String(desaId) : 'all'}
                            onValueChange={(val) => onDesaChange?.(val === 'all' ? '' : Number(val))}
                            disabled={!kecamatanId}
                        >
                            <SelectTrigger className="h-9 w-[160px] text-xs">
                                <SelectValue placeholder="Desa" />
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
                        <Select
                            value={tahun || 'all'}
                            onValueChange={(val) => onTahunChange?.(val === 'all' ? '' : val)}
                        >
                            <SelectTrigger className="h-9 w-[140px] text-xs">
                                <SelectValue placeholder="Tahun capaian" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Capaian terbaru</SelectItem>
                                {TAHUN_OPTIONS.map((y) => (
                                    <SelectItem key={y} value={y}>
                                        Capaian {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative min-w-[200px] flex-1 max-w-sm">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Cari desa, POKMAS, unit..."
                                className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                        {hasFilter ? (
                            <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={clearFilters}>
                                <X className="mr-1 h-3.5 w-3.5" />
                                Reset
                            </Button>
                        ) : null}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border px-3 py-2">
                            <p className="text-[10px] uppercase text-muted-foreground">Unit di halaman</p>
                            <p className="text-lg font-bold tabular-nums">{pageSummary.total}</p>
                        </div>
                        <div className="rounded-lg border px-3 py-2">
                            <p className="text-[10px] uppercase text-muted-foreground">Ada nama POKMAS</p>
                            <p className="text-lg font-bold tabular-nums text-emerald-600">
                                {pageSummary.withPokmas}
                            </p>
                        </div>
                        <div className="rounded-lg border px-3 py-2">
                            <p className="text-[10px] uppercase text-muted-foreground">Ada Perdes / Pengurus</p>
                            <p className="text-sm font-bold tabular-nums">
                                Perdes {pageSummary.withPerdes} · Kepala {pageSummary.withPengurus}
                            </p>
                        </div>
                        <div className="rounded-lg border px-3 py-2">
                            <p className="text-[10px] uppercase text-muted-foreground">Kelengkapan data (rata-rata)</p>
                            <p className="text-lg font-bold tabular-nums">{pageSummary.avgScore}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-sm text-muted-foreground">Memuat data kelembagaan...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/80 hover:bg-transparent dark:bg-slate-900/50">
                                        <TableHead className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 w-12">
                                            No
                                        </TableHead>
                                        <TableHead className="min-w-[120px]">Kecamatan</TableHead>
                                        <TableHead className="min-w-[120px]">Desa</TableHead>
                                        <TableHead className="text-center">Thn Bangun</TableHead>
                                        <TableHead>Sumber Dana</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead className="min-w-[140px]">Pengelola POKMAS</TableHead>
                                        <TableHead>Perdes</TableHead>
                                        <TableHead>Kepala</TableHead>
                                        <TableHead>Bendahara</TableHead>
                                        <TableHead>Sekretaris</TableHead>
                                        <TableHead className="text-center">Kap. Mata Air</TableHead>
                                        <TableHead>Gravitasi/Pompa</TableHead>
                                        <TableHead className="text-center">Kap. Air Tanah</TableHead>
                                        <TableHead>Iuran</TableHead>
                                        <TableHead className="text-center">SR</TableHead>
                                        <TableHead className="text-center">KK</TableHead>
                                        <TableHead className="text-center">Jiwa</TableHead>
                                        <TableHead className="text-center">Lengkap</TableHead>
                                        <TableHead className="sticky right-0 bg-slate-50 dark:bg-slate-900">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.length > 0 ? (
                                        rows.map((row) => {
                                            const score = completenessScore(row)
                                            return (
                                                <TableRow key={row.id}>
                                                    <TableCell className="sticky left-0 bg-background tabular-nums text-muted-foreground">
                                                        {row.no}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{row.kecamatan}</TableCell>
                                                    <TableCell>
                                                        <div>{row.desa}</div>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {row.unit_name}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-center tabular-nums">
                                                        {row.tahun_pembangunan}
                                                    </TableCell>
                                                    <TableCell className="text-xs">{row.sumber_dana}</TableCell>
                                                    <TableCell className="text-xs">{row.program}</TableCell>
                                                    <TableCell>
                                                        <div
                                                            className={cn(
                                                                'text-sm font-medium',
                                                                row.pengelola_is_fallback &&
                                                                    'text-muted-foreground italic',
                                                            )}
                                                            title={
                                                                row.pengelola_is_fallback
                                                                    ? 'Placeholder (belum diisi di master POKMAS) — sama seperti tampilan Master Unit'
                                                                    : undefined
                                                            }
                                                        >
                                                            {row.pengelola}
                                                        </div>
                                                        {row.pengelola_is_fallback ? (
                                                            <p className="text-[10px] text-amber-600">
                                                                Belum diisi di DB
                                                            </p>
                                                        ) : null}
                                                        {row.is_simspam ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="mt-0.5 text-[10px] text-emerald-600"
                                                            >
                                                                SIMSPAM
                                                            </Badge>
                                                        ) : null}
                                                    </TableCell>
                                                    <TableCell className="text-xs max-w-[100px] truncate" title={row.perdes}>
                                                        {row.perdes}
                                                    </TableCell>
                                                    <TableCell className="text-xs">{row.kepala}</TableCell>
                                                    <TableCell className="text-xs">{row.bendahara}</TableCell>
                                                    <TableCell className="text-xs">{row.sekretaris}</TableCell>
                                                    <TableCell className="text-center text-xs tabular-nums">
                                                        {row.kap_mata_air}
                                                    </TableCell>
                                                    <TableCell className="text-xs">{row.gravitasi_pompa}</TableCell>
                                                    <TableCell className="text-center text-xs tabular-nums">
                                                        {row.kap_air_tanah}
                                                    </TableCell>
                                                    <TableCell className="text-xs max-w-[90px] truncate" title={row.iuran_nominal}>
                                                        {row.iuran_nominal}
                                                    </TableCell>
                                                    <TableCell className="text-center font-semibold tabular-nums">
                                                        {row.jumlah_sr.toLocaleString('id-ID')}
                                                        <p className="text-[10px] font-normal text-muted-foreground">
                                                            {row.capaian_tahun}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-center font-semibold tabular-nums">
                                                        {row.jumlah_kk.toLocaleString('id-ID')}
                                                    </TableCell>
                                                    <TableCell className="text-center tabular-nums">
                                                        {row.jumlah_jiwa.toLocaleString('id-ID')}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span
                                                            className={cn(
                                                                'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums',
                                                                scoreTone(score),
                                                            )}
                                                        >
                                                            {score}%
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="sticky right-0 bg-background">
                                                        <div className="flex flex-wrap gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-xs"
                                                                onClick={() => {
                                                                    setDetailUnitId(row.id)
                                                                    setDetailOpen(true)
                                                                }}
                                                            >
                                                                Detail
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="h-8 text-xs"
                                                                title="Bag tanpa login"
                                                                onClick={() => {
                                                                    const unit = units.find((u) => u.id === row.id)
                                                                    if (unit) {
                                                                        setShareUnit(unit)
                                                                        setShareOpen(true)
                                                                    }
                                                                }}
                                                            >
                                                                <Share2 className="mr-1 h-3.5 w-3.5" />
                                                                Share
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={20} className="p-12 text-center text-muted-foreground">
                                                Tidak ada unit SPAM untuk filter ini. Isi data kelembagaan di Master Unit
                                                SPAM.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>

                {meta ? (
                    <CardFooter className="flex flex-col gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            {isFetching && !isLoading ? 'Memperbarui... · ' : ''}
                            Menampilkan {rows.length} dari {meta.total} unit
                            {meta.last_page > 1 ? ` · hlm. ${page}/${meta.last_page}` : ''}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                disabled={page >= meta.last_page}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </CardFooter>
                ) : null}
            </Card>

            <SpamUnitDetailSheet
                unitId={detailUnitId}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                initialTab="pokmas"
            />

            <SpamKelembagaanShareDialog
                unit={shareUnit}
                open={shareOpen}
                onOpenChange={setShareOpen}
            />
        </div>
    )
}
