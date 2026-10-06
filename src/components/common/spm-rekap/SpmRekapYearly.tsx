import { useMemo } from 'react'
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
import { ArrowDownRight, ArrowUpRight, Loader2, Minus } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { SpmYearlyRow } from '@/lib/spm-rekap'
import { formatNumber, formatPercent, formatSigned, formatSignedPercent } from './format'

type SpmRekapYearlyProps = {
    rows: SpmYearlyRow[]
    isLoading?: boolean
    capaianLabel: string
    showSr?: boolean
    highlightTahun?: string
    note?: string
    /** Capaian tanpa tahun / sebelum tahun pertama (titik awal akumulasi) */
    baseline?: number
    baselineLabel?: string
}

function DeltaBadge({ delta, deltaPct }: { delta: number | null; deltaPct: number | null }) {
    if (delta == null) {
        return <span className="text-xs text-muted-foreground">—</span>
    }
    const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus
    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
                delta > 0 && 'text-emerald-600 dark:text-emerald-400',
                delta < 0 && 'text-rose-600 dark:text-rose-400',
                delta === 0 && 'text-muted-foreground',
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {formatSigned(delta)}
            {deltaPct != null ? (
                <span className="font-normal opacity-80">({formatSignedPercent(deltaPct, 0)})</span>
            ) : null}
        </span>
    )
}

export function SpmRekapYearly({
    rows,
    isLoading,
    capaianLabel,
    showSr,
    highlightTahun,
    note,
    baseline = 0,
    baselineLabel = 'Sebelumnya / tanpa tahun',
}: SpmRekapYearlyProps) {
    const totals = useMemo(
        () =>
            rows.reduce(
                (acc, row) => {
                    acc.capaian += row.capaian
                    acc.jiwa += row.jiwa
                    acc.sr += row.sr
                    return acc
                },
                { capaian: 0, jiwa: 0, sr: 0 },
            ),
        [rows],
    )
    const last = rows.at(-1)
    const hasData = baseline > 0 || rows.some((row) => row.capaian > 0)

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memuat tren tahunan...
            </div>
        )
    }

    if (!hasData) {
        return (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Belum ada capaian tahunan untuk filter ini.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-lg border p-3">
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
                <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                            <XAxis
                                dataKey="tahun"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                className="fill-muted-foreground"
                            />
                            <YAxis
                                yAxisId="kk"
                                tickLine={false}
                                axisLine={false}
                                width={56}
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) => formatNumber(Number(v))}
                            />
                            <YAxis
                                yAxisId="coverage"
                                orientation="right"
                                tickLine={false}
                                axisLine={false}
                                width={44}
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
                                                Cakupan kumulatif:{' '}
                                                <strong>{formatPercent(point.coverageKumulatif, 2)}</strong>
                                            </p>
                                            <p>
                                                vs tahun lalu: <strong>{formatSigned(point.delta)}</strong>
                                            </p>
                                        </div>
                                    )
                                }}
                            />
                            <Bar yAxisId="kk" dataKey="capaian" radius={[4, 4, 0, 0]} maxBarSize={44}>
                                {rows.map((row) => (
                                    <Cell
                                        key={row.tahun}
                                        fill={
                                            !highlightTahun || highlightTahun === row.tahun
                                                ? 'rgb(14 165 233)'
                                                : 'rgba(14, 165, 233, 0.35)'
                                        }
                                    />
                                ))}
                            </Bar>
                            <Line
                                yAxisId="coverage"
                                type="monotone"
                                dataKey="coverageKumulatif"
                                stroke="rgb(16 185 129)"
                                strokeWidth={2.5}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead>Tahun</TableHead>
                            <TableHead className="text-right">Tambahan {capaianLabel}</TableHead>
                            {showSr ? <TableHead className="text-right">Tambahan SR</TableHead> : null}
                            <TableHead className="text-right">Jiwa</TableHead>
                            <TableHead className="text-right">Peningkatan vs tahun lalu</TableHead>
                            <TableHead className="text-right">Kenaikan cakupan</TableHead>
                            <TableHead className="text-right">Kumulatif</TableHead>
                            <TableHead className="text-right">Cakupan kumulatif</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {baseline > 0 ? (
                            <TableRow className="text-muted-foreground">
                                <TableCell className="text-xs italic">{baselineLabel}</TableCell>
                                <TableCell className="text-right tabular-nums">{formatNumber(baseline)}</TableCell>
                                {showSr ? <TableCell /> : null}
                                <TableCell />
                                <TableCell className="text-right text-xs">—</TableCell>
                                <TableCell />
                                <TableCell className="text-right tabular-nums">{formatNumber(baseline)}</TableCell>
                                <TableCell />
                            </TableRow>
                        ) : null}
                        {rows.map((row) => (
                            <TableRow
                                key={row.tahun}
                                className={cn(highlightTahun === row.tahun && 'bg-sky-50 dark:bg-sky-950/30')}
                            >
                                <TableCell className="font-semibold">{row.tahun}</TableCell>
                                <TableCell className="text-right font-semibold tabular-nums">
                                    {formatNumber(row.capaian)}
                                </TableCell>
                                {showSr ? (
                                    <TableCell className="text-right tabular-nums">{formatNumber(row.sr)}</TableCell>
                                ) : null}
                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                    {formatNumber(row.jiwa)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DeltaBadge delta={row.delta} deltaPct={row.deltaPct} />
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-sky-700 dark:text-sky-400">
                                    {row.coverageGain != null && row.coverageGain > 0
                                        ? `+${formatPercent(row.coverageGain, 2)}`
                                        : '—'}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">{formatNumber(row.kumulatif)}</TableCell>
                                <TableCell className="text-right font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                                    {formatPercent(row.coverageKumulatif, 2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell className="font-semibold">Total</TableCell>
                            <TableCell className="text-right font-bold tabular-nums">
                                {formatNumber(totals.capaian + baseline)}
                            </TableCell>
                            {showSr ? (
                                <TableCell className="text-right font-semibold tabular-nums">
                                    {formatNumber(totals.sr)}
                                </TableCell>
                            ) : null}
                            <TableCell className="text-right tabular-nums">{formatNumber(totals.jiwa)}</TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell className="text-right font-semibold tabular-nums">
                                {formatNumber(last?.kumulatif)}
                            </TableCell>
                            <TableCell className="text-right font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                                {formatPercent(last?.coverageKumulatif, 2)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            {note ? <p className="text-[11px] leading-relaxed text-muted-foreground">{note}</p> : null}
        </div>
    )
}
