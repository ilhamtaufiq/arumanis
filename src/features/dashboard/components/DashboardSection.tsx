import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type DashboardSectionProps = {
    title: string
    description?: string
    action?: ReactNode
    children: ReactNode
    className?: string
    variant?: 'default' | 'muted'
}

export function DashboardSection({
    title,
    description,
    action,
    children,
    className,
    variant = 'default',
}: DashboardSectionProps) {
    return (
        <section
            className={cn(
                'rounded-2xl border p-4 shadow-sm sm:p-5',
                variant === 'muted' ? 'border-border/60 bg-muted/20' : 'bg-card',
                className,
            )}
        >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-base font-semibold tracking-tight">
                        {title}
                    </h2>
                    {description ? (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                {action}
            </div>
            {children}
        </section>
    )
}