import { createFileRoute } from '@tanstack/react-router'
import KontrakForm from '@/features/kontrak/components/KontrakForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kontrak/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/kontrak/:id" requiredMethod="PUT">
      <KontrakForm />
    </ProtectedRoute>
  ),
})
