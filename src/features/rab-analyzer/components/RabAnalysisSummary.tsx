import { formatCurrency } from '@/lib/format'
import type { RabAnalysisResult } from '../types'

type RabAnalysisSummaryProps = {
    summary: RabAnalysisResult['summary']
    rekap?: RabAnalysisResult['rekap']
    compact?: boolean
}

export function RabAnalysisSummary({ summary, rekap, compact = false }: RabAnalysisSummaryProps) {
    if (compact) {
        return (
            <div className="grid gap-2 rounded-xl border bg-muted/20 p-3 text-sm sm:grid-cols-3">
                <div>
                    <p className="text-xs text-muted-foreground">DPP</p>
                    <p className="font-semibold tabular-nums">{formatCurrency(summary.subtotalDpp)}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">PPN 11%</p>
                    <p className="font-semibold tabular-nums">{formatCurrency(summary.totalPpn)}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-primary tabular-nums">{formatCurrency(summary.grandTotal)}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
                <SummaryCard label="Subtotal (DPP)" value={formatCurrency(summary.subtotalDpp)} />
                <SummaryCard label="PPN 11%" value={formatCurrency(summary.totalPpn)} />
                <SummaryCard label="Grand Total" value={formatCurrency(summary.grandTotal)} highlight />
            </div>
            {rekap ? <SelisihRekap summary={summary} rekap={rekap} /> : null}
        </div>
    )
}

/** Perbandingan rincian dengan total rekap di berkas. Selisih ditampilkan bila lebih dari Rp 1. */
function SelisihRekap({
    summary,
    rekap,
}: {
    summary: RabAnalysisResult['summary']
    rekap: NonNullable<RabAnalysisResult['rekap']>
}) {
    const ada = Math.abs(rekap.selisih) > 1
    const warna = ada
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200'
        : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200'
    return (
        <div className={`rounded-xl border p-4 text-sm ${warna}`}>
            <p className="font-semibold">
                {ada ? 'Selisih dengan rekap di berkas' : 'Sesuai dengan rekap di berkas'}
            </p>
            <dl className="mt-2 grid gap-1 tabular-nums sm:grid-cols-3">
                <div>
                    <dt className="text-xs opacity-80">DPP rincian</dt>
                    <dd className="font-medium">{formatCurrency(summary.subtotalDpp)}</dd>
                </div>
                <div>
                    <dt className="text-xs opacity-80">Jumlah rekap</dt>
                    <dd className="font-medium">{formatCurrency(rekap.jumlah)}</dd>
                </div>
                <div>
                    <dt className="text-xs opacity-80">Selisih</dt>
                    <dd className="font-medium">{formatCurrency(rekap.selisih)}</dd>
                </div>
            </dl>
            {ada ? (
                <p className="mt-2 text-xs opacity-90">
                    Rincian dan rekap tidak sama. Periksa rumus subtotal di berkas, atau baris yang tidak ikut terjumlah.
                </p>
            ) : null}
        </div>
    )
}

function SummaryCard({
    label,
    value,
    highlight = false,
}: {
    label: string
    value: string
    highlight?: boolean
}) {
    return (
        <div className={`rounded-xl border p-4 ${highlight ? 'border-primary/30 bg-primary/5' : 'bg-card'}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`mt-2 text-lg font-bold tabular-nums ${highlight ? 'text-primary' : ''}`}>{value}</p>
        </div>
    )
}