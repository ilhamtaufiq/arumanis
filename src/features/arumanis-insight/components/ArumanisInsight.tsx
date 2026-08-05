import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    ChevronDown,
    ChevronUp,
    Droplets,
    FileText,
    Lightbulb,
    MapPin,
    RefreshCw,
    Recycle,
    Target,
    TrendingDown,
    TrendingUp,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getArumanisInsight } from '../api'
import type { InsightBidang, InsightScope } from '../types'
import { cn } from '@/lib/utils'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { toast } from 'sonner'

function formatNumber(n: number): string {
    return n.toLocaleString('id-ID')
}

function formatPercent(n: number): string {
    return `${n.toFixed(2)}%`
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    sub,
    variant = 'default',
}: {
    icon: React.ElementType
    label: string
    value: string
    sub?: string
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
    const variants = {
        default: 'border-border bg-card',
        success: 'border-emerald-500/20 bg-emerald-500/5',
        warning: 'border-amber-500/20 bg-amber-500/5',
        danger: 'border-destructive/20 bg-destructive/5',
        info: 'border-blue-500/20 bg-blue-500/5',
    }

    return (
        <div className={cn('rounded-xl border p-4 shadow-sm', variants[variant])}>
            <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </span>
            </div>
            <p className="text-xl font-bold tabular-nums">{value}</p>
            {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
        </div>
    )
}

function InsightSection({
    title,
    icon: Icon,
    items,
    defaultOpen = true,
    variant,
}: {
    title: string
    icon: React.ElementType
    items: { title: string; content: string; source?: string }[]
    defaultOpen?: boolean
    variant?: 'highlight' | 'insight' | 'rekomendasi'
}) {
    const [open, setOpen] = useState(defaultOpen)

    const borderColors = {
        highlight: 'border-amber-500/20',
        insight: 'border-blue-500/20',
        rekomendasi: 'border-emerald-500/20',
    }

    const bgColors = {
        highlight: 'bg-amber-500/5',
        insight: 'bg-blue-500/5',
        rekomendasi: 'bg-emerald-500/5',
    }

    const badgeColors = {
        highlight: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        insight: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
        rekomendasi: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    }

    return (
        <div className={cn('rounded-xl border', borderColors[variant || 'highlight'])}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30',
                    bgColors[variant || 'highlight'],
                )}
            >
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-semibold">{title}</span>
                    <Badge
                        variant="outline"
                        className={cn('text-xs', badgeColors[variant || 'highlight'])}
                    >
                        {items.length} poin
                    </Badge>
                </div>
                {open ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {open && (
                <div className="border-t px-5 pb-5 pt-4">
                    <div className="space-y-4">
                        {items.map((item, i) => (
                            <div key={i} className="group">
                                <div className="flex gap-3">
                                    <span className="mt-0.5 shrink-0 text-xs font-bold text-muted-foreground/50">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="flex-1 space-y-1.5">
                                        {item.title ? (
                                            <p className="text-sm font-semibold">{item.title}</p>
                                        ) : null}
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {item.content}
                                        </p>
                                        {item.source ? (
                                            <p className="text-[11px] italic text-muted-foreground/60">
                                                Sumber: {item.source}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                                {i < items.length - 1 && (
                                    <div className="ml-6 mt-4 border-b border-border/50" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export function ArumanisInsight() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [bidang, setBidang] = useState<InsightBidang>('all')

    const { data, isLoading, isFetching, error, dataUpdatedAt, refetch } = useQuery({
        queryKey: ['arumanis-insight', tahunAnggaran, bidang],
        queryFn: () =>
            getArumanisInsight({
                bidang,
            }),
        staleTime: 120_000,
    })

    const handleRefresh = () => {
        void refetch()
        toast.success('Data insight diperbarui')
    }

    const refreshed =
        dataUpdatedAt != null
            ? (() => {
                  const mins = Math.floor((Date.now() - dataUpdatedAt) / 60_000)
                  if (mins <= 0) return 'Baru saja'
                  return `${mins} mnt lalu`
              })()
            : null

    return (
        <>
            <Header fixed />

            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <div className="w-full min-w-0 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
                        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
                                        Disperkim Cianjur
                                    </Badge>
                                    <Badge variant="outline" className="border-white/20 text-white/80">
                                        {bidang === 'air_minum'
                                            ? 'Air Minum'
                                            : bidang === 'sanitasi'
                                              ? 'Sanitasi'
                                              : 'Semua Bidang'}
                                    </Badge>
                                    {refreshed ? (
                                        <Badge variant="outline" className="border-white/20 font-normal text-white/60">
                                            Cache {refreshed}
                                        </Badge>
                                    ) : null}
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Arumanis Insight
                                </h1>
                                <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                                    Ringkasan analitik SPM air minum dan sanitasi — cakupan layanan, kapasitas
                                    infrastruktur, kesenjangan layanan, dan rekomendasi investasi.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="gap-1.5 bg-white/10 text-white hover:bg-white/20"
                                    disabled={isFetching}
                                    onClick={handleRefresh}
                                >
                                    <RefreshCw
                                        className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')}
                                    />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
                        <div className="flex-1 min-w-[180px]">
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Bidang
                            </label>
                            <Select value={bidang} onValueChange={(v) => setBidang(v as InsightBidang)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Bidang</SelectItem>
                                    <SelectItem value="air_minum">
                                        <span className="flex items-center gap-1.5">
                                            <Droplets className="h-3.5 w-3.5" /> Air Minum
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="sanitasi">
                                        <span className="flex items-center gap-1.5">
                                            <Recycle className="h-3.5 w-3.5" /> Sanitasi
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Error */}
                    {error ? (
                        <Card className="border-destructive">
                            <CardContent className="pt-6">
                                <p className="text-sm text-destructive">
                                    Gagal memuat data insight. Silakan muat ulang halaman.
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Loading */}
                    {isLoading && !data ? (
                        <div className="space-y-6">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                                ))}
                            </div>
                            <Skeleton className="h-64 w-full rounded-xl" />
                        </div>
                    ) : data ? (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* Summary Cards */}
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <SummaryCard
                                    icon={MapPin}
                                    label="Kecamatan"
                                    value={String(data.total_kecamatan)}
                                    sub="Wilayah cakupan"
                                    variant="info"
                                />
                                {bidang === 'all' || bidang === 'air_minum' ? (
                                    <SummaryCard
                                        icon={Target}
                                        label="Cakupan Air Minum"
                                        value={formatPercent(data.air_minum?.coverage_percentage ?? 0)}
                                        sub={`SR: ${formatNumber(data.total_sr)} / Target: ${formatNumber(data.total_target)}`}
                                        variant={(data.air_minum?.coverage_percentage ?? 0) >= 90 ? 'success' : 'warning'}
                                    />
                                ) : null}
                                {bidang === 'all' || bidang === 'sanitasi' ? (
                                    <SummaryCard
                                        icon={Target}
                                        label="Cakupan Sanitasi"
                                        value={formatPercent(data.sanitasi?.coverage_percentage ?? 0)}
                                        sub={`PK: ${formatNumber(data.sanitasi?.total_pemanfaat_kk ?? 0)} / Penduduk: ${formatNumber(data.sanitasi?.total_penduduk ?? 0)}`}
                                        variant={(data.sanitasi?.coverage_percentage ?? 0) >= 80 ? 'success' : 'warning'}
                                    />
                                ) : null}
                                {bidang === 'all' ? (
                                    <SummaryCard
                                        icon={Droplets}
                                        label="Sambungan Air Minum"
                                        value={formatNumber(data.total_sr)}
                                        sub={`KK: ${formatNumber(data.total_kk)} · Jiwa: ${formatNumber(data.total_jiwa)}`}
                                        variant="default"
                                    />
                                ) : null}
                                {bidang === 'all' || bidang === 'air_minum' ? (
                                    <SummaryCard
                                        icon={TrendingDown}
                                        label="NRD / Kehilangan Air"
                                        value={data.nrd != null ? formatPercent(data.nrd) : '—'}
                                        sub="Non-revenue water ratio"
                                        variant={data.nrd != null && data.nrd > 20 ? 'danger' : 'success'}
                                    />
                                ) : null}
                                {bidang === 'all' || bidang === 'sanitasi' ? (
                                    <SummaryCard
                                        icon={Recycle}
                                        label="Infrastruktur Sanitasi"
                                        value={formatNumber(data.sanitasi?.total_infrastruktur ?? 0)}
                                        sub={`Berfungsi: ${formatNumber(data.sanitasi?.total_pemanfaat_kk ?? 0)} KK`}
                                        variant="default"
                                    />
                                ) : null}
                            </div>

                            {/* Highlight */}
                            {data.highlight.length > 0 && (
                                <InsightSection
                                    title="Highlight"
                                    icon={Target}
                                    items={data.highlight}
                                    variant="highlight"
                                />
                            )}

                            {/* Insight */}
                            {data.insight.length > 0 && (
                                <InsightSection
                                    title="Insight"
                                    icon={Lightbulb}
                                    items={data.insight}
                                    variant="insight"
                                />
                            )}

                            {/* Rekomendasi */}
                            {data.rekomendasi.length > 0 && (
                                <InsightSection
                                    title="Rekomendasi"
                                    icon={FileText}
                                    items={data.rekomendasi}
                                    variant="rekomendasi"
                                />
                            )}


                        </div>
                    ) : null}
                </div>
            </Main>
        </>
    )
}
