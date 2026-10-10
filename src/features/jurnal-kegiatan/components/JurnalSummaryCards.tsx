import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { JurnalRingkasan } from '../types'

interface JurnalSummaryCardsProps {
    ringkasan?: JurnalRingkasan
    isLoading: boolean
}

const numberFormat = new Intl.NumberFormat('id-ID')

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

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardDescription>Jumlah kegiatan</CardDescription>
                    <CardTitle className="text-3xl">{numberFormat.format(ringkasan?.jumlah ?? 0)}</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardDescription>Hari tercatat</CardDescription>
                    <CardTitle className="text-3xl">{numberFormat.format(ringkasan?.hari ?? 0)}</CardTitle>
                </CardHeader>
            </Card>
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardDescription>Total output per RHK</CardDescription>
                </CardHeader>
                <CardContent>
                    {ringkasan && ringkasan.per_rhk.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                            {ringkasan.per_rhk.map((row) => (
                                <li key={row.rhk} className="flex items-center justify-between gap-2">
                                    <span className="font-medium">RHK {row.rhk}</span>
                                    <span className="text-muted-foreground">
                                        {numberFormat.format(row.jumlah)} kegiatan, output {numberFormat.format(row.output)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">Belum ada data RHK pada bulan ini.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
