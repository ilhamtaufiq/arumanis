import {
    Line,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Legend,
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
import { TrendingUp } from 'lucide-react'

interface DashboardLineChartProps {
    title: string
    description?: string
    data: any[]
    isLoading?: boolean
    height?: number
}

export function DashboardLineChart({
    title,
    description,
    data,
    isLoading,
    height = 350,
}: DashboardLineChartProps) {
    const chartConfig: ChartConfig = {
        rencana: {
            label: 'Rencana',
            color: 'var(--chart-1)',
        },
        realisasi: {
            label: 'Realisasi',
            color: 'var(--chart-2)',
        },
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">Tidak ada data</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    {title}
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                        <XAxis
                            dataKey="week"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                            tickMargin={8}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                            tickMargin={8}
                            label={{ value: '% Progres', angle: -90, position: 'insideLeft', offset: 10 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend verticalAlign="top" height={36} />
                        <Line
                            type="monotone"
                            dataKey="rencana"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--chart-1)' }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="realisasi"
                            stroke="var(--chart-2)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--chart-2)' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
