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
        const data = payload[0].payload;
        const rencana = data.Rencana || 0;
        const realisasi = data.Realisasi || 0;
        const deviasi = data.Deviasi || 0;
        const activeItems = data.activeItems || [];
        
        return (
            <div className="bg-background/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl min-w-[300px] max-w-[400px]">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-wider">{label}</p>
                    <div className={`flex items-center gap-1 text-sm font-black px-2 py-0.5 rounded-full ${deviasi < 0 ? 'bg-rose-500/10 text-rose-500' : deviasi > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                        {deviasi > 0 ? <TrendingUp className="w-3 h-3" /> : deviasi < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {deviasi > 0 ? `+${deviasi}` : deviasi}%
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-500/10 rounded-lg p-2">
                        <span className="block text-[10px] font-bold text-blue-500 uppercase">Total Rencana</span>
                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">{rencana.toFixed(2)}%</span>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-2">
                        <span className="block text-[10px] font-bold text-green-500 uppercase">Total Realisasi</span>
                        <span className="text-lg font-black text-green-600 dark:text-green-400">{realisasi.toFixed(2)}%</span>
                    </div>
                </div>

                {activeItems.length > 0 && (
                    <div className="mt-4">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Item Pekerjaan Terbesar Minggu Ini</p>
                        <div className="space-y-2 pr-1">
                            {[...activeItems]
                                .sort((a: any, b: any) => (b.rencana || 0) - (a.rencana || 0))
                                .slice(0, 5)
                                .map((item: any, idx: number) => {
                                return (
                                    <div key={idx} className="bg-muted/40 p-2 rounded-md border text-xs">
                                        <div className="font-semibold line-clamp-2 leading-tight mb-1" title={item.name}>{item.name}</div>
                                        <div className="flex justify-between items-center text-[10px] mt-1 text-muted-foreground">
                                            <span>Vol: {item.target} {item.satuan}</span>
                                            <span className="font-bold">Bobot: {item.bobot}%</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-blue-500 font-bold uppercase">Rencana</span>
                                                <span className="font-black">{item.rencana} <span className="text-muted-foreground font-medium text-[9px]">{item.satuan}</span></span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-green-500 font-bold uppercase">Realisasi</span>
                                                <span className="font-black">{item.realisasi ?? 0} <span className="text-muted-foreground font-medium text-[9px]">{item.satuan}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {activeItems.length > 5 && (
                                <div className="text-center pt-2 mt-2 border-t text-xs font-semibold text-muted-foreground bg-muted/20 rounded-b-md p-1">
                                    + {activeItems.length - 5} pekerjaan lainnya...
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
            const activeItems: any[] = [];

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

                if (rencana > 0 || realisasi > 0) {
                    activeItems.push({
                        name: item.nama_item + (item.rincian_item ? ` - ${item.rincian_item}` : ''),
                        rencana: Number(rencana.toFixed(2)),
                        realisasi: realisasi !== null ? Number(realisasi.toFixed(2)) : null,
                        satuan: item.satuan,
                        bobot: bobot,
                        target: targetVol
                    });
                }
            });

            cumulativeRencana += weekRencana;
            cumulativeRealisasi += weekRealisasi;

            data.push({
                week: `Minggu ${w}`,
                shortWeek: `M${w}`,
                Rencana: Math.min(100, parseFloat(cumulativeRencana.toFixed(2))),
                Realisasi: Math.min(100, parseFloat(cumulativeRealisasi.toFixed(2))),
                Deviasi: parseFloat((cumulativeRealisasi - cumulativeRencana).toFixed(2)),
                activeItems
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
