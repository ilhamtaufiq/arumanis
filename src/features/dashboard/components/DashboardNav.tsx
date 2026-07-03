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
        <nav
            aria-label="Navigasi dashboard"
            className="w-full rounded-2xl border bg-card p-1.5 shadow-sm"
        >
            <div className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
                {dashboardNavItems.map((item) => {
                    const isActive = activeTab === item.value
                    const Icon = item.icon

                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => onTabChange(item.value)}
                            className={cn(
                                'flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all sm:px-4',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold leading-tight">
                                    {item.label}
                                </span>
                                <span
                                    className={cn(
                                        'mt-0.5 hidden truncate text-[11px] sm:block',
                                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                                    )}
                                >
                                    {item.description}
                                </span>
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}