import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { getDashboardStats } from '../api/dashboard'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import { AnalyticsView } from './AnalyticsView'
import { LoungeView } from './LoungeView'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { ReportsView } from './ReportsView'
import { DashboardHero } from './DashboardHero'
import { DashboardOverview } from './DashboardOverview'
import { DashboardNav, type DashboardTab } from './DashboardNav'

const VALID_TABS: DashboardTab[] = ['lounge', 'overview', 'analytics', 'calendar', 'reports']

type DashboardProps = {
    initialTab?: DashboardTab
}

export function Dashboard({ initialTab = 'lounge' }: DashboardProps) {
    const navigate = useNavigate({ from: '/dashboard' })
    const search = useSearch({ from: '/_authenticated/dashboard', strict: false }) as {
        tab?: DashboardTab
    }
    const activeTab: DashboardTab =
        search?.tab && VALID_TABS.includes(search.tab) ? search.tab : initialTab

    const setActiveTab = useCallback(
        (tab: DashboardTab) => {
            void navigate({
                search: (prev) => ({ ...prev, tab }),
                replace: true,
            })
        },
        [navigate],
    )

    const { tahunAnggaran } = useAppSettingsValues()
    const { auth } = useAuthStore()
    const canViewStats = auth.user?.roles?.some((role) => role === 'admin' || role === 'manager') ?? false

    const { data: stats, isLoading, error, dataUpdatedAt, refetch, isFetching } = useQuery({
        queryKey: ['dashboard-stats', tahunAnggaran],
        queryFn: () => getDashboardStats(tahunAnggaran),
        enabled: canViewStats,
        staleTime: 60_000,
    })

    const [nowTick, setNowTick] = useState(0)
    useEffect(() => {
        const id = window.setInterval(() => setNowTick((n) => n + 1), 30_000)
        return () => window.clearInterval(id)
    }, [])

    const lastRefreshedLabel = (() => {
        void nowTick
        if (!dataUpdatedAt) return undefined
        const mins = Math.floor((Date.now() - dataUpdatedAt) / 60_000)
        if (mins <= 0) return 'Baru saja diperbarui'
        if (mins === 1) return 'Diperbarui 1 menit lalu'
        return `Diperbarui ${mins} menit lalu`
    })()

    return (
        <>
            <BannerNotification />
            <Header fixed />

            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <div className="flex w-full min-w-0 flex-col gap-4">
                    <DashboardNav
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <DashboardHero
                        userName={auth.user?.name}
                        tahunAnggaran={tahunAnggaran}
                        activeTab={activeTab}
                        stats={canViewStats ? stats : undefined}
                        isLoading={canViewStats && isLoading}
                        lastRefreshedLabel={lastRefreshedLabel}
                        isRefreshing={isFetching}
                        onRefresh={() => void refetch()}
                        canViewStats={canViewStats}
                    />

                    <div className="w-full min-w-0 animate-in fade-in duration-500">
                        {activeTab === 'lounge' ? (
                            <LoungeView onGoToCalendar={() => setActiveTab('calendar')} />
                        ) : null}

                        {activeTab === 'overview' ? (
                            canViewStats ? (
                                <DashboardOverview
                                    year={tahunAnggaran}
                                    stats={stats}
                                    isLoading={isLoading}
                                    error={error}
                                />
                            ) : (
                                <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
                                    <p className="text-sm font-medium">Ringkasan organisasi tersedia untuk admin & manager.</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Gunakan tab Lounge untuk antrian kerja, kalender, dan notifikasi harian Anda.
                                    </p>
                                </div>
                            )
                        ) : null}

                        {activeTab === 'analytics' ? (
                            <AnalyticsView year={tahunAnggaran} />
                        ) : null}

                        {activeTab === 'calendar' ? (
                            <div className="w-full overflow-hidden rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
                                <CalendarView />
                            </div>
                        ) : null}

                        {activeTab === 'reports' ? (
                            <ReportsView year={tahunAnggaran} />
                        ) : null}
                    </div>
                </div>
            </Main>
        </>
    )
}
