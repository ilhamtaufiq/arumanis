import { createFileRoute } from '@tanstack/react-router'
import RoleList from '@/features/roles/components/RoleList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/roles/')({
  component: () => (
    <ProtectedRoute requiredPath="/roles" requiredMethod="GET">
      <RoleList />
    </ProtectedRoute>
  ),
})
