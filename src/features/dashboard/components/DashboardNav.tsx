import type { LucideIcon } from 'lucide-react'
import {
    BarChart3,
    CalendarDays,
    Coffee,
    Download,
    LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type DashboardTab = 'lounge' | 'overview' | 'analytics' | 'calendar' | 'reports'

type NavItem = {
    value: DashboardTab
    label: string
    description: string
    icon: LucideIcon
}

export const dashboardNavItems: NavItem[] = [
    {
        value: 'lounge',
        label: 'Lounge',
        description: 'Jadwal & aktivitas',
        icon: Coffee,
    },
    {
        value: 'overview',
        label: 'Overview',
        description: 'Ringkasan data',
        icon: LayoutDashboard,
    },
    {
        value: 'analytics',
        label: 'Analytics',
        description: 'Tren & performa',
        icon: BarChart3,
    },
    {
        value: 'calendar',
        label: 'Calendar',
        description: 'Kalender kegiatan',
        icon: CalendarDays,
    },
    {
        value: 'reports',
        label: 'Reports',
        description: 'Unduh laporan',
        icon: Download,
    },
]

type DashboardNavProps = {
    activeTab: DashboardTab
    onTabChange: (tab: DashboardTab) => void
}

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
    return (
        <>
            <nav
                aria-label="Navigasi dashboard"
                className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
            >
                {dashboardNavItems.map((item) => {
                    const isActive = activeTab === item.value
                    const Icon = item.icon

                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => onTabChange(item.value)}
                            className={cn(
                                'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'border-primary/30 bg-primary text-primary-foreground shadow-sm'
                                    : 'border-border/70 bg-background text-muted-foreground hover:border-primary/20 hover:bg-muted/50 hover:text-foreground',
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    )
                })}
            </nav>

            <nav
                aria-label="Navigasi dashboard"
                className="hidden lg:block"
            >
                <div className="sticky top-24 space-y-1 rounded-2xl border bg-card/80 p-2 shadow-sm backdrop-blur-sm">
                    <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Workspace
                    </p>
                    {dashboardNavItems.map((item) => {
                        const isActive = activeTab === item.value
                        const Icon = item.icon

                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => onTabChange(item.value)}
                                className={cn(
                                    'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                                    isActive
                                        ? 'bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/15'
                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                )}
                            >
                                <span
                                    className={cn(
                                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                                        isActive
                                            ? 'border-primary/20 bg-primary text-primary-foreground'
                                            : 'border-border/60 bg-background',
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold leading-tight">
                                        {item.label}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                        {item.description}
                                    </span>
                                </span>
                            </button>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}