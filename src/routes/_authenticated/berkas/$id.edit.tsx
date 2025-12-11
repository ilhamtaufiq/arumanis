import { createFileRoute } from '@tanstack/react-router'
import BerkasForm from '@/features/berkas/components/BerkasForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/berkas/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/berkas/:id/edit" requiredMethod="GET">
      <BerkasForm />
    </ProtectedRoute>
  ),
})
