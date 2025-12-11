import { createFileRoute } from '@tanstack/react-router'
import BerkasForm from '@/features/berkas/components/BerkasForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/berkas/new')({
  component: () => (
    <ProtectedRoute requiredPath="/berkas/new" requiredMethod="GET">
      <BerkasForm />
    </ProtectedRoute>
  ),
})
