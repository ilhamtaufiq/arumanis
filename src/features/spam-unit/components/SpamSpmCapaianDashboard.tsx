import { useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Building2,
    Droplets,
    Filter,
    Landmark,
    MapPin,
    RefreshCw,
    Target,
    TrendingUp,
    Users,
    X,
} from 'lucide-react'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import { getDesaByKecamatan } from '@/features/desa/api/desa'
import { getSpamUnitStats } from '../api'
import { SpamSpmWilayahTable } from './SpamSpmWilayahTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'

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

function formatNumber(value: number) {
    return value.toLocaleString('id-ID')
}

function coverageTone(coverage: number) {
    if (coverage >= 70) return 'text-emerald-600 dark:text-emerald-400'
    if (coverage >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
}

function coverageBarColor(coverage: number) {
    if (coverage >= 70) return 'from-emerald-500 to-teal-400'
    if (coverage >= 40) return 'from-amber-500 to-orange-400'
    return 'from-rose-500 to-red-400'
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
        { key: 'sr' as const, label: 'Sambungan Rumah (SR)', hint: 'Khusus JP / jaringan perpipaan' },
        { key: 'kk' as const, label: 'Kepala Keluarga (KK)', hint: 'Capaian JP (bukan BJP)' },
        { key: 'jiwa' as const, label: 'Jiwa Terlayani', hint: 'Biasanya KK × 5 atau input manual' },
        {
            key: 'nilai_kontrak' as const,
            label: 'Nilai Kontrak / Anggaran',
            hint: 'Anggaran unit SPAM tercatat',
            isCurrency: true,
        },
    ]

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
                        const b = Number(baseline?.[row.key] ?? 0)
                        const i = Number(integrasi?.[row.key] ?? 0)
                        const t = Number(total?.[row.key] ?? 0)
                        const fmt = (v: number) =>
                            row.isCurrency ? formatCurrency(v) : formatNumber(v)

                        return (
                            <TableRow key={row.key}>
                                <TableCell>
                                    <div className="font-medium">{row.label}</div>
                                    <p className="text-[10px] text-muted-foreground">{row.hint}</p>
                                </TableCell>
                                <TableCell className="text-right tabular-nums">{fmt(b)}</TableCell>
                                <TableCell className="text-right tabular-nums text-blue-600 dark:text-blue-400">
                                    {fmt(i)}
                                </TableCell>
                                <TableCell className="text-right font-semibold tabular-nums">
                                    {fmt(t)}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

function KpiCard({
    icon: Icon,
    iconClass,
    label,
    value,
    sub,
    className,
}: {
    icon: typeof Target
    iconClass: string
    label: string
    value: ReactNode
    sub?: ReactNode
    className?: string
}) {
    return (
        <Card className={cn('flex flex-row items-center gap-3 p-4 shadow-sm', className)}>
            <div className={cn('rounded-lg p-2.5', iconClass)}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="truncate text-lg font-bold tabular-nums">{value}</div>
                {sub ? <div className="text-[10px] text-muted-foreground">{sub}</div> : null}
            </div>
        </Card>
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

    const {
        data: statsData,
        isLoading,
        isFetching,
        refetch,
        dataUpdatedAt,
    } = useQuery({
        queryKey: ['spam-units-stats', kecamatanId, tahun],
        queryFn: () =>
            getSpamUnitStats({
                kecamatan_id: kecamatanId,
                tahun: tahun || undefined,
            }),
        staleTime: 30_000,
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
    const jpKk = spm?.jp_kk ?? stats?.total_kk ?? 0
    const bjpMaster = spm?.bjp_master_kk ?? 0
    const bjpUnit = spm?.bjp_unit_kk ?? 0
    const totalBjp = spm?.total_bjp_kk ?? stats?.total_bjp_kk ?? bjpMaster + bjpUnit
    const servedKk = jpKk + totalBjp

    const totalSr = ringkasan?.capaian.sr ?? stats?.capaian_sr ?? stats?.total_sr ?? 0
    const totalKk = ringkasan?.capaian.kk ?? stats?.capaian_kk ?? stats?.total_kk ?? 0
    const totalJiwa = ringkasan?.capaian.jiwa ?? stats?.capaian_jiwa ?? stats?.total_jiwa ?? 0
    const totalAnggaran = ringkasan?.capaian.nilai_kontrak ?? stats?.capaian_nilai_kontrak ?? 0

    const hasFilter = Boolean(kecamatanId || desaId || tahun)

    const filterSummary = useMemo(() => {
        const parts: string[] = []
        if (tahun) parts.push(`Tahun ${tahun}`)
        if (kecamatanId) {
            const kec = kecamatans?.data?.find(
                (k: { id: number }) => k.id === kecamatanId,
            ) as { nama_kecamatan?: string; n_kec?: string } | undefined
            parts.push(kec?.nama_kecamatan || kec?.n_kec || `Kec. #${kecamatanId}`)
        }
        if (desaId) {
            const desa = desas?.data?.find((d: { id: number }) => d.id === desaId) as
                | { nama_desa?: string; n_desa?: string }
                | undefined
            parts.push(desa?.nama_desa || desa?.n_desa || `Desa #${desaId}`)
        }
        return parts.length > 0 ? parts.join(' · ') : 'Seluruh wilayah'
    }, [tahun, kecamatanId, desaId, kecamatans?.data, desas?.data])

    const jpShare = targetKk > 0 ? Math.min(100, (jpKk / targetKk) * 100) : 0
    const bjpShare = targetKk > 0 ? Math.min(100 - jpShare, (totalBjp / targetKk) * 100) : 0

    const clearFilters = () => {
        onKecChange?.('')
        onDesaChange?.('')
        onTahunChange?.('')
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Card className="h-24 animate-pulse bg-muted/40" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="h-28 animate-pulse bg-muted/40" />
                    ))}
                </div>
                <Card className="h-64 animate-pulse bg-muted/40" />
            </div>
        )
    }

    if (!stats) {
        return (
            <Card className="p-10 text-center">
                <p className="text-sm text-muted-foreground">Gagal memuat ringkasan capaian SPM.</p>
                <Button className="mt-4" variant="outline" size="sm" onClick={() => void refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Coba lagi
                </Button>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filter bar */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div className="space-y-1">
                            <CardTitle className="text-base">Capaian SPM Air Minum</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Ringkasan target desa, capaian unit SPAM (SR/KK/jiwa), BJP, dan cakupan SPM.
                                Data master unit terpisah dari tab integrasi pekerjaan.
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <Badge variant="secondary" className="text-[10px]">
                                    {filterSummary}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                    Periode: {scopeLabel}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                    Acuan s/d {baselineCap}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                    Integrasi {accumulationStart}+ terpisah
                                </Badge>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <Select
                                value={kecamatanId ? String(kecamatanId) : 'all'}
                                onValueChange={(val) => {
                                    onKecChange?.(val === 'all' ? '' : Number(val))
                                    onDesaChange?.('')
                                }}
                            >
                                <SelectTrigger className="h-9 w-[180px] text-xs">
                                    <SelectValue placeholder="Semua Kecamatan" />
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
                                    <SelectValue placeholder="Semua Desa" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Desa</SelectItem>
                                    {desas?.data?.map(
                                        (desa: { id: number; nama_desa?: string; n_desa?: string }) => (
                                            <SelectItem key={desa.id} value={String(desa.id)}>
                                                {desa.nama_desa || desa.n_desa}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            <Select
                                value={tahun || 'all'}
                                onValueChange={(val) => onTahunChange?.(val === 'all' ? '' : val)}
                            >
                                <SelectTrigger className="h-9 w-[130px] text-xs">
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
                            {hasFilter ? (
                                <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={clearFilters}>
                                    <X className="mr-1 h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            ) : null}
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs"
                                onClick={() => void refetch()}
                                disabled={isFetching}
                            >
                                <RefreshCw className={cn('mr-1 h-3.5 w-3.5', isFetching && 'animate-spin')} />
                                Muat ulang
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Coverage hero */}
            <Card className="overflow-hidden border-emerald-200/60 shadow-sm dark:border-emerald-900/40">
                <CardContent className="grid gap-6 p-5 lg:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            <p className="text-sm font-semibold">Cakupan SPM</p>
                            <Badge variant="outline" className="text-[10px]">
                                (KK JP + BJP) / Target KK
                            </Badge>
                        </div>
                        <p className={cn('text-4xl font-bold tabular-nums tracking-tight', coverageTone(coverage))}>
                            {coverage.toLocaleString('id-ID', { maximumFractionDigits: 2 })}%
                        </p>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className="flex h-full min-w-0"
                                style={{ width: `${Math.min(coverage, 100)}%` }}
                            >
                                {jpShare > 0 ? (
                                    <div
                                        className="h-full bg-cyan-500"
                                        style={{ width: `${(jpShare / Math.max(coverage, 0.01)) * 100}%` }}
                                        title={`JP KK: ${formatNumber(jpKk)}`}
                                    />
                                ) : null}
                                {bjpShare > 0 ? (
                                    <div
                                        className="h-full bg-violet-500"
                                        style={{ width: `${(bjpShare / Math.max(coverage, 0.01)) * 100}%` }}
                                        title={`BJP KK: ${formatNumber(totalBjp)}`}
                                    />
                                ) : null}
                                {jpShare <= 0 && bjpShare <= 0 ? (
                                    <div
                                        className={cn('h-full w-full rounded-full bg-gradient-to-r', coverageBarColor(coverage))}
                                    />
                                ) : null}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                                JP (perpipaan) {formatNumber(jpKk)} KK
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-violet-500" />
                                BJP {formatNumber(totalBjp)} KK
                            </span>
                            <span>
                                Dilayani {formatNumber(servedKk)} / Target {formatNumber(targetKk)} KK
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-2 rounded-lg border bg-slate-50/60 p-4 text-sm dark:bg-slate-900/40">
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Target KK desa</span>
                            <span className="font-semibold tabular-nums">{formatNumber(targetKk)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">KK JP (jaringan perpipaan)</span>
                            <span className="font-semibold tabular-nums text-cyan-700 dark:text-cyan-400">
                                {formatNumber(jpKk)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">BJP master (desa)</span>
                            <span className="font-semibold tabular-nums">{formatNumber(bjpMaster)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">BJP unit SPAM</span>
                            <span className="font-semibold tabular-nums">{formatNumber(bjpUnit)}</span>
                        </div>
                        <div className="flex justify-between gap-3 border-t pt-2">
                            <span className="font-medium">Total BJP KK</span>
                            <span className="font-bold tabular-nums text-violet-700 dark:text-violet-400">
                                {formatNumber(totalBjp)}
                            </span>
                        </div>
                        <p className="pt-1 text-[10px] leading-relaxed text-muted-foreground">
                            SR (Sambungan Rumah) hanya dihitung pada capaian JP. Pada BJP, output SR dihitung sebagai
                            KK saja.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* KPI strip */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <KpiCard
                    icon={Target}
                    iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                    label="Target KK Desa"
                    value={formatNumber(targetKk)}
                />
                <KpiCard
                    icon={Droplets}
                    iconClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30"
                    label="SR Tercatat"
                    value={formatNumber(totalSr)}
                    sub="Jaringan perpipaan (JP)"
                />
                <KpiCard
                    icon={Users}
                    iconClass="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30"
                    label="KK / Jiwa (JP)"
                    value={`${formatNumber(totalKk)} KK`}
                    sub={`${formatNumber(totalJiwa)} jiwa`}
                />
                <KpiCard
                    icon={Landmark}
                    iconClass="bg-violet-100 text-violet-600 dark:bg-violet-900/30"
                    label="Total BJP KK"
                    value={formatNumber(totalBjp)}
                    sub={`Master ${formatNumber(bjpMaster)} · Unit ${formatNumber(bjpUnit)}`}
                />
                <KpiCard
                    icon={Building2}
                    iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                    label="Unit SPAM"
                    value={formatNumber(stats.total_units)}
                    sub={`${stats.simspam_count} SIMSPAM · ${stats.non_simspam_count} standar`}
                />
                <KpiCard
                    icon={Landmark}
                    iconClass="bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                    label="Anggaran Tercatat"
                    value={<span className="text-sm">{formatCurrency(totalAnggaran)}</span>}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Komposisi Capaian</CardTitle>
                        <p className="text-xs font-normal text-muted-foreground">
                            Acuan master s/d {baselineCap} tidak ditimpa. Integrasi hanya {accumulationStart}+.
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
                        <CardTitle className="text-sm">Distribusi Sumber Dana</CardTitle>
                        <p className="text-xs font-normal text-muted-foreground">
                            Jumlah unit dengan anggaran per sumber dana ({scopeLabel})
                        </p>
                    </CardHeader>
                    <CardContent>
                        {stats.funding_distribution && stats.funding_distribution.length > 0 ? (
                            <div className="space-y-2">
                                {stats.funding_distribution.map((item) => {
                                    const maxCount = Math.max(
                                        ...stats.funding_distribution.map((f) => Number(f.count) || 0),
                                        1,
                                    )
                                    const pct = ((Number(item.count) || 0) / maxCount) * 100
                                    return (
                                        <div key={item.sumber_dana} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>{item.sumber_dana || 'Lainnya'}</span>
                                                <Badge variant="secondary">{item.count} unit</Badge>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div
                                                    className="h-full rounded-full bg-blue-500/80"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Belum ada data anggaran tercatat.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="shadow-sm lg:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            Ringkasan Wilayah
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between rounded-lg border px-3 py-2">
                                <span className="text-muted-foreground">Kecamatan</span>
                                <span className="font-semibold tabular-nums">
                                    {stats.wilayah_total_kecamatan ?? '-'}
                                </span>
                            </div>
                            <div className="flex justify-between rounded-lg border px-3 py-2">
                                <span className="text-muted-foreground">Desa</span>
                                <span className="font-semibold tabular-nums">
                                    {stats.wilayah_total_desa ?? '-'}
                                </span>
                            </div>
                            <div className="flex justify-between rounded-lg border px-3 py-2">
                                <span className="text-muted-foreground">Rekam capaian</span>
                                <span className="font-semibold tabular-nums">
                                    {stats.achievement_records ?? 0}
                                </span>
                            </div>
                            <div className="flex justify-between rounded-lg border px-3 py-2">
                                <span className="text-muted-foreground">Periode target</span>
                                <span className="font-semibold">{stats.target_year}</span>
                            </div>
                            <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                                Rekam capaian per unit di tab <strong>Master Unit SPAM</strong> → detail → histori
                                capaian tahunan.
                            </div>
                            {(stats.stats_generated_at || dataUpdatedAt) && (
                                <p className="text-[10px] text-muted-foreground">
                                    Diperbarui:{' '}
                                    {new Date(stats.stats_generated_at || dataUpdatedAt).toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2">
                    <SpamSpmWilayahTable
                        kecamatanId={kecamatanId}
                        desaId={desaId}
                        tahun={tahun}
                    />
                </div>
            </div>
        </div>
    )
}
