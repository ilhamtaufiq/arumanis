import { Link } from '@tanstack/react-router'
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { Droplets, Loader2, Toilet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSpamRekap } from '@/features/spam-unit/hooks/useSpamRekap'
import { useSpmSanitasiRekap } from '@/features/spm-sanitasi/hooks/useSpmSanitasiRekap'
import { coveragePercent, type SpmYearlyRow } from '@/lib/spm-rekap'
import { formatNumber, formatPercent } from '@/components/common/spm-rekap/format'

type SpmChartCardProps = {
    title: string
    icon: typeof Droplets
    capaianLabel: string
    rows: SpmYearlyRow[]
    baseline: number
    targetKk: number
    isLoading: boolean
    to: string
    /** KPI total (tanpa tahun). Tidak ditampilkan bila tidak diisi. */
    totalKk?: number
    isTotalLoading?: boolean
}

function SpmChartCard({
    title,
    icon: Icon,
    capaianLabel,
    rows,
    baseline,
    targetKk,
    isLoading,
    to,
    totalKk,
    isTotalLoading,
}: SpmChartCardProps) {
    const hasData = baseline > 0 || rows.some((row) => row.capaian > 0)
    const last = rows.at(-1)

    return (
        <Card className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Icon className="h-5 w-5 shrink-0 text-primary" />
                        {title}
                    </CardTitle>
                    {last && hasData ? (
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Cakupan {formatPercent(last.coverageKumulatif, 2)} · target {formatNumber(targetKk)} KK
                        </p>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent>
                {totalKk !== undefined && !isTotalLoading ? (
                    <dl className="mb-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-muted/50 p-2">
                            <dt className="text-[11px] text-muted-foreground">{capaianLabel}</dt>
                            <dd className="text-sm font-semibold">{formatNumber(totalKk)}</dd>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                            <dt className="text-[11px] text-muted-foreground">Target</dt>
                            <dd className="text-sm font-semibold">{formatNumber(targetKk)}</dd>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                            <dt className="text-[11px] text-muted-foreground">Cakupan</dt>
                            <dd className="text-sm font-semibold">{formatPercent(coveragePercent(totalKk, targetKk), 2)}</dd>
                        </div>
                    </dl>
                ) : null}
                {isLoading ? (
                    <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memuat grafik...
                    </div>
                ) : !hasData ? (
                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                        Belum ada capaian tahunan.
                    </div>
                ) : (
                    <>
                        <div className="mb-3 overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-left text-muted-foreground">
                                        <th className="py-1 font-medium">Tahun</th>
                                        <th className="py-1 text-right font-medium">Tambahan</th>
                                        <th className="py-1 text-right font-medium">Kumulatif</th>
                                        <th className="py-1 text-right font-medium">Cakupan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr key={row.tahun} className="border-t">
                                            <td className="py-1">{row.tahun}</td>
                                            <td className="py-1 text-right">{formatNumber(row.capaian)}</td>
                                            <td className="py-1 text-right">{formatNumber(row.kumulatif)}</td>
                                            <td className="py-1 text-right">{formatPercent(row.coverageKumulatif, 2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
                                Tambahan {capaianLabel} per tahun
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-0.5 w-4 rounded-full bg-emerald-500" />
                                Cakupan kumulatif (%)
                            </span>
                        </div>
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                    <XAxis dataKey="tahun" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                    <YAxis
                                        yAxisId="kk"
                                        tickLine={false}
                                        axisLine={false}
                                        width={52}
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(v) => formatNumber(Number(v))}
                                    />
                                    <YAxis
                                        yAxisId="coverage"
                                        orientation="right"
                                        tickLine={false}
                                        axisLine={false}
                                        width={40}
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(v) => `${Math.round(Number(v))}%`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                                        content={({ active, payload }) => {
                                            const point = payload?.[0]?.payload as SpmYearlyRow | undefined
                                            if (!active || !point) return null
                                            return (
                                                <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
                                                    <p className="mb-1 font-semibold">Tahun {point.tahun}</p>
                                                    <p>
                                                        Tambahan: <strong>{formatNumber(point.capaian)}</strong> {capaianLabel}
                                                    </p>
                                                    <p>
                                                        Kumulatif: <strong>{formatNumber(point.kumulatif)}</strong>
                                                    </p>
                                                    <p>
                                                        Cakupan: <strong>{formatPercent(point.coverageKumulatif, 2)}</strong>
                                                    </p>
                                                </div>
                                            )
                                        }}
                                    />
                                    <Bar yAxisId="kk" dataKey="capaian" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={36} />
                                    <Line
                                        yAxisId="coverage"
                                        type="monotone"
                                        dataKey="coverageKumulatif"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
                <Button variant="link" size="sm" className="mt-3 h-auto p-0 text-xs font-semibold text-primary" asChild>
                    <Link to={to}>Buka detail →</Link>
                </Button>
            </CardContent>
        </Card>
    )
}

export function DashboardSpmCharts() {
    const air = useSpamRekap({ includeDesa: false })
    const sanitasi = useSpmSanitasiRekap({})

    return (
        <section aria-label="Grafik SPM" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SpmChartCard
                title="Capaian SPM Air Minum"
                icon={Droplets}
                capaianLabel="KK terlayani"
                rows={air.yearlyRows}
                baseline={air.yearlyBaseline}
                targetKk={air.targetKk}
                isLoading={air.isYearlyLoading}
                to="/spam-unit"
                totalKk={air.totalKk}
                isTotalLoading={air.isTotalLoading}
            />
            <SpmChartCard
                title="Capaian SPM Sanitasi"
                icon={Toilet}
                capaianLabel="KK pemanfaat"
                rows={sanitasi.yearlyRows}
                baseline={sanitasi.yearlyBaseline}
                targetKk={sanitasi.targetKk}
                isLoading={sanitasi.isYearlyLoading}
                to="/spm-sanitasi"
            />
        </section>
    )
}
