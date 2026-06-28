import { createFileRoute } from '@tanstack/react-router'
import RoutePermissionList from '@/features/route-permissions/components/RoutePermissionList'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/route-permissions/')({
  beforeLoad: () => {
    requireAdmin()
  },
  component: () => (
    <div className="p-6">
      <RoutePermissionList />
    </div>
  ),
})