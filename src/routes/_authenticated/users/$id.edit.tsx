import { createFileRoute } from '@tanstack/react-router'
import UserForm from '@/features/users/components/UserForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/users/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/users/:id/edit" requiredMethod="GET">
      <UserForm />
    </ProtectedRoute>
  ),
})
