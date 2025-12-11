import { createFileRoute } from '@tanstack/react-router'
import RoutePermissionForm from '@/features/route-permissions/components/RoutePermissionForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/route-permissions/new')({
  component: () => (
    <ProtectedRoute requiredPath="/route-permissions/new" requiredMethod="GET">
      <RoutePermissionForm />
    </ProtectedRoute>
  ),
})
