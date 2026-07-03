import { useState } from 'react'
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

export function Dashboard() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('lounge')
    const { tahunAnggaran } = useAppSettingsValues()
    const { auth } = useAuthStore()
    const canViewStats = auth.user?.roles?.some((role) => role === 'admin' || role === 'manager') ?? false

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard-stats', tahunAnggaran],
        queryFn: () => getDashboardStats(tahunAnggaran),
        enabled: canViewStats,
    })

    return (
        <>
            <BannerNotification />
            <Header fixed />

            <Main className="pb-10">
                <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
                    <aside className="w-full shrink-0 lg:w-[220px]">
                        <DashboardNav
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                    </aside>

                    <div className="min-w-0 flex-1 space-y-5">
                        <DashboardHero
                            userName={auth.user?.name}
                            tahunAnggaran={tahunAnggaran}
                            activeTab={activeTab}
                            stats={stats}
                            isLoading={isLoading}
                        />

                        <div className="animate-in fade-in duration-500">
                            {activeTab === 'lounge' ? (
                                <LoungeView onGoToCalendar={() => setActiveTab('calendar')} />
                            ) : null}

                            {activeTab === 'overview' ? (
                                <DashboardOverview
                                    year={tahunAnggaran}
                                    stats={stats}
                                    isLoading={isLoading}
                                    error={error}
                                />
                            ) : null}

                            {activeTab === 'analytics' ? (
                                <AnalyticsView year={tahunAnggaran} />
                            ) : null}

                            {activeTab === 'calendar' ? (
                                <div className="overflow-hidden rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
                                    <CalendarView />
                                </div>
                            ) : null}

                            {activeTab === 'reports' ? (
                                <ReportsView year={tahunAnggaran} />
                            ) : null}
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}