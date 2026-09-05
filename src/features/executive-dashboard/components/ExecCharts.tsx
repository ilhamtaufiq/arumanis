import {
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ChartConfig } from '@/components/ui/chart'
import { ChartContainer } from '@/components/ui/chart'
import { cn } from '@/lib/utils'

function Gauge({
    label,
    value,
    color,
    caption,
}: {
    label: string
    value: number
    color: string
    caption?: string
}) {
    const config: ChartConfig = { v: { label, color } }
    const clamped = Math.max(0, Math.min(100, value))

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative h-[140px] w-full">
                <ChartContainer config={config} className="h-[140px] w-full">
                    <RadialBarChart
                        data={[{ name: label, v: clamped }]}
                        innerRadius={72}
                        outerRadius={108}
                        startAngle={90}
                        endAngle={-270}
                        barSize={13}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar
                            dataKey="v"
                            cornerRadius={6}
                            fill={color}
                            background={{ fill: 'var(--muted)' }}
                        />
                    </RadialBarChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold tabular-nums">{clamped.toFixed(1)}%</span>
                </div>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium">{label}</p>
                {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
            </div>
        </div>
    )
}

export function ExecProgressGauges({
    fisik,
    keuangan,
    kontrak,
    kontrakCaption,
    isLoading,
}: {
    fisik: number | null
    keuangan: number | null
    kontrak: number | null
    kontrakCaption?: string
    isLoading?: boolean
}) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-4 w-56" />
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-[170px]" />
                    <Skeleton className="h-[170px]" />
                    <Skeleton className="h-[170px]" />
                </CardContent>
            </Card>
        )
    }

    const items = [
        { label: 'Fisik', value: fisik, color: 'var(--chart-1)', caption: 'Rata-rata estimasi' },
        { label: 'Keuangan', value: keuangan, color: 'var(--chart-2)', caption: 'Termasuk SP2D' },
        { label: 'Terkontrak', value: kontrak, color: 'var(--chart-3)', caption: kontrakCaption },
    ]

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Progres Tahun Berjalan</CardTitle>
                <CardDescription>Rata-rata realisasi paket aktif</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
                {items.map((item) => (
                    <Gauge
                        key={item.label}
                        label={item.label}
                        value={item.value ?? 0}
                        color={item.color}
                        caption={item.caption}
                    />
                ))}
            </CardContent>
        </Card>
    )
}

export function ExecCoverageCard({
    spam,
    sanitasi,
    rows,
    isLoading,
}: {
    spam: number | null
    sanitasi: number | null
    rows: Array<{ label: string; value: string }>
    isLoading?: boolean
}) {
    const bars = [
        { label: 'Cakupan SPAM', value: spam },
        { label: 'Cakupan Sanitasi', value: sanitasi },
    ]

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Layanan Air Minum & Sanitasi</CardTitle>
                <CardDescription>Cakupan layanan SPAM & sanitasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {bars.map((bar) => (
                    <div key={bar.label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{bar.label}</span>
                            <span className="font-semibold tabular-nums">
                                {bar.value == null ? '—' : `${bar.value.toFixed(1)}%`}
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn('h-full rounded-full transition-all', bar.label.includes('Sanitasi') ? 'bg-emerald-500' : 'bg-sky-500')}
                                style={{ width: `${Math.max(0, Math.min(100, bar.value ?? 0))}%` }}
                            />
                        </div>
                    </div>
                ))}
                {rows.length > 0 ? (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3">
                        {rows.map((row) => (
                            <div key={row.label} className="min-w-0">
                                <dt className="truncate text-xs text-muted-foreground">{row.label}</dt>
                                <dd className="text-sm font-semibold tabular-nums">{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                ) : null}
            </CardContent>
        </Card>
    )
}
