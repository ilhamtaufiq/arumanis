import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    BarChart3,
    CalendarDays,
    Coffee,
    Download,
    LayoutDashboard,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

type DashboardTab = 'lounge' | 'overview' | 'analytics' | 'calendar' | 'reports'

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
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)} className="w-full">
                <Header>
                    <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl p-1 sm:w-auto">
                        <TabsTrigger value="lounge" className="gap-1.5 px-3 py-2">
                            <Coffee className="h-4 w-4" />
                            Lounge
                        </TabsTrigger>
                        <TabsTrigger value="overview" className="gap-1.5 px-3 py-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-1.5 px-3 py-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-1.5 px-3 py-2">
                            <CalendarDays className="h-4 w-4" />
                            Calendar
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="gap-1.5 px-3 py-2">
                            <Download className="h-4 w-4" />
                            Reports
                        </TabsTrigger>
                    </TabsList>
                </Header>

                <Main>
                    <TabsContent value="lounge" className="mt-0 space-y-6">
                        <DashboardHero
                            userName={auth.user?.name}
                            tahunAnggaran={tahunAnggaran}
                            activeTab="lounge"
                        />
                        <LoungeView onGoToCalendar={() => setActiveTab('calendar')} />
                    </TabsContent>

                    <TabsContent value="overview" className="mt-0 space-y-6">
                        <DashboardHero
                            userName={auth.user?.name}
                            tahunAnggaran={tahunAnggaran}
                            activeTab="overview"
                            stats={stats}
                            isLoading={isLoading}
                        />
                        <DashboardOverview
                            year={tahunAnggaran}
                            stats={stats}
                            isLoading={isLoading}
                            error={error}
                        />
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-0 space-y-6">
                        <DashboardHero
                            userName={auth.user?.name}
                            tahunAnggaran={tahunAnggaran}
                            activeTab="analytics"
                        />
                        <AnalyticsView year={tahunAnggaran} />
                    </TabsContent>

                    <TabsContent value="calendar" className="mt-0 space-y-6">
                        <DashboardHero
                            userName={auth.user?.name}
                            tahunAnggaran={tahunAnggaran}
                            activeTab="calendar"
                        />
                        <div className="overflow-hidden rounded-2xl border bg-background p-4 shadow-sm animate-in fade-in duration-500 sm:p-6">
                            <CalendarView />
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-0 space-y-6">
                        <DashboardHero
                            userName={auth.user?.name}
                            tahunAnggaran={tahunAnggaran}
                            activeTab="reports"
                        />
                        <ReportsView year={tahunAnggaran} />
                    </TabsContent>
                </Main>
            </Tabs>
        </>
    )
}