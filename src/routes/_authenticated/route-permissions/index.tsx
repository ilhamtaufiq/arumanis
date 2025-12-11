import { createFileRoute } from '@tanstack/react-router'
import RoutePermissionList from '@/features/route-permissions/components/RoutePermissionList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/route-permissions/')({
  component: () => (
    <ProtectedRoute requiredPath="/route-permissions" requiredMethod="GET">
      <RoutePermissionList />
    </ProtectedRoute>
  ),
})
