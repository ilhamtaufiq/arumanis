import { createFileRoute } from '@tanstack/react-router'
import FotoForm from '@/features/foto/components/FotoForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/foto/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/foto/:id" requiredMethod="PUT">
      <FotoForm />
    </ProtectedRoute>
  ),
})
