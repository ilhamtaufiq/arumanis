import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard/components/Dashboard'
import { PengawasDashboard } from '@/features/user-pekerjaan/components/PengawasDashboard'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardWrapper,
})

function DashboardWrapper() {
  const { auth } = useAuthStore()
  const roles = auth.user?.roles || []

  // Check if user is only pengawas (not admin/manager) or specifically prioritize pengawas view
  if (roles.includes('pengawas') && !roles.includes('admin') && !roles.includes('manager')) {
    return <PengawasDashboard />
  }

  return <Dashboard />
}
