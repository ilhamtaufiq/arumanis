import {
    Activity,
    Briefcase,
    FileText,
    Sparkles,
    Wallet,
    type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber } from '../lib/format'
import type { KegiatanStats } from '../types'

type DashboardTab = 'lounge' | 'overview' | 'analytics' | 'calendar' | 'reports'

const tabMeta: Record<DashboardTab, { title: string; description: string }> = {
    lounge: {
        title: 'Lounge',
        description: 'Ruang santai, jadwal hari ini, dan aktivitas terbaru.',
    },
    overview: {
        title: 'Overview',
        description: 'Ringkasan data kegiatan, pekerjaan, dan anggaran.',
    },
    analytics: {
        title: 'Analytics',
        description: 'Tren progres fisik dan performa per wilayah.',
    },
    calendar: {
        title: 'Calendar',
        description: 'Kalender kegiatan dan deadline administrasi.',
    },
    reports: {
        title: 'Reports',
        description: 'Pusat unduhan laporan terintegrasi.',
    },
}

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
}

export function DashboardHero({
    userName,
    tahunAnggaran,
    activeTab,
    stats,
    isLoading,
}: DashboardHeroProps) {
    const meta = tabMeta[activeTab]

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
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-background to-background p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                            TA {tahunAnggaran}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            {meta.title}
                        </Badge>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {userName ? `Halo, ${userName}` : 'Dashboard'}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            {meta.description}
                        </p>
                    </div>
                </div>

                {activeTab === 'overview' ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, index) => (
                                  <div
                                      key={index}
                                      className="rounded-xl border bg-background/70 p-3 backdrop-blur-sm"
                                  >
                                      <Skeleton className="mb-2 h-3 w-16" />
                                      <Skeleton className="h-6 w-20" />
                                  </div>
                              ))
                            : quickStats.map((item) => (
                                  <div
                                      key={item.label}
                                      className="rounded-xl border bg-background/70 p-3 backdrop-blur-sm transition-colors hover:border-primary/30"
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
    )
}