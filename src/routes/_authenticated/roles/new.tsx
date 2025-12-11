import { createFileRoute } from '@tanstack/react-router'
import RoleForm from '@/features/roles/components/RoleForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/roles/new')({
  component: () => (
    <ProtectedRoute requiredPath="/roles/new" requiredMethod="GET">
      <RoleForm />
    </ProtectedRoute>
  ),
})
