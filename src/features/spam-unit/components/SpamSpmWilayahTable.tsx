import { useEffect, useState } from 'react'
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
        { sr: 0, kk: 0, jiwa: 0, bjpUnit: 0 }
    )

    return { ...totals, tahunLabel: 'Akumulasi' }
}

export function SpamSpmWilayahTable({ kecamatanId, desaId, tahun }: SpamSpmWilayahTableProps) {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [detailUnitId, setDetailUnitId] = useState<number | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [detailTab, setDetailTab] = useState<'info' | 'pokmas' | 'achievements' | 'budgets'>('info')

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
        staleTime: 0,
    })

    const rows = data?.data ?? []
    const meta = data?.meta

    const openDetail = (unitId: number, tab: typeof detailTab = 'info') => {
        setDetailUnitId(unitId)
        setDetailTab(tab)
        setDetailOpen(true)
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div>
                            <CardTitle className="text-base">Capaian per Desa & Unit SPAM</CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Daftar unit SPAM per kecamatan/desa. Klik detail untuk melihat unit teknis, POKMAS, dan histori capaian.
                            </p>
                        </div>
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari desa, kecamatan, unit, POKMAS..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setPage(1)
                                }}
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
                                        <TableHead className="min-w-[110px]">Desa</TableHead>
                                        <TableHead className="min-w-[160px]">Unit SPAM</TableHead>
                                        <TableHead className="min-w-[150px]">POKMAS</TableHead>
                                        <TableHead className="text-center">SR</TableHead>
                                        <TableHead className="text-center">KK</TableHead>
                                        <TableHead className="text-center">BJP</TableHead>
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
                                            const bjpTotal =
                                                (unit.desa?.bjp_master ?? 0) + capaian.bjpUnit
                                            const totalAnggaran =
                                                unit.budgets?.reduce(
                                                    (sum, b) => sum + Number(b.nilai_kontrak || 0),
                                                    0
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
                                                        {unit.desa?.target != null && (
                                                            <p className="text-[10px] text-muted-foreground">
                                                                Target {unit.desa.target.toLocaleString('id-ID')} KK
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {unit.name ||
                                                                `SPAM ${unit.desa?.n_desa || ''}`}
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
                                                    <TableCell className="text-center text-sm font-semibold">
                                                        {capaian.sr.toLocaleString('id-ID')}
                                                        <p className="text-[10px] font-normal text-muted-foreground">
                                                            {capaian.tahunLabel}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm font-semibold">
                                                        {capaian.kk.toLocaleString('id-ID')}
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm font-semibold">
                                                        {bjpTotal.toLocaleString('id-ID')}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs font-semibold text-emerald-600">
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
                                                colSpan={9}
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
                    <CardFooter className="flex items-center justify-between border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-900/50">
                        <div className="text-xs text-muted-foreground">
                            {isFetching && !isLoading ? 'Memperbarui... · ' : ''}
                            Menampilkan {rows.length} dari {meta.total} unit
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