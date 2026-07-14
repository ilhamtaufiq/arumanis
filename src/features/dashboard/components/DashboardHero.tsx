import {
    Activity,
    Briefcase,
    FileText,
    RefreshCw,
    Sparkles,
    Wallet,
    type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber } from '../lib/format'
import type { KegiatanStats } from '../types'
import { dashboardNavItems, type DashboardTab } from './DashboardNav'

type QuickStat = {
    label: string
    value: string
    icon: LucideIcon
}

type DashboardHeroProps = {
    userName?: string
    tahunAnggaran: string
    activeTab: DashboardTab
    stats?: KegiatanStats
    isLoading?: boolean
    lastRefreshedLabel?: string
    isRefreshing?: boolean
    onRefresh?: () => void
    canViewStats?: boolean
}

const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat pagi'
    if (hour < 15) return 'Selamat siang'
    if (hour < 18) return 'Selamat sore'
    return 'Selamat malam'
}

export function DashboardHero({
    userName,
    tahunAnggaran,
    activeTab,
    stats,
    isLoading,
    lastRefreshedLabel,
    isRefreshing,
    onRefresh,
    canViewStats,
}: DashboardHeroProps) {
    const meta = dashboardNavItems.find((item) => item.value === activeTab)

    const quickStats: QuickStat[] = activeTab === 'overview' && stats
        ? [
              {
                  label: 'Kegiatan',
                  value: formatNumber(stats.totalKegiatan),
                  icon: Activity,
              },
              {
                  label: 'Pekerjaan',
                  value: formatNumber(stats.totalPekerjaan),
                  icon: Briefcase,
              },
              {
                  label: 'Kontrak',
                  value: formatNumber(stats.totalKontrak),
                  icon: FileText,
              },
              {
                  label: 'Total Pagu',
                  value: formatCurrency(stats.totalPagu),
                  icon: Wallet,
              },
          ]
        : []

    return (
        <section className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
            <div className="pointer-events-none absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative border-b border-border/60 px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
                                TA {tahunAnggaran}
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                                <Sparkles className="h-3 w-3" />
                                {meta?.label ?? 'Dashboard'}
                            </Badge>
                            {lastRefreshedLabel && canViewStats ? (
                                <Badge variant="outline" className="font-normal text-muted-foreground">
                                    {lastRefreshedLabel}
                                </Badge>
                            ) : null}
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                {greeting()}
                            </p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                                {userName ? userName : 'Dashboard Arumanis'}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {meta?.description ?? 'Pusat kontrol operasional dan monitoring program.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-3 sm:items-end">
                        {onRefresh && canViewStats ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 self-start sm:self-end"
                                disabled={isRefreshing}
                                onClick={onRefresh}
                            >
                                <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
                                Muat ulang
                            </Button>
                        ) : null}

                        {activeTab === 'overview' && canViewStats ? (
                            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
                                {isLoading
                                    ? Array.from({ length: 4 }).map((_, index) => (
                                          <div
                                              key={index}
                                              className="rounded-xl border bg-background/80 p-3"
                                          >
                                              <Skeleton className="mb-2 h-3 w-14" />
                                              <Skeleton className="h-6 w-16" />
                                          </div>
                                      ))
                                    : quickStats.map((item) => (
                                          <div
                                              key={item.label}
                                              className="rounded-xl border border-border/70 bg-background/80 p-3 backdrop-blur-sm transition-colors hover:border-primary/25"
                                          >
                                              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                  <item.icon className="h-3 w-3 text-primary" />
                                                  {item.label}
                                              </div>
                                              <p className={cn('text-sm font-bold leading-tight sm:text-base')}>
                                                  {item.value}
                                              </p>
                                          </div>
                                      ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    )
}
