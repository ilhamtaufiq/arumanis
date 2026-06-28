import { formatCurrency } from '@/lib/format'
import type { RabAnalysisResult } from '../types'

type RabAnalysisSummaryProps = {
    summary: RabAnalysisResult['summary']
    compact?: boolean
}

export function RabAnalysisSummary({ summary, compact = false }: RabAnalysisSummaryProps) {
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
        <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Subtotal (DPP)" value={formatCurrency(summary.subtotalDpp)} />
            <SummaryCard label="PPN 11%" value={formatCurrency(summary.totalPpn)} />
            <SummaryCard label="Grand Total" value={formatCurrency(summary.grandTotal)} highlight />
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