import { createFileRoute } from '@tanstack/react-router'
import RoleForm from '@/features/roles/components/RoleForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/roles/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/roles/:id/edit" requiredMethod="GET">
      <RoleForm />
    </ProtectedRoute>
  ),
})
