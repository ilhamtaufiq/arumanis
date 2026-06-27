import { ArrowLeftRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DerivedMetrics, ManualMetrics } from '../types'
import { getManualCompareLabel, getPotensiCompareLabel } from '../lib/manual-scope'
import { SPAM_ACCUMULATION_START_TAHUN } from '../lib/baseline'

interface SpamCompareCardProps {
    derived: DerivedMetrics
    manual: ManualMetrics
    manualIntegrasi?: ManualMetrics
    manualLabel?: string
    className?: string
}

type MetricKey = 'sr' | 'kk' | 'jiwa' | 'nilai_kontrak'

const METRIC_LABELS: Record<MetricKey, string> = {
    sr: 'Sambungan Rumah (SR)',
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

export function SpamCompareCard({
    derived,
    manual,
    manualIntegrasi,
    manualLabel = getManualCompareLabel(),
    className,
}: SpamCompareCardProps) {
    const compareManual = manualIntegrasi ?? manual
    const metrics: MetricKey[] = ['sr', 'kk', 'jiwa', 'nilai_kontrak']

    return (
        <Card className={cn('shadow-sm', className)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    Integrasi {SPAM_ACCUMULATION_START_TAHUN} ke atas
                </CardTitle>
                <p className="text-xs font-normal text-muted-foreground">
                    Kolom kiri: capaian unit tahun {SPAM_ACCUMULATION_START_TAHUN}+. Kolom kanan: potensi paket AM tahun sama. Acuan master s/d 2025 tidak dibandingkan.
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {metrics.map((key) => {
                    const derivedValue = derived[key]
                    const manualValue = compareManual[key]
                    const diff = derivedValue - manualValue

                    return (
                        <div
                            key={key}
                            className="rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50"
                        >
                            <p className="text-xs font-medium text-muted-foreground">
                                {METRIC_LABELS[key]}
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                        {manualLabel}
                                    </p>
                                    <p className="font-semibold">{formatValue(key, manualValue)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                        {getPotensiCompareLabel()}
                                    </p>
                                    <p className="font-semibold">{formatValue(key, derivedValue)}</p>
                                </div>
                            </div>
                            <p className={cn('mt-2 text-xs font-medium', getDiffClass(derivedValue, manualValue))}>
                                {diff > 0
                                    ? `Belum tercatat di unit: +${key === 'nilai_kontrak' ? formatValue(key, diff) : diff.toLocaleString('id-ID')}`
                                    : diff < 0
                                      ? `Capaian unit lebih besar: ${key === 'nilai_kontrak' ? formatValue(key, diff) : diff.toLocaleString('id-ID')}`
                                      : 'Sudah selaras'}
                            </p>
                        </div>
                    )
                })}
                {derived.progress_avg !== undefined && (
                    <div className="rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50">
                        <p className="text-xs font-medium text-muted-foreground">Rata-rata Progress Pekerjaan</p>
                        <p className="mt-1 text-lg font-bold">{derived.progress_avg.toFixed(1)}%</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}