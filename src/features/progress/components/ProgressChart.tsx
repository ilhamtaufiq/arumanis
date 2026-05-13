import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    ComposedChart, 
    Line, 
    Area,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import type { ProgressReportResponse } from '@/features/progress/types';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface ProgressChartProps {
    report: ProgressReportResponse['data'] | null;
    weekCount: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const rencana = payload.find((p: any) => p.dataKey === 'Rencana')?.value || 0;
        const realisasi = payload.find((p: any) => p.dataKey === 'Realisasi')?.value || 0;
        const deviasi = parseFloat((realisasi - rencana).toFixed(2));
        
        return (
            <div className="bg-background/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl min-w-[200px]">
                <p className="text-sm font-black mb-3 border-b pb-1 text-muted-foreground uppercase tracking-wider">{label}</p>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-blue-500">Rencana</span>
                        <span className="text-sm font-black">{rencana.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-green-500">Realisasi</span>
                        <span className="text-sm font-black">{realisasi.toFixed(2)}%</span>
                    </div>
                    <div className="pt-2 border-t mt-2 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase italic">Deviasi</span>
                        <div className={`flex items-center gap-1 text-sm font-black ${deviasi < 0 ? 'text-rose-500' : deviasi > 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                            {deviasi > 0 ? <TrendingUp className="w-3 h-3" /> : deviasi < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            {deviasi > 0 ? `+${deviasi}` : deviasi}%
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function ProgressChart({ report, weekCount }: ProgressChartProps) {
    const chartData = useMemo(() => {
        if (!report) return [];

        const data = [];
        let cumulativeRencana = 0;
        let cumulativeRealisasi = 0;

        for (let w = 1; w <= weekCount; w++) {
            let weekRencana = 0;
            let weekRealisasi = 0;

            report.items.forEach(item => {
                const weeklyData = item.weekly_data ?? {};
                const weekly = weeklyData[w];
                const targetVol = item.target_volume || 0;
                const bobot = item.bobot || 0;

                const rencana = weekly?.rencana ?? 0;
                const realisasi = weekly?.realisasi ?? 0;

                const rencanaPct = targetVol > 0 ? (rencana / targetVol) * 100 : 0;
                const realisasiPct = targetVol > 0 ? (realisasi / targetVol) * 100 : 0;

                weekRencana += (rencanaPct * bobot) / 100;
                weekRealisasi += (realisasiPct * bobot) / 100;
            });

            cumulativeRencana += weekRencana;
            cumulativeRealisasi += weekRealisasi;

            data.push({
                week: `Minggu ${w}`,
                shortWeek: `M${w}`,
                Rencana: Math.min(100, parseFloat(cumulativeRencana.toFixed(2))),
                Realisasi: Math.min(100, parseFloat(cumulativeRealisasi.toFixed(2))),
                Deviasi: parseFloat((cumulativeRealisasi - cumulativeRencana).toFixed(2))
            });
        }
        return data;
    }, [report, weekCount]);

    return (
        <Card className="mt-6 overflow-hidden border-none shadow-lg bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Kurva S - Visualisasi Progres</CardTitle>
                        <CardDescription>Perbandingan kumulatif antara rencana dan realisasi lapangan</CardDescription>
                    </div>
                    {chartData.length > 0 && (
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Status Deviasi</p>
                            <div className={`text-lg font-black flex items-center gap-1 justify-end ${
                                chartData[chartData.length - 1].Deviasi < 0 ? 'text-rose-500' : 'text-emerald-500'
                            }`}>
                                {chartData[chartData.length - 1].Deviasi > 0 ? '+' : ''}{chartData[chartData.length - 1].Deviasi}%
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-96 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="colorRealisasi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorRencana" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="shortWeek" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis 
                                domain={[0, 100]} 
                                tickFormatter={(v) => `${v}%`}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fontWeight: 600 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                            <Legend 
                                verticalAlign="top" 
                                align="right" 
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '20px' }}
                            />
                            
                            <Area
                                type="monotone"
                                dataKey="Rencana"
                                stroke="transparent"
                                fillOpacity={1}
                                fill="url(#colorRencana)"
                                isAnimationActive={true}
                            />
                            <Area
                                type="monotone"
                                dataKey="Realisasi"
                                stroke="transparent"
                                fillOpacity={1}
                                fill="url(#colorRealisasi)"
                                isAnimationActive={true}
                            />

                            <Line
                                type="monotone"
                                dataKey="Rencana"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="Rencana"
                                animationDuration={1500}
                            />
                            <Line
                                type="monotone"
                                dataKey="Realisasi"
                                stroke="#22c55e"
                                strokeWidth={4}
                                dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 8, strokeWidth: 0, fill: '#22c55e' }}
                                name="Realisasi"
                                animationDuration={2000}
                            />
                            
                            <ReferenceLine y={100} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'right', value: 'TARGET 100%', fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
