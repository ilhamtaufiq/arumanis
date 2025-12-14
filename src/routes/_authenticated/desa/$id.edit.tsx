import { createFileRoute } from '@tanstack/react-router'
import DesaForm from '@/features/desa/components/DesaForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/desa/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/desa/:id" requiredMethod="PUT">
      <DesaForm />
    </ProtectedRoute>
  ),
})
