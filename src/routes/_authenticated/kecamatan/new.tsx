import { createFileRoute } from '@tanstack/react-router'
import KecamatanForm from '@/features/kecamatan/components/KecamatanForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kecamatan/new')({
  component: () => (
    <ProtectedRoute requiredPath="/kecamatan" requiredMethod="POST">
      <KecamatanForm />
    </ProtectedRoute>
  ),
})
