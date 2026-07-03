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

function NavButton({
    item,
    isActive,
    onClick,
    compact = false,
}: {
    item: NavItem
    isActive: boolean
    onClick: () => void
    compact?: boolean
}) {
    const Icon = item.icon

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex min-w-0 items-center gap-2 rounded-xl text-left transition-all',
                compact ? 'shrink-0 px-3 py-2' : 'px-3 py-2.5 sm:px-4',
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
                {!compact ? (
                    <span
                        className={cn(
                            'mt-0.5 hidden truncate text-[11px] md:block',
                            isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                        )}
                    >
                        {item.description}
                    </span>
                ) : null}
            </span>
        </button>
    )
}

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
    return (
        <nav
            aria-label="Navigasi dashboard"
            className="w-full rounded-2xl border bg-card shadow-sm"
        >
            {/* Mobile & tablet kecil: scroll horizontal */}
            <div className="flex gap-1.5 overflow-x-auto p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
                {dashboardNavItems.map((item) => (
                    <NavButton
                        key={item.value}
                        item={item}
                        isActive={activeTab === item.value}
                        onClick={() => onTabChange(item.value)}
                        compact
                    />
                ))}
            </div>

            {/* Tablet & desktop: grid penuh lebar */}
            <div className="hidden w-full grid-cols-3 gap-1.5 p-1.5 md:grid lg:grid-cols-5">
                {dashboardNavItems.map((item) => (
                    <NavButton
                        key={item.value}
                        item={item}
                        isActive={activeTab === item.value}
                        onClick={() => onTabChange(item.value)}
                    />
                ))}
            </div>
        </nav>
    )
}