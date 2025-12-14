import { createFileRoute, redirect } from '@tanstack/react-router'
import RoutePermissionList from '@/features/route-permissions/components/RoutePermissionList'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/route-permissions/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const userRoles = auth?.user?.roles || []
    const isAdmin = userRoles.some((r: any) =>
      (typeof r === 'string' ? r : r.name) === 'admin'
    )

    if (!isAdmin) {
      throw redirect({ to: '/' })
    }
  },
  component: RoutePermissionList,
})
