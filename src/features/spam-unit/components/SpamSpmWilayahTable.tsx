import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Loader2, Search, Users } from 'lucide-react'
import { getSpamUnits } from '../api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { SpamUnitDetailSheet } from './SpamUnitDetailSheet'
import type { UnitSpam } from '../types'
import { cn } from '@/lib/utils'

interface SpamSpmWilayahTableProps {
    kecamatanId?: number
    desaId?: number
    tahun?: string
}

function formatCurrency(value: number) {
    if (value <= 0) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

function formatNumber(value: number) {
    return value.toLocaleString('id-ID')
}

function getCapaianForRow(unit: UnitSpam, tahun?: string) {
    const achievements = unit.achievements ?? []
    if (achievements.length === 0) {
        return { sr: 0, kk: 0, jiwa: 0, bjpUnit: 0, tahunLabel: tahun || '-' }
    }

    if (tahun) {
        const match = achievements.find((a) => a.tahun === tahun)
        return {
            sr: match?.jumlah_sr ?? 0,
            kk: match?.jumlah_kk ?? 0,
            jiwa: match?.jumlah_jiwa ?? 0,
            bjpUnit: match?.jumlah_bjp_kk ?? 0,
            tahunLabel: tahun,
        }
    }

    const totals = achievements.reduce(
        (acc, a) => ({
            sr: acc.sr + (a.jumlah_sr ?? 0),
            kk: acc.kk + (a.jumlah_kk ?? 0),
            jiwa: acc.jiwa + (a.jumlah_jiwa ?? 0),
            bjpUnit: acc.bjpUnit + (a.jumlah_bjp_kk ?? 0),
        }),
        { sr: 0, kk: 0, jiwa: 0, bjpUnit: 0 },
    )

    return { ...totals, tahunLabel: 'Akumulasi' }
}

function coveragePercent(served: number, target: number | null | undefined) {
    if (!target || target <= 0) return null
    return Math.round((served / target) * 1000) / 10
}

function coverageClass(pct: number | null) {
    if (pct == null) return 'text-muted-foreground'
    if (pct >= 70) return 'text-emerald-600 dark:text-emerald-400'
    if (pct >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
}

export function SpamSpmWilayahTable({ kecamatanId, desaId, tahun }: SpamSpmWilayahTableProps) {
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [detailUnitId, setDetailUnitId] = useState<number | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [detailTab, setDetailTab] = useState<'info' | 'pokmas' | 'achievements' | 'budgets'>('info')

    // Debounce search agar tidak spam request
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim())
            setPage(1)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    useEffect(() => {
        setPage(1)
    }, [kecamatanId, desaId, tahun])

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['spam-spm-wilayah-units', page, search, kecamatanId, desaId, tahun],
        queryFn: () =>
            getSpamUnits({
                page,
                per_page: 15,
                search: search || undefined,
                kecamatan_id: kecamatanId,
                desa_id: desaId,
                tahun: tahun || undefined,
            }),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    })

    const rows = data?.data ?? []
    const meta = data?.meta

    const pageTotals = useMemo(() => {
        return rows.reduce(
            (acc, unit) => {
                const capaian = getCapaianForRow(unit, tahun)
                const bjpMaster = unit.desa?.bjp_master ?? 0
                acc.sr += capaian.sr
                acc.kk += capaian.kk
                acc.jiwa += capaian.jiwa
                acc.bjpUnit += capaian.bjpUnit
                acc.bjpMaster += bjpMaster
                acc.anggaran +=
                    unit.budgets?.reduce((sum, b) => sum + Number(b.nilai_kontrak || 0), 0) ?? 0
                return acc
            },
            { sr: 0, kk: 0, jiwa: 0, bjpUnit: 0, bjpMaster: 0, anggaran: 0 },
        )
    }, [rows, tahun])

    const openDetail = (unitId: number, tab: typeof detailTab = 'info') => {
        setDetailUnitId(unitId)
        setDetailTab(tab)
        setDetailOpen(true)
    }

    return (
        <>
            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div>
                            <CardTitle className="text-base">Capaian per Desa & Unit SPAM</CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                                SR = sambungan rumah (JP). KK = capaian jaringan perpipaan. BJP = master desa + unit
                                (bukan perpipaan; output SR di BJP dihitung sebagai KK).
                            </p>
                        </div>
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari desa, kecamatan, unit, POKMAS..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center space-y-3 p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-sm text-muted-foreground">Memuat data wilayah...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 hover:bg-transparent dark:bg-slate-900/50">
                                        <TableHead className="min-w-[110px]">Kecamatan</TableHead>
                                        <TableHead className="min-w-[120px]">Desa</TableHead>
                                        <TableHead className="min-w-[150px]">Unit SPAM</TableHead>
                                        <TableHead className="min-w-[140px]">POKMAS</TableHead>
                                        <TableHead className="text-center">SR</TableHead>
                                        <TableHead className="text-center">KK</TableHead>
                                        <TableHead className="text-center">Jiwa</TableHead>
                                        <TableHead className="text-center min-w-[90px]">BJP</TableHead>
                                        <TableHead className="text-center">Cakupan</TableHead>
                                        <TableHead className="text-right">Anggaran</TableHead>
                                        <TableHead className="sticky right-0 w-[100px] bg-background text-right shadow-[-8px_0_8px_-4px_rgba(0,0,0,0.08)]">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.length > 0 ? (
                                        rows.map((unit) => {
                                            const capaian = getCapaianForRow(unit, tahun)
                                            const bjpMaster = unit.desa?.bjp_master ?? 0
                                            const bjpTotal = bjpMaster + capaian.bjpUnit
                                            const served = capaian.kk + bjpTotal
                                            const target = unit.desa?.target
                                            const cakupan = coveragePercent(served, target)
                                            const totalAnggaran =
                                                unit.budgets?.reduce(
                                                    (sum, b) => sum + Number(b.nilai_kontrak || 0),
                                                    0,
                                                ) ?? 0
                                            const pokmas =
                                                unit.pengelola?.pokmas ||
                                                `KPSPAM ${(unit.desa?.n_desa || '').toUpperCase()}`

                                            return (
                                                <TableRow
                                                    key={unit.id}
                                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                                                >
                                                    <TableCell className="font-medium">
                                                        {unit.desa?.kecamatan?.n_kec ||
                                                            unit.desa?.kecamatan?.nama_kecamatan}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>{unit.desa?.n_desa || unit.desa?.nama_desa}</div>
                                                        {target != null && (
                                                            <p className="text-[10px] text-muted-foreground">
                                                                Target {formatNumber(target)} KK
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {unit.name || `SPAM ${unit.desa?.n_desa || ''}`}
                                                        </div>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {unit.is_simspam && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px] text-emerald-600"
                                                                >
                                                                    SIMSPAM
                                                                </Badge>
                                                            )}
                                                            <Badge variant="secondary" className="text-[10px]">
                                                                {unit.sistem_layanan || 'Sistem -'}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <button
                                                            type="button"
                                                            className="text-left text-sm hover:text-blue-600 hover:underline"
                                                            onClick={() => openDetail(unit.id, 'pokmas')}
                                                        >
                                                            {pokmas}
                                                        </button>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            Kepala: {unit.pengelola?.kepala || '-'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm font-semibold tabular-nums">
                                                        {formatNumber(capaian.sr)}
                                                        <p className="text-[10px] font-normal text-muted-foreground">
                                                            {capaian.tahunLabel}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm font-semibold tabular-nums">
                                                        {formatNumber(capaian.kk)}
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm tabular-nums">
                                                        {formatNumber(capaian.jiwa)}
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm font-semibold tabular-nums">
                                                        {formatNumber(bjpTotal)}
                                                        <p className="text-[10px] font-normal text-muted-foreground">
                                                            M{formatNumber(bjpMaster)}+U{formatNumber(capaian.bjpUnit)}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell
                                                        className={cn(
                                                            'text-center text-sm font-bold tabular-nums',
                                                            coverageClass(cakupan),
                                                        )}
                                                    >
                                                        {cakupan != null ? `${cakupan}%` : '—'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs font-semibold tabular-nums text-emerald-600">
                                                        {formatCurrency(totalAnggaran)}
                                                    </TableCell>
                                                    <TableCell className="sticky right-0 bg-background shadow-[-8px_0_8px_-4px_rgba(0,0,0,0.08)]">
                                                        <div className="flex justify-end gap-0.5">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                title="Detail unit"
                                                                onClick={() => openDetail(unit.id, 'info')}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                title="Detail POKMAS"
                                                                onClick={() => openDetail(unit.id, 'pokmas')}
                                                            >
                                                                <Users className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={11}
                                                className="p-10 text-center text-muted-foreground"
                                            >
                                                Tidak ada unit SPAM untuk filter ini.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>

                {meta && (
                    <CardFooter className="flex flex-col gap-3 border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <div>
                                {isFetching && !isLoading ? 'Memperbarui... · ' : ''}
                                Menampilkan {rows.length} dari {meta.total} unit
                                {meta.last_page > 1 ? ` · halaman ${page}/${meta.last_page}` : ''}
                            </div>
                            {rows.length > 0 ? (
                                <div className="tabular-nums">
                                    Halaman ini: {formatNumber(pageTotals.sr)} SR · {formatNumber(pageTotals.kk)} KK ·{' '}
                                    {formatNumber(pageTotals.bjpMaster + pageTotals.bjpUnit)} BJP ·{' '}
                                    {formatCurrency(pageTotals.anggaran)}
                                </div>
                            ) : null}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                disabled={page === meta.last_page}
                                onClick={() => setPage((p) => Math.min(p + 1, meta.last_page))}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

            <SpamUnitDetailSheet
                unitId={detailUnitId}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                initialTab={detailTab}
            />
        </>
    )
}
