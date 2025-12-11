import { createFileRoute } from '@tanstack/react-router'
import PermissionList from '@/features/permissions/components/PermissionList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/permissions/')({
  component: () => (
    <ProtectedRoute requiredPath="/permissions" requiredMethod="GET">
      <PermissionList />
    </ProtectedRoute>
  ),
})
