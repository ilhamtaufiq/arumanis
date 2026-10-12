import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { daysInMonth, rhkTone } from '../lib/jurnal-helpers'
import type { JurnalRingkasan } from '../types'

interface JurnalSummaryCardsProps {
    ringkasan?: JurnalRingkasan
    isLoading: boolean
}

const numberFormat = new Intl.NumberFormat('id-ID')
const decimalFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 })

export default function JurnalSummaryCards({ ringkasan, isLoading }: JurnalSummaryCardsProps) {
    if (isLoading && !ringkasan) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
        )
    }

    const jumlah = ringkasan?.jumlah ?? 0
    const hari = ringkasan?.hari ?? 0
    const totalHari = ringkasan ? daysInMonth(ringkasan.tahun, ringkasan.bulan) : 0
    const rataRata = hari > 0 ? jumlah / hari : null
    const perRhk = ringkasan?.per_rhk ?? []
    const totalKegiatanRhk = perRhk.reduce((sum, row) => sum + row.jumlah, 0)

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardDescription>Jumlah kegiatan</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">{numberFormat.format(jumlah)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {rataRata !== null
                            ? `rata-rata ${decimalFormat.format(rataRata)} per hari tercatat`
                            : 'belum ada kegiatan bulan ini'}
                    </p>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription>Hari tercatat</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">
                        {numberFormat.format(hari)}
                        {totalHari > 0 && (
                            <span className="ml-1 text-base font-normal text-muted-foreground">
                                / {totalHari} hari
                            </span>
                        )}
                    </CardTitle>
                    {totalHari > 0 && (
                        <div
                            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                            role="progressbar"
                            aria-label="Hari tercatat dibanding jumlah hari dalam bulan"
                            aria-valuemin={0}
                            aria-valuemax={totalHari}
                            aria-valuenow={hari}
                        >
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${Math.min(100, (hari / totalHari) * 100)}%` }}
                            />
                        </div>
                    )}
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription>Kegiatan per RHK</CardDescription>
                </CardHeader>
                <CardContent>
                    {perRhk.length > 0 ? (
                        <ul className="space-y-3">
                            {perRhk.map((row) => {
                                const share = totalKegiatanRhk > 0 ? (row.jumlah / totalKegiatanRhk) * 100 : 0
                                const tone = rhkTone(row.rhk)
                                return (
                                    <li key={row.rhk} className="space-y-1">
                                        <div className="flex items-baseline justify-between gap-2 text-sm">
                                            <span className="font-semibold">RHK {row.rhk}</span>
                                            <span className="text-muted-foreground tabular-nums">
                                                {numberFormat.format(row.jumlah)} kegiatan
                                                {row.output > 0 && <> · output {numberFormat.format(row.output)}</>}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                                            <div
                                                className={cn('h-full rounded-full', tone.bar)}
                                                style={{ width: `${share}%` }}
                                            />
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">Belum ada data RHK pada bulan ini.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
