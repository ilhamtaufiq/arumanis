import { createFileRoute } from '@tanstack/react-router'
import UserForm from '@/features/users/components/UserForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/users/new')({
  component: () => (
    <ProtectedRoute requiredPath="/users/new" requiredMethod="GET">
      <UserForm />
    </ProtectedRoute>
  ),
})
