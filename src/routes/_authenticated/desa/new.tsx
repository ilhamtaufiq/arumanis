import { createFileRoute } from '@tanstack/react-router'
import DesaForm from '@/features/desa/components/DesaForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/desa/new')({
  component: () => (
    <ProtectedRoute requiredPath="/desa" requiredMethod="POST">
      <DesaForm />
    </ProtectedRoute>
  ),
})
