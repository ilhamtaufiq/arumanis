import { createFileRoute } from '@tanstack/react-router'
import PekerjaanForm from '@/features/pekerjaan/components/PekerjaanForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/pekerjaan/new')({
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan/new" requiredMethod="GET">
      <PekerjaanForm />
    </ProtectedRoute>
  ),
})
