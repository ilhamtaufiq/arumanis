import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAnalyticsStats } from '../api/dashboard'
import { DashboardLineChart } from './DashboardLineChart'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    XAxis,
    YAxis,
} from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { AlertTriangle, Filter, TrendingDown, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ChartData } from '../types'

interface AnalyticsViewProps {
    year: string
}

const LAG_THRESHOLD = 50

export function AnalyticsView({ year }: AnalyticsViewProps) {
    const [selectedKecamatans, setSelectedKecamatans] = useState<string[]>([])

    const { data: kecamatans } = useQuery({
        queryKey: ['kecamatan-list'],
        queryFn: getKecamatan,
    })

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard-analytics', year, selectedKecamatans],
        queryFn: () => getAnalyticsStats(year, selectedKecamatans),
    })

    const toggleKecamatan = (id: string) => {
        setSelectedKecamatans((prev) =>
            prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
        )
    }

    const deviationSummary = useMemo(() => {
        const trend = stats?.trend ?? []
        if (!trend.length) return null
        const last = trend[trend.length - 1]
        const prev = trend.length > 1 ? trend[trend.length - 2] : last
        const gap = Number((last.realisasi - last.rencana).toFixed(1))
        const weekDelta = Number((last.realisasi - prev.realisasi).toFixed(1))
        return {
            week: last.week,
            rencana: last.rencana,
            realisasi: last.realisasi,
            gap,
            weekDelta,
            status: gap >= 0 ? 'on_track' : gap > -10 ? 'watch' : 'behind',
        }
    }, [stats?.trend])

    const laggingRegions = useMemo(() => {
        return [...(stats?.regions ?? [])]
            .filter((r) => Number(r.value) < LAG_THRESHOLD)
            .sort((a, b) => Number(a.value) - Number(b.value))
            .slice(0, 5)
    }, [stats?.regions])

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <p className="text-destructive">Gagal memuat data analitik.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-5 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold">Analitik progres TA {year}</h2>
                    <p className="text-xs text-muted-foreground">
                        Deviasi di bawah ambang ditandai; filter kecamatan mempersempit tren & wilayah.
                    </p>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-2">
                            <Filter className="h-4 w-4" />
                            Kecamatan {selectedKecamatans.length > 0 && `(${selectedKecamatans.length})`}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-2" align="end">
                        <div className="space-y-2">
                            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                Filter Kecamatan
                            </p>
                            <div className="max-h-[300px] space-y-1 overflow-y-auto">
                                {kecamatans?.data.map((kec) => (
                                    <div
                                        key={kec.id}
                                        className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1 hover:bg-accent"
                                        onClick={() => toggleKecamatan(kec.id.toString())}
                                    >
                                        <Checkbox
                                            id={`kec-${kec.id}`}
                                            checked={selectedKecamatans.includes(kec.id.toString())}
                                            onCheckedChange={() => toggleKecamatan(kec.id.toString())}
                                        />
                                        <label
                                            htmlFor={`kec-${kec.id}`}
                                            className="cursor-pointer text-sm font-medium leading-none"
                                        >
                                            {kec.nama_kecamatan}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {selectedKecamatans.length > 0 ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-full text-xs text-destructive hover:text-destructive"
                                    onClick={() => setSelectedKecamatans([])}
                                >
                                    Bersihkan Filter
                                </Button>
                            ) : null}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            ) : deviationSummary ? (
                <div className="grid gap-3 sm:grid-cols-3">
                    <DeviationCard
                        label="Realisasi vs Rencana"
                        value={`${deviationSummary.gap > 0 ? '+' : ''}${deviationSummary.gap} pp`}
                        hint={`${deviationSummary.week}: realisasi ${deviationSummary.realisasi}% / rencana ${deviationSummary.rencana}%`}
                        tone={
                            deviationSummary.status === 'on_track'
                                ? 'good'
                                : deviationSummary.status === 'watch'
                                  ? 'warn'
                                  : 'bad'
                        }
                    />
                    <DeviationCard
                        label="Perubahan minggu ke minggu"
                        value={`${deviationSummary.weekDelta > 0 ? '+' : ''}${deviationSummary.weekDelta} pp`}
                        hint="Selisih realisasi minggu terakhir vs sebelumnya"
                        tone={deviationSummary.weekDelta >= 0 ? 'good' : 'warn'}
                    />
                    <DeviationCard
                        label="Wilayah di bawah 50%"
                        value={String(laggingRegions.length)}
                        hint={
                            laggingRegions.length
                                ? laggingRegions.map((r) => r.name).join(', ')
                                : 'Semua wilayah di atas ambang'
                        }
                        tone={laggingRegions.length ? 'bad' : 'good'}
                    />
                </div>
            ) : null}

            {laggingRegions.length > 0 ? (
                <Card className="border-amber-500/25 bg-amber-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            Wilayah lag (progres &lt; {LAG_THRESHOLD}%)
                        </CardTitle>
                        <CardDescription>
                            Prioritaskan monitoring lapangan di wilayah ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {laggingRegions.map((region) => (
                            <Badge key={region.name} variant="outline" className="gap-1 tabular-nums">
                                {region.name}
                                <span className="font-semibold text-amber-700 dark:text-amber-400">
                                    {Number(region.value).toFixed(1)}%
                                </span>
                            </Badge>
                        ))}
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid grid-cols-1 gap-6">
                <DashboardLineChart
                    title="Tren Progres Fisik vs Rencana (Kumulatif)"
                    description="Rata-rata persentase kemajuan fisik seluruh pekerjaan"
                    data={stats?.trend ?? []}
                    isLoading={isLoading}
                    height={400}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <RegionalPerformanceChart
                    data={stats?.regions ?? []}
                    isLoading={isLoading}
                    lagThreshold={LAG_THRESHOLD}
                />
                <CategoryDistributionChart
                    data={stats?.categories ?? []}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}

function DeviationCard({
    label,
    value,
    hint,
    tone,
}: {
    label: string
    value: string
    hint: string
    tone: 'good' | 'warn' | 'bad'
}) {
    return (
        <div
            className={cn(
                'rounded-xl border p-4',
                tone === 'good' && 'border-emerald-500/25 bg-emerald-500/5',
                tone === 'warn' && 'border-amber-500/25 bg-amber-500/5',
                tone === 'bad' && 'border-destructive/25 bg-destructive/5',
            )}
        >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold tabular-nums">
                {tone === 'good' ? (
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                ) : (
                    <TrendingDown className="h-5 w-5 text-amber-600" />
                )}
                {value}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{hint}</p>
        </div>
    )
}

function RegionalPerformanceChart({
    data,
    isLoading,
    lagThreshold,
}: {
    data: ChartData[]
    isLoading: boolean
    lagThreshold: number
}) {
    const chartConfig: ChartConfig = {
        value: {
            label: 'Rata-rata Progres (%)',
            color: 'var(--chart-1)',
        },
    }

    if (isLoading) return <Skeleton className="h-[400px] w-full" />

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    Performa Progres per Kecamatan
                </CardTitle>
                <CardDescription>
                    Batang merah/amber = di bawah {lagThreshold}%
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full" style={{ height: 400 }}>
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            width={120}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                            dataKey="value"
                            radius={[0, 4, 4, 0]}
                            label={{
                                position: 'right',
                                formatter: (val: number) => `${val}%`,
                                fontSize: 10,
                            }}
                        >
                            {data.map((entry) => {
                                const v = Number(entry.value)
                                const fill =
                                    v < lagThreshold
                                        ? 'hsl(var(--destructive))'
                                        : v < 70
                                          ? 'hsl(38 92% 50%)'
                                          : 'var(--chart-1)'
                                return <Cell key={entry.name} fill={fill} />
                            })}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

function CategoryDistributionChart({
    data,
    isLoading,
}: {
    data: ChartData[]
    isLoading: boolean
}) {
    const chartConfig: ChartConfig = {
        value: {
            label: 'Jumlah Pekerjaan',
            color: 'var(--chart-2)',
        },
    }

    if (isLoading) return <Skeleton className="h-[400px] w-full" />

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribusi Pekerjaan per Sumber Dana</CardTitle>
                <CardDescription>Pekerjaan aktif berdasarkan kategori pendanaan</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full" style={{ height: 400 }}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
