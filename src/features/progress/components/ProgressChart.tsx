import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ProgressReportResponse } from '@/features/progress/types';

interface ProgressChartProps {
    report: ProgressReportResponse['data'] | null;
    weekCount: number;
}

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

                // Calculate weighted progress
                const rencanaPct = targetVol > 0 ? (rencana / targetVol) * 100 : 0;
                const realisasiPct = targetVol > 0 ? (realisasi / targetVol) * 100 : 0;

                weekRencana += (rencanaPct * bobot) / 100;
                weekRealisasi += (realisasiPct * bobot) / 100;
            });

            cumulativeRencana += weekRencana;
            cumulativeRealisasi += weekRealisasi;

            data.push({
                week: `M${w}`,
                Rencana: Math.round(cumulativeRencana),
                Realisasi: Math.round(cumulativeRealisasi),
            });
        }
        return data;
    }, [report, weekCount]);

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Kurva S - Progress Pekerjaan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                            <Tooltip formatter={(value: any) => `${value ?? 0}%`} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="Rencana"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="Rencana Kumulatif"
                            />
                            <Line
                                type="monotone"
                                dataKey="Realisasi"
                                stroke="#22c55e"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="Realisasi Kumulatif"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
