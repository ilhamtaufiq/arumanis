import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { PengawasAppRedirect } from '@/components/common/PengawasAppRedirect'
import { useAuthStore } from '@/stores/auth-stores'
import { shouldRedirectToPengawasApp } from '@/lib/pengawas-app'

const Dashboard = lazy(() =>
    lazyImport(
        () =>
            import('@/features/dashboard/components/Dashboard').then((m) => ({
                default: m.Dashboard,
            })),
        'dashboard',
    ),
)

export const Route = createFileRoute('/_authenticated/dashboard')({
    component: DashboardRoute,
})

function DashboardRoute() {
  const roles = useAuthStore((state) => state.auth.user?.roles)
  const isImpersonating = useAuthStore((state) => state.auth.isImpersonating)

  if (!isImpersonating && shouldRedirectToPengawasApp(roles)) {
    return <PengawasAppRedirect />
  }

  return (
    <RouteSuspense label="Memuat Dashboard...">
      <Dashboard />
    </RouteSuspense>
  )
}
