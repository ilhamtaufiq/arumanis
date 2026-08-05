import { createFileRoute, Navigate } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { canViewAdvancedMvpFeatures } from '@/lib/mvp-access'
import { useAuthStore } from '@/stores/auth-stores'

const ExecutiveDashboard = lazy(() =>
    lazyImport(
        () =>
            import('@/features/executive-dashboard/components/ExecutiveDashboard').then((m) => ({
                default: m.ExecutiveDashboard,
            })),
        'executive-dashboard',
    ),
)

export const Route = createFileRoute('/_authenticated/executive-dashboard')({
    component: ExecutiveDashboardRoute,
})

function ExecutiveDashboardRoute() {
    const roles = useAuthStore((state) => state.auth.user?.roles)

    if (!canViewAdvancedMvpFeatures(roles)) {
        return <Navigate to="/forbidden" />
    }

    return (
        <RouteSuspense label="Memuat Dashboard Eksekutif...">
            <ExecutiveDashboard />
        </RouteSuspense>
    )
}