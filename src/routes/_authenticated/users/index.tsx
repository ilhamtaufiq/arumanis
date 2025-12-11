import { createFileRoute } from '@tanstack/react-router'
import UserList from '@/features/users/components/UserList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/users/')({
  component: () => (
    <ProtectedRoute requiredPath="/users" requiredMethod="GET">
      <UserList />
    </ProtectedRoute>
  ),
})
