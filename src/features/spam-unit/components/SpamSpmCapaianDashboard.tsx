import { useQuery } from '@tanstack/react-query'
import {
    Building2,
    Droplets,
    Filter,
    Landmark,
    MapPin,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import { getDesaByKecamatan } from '@/features/desa/api/desa'
import { getSpamUnitStats } from '../api'
import { SpamSpmWilayahTable } from './SpamSpmWilayahTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { getManualScopeLabel } from '../lib/manual-scope'
import { SPAM_ACCUMULATION_START_TAHUN, SPAM_BASELINE_CAP_TAHUN } from '../lib/baseline'
import type { SpamStatsMetricBlock, UnitSpamStats } from '../types'

const TAHUN_OPTIONS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020']

interface SpamSpmCapaianDashboardProps {
    kecamatanId?: number
    desaId?: number
    tahun?: string
    onKecChange?: (kec: number | '') => void
    onDesaChange?: (desa: number | '') => void
    onTahunChange?: (tahun: string) => void
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

function CapaianBlockTable({
    baseline,
    integrasi,
    total,
    baselineLabel,
    integrasiLabel,
}: {
    baseline: SpamStatsMetricBlock | undefined
    integrasi: SpamStatsMetricBlock | undefined
    total: SpamStatsMetricBlock | undefined
    baselineLabel: string
    integrasiLabel: string
}) {
    const rows = [
        { key: 'sr', label: 'Sambungan Rumah (SR)' },
        { key: 'kk', label: 'Kepala Keluarga (KK)' },
        { key: 'jiwa', label: 'Jiwa Terlayani' },
        { key: 'nilai_kontrak', label: 'Nilai Kontrak / Anggaran', isCurrency: true },
    ] as const

    return (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-transparent dark:bg-slate-900/50">
                        <TableHead>Indikator</TableHead>
                        <TableHead className="text-right">{baselineLabel}</TableHead>
                        <TableHead className="text-right">{integrasiLabel}</TableHead>
                        <TableHead className="text-right">Total Tercatat</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
                        const b = baseline?.[row.key] ?? 0
                        const i = integrasi?.[row.key] ?? 0
                        const t = total?.[row.key] ?? 0
                        const fmt = (v: number) =>
                            row.key === 'nilai_kontrak' ? formatCurrency(v) : v.toLocaleString('id-ID')

                        return (
                            <TableRow key={row.key}>
                                <TableCell className="font-medium">{row.label}</TableCell>
                                <TableCell className="text-right">{fmt(b)}</TableCell>
                                <TableCell className="text-right text-blue-600">{fmt(i)}</TableCell>
                                <TableCell className="text-right font-semibold">{fmt(t)}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

export function SpamSpmCapaianDashboard({
    kecamatanId,
    desaId,
    tahun,
    onKecChange,
    onDesaChange,
    onTahunChange,
}: SpamSpmCapaianDashboardProps) {
    const { data: kecamatans } = useQuery({
        queryKey: ['kecamatans-list'],
        queryFn: getKecamatan,
    })

    const { data: desas } = useQuery({
        queryKey: ['desas-list-by-kec', kecamatanId],
        queryFn: () => getDesaByKecamatan(kecamatanId as number),
        enabled: !!kecamatanId,
        staleTime: 0,
    })

    const { data: statsData, isLoading } = useQuery({
        queryKey: ['spam-units-stats', kecamatanId, tahun],
        queryFn: () =>
            getSpamUnitStats({
                kecamatan_id: kecamatanId,
                tahun: tahun || undefined,
            }),
        staleTime: 0,
    })

    const stats = statsData?.data as UnitSpamStats | undefined
    const ringkasan = stats?.ringkasan
    const scopeLabel = ringkasan?.scope_label ?? stats?.manual_scope_label ?? getManualScopeLabel(tahun)
    const baselineCap = ringkasan?.baseline_cap_tahun ?? stats?.baseline_cap_tahun ?? SPAM_BASELINE_CAP_TAHUN
    const accumulationStart =
        ringkasan?.accumulation_start_tahun ?? stats?.accumulation_start_tahun ?? SPAM_ACCUMULATION_START_TAHUN

    const spm = ringkasan?.spm
    const coverage = spm?.coverage_percentage ?? stats?.coverage_percentage ?? 0
    const targetKk = spm?.target_kk ?? stats?.total_target ?? 0

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Card className="h-16 animate-pulse bg-muted/40" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="h-28 animate-pulse bg-muted/40" />
                    ))}
                </div>
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <CardTitle className="text-base">Filter Capaian SPM</CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Data capaian unit SPAM, target desa, BJP, dan anggaran — terpisah dari integrasi pekerjaan.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={kecamatanId ? String(kecamatanId) : 'all'}
                                onValueChange={(val) => {
                                    onKecChange?.(val === 'all' ? '' : Number(val))
                                    onDesaChange?.('')
                                }}
                            >
                                <SelectTrigger className="h-9 w-[200px] text-xs">
                                    <SelectValue placeholder="Semua Kecamatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kecamatan</SelectItem>
                                    {kecamatans?.data?.map((kec: { id: number; nama_kecamatan?: string; n_kec?: string }) => (
                                        <SelectItem key={kec.id} value={String(kec.id)}>
                                            {kec.nama_kecamatan || kec.n_kec}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={desaId ? String(desaId) : 'all'}
                                onValueChange={(val) => onDesaChange?.(val === 'all' ? '' : Number(val))}
                                disabled={!kecamatanId}
                            >
                                <SelectTrigger className="h-9 w-[180px] text-xs">
                                    <SelectValue placeholder="Semua Desa" />
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
                                <SelectTrigger className="h-9 w-[150px] text-xs">
                                    <SelectValue placeholder="Semua Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tahun</SelectItem>
                                    {TAHUN_OPTIONS.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            Tahun {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                    Periode capaian: {scopeLabel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                    Acuan master s/d {baselineCap}
                </Badge>
                <Badge variant="outline" className="text-xs">
                    Integrasi {accumulationStart}+ terpisah
                </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <Card className="flex flex-row items-center gap-3 p-5 shadow-sm xl:col-span-1">
                    <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-600 dark:bg-emerald-900/30">
                        <Target className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Target KK Desa</p>
                        <p className="text-lg font-bold">{targetKk.toLocaleString('id-ID')}</p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center gap-3 p-5 shadow-sm">
                    <div className="rounded-lg bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-900/30">
                        <Droplets className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">SR Tercatat</p>
                        <p className="text-lg font-bold">
                            {(ringkasan?.capaian.sr ?? stats.capaian_sr ?? stats.total_sr).toLocaleString('id-ID')}
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center gap-3 p-5 shadow-sm">
                    <div className="rounded-lg bg-cyan-100 p-2.5 text-cyan-600 dark:bg-cyan-900/30">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">KK / Jiwa</p>
                        <p className="text-lg font-bold">
                            {(ringkasan?.capaian.kk ?? stats.capaian_kk ?? stats.total_kk).toLocaleString('id-ID')} KK
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            {(ringkasan?.capaian.jiwa ?? stats.capaian_jiwa ?? stats.total_jiwa).toLocaleString('id-ID')} jiwa
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center gap-3 p-5 shadow-sm">
                    <div className="rounded-lg bg-violet-100 p-2.5 text-violet-600 dark:bg-violet-900/30">
                        <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Anggaran Tercatat</p>
                        <p className="text-sm font-bold">
                            {formatCurrency(ringkasan?.capaian.nilai_kontrak ?? stats.capaian_nilai_kontrak ?? 0)}
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-col justify-between p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Cakupan SPM</p>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="mt-1 text-2xl font-bold">{coverage}%</p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            style={{ width: `${Math.min(coverage, 100)}%` }}
                        />
                    </div>
                </Card>

                <Card className="flex flex-row items-center gap-3 p-5 shadow-sm">
                    <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-900/30">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Unit SPAM</p>
                        <p className="text-lg font-bold">{stats.total_units}</p>
                        <p className="text-[10px] text-muted-foreground">
                            {stats.simspam_count} SIMSPAM · {stats.non_simspam_count} standar
                        </p>
                    </div>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Komposisi Capaian</CardTitle>
                        <p className="text-xs font-normal text-muted-foreground">
                            Acuan master tidak ditimpa. Capaian integrasi hanya tahun {accumulationStart} ke atas.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <CapaianBlockTable
                            baseline={ringkasan?.baseline}
                            integrasi={ringkasan?.capaian_integrasi}
                            total={ringkasan?.capaian}
                            baselineLabel={`Acuan s/d ${baselineCap}`}
                            integrasiLabel={`Integrasi ${accumulationStart}+`}
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Perhitungan Cakupan SPM</CardTitle>
                        <p className="text-xs font-normal text-muted-foreground">
                            (JP + Total BJP) / Target KK desa × 100%
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid gap-2 rounded-lg border bg-slate-50/50 p-4 text-sm dark:bg-slate-900/50">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Jumlah Penduduk (JP) — KK tercatat</span>
                                <span className="font-semibold">
                                    {(spm?.jp_kk ?? stats.total_kk).toLocaleString('id-ID')} KK
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">BJP Master (desa)</span>
                                <span className="font-semibold">
                                    {(spm?.bjp_master_kk ?? 0).toLocaleString('id-ID')} KK
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">BJP Unit SPAM</span>
                                <span className="font-semibold">
                                    {(spm?.bjp_unit_kk ?? 0).toLocaleString('id-ID')} KK
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-medium">Total BJP</span>
                                <span className="font-bold">
                                    {(spm?.total_bjp_kk ?? stats.total_bjp_kk).toLocaleString('id-ID')} KK
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">BJP Jiwa (estimasi ×5)</span>
                                <span className="font-semibold">
                                    {(stats.total_bjp_jiwa ?? (spm?.total_bjp_kk ?? stats.total_bjp_kk) * 5).toLocaleString('id-ID')} jiwa
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-emerald-700 dark:text-emerald-400">
                                <span className="font-medium">Cakupan SPM</span>
                                <span className="text-lg font-bold">{coverage}%</span>
                            </div>
                        </div>

                        <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                            Rekam capaian per unit di tab <strong>Master Unit SPAM</strong> → detail unit → histori capaian tahunan.
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Distribusi Sumber Dana</CardTitle>
                        <p className="text-xs font-normal text-muted-foreground">
                            Jumlah unit dengan anggaran per sumber dana ({scopeLabel})
                        </p>
                    </CardHeader>
                    <CardContent>
                        {stats.funding_distribution && stats.funding_distribution.length > 0 ? (
                            <div className="space-y-2">
                                {stats.funding_distribution.map((item) => (
                                    <div
                                        key={item.sumber_dana}
                                        className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                                    >
                                        <span>{item.sumber_dana || 'Lainnya'}</span>
                                        <Badge variant="secondary">{item.count} unit</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Belum ada data anggaran tercatat.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            Ringkasan Wilayah & Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between rounded-lg border px-3 py-2">
                                <span className="text-muted-foreground">Kecamatan</span>
                                <span className="font-semibold">{stats.wilayah_total_kecamatan ?? '-'}</span>
                            </div>
                            <div className="flex justify-between rounded-lg border px-3 py-2">
                                <span className="text-muted-foreground">Desa</span>
                                <span className="font-semibold">{stats.wilayah_total_desa ?? '-'}</span>
                            </div>
                            <div className="flex justify-between rounded-lg border px-3 py-2">
                                <span className="text-muted-foreground">Rekam capaian (baris achievement)</span>
                                <span className="font-semibold">{stats.achievement_records ?? 0}</span>
                            </div>
                            <div className="flex justify-between rounded-lg border px-3 py-2">
                                <span className="text-muted-foreground">Periode target capaian</span>
                                <span className="font-semibold">{stats.target_year}</span>
                            </div>
                            {stats.stats_generated_at && (
                                <p className="pt-1 text-[10px] text-muted-foreground">
                                    Diperbarui: {new Date(stats.stats_generated_at).toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <SpamSpmWilayahTable
                kecamatanId={kecamatanId}
                desaId={desaId}
                tahun={tahun}
            />
        </div>
    )
}