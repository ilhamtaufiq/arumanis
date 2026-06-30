import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
    Bar,
    CartesianGrid,
    Cell,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { formatCount, formatCoverage } from '../../lib/innovation-stats'
import { useSpmYearlyTrend } from '../../hooks/useSpmYearlyTrend'
import { getPrimaryCoverageMetric, type SpmYearlyTrendPoint } from '../../lib/spm-yearly-trend'
import type { LandingSpmSector } from '../../api/spam-stats'
import type { PublicMessages } from '../../i18n/types'

type SpmYearlyTrendChartProps = {
    sector: LandingSpmSector
    highlightTahun?: string
    copy: PublicMessages['spmDetail']['yearlyChart']
}

export function SpmYearlyTrendChart({ sector, highlightTahun, copy }: SpmYearlyTrendChartProps) {
    const { points, isLoading, isError } = useSpmYearlyTrend(sector)
    const coverageKey = getPrimaryCoverageMetric(sector)

    const chartData = useMemo(
        () =>
            points.map((point) => ({
                ...point,
                coverageValue:
                    coverageKey === 'coverageKk'
                        ? (point.coverageKk ?? point.coverage)
                        : point.coverage,
            })),
        [points, coverageKey],
    )

    const kkLabel = sector === 'sanitasi' ? copy.kkSanitasi : copy.kkAirMinum

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/15 bg-black/20 p-5 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-6"
        >
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">
                        {copy.eyebrow}
                    </p>
                    <h3 className="mt-1 text-lg font-medium text-white">{copy.title}</h3>
                    <p className="mt-1 text-sm text-white/60">
                        {sector === 'sanitasi' ? copy.subtitleSanitasi : copy.subtitleAirMinum}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                        {kkLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-0.5 w-4 rounded-full bg-cyan-300" />
                        {copy.coverageLegend}
                    </span>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-[280px] items-center justify-center text-sm text-white/55">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {copy.loading}
                </div>
            ) : isError || chartData.length === 0 ? (
                <div className="flex h-[280px] items-center justify-center text-sm text-white/55">
                    {copy.empty}
                </div>
            ) : (
                <div className="h-[min(320px,50vh)] w-full min-h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                            <XAxis
                                dataKey="tahun"
                                tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="kk"
                                tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => formatCount(Number(value))}
                                width={48}
                            />
                            <YAxis
                                yAxisId="coverage"
                                orientation="right"
                                domain={[0, 100]}
                                tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `${value}%`}
                                width={40}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                content={({ active, payload, label }) => (
                                    <TrendTooltip
                                        active={active}
                                        payload={payload}
                                        label={String(label ?? '')}
                                        sector={sector}
                                        copy={copy}
                                    />
                                )}
                            />
                            <Bar yAxisId="kk" dataKey="kk" radius={[6, 6, 0, 0]} maxBarSize={42}>
                                {chartData.map((point) => (
                                    <Cell
                                        key={point.tahun}
                                        fill={
                                            highlightTahun === point.tahun
                                                ? 'rgba(52, 211, 153, 0.92)'
                                                : 'rgba(52, 211, 153, 0.42)'
                                        }
                                    />
                                ))}
                            </Bar>
                            <Line
                                yAxisId="coverage"
                                type="monotone"
                                dataKey="coverageValue"
                                stroke="rgb(103, 232, 249)"
                                strokeWidth={2.5}
                                dot={{
                                    r: highlightTahun ? 4 : 3,
                                    fill: 'rgb(103, 232, 249)',
                                    stroke: 'rgba(15, 23, 42, 0.9)',
                                    strokeWidth: 2,
                                }}
                                activeDot={{ r: 5 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    )
}

function TrendTooltip({
    active,
    payload,
    label,
    sector,
    copy,
}: {
    active?: boolean
    payload?: Array<{ payload?: SpmYearlyTrendPoint & { coverageValue?: number } }>
    label: string
    sector: LandingSpmSector
    copy: PublicMessages['spmDetail']['yearlyChart']
}) {
    if (!active || !payload?.length) return null

    const point = payload[0]?.payload
    if (!point) return null

    const coverage =
        sector === 'sanitasi'
            ? (point.coverageKk ?? point.coverage)
            : point.coverage

    return (
        <div className="rounded-xl border border-white/15 bg-slate-950/95 px-3 py-2.5 text-xs shadow-xl shadow-black/30 backdrop-blur-md">
            <p className="font-semibold text-white">{copy.tooltipYear.replace('{year}', label)}</p>
            <div className="mt-2 space-y-1 text-white/75">
                <p>
                    {copy.coverageLegend}:{' '}
                    <span className="font-semibold text-cyan-300">{formatCoverage(coverage)}%</span>
                </p>
                <p>
                    {sector === 'sanitasi' ? copy.kkSanitasi : copy.kkAirMinum}:{' '}
                    <span className="font-semibold text-emerald-300">{formatCount(point.kk)}</span>
                </p>
                <p>
                    {copy.jiwa}:{' '}
                    <span className="font-semibold text-white">{formatCount(point.jiwa)}</span>
                </p>
                <p>
                    {copy.target}:{' '}
                    <span className="font-semibold text-white">{formatCount(point.target)}</span>
                </p>
                {sector === 'sanitasi' ? (
                    <p>
                        {copy.infrastruktur}:{' '}
                        <span className="font-semibold text-white">{formatCount(point.units)}</span>
                    </p>
                ) : (
                    <p>
                        {copy.unitSpam}:{' '}
                        <span className="font-semibold text-white">{formatCount(point.units)}</span>
                    </p>
                )}
            </div>
        </div>
    )
}