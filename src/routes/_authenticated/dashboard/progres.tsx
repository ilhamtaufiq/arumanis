import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const DashboardProgresPage = lazy(() =>
    lazyImport(
        () =>
            import('@/features/dashboard/components/DashboardProgresPage').then((m) => ({
                default: m.DashboardProgresPage,
            })),
        'dashboard-progres',
    ),
)

export const Route = createFileRoute('/_authenticated/dashboard/progres')({
    component: () => (
        <RouteSuspense label="Memuat Progres Pekerjaan...">
            <DashboardProgresPage />
        </RouteSuspense>
    ),
})
