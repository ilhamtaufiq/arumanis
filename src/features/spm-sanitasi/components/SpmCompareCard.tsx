import { ArrowLeftRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SpmCompareCardProps {
    infrastrukturCount: number
    derived: {
        unit?: number
        mck_unit: number
        kk: number
        jiwa: number
        nilai_kontrak: number
    }
    manual: {
        kk: number
        jiwa: number
        nilai_kontrak: number
    }
    className?: string
}

type MetricKey = 'unit' | 'kk' | 'jiwa' | 'nilai_kontrak'

const METRIC_LABELS: Record<MetricKey, string> = {
    unit: 'Unit Output',
    kk: 'Kepala Keluarga (KK)',
    jiwa: 'Jiwa Terlayani',
    nilai_kontrak: 'Nilai Kontrak',
}

function formatValue(key: MetricKey, value: number) {
    if (key === 'nilai_kontrak') {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(value)
    }
    return value.toLocaleString('id-ID')
}

function getDiffClass(derived: number, manual: number) {
    if (derived === manual) return 'text-emerald-600'
    if (derived > manual) return 'text-amber-600'
    return 'text-blue-600'
}

export function SpmCompareCard({
    infrastrukturCount,
    derived,
    manual,
    className,
}: SpmCompareCardProps) {
    const rows: Array<{ key: MetricKey; manual: number; derived: number; manualLabel: string }> = [
        {
            key: 'unit',
            manual: infrastrukturCount,
            derived: derived.unit ?? derived.mck_unit,
            manualLabel: 'Infrastruktur',
        },
        { key: 'kk', manual: manual.kk, derived: derived.kk, manualLabel: 'Manual (Infrastruktur)' },
        { key: 'jiwa', manual: manual.jiwa, derived: derived.jiwa, manualLabel: 'Manual (Infrastruktur)' },
        {
            key: 'nilai_kontrak',
            manual: manual.nilai_kontrak,
            derived: derived.nilai_kontrak,
            manualLabel: 'Manual (Infrastruktur)',
        },
    ]

    return (
        <Card className={cn('shadow-sm', className)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    Perbandingan Infrastruktur vs Paket Pekerjaan
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {rows.map((row) => {
                    const diff = row.derived - row.manual
                    return (
                        <div
                            key={row.key}
                            className="rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50"
                        >
                            <p className="text-xs font-medium text-muted-foreground">{METRIC_LABELS[row.key]}</p>
                            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                        {row.manualLabel}
                                    </p>
                                    <p className="font-semibold">{formatValue(row.key, row.manual)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                        Derived (Pekerjaan)
                                    </p>
                                    <p className="font-semibold">{formatValue(row.key, row.derived)}</p>
                                </div>
                            </div>
                            <p className={cn('mt-2 text-xs font-medium', getDiffClass(row.derived, row.manual))}>
                                Selisih: {diff >= 0 ? '+' : ''}
                                {row.key === 'nilai_kontrak'
                                    ? formatValue(row.key, diff)
                                    : diff.toLocaleString('id-ID')}
                            </p>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}