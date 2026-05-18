import { createFileRoute, redirect } from '@tanstack/react-router'
import RoutePermissionList from '@/features/route-permissions/components/RoutePermissionList'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/route-permissions/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const isAdmin = auth?.user?.roles?.includes('admin') || false

    if (!isAdmin) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: () => (
    <div className="p-6">
      <RoutePermissionList />
    </div>
  ),
})
