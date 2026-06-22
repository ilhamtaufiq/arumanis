import { TrendingUp } from 'lucide-react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
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
import { Skeleton } from '@/components/ui/skeleton'
import type { ChartData } from '../types'

const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
]

type DashboardBarChartProps = {
    title: string
    description?: string
    data: ChartData[]
    isLoading?: boolean
    dataKey?: string
    nameKey?: string
    layout?: 'vertical' | 'horizontal'
    height?: number
}

export function DashboardBarChart({
    title,
    description,
    data,
    isLoading,
    dataKey = 'value',
    nameKey = 'name',
    layout = 'vertical',
    height = 350,
}: DashboardBarChartProps) {
    const chartConfig: ChartConfig = {
        [dataKey]: {
            label: title,
            color: 'var(--chart-1)',
        },
    }

    if (isLoading) {
        return (
            <Card className="border-muted/60 shadow-sm">
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full rounded-lg" />
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card className="border-muted/60 shadow-sm">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description ? <CardDescription>{description}</CardDescription> : null}
                </CardHeader>
                <CardContent className="flex h-[300px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">Tidak ada data</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-muted/60 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {title}
                </CardTitle>
                {description ? <CardDescription>{description}</CardDescription> : null}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
                    {layout === 'horizontal' ? (
                        <BarChart data={data} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey={nameKey}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                width={60}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey={dataKey}
                                fill="var(--chart-1)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    ) : (
                        <BarChart data={data} layout="vertical">
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                                horizontal
                                vertical={false}
                            />
                            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                            <YAxis
                                dataKey={nameKey}
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                width={120}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey={dataKey}
                                fill="var(--chart-1)"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

type DashboardPieChartProps = {
    title: string
    description?: string
    data: ChartData[]
    isLoading?: boolean
}

export function DashboardPieChart({
    title,
    description,
    data,
    isLoading,
}: DashboardPieChartProps) {
    const chartConfig: ChartConfig = data.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: COLORS[index % COLORS.length],
        }
        return acc
    }, {} as ChartConfig)

    if (isLoading) {
        return (
            <Card className="border-muted/60 shadow-sm">
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Skeleton className="h-[250px] w-[250px] rounded-full" />
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card className="border-muted/60 shadow-sm">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description ? <CardDescription>{description}</CardDescription> : null}
                </CardHeader>
                <CardContent className="flex h-[300px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">Tidak ada data</p>
                </CardContent>
            </Card>
        )
    }

    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card className="border-muted/60 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                {description ? <CardDescription>{description}</CardDescription> : null}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[280px]">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={64}
                            outerRadius={96}
                            paddingAngle={3}
                            label={({ name, value }) => `${name}: ${value}`}
                            labelLine={false}
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="hsl(var(--background))"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2 rounded-full border bg-muted/30 px-2.5 py-1">
                            <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-xs text-muted-foreground">
                                {item.name} ({((item.value / total) * 100).toFixed(1)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}