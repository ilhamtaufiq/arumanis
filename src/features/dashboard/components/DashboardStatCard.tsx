import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type StatVariant = 'default' | 'success' | 'warning' | 'info' | 'primary'

const variantStyles: Record<StatVariant, { card: string; icon: string }> = {
    default: {
        card: 'border-border/70 bg-background',
        icon: 'bg-muted text-muted-foreground',
    },
    success: {
        card: 'border-emerald-500/20 bg-emerald-500/[0.04]',
        icon: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
    },
    warning: {
        card: 'border-amber-500/20 bg-amber-500/[0.04]',
        icon: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
    },
    info: {
        card: 'border-blue-500/20 bg-blue-500/[0.04]',
        icon: 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
    },
    primary: {
        card: 'border-primary/20 bg-primary/[0.04]',
        icon: 'bg-primary/12 text-primary',
    },
}

type DashboardStatCardProps = {
    title: string
    value: string
    icon: LucideIcon
    description?: string
    isLoading?: boolean
    variant?: StatVariant
    compact?: boolean
}

export function DashboardStatCard({
    title,
    value,
    icon: Icon,
    description,
    isLoading,
    variant = 'default',
    compact = false,
}: DashboardStatCardProps) {
    const styles = variantStyles[variant]

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-card p-4">
                <Skeleton className="mb-3 h-8 w-8 rounded-lg" />
                <Skeleton className="mb-2 h-3 w-24" />
                <Skeleton className="h-7 w-28" />
            </div>
        )
    }

    return (
        <div
            className={cn(
                'group rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                styles.card,
                compact && 'p-3',
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {title}
                    </p>
                    <p className={cn('mt-2 font-bold tracking-tight', compact ? 'text-xl' : 'text-2xl')}>
                        {value}
                    </p>
                    {description ? (
                        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                <div className={cn('rounded-xl p-2.5 transition-transform group-hover:scale-105', styles.icon)}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </div>
    )
}