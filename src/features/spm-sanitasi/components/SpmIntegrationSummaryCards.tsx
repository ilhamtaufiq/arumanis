import { Building2, GitCompare, Link2, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SpmIntegrationResponse } from '../types'

interface SpmIntegrationSummaryCardsProps {
    summary?: SpmIntegrationResponse['summary']
    isLoading?: boolean
}

export function SpmIntegrationSummaryCards({ summary, isLoading }: SpmIntegrationSummaryCardsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="h-24 animate-pulse bg-muted/40" />
                ))}
            </div>
        )
    }

    if (!summary) return null

    const cards = [
        {
            label: 'Desa Terintegrasi',
            value: summary.matched_count,
            sub: `dari ${summary.total_desa} desa`,
            icon: Link2,
        },
        {
            label: 'Perlu Tindakan',
            value: summary.partial_count + summary.no_infrastruktur_count,
            sub: `${summary.partial_count} partial · ${summary.no_infrastruktur_count} tanpa infrastruktur`,
            icon: GitCompare,
        },
        {
            label: 'Paket Pekerjaan',
            value: summary.total_pekerjaan,
            sub: `${summary.total_linked} tertaut`,
            icon: Package,
        },
        {
            label: 'Infrastruktur',
            value: summary.total_infrastruktur,
            sub: `${summary.no_pekerjaan_count} desa tanpa paket`,
            icon: Building2,
        },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.label}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.label}
                        </CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground">{card.sub}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}