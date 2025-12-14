import { createFileRoute } from '@tanstack/react-router'
import PenerimaForm from '@/features/penerima/components/PenerimaForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/penerima/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/penerima/:id" requiredMethod="PUT">
      <PenerimaForm />
    </ProtectedRoute>
  ),
})
