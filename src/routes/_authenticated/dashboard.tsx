import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { z } from 'zod'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { PengawasAppRedirect } from '@/components/common/PengawasAppRedirect'
import { useAuthStore } from '@/stores/auth-stores'
import { shouldRedirectToPengawasApp } from '@/lib/pengawas-app'
import type { DashboardTab } from '@/features/dashboard/components/DashboardNav'

const Dashboard = lazy(() =>
    lazyImport(
        () =>
            import('@/features/dashboard/components/Dashboard').then((m) => ({
                default: m.Dashboard,
            })),
        'dashboard',
    ),
)

const dashboardSearchSchema = z.object({
  tab: z
    .enum(['lounge', 'overview', 'analytics', 'calendar', 'reports'])
    .optional()
    .catch('lounge'),
})

export const Route = createFileRoute('/_authenticated/dashboard')({
  validateSearch: dashboardSearchSchema,
  component: DashboardRoute,
})

function DashboardRoute() {
  const roles = useAuthStore((state) => state.auth.user?.roles)
  const isImpersonating = useAuthStore((state) => state.auth.isImpersonating)
  const { tab } = Route.useSearch()

  if (!isImpersonating && shouldRedirectToPengawasApp(roles)) {
    return <PengawasAppRedirect />
  }

  return (
    <RouteSuspense label="Memuat Dashboard...">
      <Dashboard initialTab={(tab ?? 'lounge') as DashboardTab} />
    </RouteSuspense>
  )
}
