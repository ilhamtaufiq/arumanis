import { useQuery } from '@tanstack/react-query'
import {
    MapPinOff,
    ImageMinus,
    FileWarning,
    AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getDataQualityStats } from '../api/dashboard'
import type { DataQualityStats as DataQualityStatsType } from '../types'

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    description: string
    isLoading: boolean
    variant: 'danger' | 'warning' | 'info'
}

function StatCard({ title, value, icon: Icon, description, isLoading, variant }: StatCardProps) {
    const variantStyles = {
        danger: 'from-destructive/10 via-destructive/5 to-transparent border-destructive/20 text-destructive',
        warning: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 text-amber-600 dark:text-amber-400',
        info: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 text-blue-600 dark:text-blue-400',
    }

    if (isLoading) {
        return (
            <Card className="relative overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-7 w-16 mb-1" />
                    <Skeleton className="h-3 w-32" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={`relative overflow-hidden bg-gradient-to-br ${variantStyles[variant]} border transition-all hover:shadow-md`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                <p className="text-[10px] mt-1 opacity-80 font-medium">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

export function DataQualityStats({ year }: { year?: string }) {
    const { data: stats, isLoading, error } = useQuery<DataQualityStatsType>({
        queryKey: ['data-quality-stats', year],
        queryFn: () => getDataQualityStats(year)
    })

    if (error) return null

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
                title="Selesaikan Koordinat"
                value={stats?.no_coordinates || 0}
                icon={MapPinOff}
                description="Pekerjaan belum memiliki titik koordinat"
                variant="danger"
                isLoading={isLoading}
            />
            <StatCard
                title="Dokumentasi Foto"
                value={stats?.no_photos || 0}
                icon={ImageMinus}
                description="Pekerjaan belum memiliki foto progres"
                variant="warning"
                isLoading={isLoading}
            />
            <StatCard
                title="Started No Photo"
                value={stats?.started_no_photos || 0}
                icon={AlertCircle}
                description="Pekerjaan sudah ada kontrak tapi belum ada foto"
                variant="warning"
                isLoading={isLoading}
            />
            <StatCard
                title="Pekerjaan Draft"
                value={stats?.no_contracts || 0}
                icon={FileWarning}
                description="Pekerjaan belum dikaitkan dengan kontrak"
                variant="info"
                isLoading={isLoading}
            />
        </div>
    )
}
