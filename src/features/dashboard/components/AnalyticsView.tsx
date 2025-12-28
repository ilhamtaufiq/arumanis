import { useQuery } from '@tanstack/react-query'
import { getAnalyticsStats } from '../api/dashboard'
import { DashboardLineChart } from './DashboardLineChart'
import {
    Bar,
    BarChart,
    CartesianGrid,
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
import { TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Filter } from 'lucide-react'

interface AnalyticsViewProps {
    year: string
}

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
        setSelectedKecamatans(prev =>
            prev.includes(id)
                ? prev.filter(k => k !== id)
                : [...prev, id]
        )
    }

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Analitik & Reporting</h2>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2">
                                <Filter className="h-4 w-4" />
                                Kecamatan {selectedKecamatans.length > 0 && `(${selectedKecamatans.length})`}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-2" align="end">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground px-2 py-1">Filter Kecamatan</p>
                                <div className="max-h-[300px] overflow-y-auto space-y-1">
                                    {kecamatans?.data.map((kec) => (
                                        <div key={kec.id} className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded-sm cursor-pointer" onClick={() => toggleKecamatan(kec.id.toString())}>
                                            <Checkbox
                                                id={`kec-${kec.id}`}
                                                checked={selectedKecamatans.includes(kec.id.toString())}
                                                onCheckedChange={() => toggleKecamatan(kec.id.toString())}
                                            />
                                            <label
                                                htmlFor={`kec-${kec.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {kec.nama_kecamatan}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {selectedKecamatans.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs h-8 text-destructive hover:text-destructive"
                                        onClick={() => setSelectedKecamatans([])}
                                    >
                                        Bersihkan Filter
                                    </Button>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

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
                />

                <CategoryDistributionChart
                    data={stats?.categories ?? []}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}

function RegionalPerformanceChart({ data, isLoading }: { data: any[], isLoading: boolean }) {
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
                <CardDescription>Rata-rata kemajuan fisik proyek di setiap wilayah</CardDescription>
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
                            fill="var(--chart-1)"
                            radius={[0, 4, 4, 0]}
                            label={{ position: 'right', formatter: (val: number) => `${val}%`, fontSize: 10 }}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

function CategoryDistributionChart({ data, isLoading }: { data: any[], isLoading: boolean }) {
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
                        <Bar
                            dataKey="value"
                            fill="var(--chart-2)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
