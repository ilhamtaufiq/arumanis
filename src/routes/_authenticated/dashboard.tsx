import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard/components/Dashboard'
import { PengawasAppRedirect } from '@/components/common/PengawasAppRedirect'
import { useAuthStore } from '@/stores/auth-stores'
import { shouldRedirectToPengawasApp } from '@/lib/pengawas-app'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardRoute,
})

function DashboardRoute() {
  const roles = useAuthStore((state) => state.auth.user?.roles)
  const isImpersonating = useAuthStore((state) => state.auth.isImpersonating)

  if (!isImpersonating && shouldRedirectToPengawasApp(roles)) {
    return <PengawasAppRedirect />
  }

  return <Dashboard />
}