import type { ReactNode } from 'react'

type DashboardSectionProps = {
    title: string
    description?: string
    action?: ReactNode
    children: ReactNode
}

export function DashboardSection({
    title,
    description,
    action,
    children,
}: DashboardSectionProps) {
    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                            {title}
                        </h2>
                        <div className="hidden h-px flex-1 bg-gradient-to-r from-border to-transparent sm:block" />
                    </div>
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