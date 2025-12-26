import { createFileRoute } from '@tanstack/react-router'
import PekerjaanForm from '@/features/pekerjaan/components/PekerjaanForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/pekerjaan/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan/:id" requiredMethod="PUT">
      <PekerjaanForm />
    </ProtectedRoute>
  ),
})
