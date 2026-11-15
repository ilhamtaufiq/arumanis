import { 
    Bar, 
    BarChart, 
    XAxis, 
    CartesianGrid, 
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line
} from "recharts"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface ChatChartProps {
    data: any[]
    type: "bar" | "pie" | "line"
}

export function ChatChart({ data, type }: ChatChartProps) {
    if (!data || data.length === 0) return null

    // Generate dynamic config based on data keys
    const firstItem = data[0]
    const dataKeys = Object.keys(firstItem)
    const labelKey = dataKeys.find(k => k.includes('nama') || k.includes('label') || k.includes('kecamatan')) || dataKeys[0]
    const valueKey = dataKeys.find(k => k.includes('progres') || k.includes('jumlah') || k.includes('total') || typeof firstItem[k] === 'number') || dataKeys[1]

    const config: ChartConfig = {
        [valueKey]: {
            label: valueKey.charAt(0).toUpperCase() + valueKey.slice(1),
            color: "hsl(var(--primary))",
        },
    }

    const renderChart = () => {
        switch (type) {
            case "pie":
                return (
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={data}
                            dataKey={valueKey}
                            nameKey={labelKey}
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {data.map((_, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={`hsl(var(--primary) / ${100 - (index * 15)}%)`} 
                                />
                            ))}
                        </Pie>
                    </PieChart>
                )
            case "line":
                return (
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey={labelKey}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            hide
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            type="monotone"
                            dataKey={valueKey}
                            stroke="var(--color-value)"
                            strokeWidth={2}
                            dot={true}
                        />
                    </LineChart>
                )
            default: // bar
                return (
                    <BarChart data={data}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                            dataKey={labelKey}
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            hide
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar 
                            dataKey={valueKey} 
                            fill="var(--color-value)" 
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                )
        }
    }

    return (
        <div className="mt-4 p-4 border rounded-xl bg-background/50 backdrop-blur-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Visualisasi Data Ami
            </h4>
            <ChartContainer config={config} className="h-[200px] w-full">
                {renderChart()}
            </ChartContainer>
            <div className="mt-2 text-[9px] text-muted-foreground text-center italic">
                * Arahkan kursor untuk melihat detail
            </div>
        </div>
    )
}
