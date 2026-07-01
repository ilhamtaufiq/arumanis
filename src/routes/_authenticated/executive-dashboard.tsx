import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ExecutiveDashboard } from '@/features/executive-dashboard/components/ExecutiveDashboard'
import { canViewAdvancedMvpFeatures } from '@/lib/mvp-access'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/executive-dashboard')({
    component: ExecutiveDashboardRoute,
})

function ExecutiveDashboardRoute() {
    const roles = useAuthStore((state) => state.auth.user?.roles)

    if (!canViewAdvancedMvpFeatures(roles)) {
        return <Navigate to="/forbidden" />
    }

    return <ExecutiveDashboard />
}