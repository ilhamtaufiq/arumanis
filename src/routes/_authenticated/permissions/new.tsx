import { createFileRoute } from '@tanstack/react-router'
import PermissionForm from '@/features/permissions/components/PermissionForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/permissions/new')({
  component: () => (
    <ProtectedRoute requiredPath="/permissions/new" requiredMethod="GET">
      <PermissionForm />
    </ProtectedRoute>
  ),
})
