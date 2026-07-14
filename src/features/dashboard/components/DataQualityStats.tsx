import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
    MapPinOff,
    ImageMinus,
    FileWarning,
    AlertCircle,
    ChevronRight,
    type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getDataQualityStats } from '../api/dashboard'
import type { DataQualityStats as DataQualityStatsType } from '../types'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description: string
    isLoading: boolean
    variant: 'danger' | 'warning' | 'info'
    href: string
    cta: string
}

function StatCard({
    title,
    value,
    icon: Icon,
    description,
    isLoading,
    variant,
    href,
    cta,
}: StatCardProps) {
    const variantStyles = {
        danger: 'from-destructive/10 via-destructive/5 to-transparent border-destructive/20 text-destructive',
        warning: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 text-amber-600 dark:text-amber-400',
        info: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 text-blue-600 dark:text-blue-400',
    }

    if (isLoading) {
        return (
            <Card className="group relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="mb-1 h-7 w-16" />
                    <Skeleton className="h-3 w-32" />
                </CardContent>
            </Card>
        )
    }

    const numeric = Number(value)
    const isCritical = numeric > 0

    return (
        <Link to={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
            <Card
                className={cn(
                    'relative overflow-hidden border bg-gradient-to-br transition-all hover:shadow-md',
                    variantStyles[variant],
                    isCritical && 'ring-1 ring-inset ring-current/10',
                )}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider opacity-70">
                        {title}
                    </CardTitle>
                    <Icon className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight tabular-nums">{value}</div>
                    <p className="mt-1 text-[10px] font-medium opacity-80">{description}</p>
                    <p className="mt-2 inline-flex items-center gap-0.5 text-[11px] font-semibold opacity-90">
                        {cta}
                        <ChevronRight className="h-3 w-3" />
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}

export function DataQualityStats({ year }: { year?: string }) {
    const { data: stats, isLoading, error } = useQuery<DataQualityStatsType>({
        queryKey: ['data-quality-stats', year],
        queryFn: () => getDataQualityStats(year),
    })

    if (error) return null

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Selesaikan Koordinat"
                value={stats?.no_coordinates || 0}
                icon={MapPinOff}
                description="Pekerjaan belum memiliki titik koordinat"
                variant="danger"
                isLoading={isLoading}
                href="/map"
                cta="Buka peta & lengkapi"
            />
            <StatCard
                title="Dokumentasi Foto"
                value={stats?.no_photos || 0}
                icon={ImageMinus}
                description="Pekerjaan belum memiliki foto progres"
                variant="warning"
                isLoading={isLoading}
                href="/foto"
                cta="Kelola foto"
            />
            <StatCard
                title="Kontrak Tanpa Foto"
                value={stats?.started_no_photos || 0}
                icon={AlertCircle}
                description="Sudah berkontrak tapi belum ada foto"
                variant="warning"
                isLoading={isLoading}
                href="/pekerjaan"
                cta="Lihat pekerjaan"
            />
            <StatCard
                title="Tanpa Kontrak"
                value={stats?.no_contracts || 0}
                icon={FileWarning}
                description="Pekerjaan belum dikaitkan dengan kontrak"
                variant="info"
                isLoading={isLoading}
                href="/kontrak"
                cta="Kelola kontrak"
            />
        </div>
    )
}
