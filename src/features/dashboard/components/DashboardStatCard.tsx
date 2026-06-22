import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type StatVariant = 'default' | 'success' | 'warning' | 'info' | 'primary'

const variantStyles: Record<StatVariant, { card: string; icon: string; accent: string }> = {
    default: {
        card: 'border-border/60',
        icon: 'bg-muted text-muted-foreground',
        accent: 'bg-muted-foreground',
    },
    success: {
        card: 'border-emerald-500/20 bg-emerald-500/[0.03]',
        icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        accent: 'bg-emerald-500',
    },
    warning: {
        card: 'border-amber-500/20 bg-amber-500/[0.03]',
        icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        accent: 'bg-amber-500',
    },
    info: {
        card: 'border-blue-500/20 bg-blue-500/[0.03]',
        icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        accent: 'bg-blue-500',
    },
    primary: {
        card: 'border-primary/20 bg-primary/[0.03]',
        icon: 'bg-primary/10 text-primary',
        accent: 'bg-primary',
    },
}

type DashboardStatCardProps = {
    title: string
    value: string
    icon: LucideIcon
    description?: string
    isLoading?: boolean
    variant?: StatVariant
}

export function DashboardStatCard({
    title,
    value,
    icon: Icon,
    description,
    isLoading,
    variant = 'default',
}: DashboardStatCardProps) {
    const styles = variantStyles[variant]

    if (isLoading) {
        return (
            <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="mb-1 h-8 w-32" />
                    <Skeleton className="h-3 w-20" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            className={cn(
                'group relative overflow-hidden border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                styles.card,
            )}
        >
            <div
                className={cn(
                    'absolute inset-x-0 top-0 h-0.5 opacity-80 transition-opacity group-hover:opacity-100',
                    styles.accent,
                )}
            />
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={cn('rounded-lg p-2.5 transition-transform group-hover:scale-105', styles.icon)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {description ? (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                ) : null}
            </CardContent>
        </Card>
    )
}