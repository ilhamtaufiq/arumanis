import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { ProtectedRoute } from '@/components/ProtectedRoute'
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
        <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
            <RouteSuspense label="Memuat Progres Pekerjaan...">
                <DashboardProgresPage />
            </RouteSuspense>
        </ProtectedRoute>
    ),
})
