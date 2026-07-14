import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Dashboard } from '@/features/dashboard/components/Dashboard'
import { PengawasAppRedirect } from '@/components/common/PengawasAppRedirect'
import { useAuthStore } from '@/stores/auth-stores'
import { shouldRedirectToPengawasApp } from '@/lib/pengawas-app'
import type { DashboardTab } from '@/features/dashboard/components/DashboardNav'

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

  return <Dashboard initialTab={(tab ?? 'lounge') as DashboardTab} />
}
