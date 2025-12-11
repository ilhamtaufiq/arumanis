import { createFileRoute } from '@tanstack/react-router'
import RoutePermissionForm from '@/features/route-permissions/components/RoutePermissionForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/route-permissions/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/route-permissions/:id/edit" requiredMethod="GET">
      <RoutePermissionForm />
    </ProtectedRoute>
  ),
})
